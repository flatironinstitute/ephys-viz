import React, { Component } from 'react';
import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';

export default class EpochSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEpochs: {}
        };
    }
    componentDidMount() {
        this.setStateFromProps();
    }
    componentDidUpdate() {
        this.setStateFromProps();
    }
    setStateFromProps() {
        if (!matches(this.state.selectedEpochs, this.props.selectedEpochs)) {
            this.setState({
                selectedEpochs: this.props.selectedEpochs
            });
        }
    }
    handleChange = (id, checked) => {
        let sel = this.state.selectedEpochs;
        if (this.props.mode == 'single') {
            sel = {};
        }
        sel[id] = checked;
        if (!checked) {
            delete sel[id];
        }
        this.props.onChange && this.props.onChange(sel);
    }
    render() {
        const { epochs } = this.props;
        return (
            <FormControl component="fieldset">
                <FormLabel component="legend">{this.props.mode === 'single' ? 'Select epoch' : 'Select epochs'}</FormLabel>
                <FormGroup aria-label="position" name="position" row>
                    {
                        epochs.map((epoch) => (
                            <FormControlLabel
                                key={epoch.id}
                                control={<Checkbox checked={this.state.selectedEpochs[epoch.id] ? true : false} onChange={(evt, checked) => {this.handleChange(epoch.id, checked);}} color="primary" />}
                                label={epoch.label}
                                labelPlacement="end"
                            />
                        ))
                    }
                </FormGroup>
            </FormControl>
        )
    }
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
