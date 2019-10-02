import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
const config = require('./SpikeRasterPlot.json');
import TimeWidget, { PainterPath } from '../TimeWidget/TimeWidget';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';

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

class SpikeRasterPlotInner extends TimeWidget {
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
            status_message: ''
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this.pythonInterface.setState({
            sorting: this.props.sorting,
        });
        this.initializeTimeWidget();
        this.updatePanels();
    }
    componentDidUpdate() {
        this.updatePanels();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    updatePanels() {
        const { unit_ids } = this.state;
        this.clearPanels();
        if (!unit_ids) return;
        for (let unit_id of unit_ids) {
            let panel = this.addPanel(
                (painter) => {this.paintUnit(painter, unit_id)},
                {label: unit_id}
            );
            panel.setCoordYRange(0, 1);
        }
        this.repaint();
    }
    paintUnit = (painter, unit_id) => {
        let times0 = this.state.spike_trains[unit_id];
        let trange = this.timeRange();
        painter.setPen({color: 'black'});
        for (let t of times0) {
            if ((trange[0] <= t) && (t <= trange[1])) {
                painter.drawLine(t, 0.15, t, 0.85);
            }
        }
    }
    render() {
        if (this.state.status === 'finished') {
            return this.renderTimeWidget();
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