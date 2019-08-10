import { PythonInterface } from 'reactopya';
import React, { Component } from 'react';
import Mda from './Mda';
import TimeseriesWidget from "./TimeseriesWidget";
import TimeseriesModel from "./TimeseriesModel";
const config = require('./TimeseriesView.json');


export default class TimeseriesView extends Component {
    static title = 'Timeseries view'
    static reactopyaConfig = config;
    render() {
        return (
            <AutoSizer>
                <TimeseriesViewInner {...this.props} />
            </AutoSizer>
        );
    }
}

class TimeseriesViewInner extends Component {
    constructor(props) {
        super(props)
        this.state = {
            recordingPath: props.recordingPath,
            timeseriesModelSet: false,
            numChannels: null, // from python state
            numTimepoints: null, // from python state
            samplerate: null, // from python state
            segmentSize: 1000,
            status_message: '', // from python state
            download_from: props.download_from
        }
        this.timeseriesModel = null;
    }

    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this.updateData();
    }
    componentDidUpdate() {
        this.pythonInterface.update();
        this.updateData();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }

    updateData() {
        if (!this.state.numChannels) return;
        if (!this.timeseriesModel) {
            if (!this.state.samplerate) {
                return;
            }
            const params = {
                samplerate: this.state.samplerate,
                num_channels: this.state.numChannels,
                num_timepoints: this.state.numTimepoints,
                segment_size: this.state.segmentSize
            };
            this.timeseriesModel = new TimeseriesModel(params);
            this.setState({
                timeseriesModelSet: true
            });
            this.timeseriesModel.onRequestDataSegment((ds_factor, segment_num) => {
                let sr = this.pythonInterface.getJavaScriptState('segmentsRequested') || {};
                let code = `${ds_factor}-${segment_num}`;
                sr[code] = { ds: ds_factor, ss: segment_num };
                this.pythonInterface.setJavaScriptState({
                    segmentsRequested: sr
                });
            });
        }
        let SR = this.pythonInterface.getJavaScriptState('segmentsRequested') || {};
        let keys = Object.keys(SR);
        let something_changed = false;
        for (let key of keys) {
            let aa = this.pythonInterface.getPythonState(key) || null;
            if ((aa) && (aa.data)) {
                let X = new Mda();
                X.setFromBase64(aa.data);
                this.timeseriesModel.setDataSegment(aa.ds, aa.ss, X);
                delete SR[key];
                // delete SF[key];
                something_changed = true;
            }
        }
        if (something_changed) {
            this.pythonInterface.setJavaScriptState({
                segmentsRequested: SR
            });
        }
    }
    render() {
        if (this.state.timeseriesModelSet) {
            return (
                <div>
                    <TimeseriesWidget
                        timeseriesModel={this.timeseriesModel}
                        width={this.props.width}
                        height={this.props.height || 500}
                    />
                    <div>{this.state.status_message}</div>
                </div>
            )
        }
        else {
            return (
                <div>{this.state.status_message}</div>
            );
        }
    }
}

class AutoSizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: null
        };
    }

    async componentDidMount() {
        if (this.props.width) return;
        this.updateDimensions();
        window.addEventListener("resize", this.resetWidth);
    }

    componentWillUnmount() {
        if (this.props.width) return;
        window.removeEventListener("resize", this.resetWidth);
    }

    resetWidth = () => {
        if (this.props.width) return;
        this.setState({
            width: null
        });
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.width) return;
        if (!this.state.width) {
            this.updateDimensions();
        }
    }

    updateDimensions() {
        if (this.props.width) return;
        if (this.state.width !== this.container.offsetWidth) {
            this.setState({
                width: this.container.offsetWidth // see render()
            });
        }
    }

    render() {
        if (this.props.width) {
            return this.props.children;
        }
        let { width } = this.state;
        if (!width) width=300;

        const elmt = React.Children.only(this.props.children);

        return (
            <div className="determiningWidth" ref={el => (this.container = el)}>
                <elmt.type {...elmt.props} width={this.state.width}>{elmt.children}</elmt.type>
            </div>
        );
    }
}
