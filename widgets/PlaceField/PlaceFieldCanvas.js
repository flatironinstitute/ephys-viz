import React, { Component } from 'react';
import CanvasWidget, { CanvasWidgetLayer } from '../jscommon/CanvasWidget';

export default class PlaceFieldCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canvasWidth: 0,
            canvasHeight: 0
        };

        // this.mouseHandler().onMousePress(this.handleMousePress);
        // this.mouseHandler().onMouseRelease(this.handleMouseRelease);
        // this.mouseHandler().onMouseMove(this.handleMouseMove);
        // this.mouseHandler().onMouseDrag(this.handleMouseDrag);
        // this.mouseHandler().onMouseDragRelease(this.handleMouseDragRelease);

        this.mainLayer = new CanvasWidgetLayer(this.paintMainLayer);
        this.currentPositionLayer = new CanvasWidgetLayer(this.paintCurrentPositionLayer);
        this.spikeLayer = new CanvasWidgetLayer(this.paintSpikeLayer);

        this.allLayers = [
            this.mainLayer,
            this.currentPositionLayer,
            this.spikeLayer
        ];
    }

    componentDidMount() {
        this.updateRanges();
        this._repaintAllLayers();
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
        let W = width;
        if (!W) W = 500;
        let H = Math.min(600, W);
        this.setState({
            canvasWidth: W,
            canvasHeight: H
        });
        if (positions) {
            let xmin = compute_min(positions[0]);
            let xmax = compute_max(positions[0]);
            let ymin = compute_min(positions[1]);
            let ymax = compute_max(positions[1]);
            for (let L of this.allLayers) {
                L.setPreserveAspectRatio(true);
                L.setCoordXRange(xmin, xmax);
                L.setCoordYRange(ymin, ymax);
            }
        }
        else {
            for (let L of this.allLayers) {
                L.setPreserveAspectRatio(true);
                L.setCoordXRange(0, 1);
                L.setCoordYRange(0, 1);
            }
        }
    }

    _repaintAllLayers = () => {
        for (let L of this.allLayers) {
            L.repaint();
        }
    }

    // onAnimationFrame = () => {
    //     this.animationLayer.repaint();
    // }

    paintMainLayer = (painter) => {
        const { positions } = this.props;

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

        if (spike_time_indices) {
            painter.useCoords();
            for (let pass = 1; pass <= 2; pass++) {
                for (let i = 0; i < spike_time_indices.length; i++) {
                    if (spike_labels[i] in selectedUnits) {
                        let j = spike_time_indices[i];
                        let x = positions[0][j];
                        let y = positions[1][j];
                        let radius;
                        let color = colorForUnitId(unitColorArray, spike_labels[i]);
                        if ((j <= currentTimepoint) && (currentTimepoint <= (j+20))) {
                            if (pass == 2) {
                                radius = 5;
                                painter.setPen({ color: 'black' });
                                painter.setBrush({ color: 'black' });
                                painter.fillMarker(x, y, radius + 2);

                                painter.setPen({ color: color });
                                painter.setBrush({ color: color });
                                painter.fillMarker(x, y, radius);
                            }
                        }
                        else {
                            if (pass == 1) {
                                radius = 2;
                                painter.setPen({ color: color });
                                painter.setBrush({ color: color });
                                painter.fillMarker(x, y, radius);
                            }
                        }
                    }
                }
            }
        }
    }

    paintCurrentPositionLayer = (painter) => {
        if (this.props.currentTimepoint === null)
            return;

        const { positions } = this.props;

        const W = this.currentPositionLayer.width();
        const H = this.currentPositionLayer.height();

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

        return <CanvasWidget
            layers={this.allLayers}
            width={this.state.canvasWidth}
            height={this.state.canvasHeight}
        />
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