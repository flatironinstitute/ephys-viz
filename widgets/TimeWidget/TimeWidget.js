import React, { Component } from 'react';
import { Toolbar, IconButton } from '@material-ui/core';
import { FaSearchMinus, FaSearchPlus, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CanvasWidget from '../jscommon/CanvasWidget';
export { PainterPath } from '../jscommon/CanvasWidget';

export default class TimeWidget extends CanvasWidget {
    constructor(props) {
        super(props);
        this.state = this.state || {};
        this.state._statusBarText = '';

        this._panels = [];
        this._timeRange = [0, 1000];
        this._timeRangeChangedHandlers = [];
        this._currentTime = null;
        this._anchorTimeRange = null;
        this._dragging = false;
        this._customActions = [];
        this._toolbarHeight = 50;
        this._statusBarHeight = 0;
        this._paintPanelIndex = 0;
        this._paintPanelCode = 0;
        this._maxTimeSpan = null

        this.mouseHandler().onMousePress(this.handle_mouse_press);
        this.mouseHandler().onMouseRelease(this.handle_mouse_release);
        this.mouseHandler().onMouseDrag(this.handle_mouse_drag);
        this.mouseHandler().onMouseDragRelease(this.handle_mouse_drag_release);

        this.onKeyPress(this.handle_key_press);
    }
    initializeTimeWidget() {
        this._timeAxisLayer = this.addCanvasLayer(this.paintTimeAxisLayer);
        this._mainLayer = this.addCanvasLayer(this.paintMainLayer);
        this._cursorLayer = this.addCanvasLayer(this.paintCursorLayer);
        this._panelLabelLayer = this.addCanvasLayer(this.paintPanelLabelLayer);

        this._mainLayer.setMargins(50, 10, 15, 50);
        this._cursorLayer.setMargins(50, 10, 15, 50);

        this.initializeCanvasWidget();
        this.updateTimeWidget();
    }
    updateTimeWidget() {
        this.setCanvasSize(this.props.width, this.props.height - this._toolbarHeight - this._statusBarHeight);
    }
    paintMainLayer = (painter) => {
        this._paintPanelIndex = 0;
        this._paintPanelCode++;
        painter.clear();
        painter.useCoords();
        this.setCoordXRange(0, 1);
        this.setCoordYRange(0, 1);
        painter.setPen({color: 'gray'});
        painter.drawLine(0, 0, 0, 1);
        painter.drawLine(1, 0, 1, 1);
        painter.drawLine(0, 1, 1, 1);

        this._paintPanels(painter, this._paintPanelCode);
    }

    _paintPanels = (painter, paintPanelCode) => {
        if (paintPanelCode !== this._paintPanelCode) {
            // we have started a new painting
            return;
        }
        const indexPermutation = _getIndexPermutation(this._panels.length);
        let timer = new Date();
        while (this._paintPanelIndex < this._panels.length) {
            const panel = this._panels[indexPermutation[this._paintPanelIndex]];
            this.setCoordXRange(this._timeRange[0], this._timeRange[1]);
            // v1=-1 => y1
            //  v2=1 => y2
            // (v1-a) / (b-a) * H = y1
            // (v2-a) / (b-a) * H = y2
            // v1 - a = y1/H * (b-a) 
            // v2 - a = y2/H * (b-a) 
            // (v2 - v1) = (y2-y1)/H * (b-a)
            // b-a = (v2-v1) / (y2-y1) * H
            // a = v1 - y1/H*(b-a)
            let v1 = panel._coordYRange[0];
            let v2 = panel._coordYRange[1];
            let b_minus_a = (v2 - v1) / (panel._yRange[1] - panel._yRange[0]) * this.props.height;
            let a = v1 - panel._yRange[0] * b_minus_a / this.props.height;
            let b = a + b_minus_a;

            this.setCoordYRange(a, b);
            panel.paint(painter);
            this._paintPanelIndex++;

            let elapsed = (new Date()) - timer;
            if (elapsed > 200) {
                setTimeout(() => {
                    this._paintPanels(painter, paintPanelCode);
                }, 1);
                return;
            }
        }
    }
    paintCursorLayer = (painter) => {
        painter.clear();

        this.setCoordXRange(this._timeRange[0], this._timeRange[1]);
        this.setCoordYRange(0, 1);
        painter.useCoords();

        if (this._currentTime !== null) {
            if ((this._timeRange[0] <= this._currentTime) && (this._currentTime <= this._timeRange[1])) {
                painter.setPen({width:2, color: 'blue'});
                painter.drawLine(this._currentTime, 0, this._currentTime, 1);
            }
        }
    }
    paintTimeAxisLayer = (painter) => {
        let W = this.canvasWidgetWidth();
        let H = this.canvasWidgetHeight();
        this._timeAxisLayer.setMargins(50, 10, H-50, 0);
        this._timeAxisLayer.setCoordXRange(this._timeRange[0], this._timeRange[1]);
        this._timeAxisLayer.setCoordYRange(0, 1);
        painter.clear();
        painter.useCoords();
        painter.setPen({color: 'rgb(22, 22, 22)'});
        painter.drawLine(this._timeRange[0], 1, this._timeRange[1], 1);
        let samplerate = 30000; //fix this
        let ticks = get_ticks(this._timeRange[0], this._timeRange[1], W, samplerate);
        for (let tick of ticks) {
            if (!tick.scale_info) {
                painter.drawLine(tick.t, 1, tick.t, 1 - tick.height);
            }
            else {
                let info = tick;
                painter.drawLine(info.t1, 0.45, info.t2, 0.45);
                painter.drawLine(info.t1, 0.45, info.t1, 0.5);
                painter.drawLine(info.t2, 0.45, info.t2, 0.5);
                let rect = [info.t1, 0, info.t2 - info.t1, 0.35];
                let alignment = {AlignTop: true, AlignCenter: true};
                painter.drawText(rect, alignment, info.label + '');
            }
        }
    }
    paintPanelLabelLayer = (painter) => {
        let W = this.canvasWidgetWidth();
        let H = this.canvasWidgetHeight();
        
        painter.clear();
        painter.useCoords();

        for (let i = 0; i < this._panels.length; i++) {
            let panel = this._panels[i];
            let p1 = i / this._panels.length;
            let p2 = (i + 1) / this._panels.length;
            this._panelLabelLayer.setMargins(0, W - 50, 15 + (H - 50 - 15) * p1, H - (15 + (H - 50 - 15) * p2));
            this._panelLabelLayer.setCoordXRange(0, 1);
            this._panelLabelLayer.setCoordYRange(0, 1);
            
            let rect = [0.2, 0.2, 0.6, 0.6];
            let alignment = {AlignRight: true, AlignVCenter: true};
            panel._opts.label + '' && painter.drawText(rect, alignment, panel._opts.label + '');
        }
    }
    addAction(action, opts) {
        this._customActions.push({
            action: action,
            opts: opts
        });
    }
    currentTime() {
        return this._currentTime;
    }
    numTimepoints() {
        return this.props.num_timepoints || this.state.num_timepoints;
    }
    setCurrentTime(t) {
        if (t < 0) t = 0;
        if (t >= this.numTimepoints())
            t = this.numTimepoints() - 1;
        if (this._currentTime === t)
            return;
        this._currentTime = t;
        this._cursorLayer.repaint();
    }
    setMaxTimeSpan(val) {
        this._maxTimeSpan = Math.ceil(val)
    }
    setTimeRange(trange) {
        let tr = clone(trange);
        if (tr[1] >= this.numTimepoints()) {
            let delta = this.numTimepoints() -1 - tr[1];
            tr[0] += delta;
            tr[1] += delta;
        }
        if (tr[0] < 0) {
            let delta = -tr[0];
            tr[0] += delta;
            tr[1] += delta;
        }
        if (tr[1] >= this.numTimepoints()) {
            tr[1] = this.numTimepoints() - 1;
        }
        if (this._maxTimeSpan) {
            if (tr[1] - tr[0] > this._maxTimeSpan) {
                return;
                // tr[0] = Math.max(0, Math.floor((tr[0] + tr[1]) / 2 - this._maxTimeSpan / 2));
                // tr[1] = tr[0] + this._maxTimeSpan;
            }
        }
        if ((this._timeRange[0] === tr[0]) && (this._timeRange[1] === tr[1]))
            return;
        this._timeRange = tr;
        for (let handler of this._timeRangeChangedHandlers) {
            handler();
        }
        this.repaint();        
    }
    timeRange() {
        return [this._timeRange[0], this._timeRange[1]];
    }
    onTimeRangeChanged(handler) {
        this._timeRangeChangedHandlers.push(handler);
    }
    clearPanels() {
        this._panels = [];
        this.updateLayout();
    }
    addPanel(onPaint, opts) {
        let panel = new TimeWidgetPanel(onPaint, opts);
        this._panels.push(panel);
        this.updateLayout();
        return panel;
    }
    updateLayout() {
        let H0 = this.props.height;
        let panelHeight = H0 / this._panels.length;
        let y0 = 0;
        for (let panel of this._panels) {
            panel.setYRange(y0, y0+panelHeight);
            y0 += panelHeight;
        }
    }
    pixToTime(pix) {
        let coords = this._mainLayer.pixToCoords(pix);
        return coords[0];
    }
    setStatusBarText(txt) {
        if (this.state._statusBarText === txt)
            return;
        this.setState({
            _statusBarText: txt
        });
        let height = txt ? 40 : 0;
        if (height !== this._statusBarHeight) {
            this._statusBarHeight = height;
            this.updateTimeWidget();
        }
    }
    handle_mouse_press = (X) => {
        let t = this.pixToTime(X.pos);
        this._anchorTimeRange = clone(this._timeRange);
    }

    handle_mouse_release = (X) => {
        if (!this._dragging) {
            const t = this.pixToTime(X.pos);
            this.setCurrentTime(t);
        }
    }

    handle_mouse_drag = (X) => {
        this._dragging = true;
        let t1 = this.pixToTime(X.anchor);
        let t2 = this.pixToTime(X.pos);
        let tr = clone(this._anchorTimeRange);
        tr[0] += t1 - t2;
        tr[1] += t1 - t2;
        this.setTimeRange(tr);
    }

    handle_mouse_drag_release = (X) => {
        this._dragging = false;
    }

    handle_key_press = (event) => {
        for (let a of this._customActions) {
            if (a.opts.key === event.keyCode) {
                a.action();
                event.preventDefault();
                return false;
            }
        }
        switch (event.keyCode) {
            case 37: this.handle_key_left(event); event.preventDefault(); return false;
            case 39: this.handle_key_right(event); event.preventDefault(); return false;
            case 187: this.zoomTime(1.15); event.preventDefault(); return false;
            case 189: this.zoomTime(1 / 1.15); event.preventDefault(); return false;
            case 35 /*end*/: this.handle_end(event); event.preventDefault(); return false;
            case 36 /*end*/: this.handle_home(event); event.preventDefault(); return false;
            default: console.info('key: ' + event.keyCode);
        }
    }

    handle_key_left = (X) => {
        let span = this._timeRange[1] - this._timeRange[0];
        this.translateTime(-span * 0.2);
    }
    handle_key_right = (X) => {
        let span = this._timeRange[1] - this._timeRange[0];
        this.translateTime(span * 0.2);
    }
    handle_home = (X) => {
        this.translateTime(-this._currentTime);
    }
    handle_end = (X) => {
        this.translateTime(this.numTimepoints()-this._currentTime);
    }
    translateTime = (delta_t) => {
        let tr = clone(this._timeRange);
        tr[0] += delta_t;
        tr[1] += delta_t;
        let t0 = this._currentTime + delta_t;
        this.setCurrentTime(t0);
        this.setTimeRange(tr);
    }
    zoomTime = (factor) => {
        let anchor_time = this._currentTime;
        let tr = clone(this._timeRange);
        if ((anchor_time < tr[0]) || (anchor_time > tr[1]))
            anchor_time = tr[0];
        let old_t1 = tr[0];
        let old_t2 = tr[1];
        let t1 = anchor_time + (old_t1 - anchor_time) / factor;
        let t2 = anchor_time + (old_t2 - anchor_time) / factor;
        this.setTimeRange([t1, t2]);
    }

    renderTimeWidget() {
        return (
            <div>
                <TimeWidgetToolBar
                    width={this.canvasWidgetWidth()}
                    height={this._toolbarHeight}
                    onZoomIn={() => {this.zoomTime(1.15)}}
                    onZoomOut={() => {this.zoomTime(1 / 1.15)}}
                    onShiftTimeLeft={() => {this.handle_key_left()}}
                    onShiftTimeRight={() => {this.handle_key_right()}}
                    customActions={this._customActions}
                />
                {this.renderCanvasWidget()}
                <TimeWidgetStatusBar
                    width={this.canvasWidgetWidth()}
                    height={this._statusBarHeight}
                    text={this.state._statusBarText}
                />
            </div>
        );
    }
}

class TimeWidgetToolBar extends Component {
    render() {
        const style0 = {
            position: 'relative',
            width: this.props.width,
            height: this.props.height
        };
        let buttons = [];
        buttons.push({
            title: "Time zoom out (-)",
            onClick: this.props.onZoomOut,
            icon: <FaSearchMinus />
        });
        buttons.push({
            title: "Time zoom in (+)",
            onClick: this.props.onZoomIn,
            icon: <FaSearchPlus />
        });
        buttons.push({
            title: "Shift time left [left arrow]",
            onClick: this.props.onShiftTimeLeft,
            icon: <FaArrowLeft />
        });
        buttons.push({
            title: "Shift time right [right arrow]",
            onClick: this.props.onShiftTimeRight,
            icon: <FaArrowRight />
        });
        for (let a of this.props.customActions) {
            buttons.push({
                title: a.opts.title,
                onClick: a.action,
                icon: a.opts.icon
            });
        }
        return (
            <div style={style0}>
                <Toolbar style={{minHeight: this.props.height}}>
                    {
                        buttons.map((button) => (
                            <IconButton title={button.title} onClick={button.onClick} key={button.title}>
                                {button.icon}
                            </IconButton>
                        ))
                    }
                </Toolbar>
            </div>
            
        );
    }
}

class TimeWidgetStatusBar extends Component {
    render() {
        const style0 = {
            position: 'relative',
            width: this.props.width,
            height: this.props.height
        };
        return (
            <div style={style0}>
                {this.props.text}
            </div>
        );
    }
}

function get_ticks(t1, t2, width, samplerate) {

    let W = width;

    // adapted from MountainView
    const min_pixel_spacing_between_ticks = 15;
    const tickinfo = [
        {
            name: '1 ms',
            interval: 1e-3 * samplerate
        },
        {
            name: '10 ms',
            interval: 10 * 1e-3 * samplerate
        },
        {
            name: '100 ms',
            interval: 100 * 1e-3 * samplerate
        },
        {
            name: '1 s',
            interval: 1 * samplerate
        },
        {
            name: '10 s',
            interval: 10 * samplerate
        },
        {
            name: '1 m',
            interval: 60 * samplerate
        },
        {
            name: '10 m',
            interval: 10 * 60 * samplerate
        },
        {
            name: '1 h',
            interval: 60 * 60 * samplerate
        },
        {
            name: '1 day',
            interval: 24 * 60 * 60 * samplerate
        }
    ];

    let ticks = [];
    let first_scale_shown = true;
    let height = 0.2;
    for (let info of tickinfo) {
        const scale_pixel_width = W / (t2 - t1) * info.interval;
        let show_scale = false;
        if (scale_pixel_width >= min_pixel_spacing_between_ticks) {
            show_scale = true;
        }
        else {
            show_scale = false;
        }
        if (show_scale) {
            // msec
            let u1 = Math.floor(t1 / info.interval);
            let u2 = Math.ceil(t2 / info.interval);
            let first_tick = true;
            for (let u = u1; u <= u2; u++) {
                let t = u * info.interval;
                if ((t1 <= t) && (t <= t2)) {
                    let tick = {
                        t: t,
                        height: height
                    };
                    if (first_scale_shown) {
                        if (first_tick) {
                            ticks.push({
                                scale_info: true,
                                t1: t1,
                                t2: t1 + info.interval,
                                label: info.name
                            });
                            first_tick = false;
                        }
                        first_scale_shown = false;
                    }
                    ticks.push(tick);
                }
            }
            height += 0.1;
            height = Math.min(height, 0.45);
        }
    }
    // remove duplicates
    let ticks2 = [];
    for (let i = 0; i < ticks.length; i++) {
        let tick = ticks[i];
        let duplicate = false;
        if (!tick.scale_info) {
            for (let j = i + 1; j < ticks.length; j++) {
                if (Math.abs(ticks[j].t - tick.t) < 1) {
                    duplicate = true;
                    break;
                }
            }
        }
        if (!duplicate) {
            ticks2.push(tick);
        }
    }
    return ticks2;
}

class TimeWidgetPanel {
    constructor(onPaint, opts) {
        this.onPaint = onPaint;
        this._opts = opts;
        this.timeRange = null;
        this._yRange = [0, 1];
        this._coordYRange = [-1, 1];
    }
    setYRange(y1, y2) {
        this._yRange = [y1, y2];
    }
    setCoordYRange(y1, y2) {
        this._coordYRange = [y1, y2];
    }
    paint(painter) {
        this.onPaint(painter);
    }
}

function _getIndexPermutation(N) {
    let ret = [];
    let indices = [];
    for (let i = 0; i < N; i++)
        indices.push(i);
    let used = [];
    for (let i of indices) {
        used.push(false);
    }
    let cur = 0;
    let increment = Math.floor(N / 2);
    if (increment < 1) increment = 1;
    while (ret.length < N) {
        if (!used[cur]) {
            ret.push(cur);
            used[cur] = true;
        }
        cur += increment;
        if (cur >= N) {
            cur = 0;
            if (increment <= 1) {
                increment = 1;
            }
            else {
                increment = Math.floor(increment / 2);
            }
        }
    }
    return ret;
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}