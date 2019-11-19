import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
const config = require('./SpikeAmplitudePlot.json');
import TimeWidget, { PainterPath } from '../TimeWidget/TimeWidget';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';
import { TimeWidgetPanel } from '../TimeWidget/TimeWidget';
import SelectUnits from '../SelectUnits/SelectUnits';

export default class SpikeAmplitudePlot extends Component {
    static title = 'Spike amplitude plot'
    static reactopyaConfig = config;
    render() {
        if (!this.props.unit_ids) {
            return <SpikeAmplitudePlotSelectUnitIds {...this.props} />;
        }
        return (
            <AutoDetermineWidth>
                <SpikeAmplitudePlotInner {...this.props} />
            </AutoDetermineWidth>
        );
    }
}

class SpikeAmplitudeDataModel {
    constructor(pythonInterface) {
        this._pythonInterface = pythonInterface;
        this._blockSize = 30000 * 10;
        this._blocks = {};
        this._requestedBlocks = {};
        this._updateHandlers = [];
        this._amplitudeRange = [0, 0];

        this._pythonInterface.onMessage((msg) => {
            if (msg.name == 'amplitudeData') {
                this._handleMessage(msg);
            }
            else if (msg.name == 'amplitudeRange') {
                this._amplitudeRange = msg.amplitude_range
            }
        });
    }
    amplitudeRange() {
        return this._amplitudeRange;
    }
    requestData(unit_id, t1, t2) {
        let times = [];
        let amplitudes = [];
        let b1 = Math.floor(t1 / this._blockSize);
        let b2 = Math.floor(t2 / this._blockSize);
        for (let bb = b1; bb <= b2; bb++) {
            let x = this._requestBlock(unit_id, bb);
            if (x) {
                for (let i = 0; i < x.times.length; i++) {
                    let t0 = x.times[i];
                    if ((t1 <= t0) && (t0 <= t2)) {
                        times.push(x.times[i]);
                        amplitudes.push(x.amplitudes[i]);
                    }
                }
            }
        }
        return {
            times: times,
            amplitudes: amplitudes
        }
    }
    onUpdate(handler) {
        this._updateHandlers.push(handler);
    }
    _handleMessage(msg) {
        if (msg.blockSize != this._blockSize)
            return;
        let unit_id = msg.unit_id;
        let blockNum = msg.blockNum;
        let times = msg.times;
        let amplitudes = msg.amplitudes;
        if (!this._blocks[unit_id])
            this._blocks[unit_id] = {};
        this._blocks[unit_id][blockNum] = {
            times: times,
            amplitudes: amplitudes
        };
        for (let handler of this._updateHandlers) {
            handler();
        }
    }
    _requestBlock(unit_id, bnum) {
        if ((this._blocks[unit_id]) && (this._blocks[unit_id][bnum])) {
            return this._blocks[unit_id][bnum];
        }
        if ((this._requestedBlocks[unit_id]) && (this._requestedBlocks[unit_id][bnum])) {
            return;
        }
        let msg = {
            name: 'requestAmplitudeData',
            unit_id: unit_id,
            blockNum: bnum,
            blockSize: this._blockSize
        };
        this._pythonInterface.sendMessage(msg);
        if (!this._requestedBlocks[unit_id]) this._requestedBlocks[unit_id] = {};
        this._requestedBlocks[unit_id][bnum] = true;
    }
}

class SpikeAmplitudePlotInner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            sorting: null,
            recording: null,
            
            // python state
            num_timepoints: null,
            num_channels: null,
            samplerate: null,
            status: '',
            status_message: ''
        }
        this._initializedTimeRange = false;
        this._repainter = null;

        this._mainPanel = new TimeWidgetPanel(
            (painter, timeRange) => {this.paintUnits(painter, timeRange)},
            {label: ''}
        );
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this._dataModel = new SpikeAmplitudeDataModel(this.pythonInterface);
        this._dataModel.onUpdate(this._repaint);
        this.pythonInterface.setState({
            sorting: this.props.sorting,
            recording: this.props.recording,
        });
    }
    componentDidUpdate(prevProps, prevState) {        
        if (this.props.unit_ids !== prevProps.unit_ids) {
            this._repaint();
        }
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    paintUnits = (painter, trange) => {
        if (!this.props.unit_ids) return;
        let amplitudeRange = this._dataModel.amplitudeRange();
        let minAmp = amplitudeRange[0];
        let maxAmp = amplitudeRange[1];
        if (maxAmp == minAmp) maxAmp = minAmp + 1;
        this._mainPanel.setCoordYRange(minAmp, maxAmp);
        for (let unit_id of this.props.unit_ids) {
            let data0 = this._dataModel.requestData(unit_id, trange[0], trange[1]);
            let times0 = data0.times;
            let amps0 = data0.amplitudes;
            painter.setPen({color: _color_for_unit_id(unit_id)});
            for (let i in times0) {
                let t = times0[i];
                if ((trange[0] <= t) && (t <= trange[1])) {
                    let amp = amps0[i];
                    if ((minAmp <= amp) && (amp <= maxAmp))
                        painter.drawMarker(t, amp, 2, 'circle');
                }
            }
        }
    }
    _repaint = () => {
        this._repainter && this._repainter();
    }
    render() {
        if (this.state.status === 'finished') {
            let panels = [this._mainPanel];

            let width = Math.min(this.props.width, this.props.maxWidth || 99999);
            let height = Math.min(this.props.height || 600, this.props.maxHeight || 99999);
            
            return (
                <TimeWidget
                    panels={panels}
                    actions={[]}
                    width={this.props.width}
                    height={this.props.height}
                    registerRepainter={(repaintFunc) => {this._repainter=repaintFunc}}
                    samplerate={this.state.samplerate}
                    maxTimeSpan={1e7 / this.state.num_channels}
                    numTimepoints={this.state.num_timepoints}
                    width={width}
                    height={height}
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

class SpikeAmplitudePlotSelectUnitIds extends Component {
    state = {
        unit_ids: null
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
        let width = Math.min(this.props.width, this.props.maxWidth || 99999);
        let height = Math.min(this.props.height || 600, this.props.maxHeight || 99999);
        let selectUnitsHeight = 100;
        return (
            <React.Fragment>
                {
                    this.state.unit_ids ? (
                        <SpikeAmplitudePlot
                            {...this.props} width={width} height={height-selectUnitsHeight} unit_ids={this.state.unit_ids}
                        />
                    ) : <span />
                }
                <SelectUnits
                    sorting={this.props.sorting}
                    reactopyaParent={this}
                    reactopyaChildId="SelectUnits"
                    onSelectedUnitsChanged={this._handleSelectedUnitsChanged}
                    width={width}
                    height={selectUnitsHeight}
                />
            </React.Fragment>
        )
    }
}

function _color_for_unit_id(unit_id) {
    // Got these from: http://phrogz.net/css/distinct-colors.html
    const colors_str = '#ff0000, #665a4d, #1a661a, #0074d9, #695673, #8c0000, #e59900, #304032, #00258c, #ff00cc, #f27979, #e5d600, #00d991, #202440, #731d62, #d96236, #8c8300, #79f2ea, #a3aad9, #e673bf, #401a00, #403d10, #23858c, #0000ff, #e5005c, #ffb380, #669900, #00b8e6, #0000d9, #401023, #8c6246, #88ff00, #003340, #6953a6, #66001b, #593000, #879973, #005e8c, #1a0040, #ffbfd0, #e6cbac, #d9ffbf, #bfeaff, #ac39e6, #997378'
    const colors = colors_str.split(', ');
    const index = Number(unit_id);
    return colors[index % colors.length];
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