import React, { Component } from "react";
import { CanvasPainter, MouseHandler } from "./CanvasPainter";

class CanvasWidgetLayer {
    constructor(onPaint) {
        this._onPaint = onPaint;
        this._ref = React.createRef();
        this._repaintHandlers = [];
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
        this.state = {
            canvasWidgetWidth: 100,
            canvasWidgetHeight: 100,
            coordXRange: [0, 1],
            coordYRange: [0, 1],
            preserveAspectRatio: false,
            margins: [0, 0, 0, 0]
        };
        this._canvasLayers = [];
        this._mouseHandler = new MouseHandler();

        this._animationRunning = false;
        this._onAnimationFrame = null;
        this._animationCode = 0;
        this._animationFPS = null;
        this._animationStartTime = null;
        this._animationTimeoutScheduled = false;
    }
    componentWillUnmount() {
        this.stopAnimation();
    }
    addCanvasLayer(onPaint) {
        let L = new CanvasWidgetLayer(onPaint, this.width(), this.height());
        L._onRepaintCalled(() => {
            let ctx = L.context();
            if (!ctx) return;
            this._mouseHandler.setElement(L.canvasElement());
            let painter = new CanvasPainter(ctx, this);
            painter._initialize(this.width(), this.height());
            L._callOnPaint(painter);
        });
        this._canvasLayers.push(L);
        return L;
    }
    setSize(width, height) {
        if ((width != this.width()) || (height != this.height())) {
            this.setState({
                canvasWidgetWidth: width,
                canvasWidgetHeight: height
            });
        }
    }
    width() {
        return this.state.canvasWidgetWidth;
    }
    height() {
        return this.state.canvasWidgetHeight;
    }
    setCoordXRange(xmin, xmax) {
        if ((xmin === this.state.coordXRange[0]) && (xmax === this.state.coordXRange[1])) {
            return;
        }
        this.setState({
            coordXRange: [xmin, xmax]
        });
    }
    setCoordYRange(ymin, ymax) {
        if ((ymin === this.state.coordYRange[0]) && (ymax === this.state.coordYRange[1])) {
            return;
        }
        this.setState({
            coordYRange: [ymin, ymax]
        });
    }
    setPreserveAspectRatio(val) {
        if (this.state.preserveAspectRatio === val)
            return;
        this.setState({
            preserveAspectRatio: val
        });
    }
    setMargins(l, r, t, b) {
        const lrtb = [l, r, t, b];
        if (JSON.stringify(lrtb) === JSON.stringify(this.state.margins))
            return
        this.setState({
            margins: lrtb
        });
    }
    coordXRange() {
        return [this.state.coordXRange[0], this.state.coordXRange[1]];
    }
    coordYRange() {
        return [this.state.coordYRange[0], this.state.coordYRange[1]];
    }
    preserveAspectRatio() {
        return this.state.preserveAspectRatio;
    }
    margins() {
        return JSON.parse(JSON.stringify(this.state.margins));
    }
    mouseHandler() {
        return this._mouseHandler;
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
        // We'll need to think of a better way to do this
        setTimeout(this.repaint, 100);

        return (
            <div style={{position: 'relative', width: this.width(), height: this.height(), left: 0, top: 0}}>
                {
                    this._canvasLayers.map((L, index) => (
                        <canvas
                            key={index}
                            style={{position: 'absolute', left: 0, top: 0}}
                            ref={L.ref()}
                            width={this.width()}
                            height={this.height()}
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