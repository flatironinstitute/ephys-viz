import React, { Component } from 'react';
import CanvasWidget from './CanvasWidget';
import AutoSizer from './AutoSizer';
import { FaPlay, FaStop } from 'react-icons/fa';
import { Grid, Slider, IconButton } from '@material-ui/core';

export default class AnimalPositionWidget extends Component {
    render() {
        return (
            <AutoSizer>
                <AnimalPositionWidgetInner {...this.props} />
            </AutoSizer>
        );
    }
}

class AnimalPositionWidgetInner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTimepoint: 0
        };
        this.currentTimepointController = new IntController();
        this.currentTimepointController.setValue(this.state.currentTimepoint);
        this.currentTimepointController.onChange(() => {
            if (this.currentTimepointController.value() === this.state.currentTimepoint) return;
            this.setState({ currentTimepoint: this.currentTimepointController.value() });
        })
        this.currentTimepointController.setValue(0);
    }
    render() {
        const { positions } = this.props;
        if (!positions) {
            return <span>Loading...</span>;
        }
        const N = positions[0].length;
        return (
            <Grid container direction="row">
                <Grid item xs={12}>
                    <AnimalPositionCanvas {...this.props} currentTimepointController={this.currentTimepointController} />
                </Grid>
                <Grid item xs={12}>
                    <PlayableSlider
                        min={0} max={N - 1} value={this.currentTimepointController.value()}
                        stepsPerSec={80}
                        onChange={(evt, val) => { this.currentTimepointController.setValue(val); }}
                        running={false}
                    />
                </Grid>
            </Grid>
        )
    }
}

class PlayableSlider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            running: false
        }
        this._frameId = null;
        this._animationTimer = null;
        
    }
    componentDidMount() {
        if ((this.props.running) && (!this.state.running)) {
            this.handleToggleStart();
        }
    }
    componentWillUnmount() {
        if (this._frameId) {
            window.cancelAnimationFrame(this._frameId);
        }
        this.setState({ running: false });
    }
    handleToggleStart = () => {
        if (this.state.running) {
            this.setState({ running: false });
        }
        else {
            this.setState({ running: true });
            this._animationTimer = new Date();
            this._requestAnimationFrame();
        }
    }
    _requestAnimationFrame() {
        this._frameId = window.requestAnimationFrame(this.handleAnimation);
    }
    handleAnimation = () => {
        if (!this.state.running) return;
        let elapsed = (new Date()) - this._animationTimer;
        let numToAdvance = Math.floor(this.props.stepsPerSec * (elapsed / 1000));
        if (numToAdvance > 0) {
            this.props.onChange(null, this.props.value + numToAdvance);
            this._animationTimer = new Date();
        }
        this._requestAnimationFrame();
    }
    render() {
        let icon = this.state.running ? <FaStop /> : <FaPlay />;
        return (
            <Grid container alignItems="center" spacing={2}>
                <Grid item>
                    <IconButton
                        onClick={this.handleToggleStart}
                        size="small"
                    >
                        {icon}
                    </IconButton>
                </Grid>
                <Grid item style={{flexGrow: 1}}>
                    <Slider {...this.props} />
                </Grid>
            </Grid>
        )
    }
}

class IntController {
    _value = 0;
    _changeHandlers = [];
    value() {
        return this._value;
    }
    setValue(val) {
        if (this._value === val) return;
        this._value = val;
        for (let handler of this._changeHandlers)
            handler();
    }
    onChange(handler) {
        this._changeHandlers.push(handler);
    }
}



class AnimalPositionCanvas extends CanvasWidget {
    constructor(props) {
        super(props);

        // this.mouseHandler().onMousePress(this.handleMousePress);
        // this.mouseHandler().onMouseRelease(this.handleMouseRelease);
        // this.mouseHandler().onMouseMove(this.handleMouseMove);
        // this.mouseHandler().onMouseDrag(this.handleMouseDrag);
        // this.mouseHandler().onMouseDragRelease(this.handleMouseDragRelease);

        this.mainLayer = this.addCanvasLayer(this.paintMainLayer);
        this.currentPositionLayer = this.addCanvasLayer(this.paintCurrentPositionLayer);
    }

    componentDidMount() {
        this.updateRanges();
        this.repaint();
        // this.startAnimation(this.onAnimationFrame, 100);
        this.props.currentTimepointController.onChange(() => { this.currentPositionLayer.repaint(); });
    }

    componentDidUpdate() {
        this.updateRanges();
        this.repaint();
    }

    updateRanges() {
        const { positions } = this.props;
        let W = this.props.width;
        if (!W) W = 400;
        let H = Math.min(600, W);
        this.setSize(W, H);
        if (positions) {
            let xmin = compute_min(positions[0]);
            let xmax = compute_max(positions[0]);
            let ymin = compute_min(positions[1]);
            let ymax = compute_max(positions[1]);
            this.setCoordXRange(xmin, xmax);
            this.setCoordYRange(ymin, ymax);
        }
        else {
            this.setCoordXRange(0, 1);
            this.setCoordYRange(0, 1);
        }
    }

    // onAnimationFrame = () => {
    //     this.animationLayer.repaint();
    // }

    paintMainLayer = (painter) => {
        const { positions } = this.props;

        const W = this.width();
        const H = this.height();

        painter.clear();

        if (positions) {
            painter.useCoords();
            painter.setPen({ color: 'black' });
            let path = painter.newPainterPath();
            for (let i = 0; i < positions[0].length; i++) {
                let x = positions[0][i];
                let y = positions[1][i];
                path.lineTo(x, y);
            }
            painter.drawPath(path);
        }
    }

    paintCurrentPositionLayer = (painter) => {
        const { positions } = this.props;

        const W = this.width();
        const H = this.height();

        painter.clear();

        if (positions) {
            painter.useCoords();
            // let elapsed = this.animationElapsedMsec();
            // let j = Math.floor(elapsed / 1000000 * positions[0].length);
            let j = this.props.currentTimepointController.value();
            if (j < positions[0].length) {
                painter.setPen({ color: 'pink', width: 5 });
                let path = painter.newPainterPath();
                for (let i = Math.max(0, j - 40 + 1); i <= j; i++) {
                    let x = positions[0][i];
                    let y = positions[1][i];
                    path.lineTo(x, y);
                }
                painter.drawPath(path);
                painter.setBrush({ color: 'red' });
                {
                    let x = positions[0][j];
                    let y = positions[1][j];
                    painter.fillMarker(x, y, 5);
                }
            }
        }
    }

    _randint(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    };

    handleMousePress = (X) => {
        if (!X) return;
        // let pos = X.pos;
        // let elec_ind = this.electrodeIndexAtPixel(X.pos);
        // if ((X.modifiers.ctrlKey) || (X.modifiers.shiftKey)) {
        // }
    }

    handleMouseRelease = (X) => {
    }

    handleMouseMove = (X) => {
    }

    handleMouseDrag = (X) => {
        // X.rect;
    }

    handleMouseDragRelease = (X) => {
        // X.rect;
    }

    render() {
        if (!this.props.positions) {
            return <span>
                <div>Loading...</div>
            </span>
        }

        return this.renderCanvasWidget();
    }
}

function compute_min(x) {
    if (x.length == 0) return 0;
    let ret = x[0];
    for (let i=0; i<x.length; i++) {
        if (x[i] < ret) ret = x[i];
    }
    return ret;
}

function compute_max(x) {
    if (x.length == 0) return 0;
    let ret = x[0];
    for (let i=0; i<x.length; i++) {
        if (x[i] > ret) ret = x[i];
    }
    return ret;
}