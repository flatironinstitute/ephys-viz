import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
const config = require('./SpikeRasterPlot.json');
import TimeWidget, { PainterPath } from '../TimeWidget/TimeWidget';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';
import { TimeWidgetPanel } from '../TimeWidget/TimeWidget';

export default class SpikeRasterPlot extends Component {
    static title = 'Spike raster plot'
    static reactopyaConfig = config;
    render() {
        let height = this.props.height || 500;
        return (
            <AutoDetermineWidth>
                <SpikeRasterPlotInner {...this.props} height={height} />
            </AutoDetermineWidth>
        );
    }
}

class SpikeRasterPlotInner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            sorting: null,
            
            // python state
            unit_ids: null,
            num_timepoints: null,
            spike_trains: null,
            status: '',
            status_message: '',

            panels: []
        }
        this._initializedTimeRange = false;
        this._repainter = null;
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this.pythonInterface.setState({
            sorting: this.props.sorting,
        });        
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.num_timepoints) {
            if (!this._initializedTimeRange) {
                // this.setTimeRange([0, this.state.num_timepoints]);
                // this._initializedTimeRange = true;
            }
        }
        if (
            (this.props.width !== prevProps.width) ||
            (this.props.height !== prevProps.height) ||
            (this.state.spike_trains !== prevState.spike_trains)
        ) {
            this.updatePanels();
        }
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    paintUnit = (painter, trange, unit_id) => {
        let times0 = this.state.spike_trains[unit_id];
        painter.setPen({color: 'black'});
        for (let t of times0) {
            if ((trange[0] <= t) && (t <= trange[1])) {
                painter.drawLine(t, 0.15, t, 0.85);
            }
        }
    }
    updatePanels = () => {
        const { unit_ids } = this.state;
        let panels = [];
        if (unit_ids) {
            for (let unit_id of unit_ids) {
                let panel = new TimeWidgetPanel(
                    (painter, timeRange) => {this.paintUnit(painter, timeRange, unit_id)},
                    {label: unit_id}
                );
                panel.setCoordYRange(0, 1);
                panels.push(panel);
            }
        }
        this.setState({
            panels: panels
        });
    }
    _repaint = () => {
        this._repainter && this._repainter();
    }
    render() {
        if (this.state.status === 'finished') {
            const { panels } = this.state;
            
            return (
                <TimeWidget
                    panels={panels}
                    actions={[]}
                    width={this.props.width}
                    height={this.props.height}
                    registerRepainter={(repaintFunc) => {this._repainter=repaintFunc}}
                    samplerate={30000} // fix this
                    maxTimeSpan={null}
                    numTimepoints={this.state.num_timepoints}
                    // currentTime={this.state.currentTime}
                    // timeRange={this.state.timeRange}
                    // onCurrentTimeChanged={this._handleCurrentTimeChanged}
                    // onTimeRangeChanged={this._handleTimeRangeChanged}
                    // leftPanel={leftPanel}
                />
            )
        }
        else {
            return (
                <RespectStatus {...this.state} />
            )
        }
    }
}

class RespectStatus extends Component {
    state = {}
    render() {
        switch (this.props.status) {
            case 'running':
                return <div>Running: {this.props.status_message}</div>
            case 'error':
                return <div>Error: {this.props.status_message}</div>
            case 'finished':
                return this.props.children;
            default:
                return <div>Unknown status: {this.props.status}</div>
        }
    }
}