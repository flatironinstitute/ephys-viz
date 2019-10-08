import React, { Component } from "react";
import { CanvasPainter, MouseHandler } from "./CanvasPainter";

function g_elapsed() {
    return (new Date()) - 0;
}

export class CanvasWidgetLayer {
    constructor(onPaint) {
        this._onPaint = onPaint;
        this._ref = React.createRef();
        this._repaintHandlers = [];
        this._preserveAspectRatio = false;
        this._margins = [0, 0, 0, 0];
        this._coordXRange = [0, 1];
        this._coordYRange = [0, 1];
        this._repaintScheduled = false;
        this._lastRepaintTime = new Date();
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
    _canvasWidget() {
        return this._canvasWidget;
    }
    _setCanvasWidget(canvasWidget) {
        this._canvasWidget = canvasWidget;
    }
    repaint = () => {
        if (this._repaintScheduled) {
            return;
        }
        if (this._timeSinceLastRepaint() > 10) {
            // do it right away
            this._doRepaint();
            return;
        }
        this._repaintScheduled = true;
        let code = Math.random();
        let timer = new Date();
        setTimeout(() => {
            let elapsed = (new Date()) - timer;
            this._repaintScheduled = false;
            this._doRepaint();
        }, 5);
    }
    repaintImmediate = () => {
        this._doRepaint();
    }
    _doRepaint = () => {
        for (let handler of this._repaintHandlers) {
            handler();
        }
        this._lastRepaintTime = new Date();
    }
    _timeSinceLastRepaint() {
        return (new Date()) - this._lastRepaintTime;
    }
    width() {
        if (!this._canvasWidget) return 0;
        return this._canvasWidget.props.width;
    }
    height() {
        if (!this._canvasWidget) return 0;
        return this._canvasWidget.props.height;
    }
    setMargins(l, r, t, b) {
        this._margins = [l, r, t, b];
    }
    margins() {
        return cloneSimpleArray(this._margins);
    }
    coordXRange() {
        return cloneSimpleArray(this._coordXRange);
    }
    coordYRange() {
        return cloneSimpleArray(this._coordYRange);
    }
    setCoordXRange(min, max) {
        this._coordXRange = [min, max];
    }
    setCoordYRange(min, max) {
        this._coordYRange = [min, max];
    }
    setPreserveAspectRatio(val) {
        this._preserveAspectRatio = val;
    }
    preserveAspectRatio() {
        return this._preserveAspectRatio;
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

        this._mouseHandler.onMousePress(this._handleMousePress);
        this._mouseHandler.onMouseRelease(this._handleMouseRelease);
        this._mouseHandler.onMouseMove(this._handleMouseMove);
        this._mouseHandler.onMouseDrag(this._handleMouseDrag);
        this._mouseHandler.onMouseDragRelease(this._handleMouseDragRelease);

        this._animationRunning = false;
        this._onAnimationFrame = null;
        this._animationCode = 0;
        this._animationFPS = null;
        this._animationStartTime = null;
        this._animationTimeoutScheduled = false;

        this._keyPressHandlers = [];
    }
    componentDidMount() {
        this._connectLayers();
        this.setState({
            overrideWidth: null,
            overrideHeight: null
        });
        this._repaint();
    }
    componentDidUpdate() {
        this._connectLayers();
        this._repaint();
    }
    _connectLayers() {
        for (let layer of this.props.layers || []) {
            if (layer._canvasWidget != this) {
                this._connectLayer(layer);
            }
        }
    }
    _connectLayer(L) {
        L._setCanvasWidget(this);
        L._onRepaintCalled(() => {
            let ctx = L.context();
            if (!ctx) {
                L.repaintNeeded = true;
                return;
            }
            this._mouseHandler.setElement(L.canvasElement());
            let painter = new CanvasPainter(ctx, L);
            painter._initialize(this.props.width, this.props.height);
            L._callOnPaint(painter);
        });
    }
    _repaint = () => {
        for (let L of this.props.layers) {
            L.repaint();
        }
    }
    _handleMousePress = (X) => {
        this.props.onMousePress && this.props.onMousePress(X);
    }

    _handleMouseRelease = (X) => {
        this.props.onMouseRelease && this.props.onMouseRelease(X);
    }

    _handleMouseMove = (X) => {
        this.props.onMouseMove && this.props.onMouseMove(X);
    }

    _handleMouseDrag = (X) => {
        this.props.onMouseDrag && this.props.onMouseDrag(X);
    }

    _handleMouseDragRelease = (X) => {
        this.props.onMouseDragRelease && this.props.onMouseDragRelease(X);
    }
    render() {
        // Need to find better way to do this:
        setTimeout(() => {
            for (let L of this.props.layers) {
                if (L.repaintNeeded) {
                    L.repaintNeeded = false;
                    L.repaint();
                }
            }
        }, 100);
        let style0 = {
            position: 'relative',
            width: this.props.width,
            height: this.props.height,
            left: 0,
            top: 0
        }
        return (
            <div
                style={style0}
                onKeyDown={(evt) => {this.props.onKeyPress && this.props.onKeyPress(evt);}}
                tabIndex={0} // tabindex needed to handle keypress
            >
                {
                    this.props.layers.map((L, index) => (
                        <canvas
                            key={index}
                            style={{position: 'absolute', left: 0, top: 0}}
                            ref={L.ref()}
                            width={this.props.width}
                            height={this.props.height}
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

function cloneSimpleArray(x) {
    return x.slice(0);
}

