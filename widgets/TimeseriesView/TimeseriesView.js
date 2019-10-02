import { PythonInterface } from 'reactopya';
import React, { Component } from 'react';
import Mda from './Mda';
import TimeseriesWidget from "./TimeseriesWidget";
import TimeseriesModel from "./TimeseriesModel";
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';
const config = require('./TimeseriesView.json');


export default class TimeseriesView extends Component {
    static title = 'Timeseries view'
    static reactopyaConfig = config;
    render() {
        return (
            <AutoDetermineWidth>
                <TimeseriesViewInner {...this.props} />
            </AutoDetermineWidth>
        );
    }
}

class TimeseriesViewInner extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // javascript state
            recording: null,
            segmentsRequested: null,

            // python state
            num_channels: null,
            num_timepoints: null,
            channel_ids: null,
            samplerate: null,
            y_offsets: null,
            y_scale_factor: null,
            segment_size: null,
            status_message: '',

            // other
            timeseriesModelSet: false // to trigger re-render
        }
        this.timeseriesModel = null;
        this.segmentsRequested = {};
    }

    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.setState({
            recording: this.props.recording
        });

        this.pythonInterface.start();
        this.updateData();
    }
    componentDidUpdate() {
        this.updateData();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }

    updateData() {
        if (!this.state.num_channels) return;
        if (!this.timeseriesModel) {
            if (!this.state.samplerate) {
                return;
            }
            const params = {
                samplerate: this.state.samplerate,
                num_channels: this.state.num_channels,
                num_timepoints: this.state.num_timepoints,
                segment_size: this.state.segment_size
            };
            this.timeseriesModel = new TimeseriesModel(params);
            this.timeseriesModel.onRequestDataSegment((ds_factor, segment_num) => {
                let sr = this.segmentsRequested;
                let code = `${ds_factor}-${segment_num}`;
                sr[code] = { ds: ds_factor, ss: segment_num };
                this.segmentsRequested = sr;
                this.pythonInterface.setState({
                    segmentsRequested: sr
                });
            });
            this.setState({
                timeseriesModelSet: true
            });
        }
        let SR = this.segmentsRequested;
        let keys = Object.keys(SR);
        let something_changed = false;
        for (let key of keys) {
            let aa = this.state[key] || null;
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
            this.segmentsRequested = SR;
            this.pythonInterface.setState({
                segmentsRequested: SR
            });
        }
    }
    render() {
        if (this.timeseriesModel) {
            return (
                <div>
                    <TimeseriesWidget
                        timeseriesModel={this.timeseriesModel}
                        num_channels={this.state.num_channels}
                        num_timepoints={this.state.num_timepoints}
                        channel_ids={this.state.channel_ids}
                        y_offsets={this.state.y_offsets}
                        y_scale_factor={this.state.y_scale_factor}
                        width={this.props.width}
                        height={this.props.height || 500}
                    />
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
