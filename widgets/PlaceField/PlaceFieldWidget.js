import React, { Component } from 'react';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';
import { Grid } from '@material-ui/core';
import UnitSelector from './UnitSelector';
import PlaceFieldCanvas from './PlaceFieldCanvas';
import PlayableSlider from './PlayableSlider';

export default class PlaceFieldWidget extends Component {
    render() {
        return (
            <AutoDetermineWidth>
                <PlaceFieldWidgetInner {...this.props} />
            </AutoDetermineWidth>
        );
    }
}

class PlaceFieldWidgetInner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUnits: {0: true},
            unitSelectMode: 'single',
            currentTimepoint: 0
        };
    }
    render() {
        const { positions } = this.props;
        const { currentTimepoint } = this.state;
        if (!positions) {
            return <span>Loading...</span>;
        }
        const N = positions[0].length;
        return (
            <Grid container direction="row">
                <Grid item xs={12}>
                    <PlaceFieldCanvas
                        width={this.props.width}
                        positions={this.props.positions}
                        spike_time_indices={this.props.spike_time_indices}
                        spike_labels={this.props.spike_labels}
                        selectedUnits={this.state.selectedUnits}
                        unitColorArray={colorArray()}
                        currentTimepoint={currentTimepoint}
                    />
                </Grid>
                <Grid item xs={12}>
                    <PlayableSlider
                        min={0} max={N - 1} value={currentTimepoint}
                        onChange={(evt, val) => { this.setState({currentTimepoint: val}) }}
                        stepsPerSec={80}
                        running={false}
                    />
                </Grid>
                <Grid item xs={12}>
                    <UnitSelector
                        all_unit_ids={this.props.all_unit_ids}
                        cluster_names={this.props.cluster_names}
                        selectedUnits={this.state.selectedUnits}
                        onChange={(su) => {this.setState({selectedUnits: su})}}
                        mode={this.state.unitSelectMode}
                    />
                </Grid>
            </Grid>
        )
    }
}

function colorArray() {
    return ['#10B070'];
    // return ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
	// 	  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
	// 	  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
	// 	  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
	// 	  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
	// 	  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
	// 	  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
	// 	  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
	// 	  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
    //       '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
}
