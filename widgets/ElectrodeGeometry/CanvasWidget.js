import React, { Component } from "react";
import { CanvasPainter, MouseHandler } from "./CanvasPainter";

class CanvasWidgetLayer {
    constructor(onPaint) {
        this._onPaint = onPaint;
        this._ref = React.createRef();
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
    _callOnPaint(painter) {
        this._onPaint(painter);
    }
}

export default class CanvasWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canvasWidgetWidth: 100,
            canvasWidgetHeight: 100
        };
        this._canvasLayers = [];
        this._mouseHandler = new MouseHandler();
    }
    addCanvasLayer(onPaint) {
        let L = new CanvasWidgetLayer(onPaint, this._width, this._height)
        this._canvasLayers.push(L);
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
    mouseHandler() {
        return this._mouseHandler;
    }
    repaint = () => {
        for (let L of this._canvasLayers) {
            let ctx = L.context();
            if (!ctx) return;
            this._mouseHandler.setElement(L.canvasElement());
            let painter = new CanvasPainter(ctx);
            L._callOnPaint(painter);
        }
    }
    renderCanvasWidget() {
        // We'll need to think of a better way to do this
        setTimeout(this.repaint, 100);

        return (
            <div style={{position: 'relative'}}>
                {
                    this._canvasLayers.map((L, index) => (
                        <canvas
                            key={index}
                            style={{position: 'absolute'}}
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