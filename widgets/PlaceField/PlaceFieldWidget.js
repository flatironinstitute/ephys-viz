import React, { Component } from 'react';
import CanvasWidget from './CanvasWidget';
import AutoSizer from './AutoSizer';
import { Grid, Checkbox, FormControl, FormLabel, FormGroup, FormControlLabel } from '@material-ui/core';

export default class PlaceFieldWidget extends Component {
    render() {
        return (
            <AutoSizer>
                <PlaceFieldWidgetInner {...this.props} />
            </AutoSizer>
        );
    }
}

class PlaceFieldWidgetInner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUnits: {0: true},
            unitSelectMode: 'single'
        };
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
                    <PlaceFieldCanvas {...this.props} selectedUnits={this.state.selectedUnits} unitColorArray={colorArray()} />
                </Grid>
                <Grid item xs={12}>
                    <UnitSelector
                        all_unit_ids={this.props.all_unit_ids}
                        selectedUnits={this.state.selectedUnits}
                        onChange={(su) => {this.setState({selectedUnits: su})}}
                        mode={this.state.unitSelectMode}
                    />
                </Grid>
            </Grid>
        )
    }
}

class UnitSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUnits: {}
        };
    }
    componentDidMount() {
        this.setStateFromProps();
    }
    componentDidUpdate() {
        this.setStateFromProps();
    }
    setStateFromProps() {
        if (!matches(this.state.selectedUnits, this.props.selectedUnits)) {
            this.setState({
                selectedUnits: this.props.selectedUnits
            });
        }
    }
    handleChange = (id, checked) => {
        let su = this.state.selectedUnits;
        if (this.props.mode == 'single') {
            su = {};
        }
        su[id] = checked;
        if (!checked) {
            delete su[id];
        }
        this.props.onChange && this.props.onChange(su);
    }
    render() {
        return (
            <FormControl component="fieldset">
                <FormLabel component="legend">{this.props.mode === 'single' ? 'Select unit' : 'Select units'}</FormLabel>
                <FormGroup aria-label="position" name="position" row>
                    {
                        this.props.all_unit_ids.map((id) => (
                            <FormControlLabel
                                key={id}
                                control={<Checkbox checked={this.state.selectedUnits[id] ? true : false} onChange={(evt, checked) => {this.handleChange(id, checked);}} color="primary" />}
                                label={id}
                                labelPlacement="end"
                            />
                        ))
                    }
                    
                </FormGroup>
            </FormControl>
        )
        // return (
        //     <Grid container>
        //         {
        //             this.props.all_unit_ids.map((id) => (
        //                 <Grid item>
        //                     <Checkbox
        //                         value="checkedA"
        //                         inputProps={{ 'aria-label': 'Checkbox A' }}
        //                     />
        //                 </Grid>
        //             ))
        //         }
        //     </Grid>
        // )
    }
}

class PlaceFieldCanvas extends CanvasWidget {
    constructor(props) {
        super(props);

        // this.mouseHandler().onMousePress(this.handleMousePress);
        // this.mouseHandler().onMouseRelease(this.handleMouseRelease);
        // this.mouseHandler().onMouseMove(this.handleMouseMove);
        // this.mouseHandler().onMouseDrag(this.handleMouseDrag);
        // this.mouseHandler().onMouseDragRelease(this.handleMouseDragRelease);

        this.mainLayer = this.addCanvasLayer(this.paintMainLayer);
        this.spikeLayer = this.addCanvasLayer(this.paintSpikeLayer);
        this.currentPositionLayer = this.addCanvasLayer(this.paintCurrentPositionLayer);
    }

    componentDidMount() {
        this.updateRanges();
        this.repaint();
        // this.startAnimation(this.onAnimationFrame, 100);
        if (this.props.currentTimepointController) {
            this.props.currentTimepointController.onChange(() => { this.currentPositionLayer.repaint(); });
        }
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

        painter.clear();

        if (positions) {
            painter.useCoords();
            painter.setPen({ color: 'darkGreen' });
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
        const { positions, spike_time_indices, spike_labels } = this.props;

        painter.clear();

        if (spike_time_indices) {
            painter.useCoords();
            for (let i = 0; i < spike_time_indices.length; i++) {
                if (spike_labels[i] in this.props.selectedUnits) {
                    let color = colorForUnitId(this.props.unitColorArray, spike_labels[i]);
                    painter.setPen({ color: color });
                    painter.setBrush({ color: color });
                    let j = spike_time_indices[i];
                    let x = positions[0][j];
                    let y = positions[1][j];
                    painter.fillMarker(x, y, 2);
                }
            }
        }
    }

    paintCurrentPositionLayer = (painter) => {
        if (!this.props.currentTimepointController)
            return;

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

function colorArray() {
    return ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
          '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
}

function colorForUnitId(color_array, id) {
    return color_array[id % color_array.length];
}

function matches(a, b) {
    for (let key in a) {
        if (a[key] != b[key])
            return false;
    }
    for (let key in b) {
        if (a[key] != b[key])
            return false;
    }
    return true;
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