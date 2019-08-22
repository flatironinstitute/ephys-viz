import React, { Component } from 'react';
import CanvasWidget from '../jscommon/CanvasWidget';

export default class PlaceFieldCanvas extends CanvasWidget {
    constructor(props) {
        super(props);

        // this.mouseHandler().onMousePress(this.handleMousePress);
        // this.mouseHandler().onMouseRelease(this.handleMouseRelease);
        // this.mouseHandler().onMouseMove(this.handleMouseMove);
        // this.mouseHandler().onMouseDrag(this.handleMouseDrag);
        // this.mouseHandler().onMouseDragRelease(this.handleMouseDragRelease);

        this.mainLayer = this.addCanvasLayer(this.paintMainLayer);
        this.currentPositionLayer = this.addCanvasLayer(this.paintCurrentPositionLayer);
        this.spikeLayer = this.addCanvasLayer(this.paintSpikeLayer);
    }

    componentDidMount() {
        this.updateRanges();
        this.repaint();
        // this.startAnimation(this.onAnimationFrame, 100);
    }

    componentDidUpdate(prevProps) {
        if ((prevProps.positions !== this.props.positions) || (prevProps.width !== this.props.width)) {
            this.updateRanges();
            this.mainLayer.repaint();
            this.spikeLayer.repaint();
        }
        else if ((prevProps.spike_time_indices !== this.props.spike_time_indices) || (prevProps.spike_labels !== this.props.spike_labels) || (prevProps.selectedUnits !== this.props.selectedUnits)) {
            this.spikeLayer.repaint();
        }
        this.currentPositionLayer.repaint();
    }

    updateRanges() {
        const { positions, width } = this.props;
        const W = width;
        if (!W) W = 500;
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

        painter.clear();

        if (positions) {
            painter.useCoords();
            painter.setPen({ color: 'lightblue' });
            let path = painter.newPainterPath();
            for (let i = 0; i < positions[0].length; i++) {
                let x = positions[0][i];
                let y = positions[1][i];
                path.lineTo(x, y);
            }
            painter.drawPath(path);
        }
    }

    paintSpikeLayer = (painter) => {
        const { positions, spike_time_indices, spike_labels, selectedUnits, unitColorArray, currentTimepoint } = this.props;

        painter.clear();

        if (spike_time_indices) {
            painter.useCoords();
            for (let i = 0; i < spike_time_indices.length; i++) {
                if (spike_labels[i] in selectedUnits) {
                    let color = colorForUnitId(unitColorArray, spike_labels[i]);
                    painter.setPen({ color: color });
                    painter.setBrush({ color: color });
                    let j = spike_time_indices[i];
                    let x = positions[0][j];
                    let y = positions[1][j];
                    let radius = 2;
                    if ((j <= currentTimepoint) && (currentTimepoint <= (j+20)))
                        radius = 8;
                    painter.fillMarker(x, y, radius);
                }
            }
        }
    }

    paintCurrentPositionLayer = (painter) => {
        if (this.props.currentTimepoint === null)
            return;

        const { positions } = this.props;

        const W = this.width();
        const H = this.height();

        painter.clear();

        if (positions) {
            painter.useCoords();
            // let elapsed = this.animationElapsedMsec();
            // let j = Math.floor(elapsed / 1000000 * positions[0].length);
            let j = this.props.currentTimepoint;
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

function colorForUnitId(color_array, id) {
    return color_array[id % color_array.length];
}

function compute_min(x) {
    if (x.length == 0) return 0;
    let ret = x[0];
    for (let i = 0; i < x.length; i++) {
        if (x[i] < ret) ret = x[i];
    }
    return ret;
}

function compute_max(x) {
    if (x.length == 0) return 0;
    let ret = x[0];
    for (let i = 0; i < x.length; i++) {
        if (x[i] > ret) ret = x[i];
    }
    return ret;
}