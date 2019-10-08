import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
const config = require('./SpikeAmplitudePlot.json');
import TimeWidget, { PainterPath } from '../TimeWidget/TimeWidget';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';
import UnitSelector from '../jscommon/UnitSelector';
import { SelectUnits } from '..';
import { FaCommentsDollar } from 'react-icons/fa';

export default class SpikeAmplitudePlot extends Component {
    static title = 'Spike amplitude plot'
    static reactopyaConfig = config;
    render() {
        if (!this.props.unit_ids) {
            return <SpikeAmplitudePlotSelectUnitIds {...this.props} />;
        }
        let height = this.props.height || 500;
        return (
            <AutoDetermineWidth>
                <SpikeAmplitudePlotInner {...this.props} height={height} />
            </AutoDetermineWidth>
        );
    }
}

class SpikeAmplitudePlotSelectUnitIds extends Component {
    state = {
        unit_ids: []
    };
    _handleSelectedUnitsChanged = (selectedUnits) => {
        let unit_ids = [];
        for (let id in selectedUnits)
            unit_ids.push(Number(id));
        this.setState({
            unit_ids: unit_ids
        });
    }
    render() {
        let height = this.props.height || 500;
        let selectUnitsHeight = 100;
        return (
            <React.Fragment>
                <SpikeAmplitudePlot
                    {...this.props} height={height-selectUnitsHeight} unit_ids={this.state.unit_ids}
                />
                <SelectUnits
                    sorting={this.props.sorting}
                    reactopyaParent={this}
                    reactopyaChildId="SelectUnits"
                    onSelectedUnitsChanged={this._handleSelectedUnitsChanged}
                    height={selectUnitsHeight}
                />
            </React.Fragment>
        )
    }
}

class SpikeAmplitudePlotInner extends TimeWidget {
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            sorting: null,
            recording: null,
            unit_ids: null,
            
            // python state
            num_timepoints: null,
            spike_trains: null,
            spike_amplitudes: null,
            status: '',
            status_message: ''
        }
        this.retrievedSpikeTrains = {};
        this.retrievedSpikeAmplitudes = {};
        this._ampRange = [null, null];
        this._initializedTimeRange = false;
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this.pythonInterface.setState({
            sorting: this.props.sorting,
            recording: this.props.recording,
            unit_ids: this._determineUnitIdsToCompute()
        });
        this.initializeTimeWidget();
        this._mainPanel = this.addPanel(this.paintMainPanel, {label: null});
        this._updateAmpRange();
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.spike_trains) {
            for (let id in this.state.spike_trains) {
                this.retrievedSpikeTrains[id] = this.state.spike_trains[id];
                this.retrievedSpikeAmplitudes[id] = this.state.spike_amplitudes[id];
            }
        }
        const unit_ids_to_compute = this._determineUnitIdsToCompute();
        if (unit_ids_to_compute.length > 0) {
            this.pythonInterface.setState({
                unit_ids: unit_ids_to_compute
            });
        }
        if (
            (this.props.width !== prevProps.width) ||
            (this.props.height !== prevProps.height) ||
            (this.state.spike_trains !== prevState.spike_trains) ||
            (this.state.spike_amplitudes !== prevState.spike_amplitudes)
        ) {
            this._updateAmpRange();
            this.updateTimeWidget();
        }
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    _determineUnitIdsToCompute() {
        let unit_ids = [];
        for (let unit_id of this.props.unit_ids) {
            let needed = (!this.retrievedSpikeTrains[unit_id]);
            if (needed) {
                unit_ids.push(unit_id);
            }
        }
        return unit_ids;
    }
    paintMainPanel = (painter) => {
        if (this.state.status !== 'finished') return;
        if (!this._initializedTimeRange) {
            this.setTimeRange([0, this.state.num_timepoints]);
            this._initializedTimeRange = true;
        }
        let trange = this.timeRange();
        for (let unit_id of this.props.unit_ids) {
            let times0 = this.retrievedSpikeTrains[unit_id];
            let amps0 = this.retrievedSpikeAmplitudes[unit_id];
            if ((times0) && (amps0)) {
                painter.setPen({color: _color_for_unit_id(unit_id)});
                for (let i in times0) {
                    let t = times0[i];
                    if ((trange[0] <= t) && (t <= trange[1])) {
                        let amp = amps0[i];
                        if ((this._ampRange[0] <= amp) && (amp <= this._ampRange[1]))
                        painter.drawMarker(t, amp, 2, 'circle');
                    }
                }
            }
        }
    }
    _updateAmpRange() {
        if (this.state.status !== 'finished') return;
        let min = 0, max = 0;
        for (let unit_id of this.props.unit_ids) {
            let amps = this.retrievedSpikeAmplitudes[unit_id];
            if (amps) {
                for (let a of amps) {
                    if (a < min) min = a;
                    if (a > max) max = a;
                }
            }
        }
        if ((this._ampRange[0] === min) && (this._ampRange[1] === max))
            return;
        this._ampRange = [min, max];
        let panel = this._mainPanel;
        panel.setCoordYRange(this._ampRange[0], this._ampRange[1]);
        this.repaint();
    }
    render() {
        if (this.state.status === 'finished') {
            return this.renderTimeWidget();
        }
        else {
            return (
                <RespectStatus {...this.state} width={this.props.width} height={this.props.height} />
            )
        }
    }
}

class RespectStatus extends Component {
    state = {}
    render() {
        let style0 = {
            position: 'relative',
            width: this.props.width,
            height: this.props.height
        };
        switch (this.props.status) {
            case 'running':
                return <div style={style0}>Running: {this.props.status_message}</div>
            case 'error':
                return <div style={style0}>Error: {this.props.status_message}</div>
            case 'finished':
                return this.props.children;
            default:
                return <div style={style0}>Unknown status: {this.props.status}</div>
        }
    }
}

function _color_for_unit_id(unit_id) {
    // Got these from: http://phrogz.net/css/distinct-colors.html
    const colors_str = '#ff0000, #665a4d, #1a661a, #0074d9, #695673, #8c0000, #e59900, #304032, #00258c, #ff00cc, #f27979, #e5d600, #00d991, #202440, #731d62, #d96236, #8c8300, #79f2ea, #a3aad9, #e673bf, #401a00, #403d10, #23858c, #0000ff, #e5005c, #ffb380, #669900, #00b8e6, #0000d9, #401023, #8c6246, #88ff00, #003340, #6953a6, #66001b, #593000, #879973, #005e8c, #1a0040, #ffbfd0, #e6cbac, #d9ffbf, #bfeaff, #ac39e6, #997378'
    const colors = colors_str.split(', ');
    const index = Number(unit_id);
    return colors[index % colors.length];
}