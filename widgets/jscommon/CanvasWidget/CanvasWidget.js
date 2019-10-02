import React, { Component } from "react";
import { CanvasPainter, MouseHandler } from "./CanvasPainter";

class CanvasWidgetLayer {
    constructor(onPaint, canvasWidget) {
        this._onPaint = onPaint;
        this._ref = React.createRef();
        this._repaintHandlers = [];
        this._canvasWidget = canvasWidget;
        this._margins = null;
        this._coordXRange = null;
        this._coordYRange = null;
    }
    ref() {
        return this._ref;
    }
    context() {
        let canvas = this._ref.current;
        if (!canvas) return null;
        return canvas.getContext('2d');
    }
    canvasElement() {
        let canvas = this._ref.current;
        if (!canvas) return null;
        return canvas;
    }
    repaint = () => {
        for (let handler of this._repaintHandlers) {
            handler();
        }
    }
    width() {
        return this._canvasWidget.canvasWidgetWidth();
    }
    height() {
        return this._canvasWidget.canvasWidgetHeight();
    }
    setMargins(l, r, t, b) {
        this._margins = [l, r, t, b];
    }
    margins() {
        return this._margins ? clone(this._margins) : this._canvasWidget.margins();
    }
    coordXRange() {
        return this._coordXRange ? clone(this._coordXRange) : this._canvasWidget.coordXRange();
    }
    coordYRange() {
        return this._coordYRange ? clone(this._coordYRange) : this._canvasWidget.coordYRange();
    }
    setCoordXRange(min, max) {
        this._coordXRange = [min, max];
    }
    setCoordYRange(min, max) {
        this._coordYRange = [min, max];
    }
    preserveAspectRatio() {
        return this._canvasWidget.preserveAspectRatio();
    }
    pixToCoords(pix) {
        let margins = this.margins();
        let coordXRange = this.coordXRange();
        let coordYRange = this.coordYRange();
        let width = this.width();
        let height = this.height();
        let xpct = (pix[0] - margins[0]) / (width - margins[0] - margins[1]);
        let x = coordXRange[0] + xpct * (coordXRange[1] - coordXRange[0]);
        let ypct = (pix[1] - margins[2]) / (height - margins[2] - margins[3]);
        let y = coordYRange[0] + ypct * (coordYRange[1] - coordYRange[0]);
        return [x, y];
    }
    _onRepaintCalled(handler) {
        this._repaintHandlers.push(handler);
    }
    _callOnPaint(painter) {
        this._onPaint(painter);
    }
}

export default class CanvasWidget extends Component {
    constructor(props) {
        super(props);
        this._coordXRange = [0, 1];
        this._coordYRange = [0, 1];
        this._preserveAspectRatio = false;
        this._margins = [0, 0, 0, 0];
        this._canvasLayers = [];
        this._mouseHandler = new MouseHandler();

        this._animationRunning = false;
        this._onAnimationFrame = null;
        this._animationCode = 0;
        this._animationFPS = null;
        this._animationStartTime = null;
        this._animationTimeoutScheduled = false;

        this._keyPressHandlers = [];
    }
    initializeCanvasWidget() {
        this.setState({
            overrideWidth: null,
            overrideHeight: null
        });
        this.repaint();
    }
    componentWillUnmount() {
        this.stopAnimation();
    }
    addCanvasLayer(onPaint) {
        let L = new CanvasWidgetLayer(onPaint, this);
        L._onRepaintCalled(() => {
            let ctx = L.context();
            if (!ctx) {
                return;
            }
            this._mouseHandler.setElement(L.canvasElement());
            let painter = new CanvasPainter(ctx, L);
            painter._initialize(this.canvasWidgetWidth(), this.canvasWidgetHeight());
            L._callOnPaint(painter);
        });
        this._canvasLayers.push(L);
        return L;
    }
    canvasWidgetWidth() {
        return this.state.overrideWidth || this.props.width;
    }
    canvasWidgetHeight() {
        return this.state.overrideHeight || this.props.height;
    }
    setCanvasSize(W, H) {
        this.setState({
            overrideWidth: W,
            overrideHeight: H
        });
    }
    setCoordXRange(xmin, xmax) {
        if ((xmin === this._coordXRange[0]) && (xmax === this._coordXRange[1])) {
            return;
        }
        this._coordXRange = [xmin, xmax];
    }
    setCoordYRange(ymin, ymax) {
        if ((ymin === this._coordYRange[0]) && (ymax === this._coordYRange[1])) {
            return;
        }
        this._coordYRange = [ymin, ymax];
    }
    pixToCoords(pix) {
        let xpct = (pix[0] - this._margins[0]) / (this.canvasWidgetWidth() - this._margins[0] - this._margins[1]);
        let x = this._coordXRange[0] + xpct * (this._coordXRange[1] - this._coordXRange[0]);
        let ypct = (pix[1] - this._margins[2]) / (this.canvasWidgetHeight() - this._margins[2] - this._margins[3]);
        let y = this._coordYRange[0] + ypct * (this._coordYRange[1] - this._coordYRange[0]);
        return [x, y];
    }
    setPreserveAspectRatio(val) {
        if (this._preserveAspectRatio === val)
            return;
        this._preserveAspectRatio = val;
    }
    setMargins(l, r, t, b) {
        const lrtb = [l, r, t, b];
        if (JSON.stringify(lrtb) === JSON.stringify(this._margins))
            return
        this._margins = lrtb;
    }
    coordXRange() {
        return [this._coordXRange[0], this._coordXRange[1]];
    }
    coordYRange() {
        return [this._coordYRange[0], this._coordYRange[1]];
    }
    preserveAspectRatio() {
        return this._preserveAspectRatio;
    }
    margins() {
        return clone(this._margins);
    }
    mouseHandler() {
        return this._mouseHandler;
    }
    onKeyPress(handler) {
        this._keyPressHandlers.push(handler);
    }
    _handleKeyPress = (evt) => {
        for (let handler of this._keyPressHandlers) {
            handler(evt);
        }
    }
    startAnimation(onAnimationFrame, fps) {
        if (this._animationRunning) {
            this.stopAnimation();
        }
        this._animationRunning = true;
        this._onAnimationFrame = onAnimationFrame;
        this._animationCode = this._animationCode + 1;
        this._animationStartTime = new Date();
        this._animationFPS = fps;
        this.scheduleNextAnimationFrame();
    }
    stopAnimation() {
        this._animationCode = this._animationCode + 1;
        this._animationRunning = false;
    }
    animationElapsedMsec() {
        if (!this._animationRunning) return 0;
        let elapsed = (new Date()) - this._animationStartTime;
        return elapsed;
    }
    scheduleNextAnimationFrame() {
        let code = this._animationCode;
        setTimeout(() => {
            if (code != this._animationCode)
                return;
            if (!this._animationRunning)
                return;
            this._onAnimationFrame();
            this.scheduleNextAnimationFrame();
        }, 1000/this._animationFPS);
    }
    repaint = () => {
        for (let L of this._canvasLayers) {
            L.repaint();
        }
    }
    renderCanvasWidget() {
        // Need to ind better way to do this:
        setTimeout(() => {
            this.repaint();
        }, 100);
        return (
            <div
                style={{position: 'relative', width: this.canvasWidgetWidth(), height: this.canvasWidgetHeight(), left: 0, top: 0}}
                onKeyDown={this._handleKeyPress}
                tabIndex={0} // tabindex needed to handle keypress
            >
                {
                    this._canvasLayers.map((L, index) => (
                        <canvas
                            key={index}
                            style={{position: 'absolute', left: 0, top: 0}}
                            ref={L.ref()}
                            width={this.canvasWidgetWidth()}
                            height={this.canvasWidgetHeight()}
                            onMouseDown={this._mouseHandler.mouseDown}
                            onMouseUp={this._mouseHandler.mouseUp}
                            onMouseMove={this._mouseHandler.mouseMove}
                        />
                    ))
                }
            </div>
        );
    }
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}