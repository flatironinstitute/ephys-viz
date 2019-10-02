import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import UnitSelector from '../jscommon/UnitSelector.js';
const config = require('./SelectUnits.json');

export default class SelectUnits extends Component {
    static title = 'Select unit ids'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            sorting: null,
            
            // python state
            unit_ids: [],
            status: '',
            status_message: '',

            //
            selectedUnits: {}
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this.pythonInterface.setState({
            sorting: this.props.sorting
        });
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    _handleChange = (selectedUnits) => {
        this.setState({
            selectedUnits: selectedUnits
        });
        this.props.onSelectedUnitsChanged && this.props.onSelectedUnitsChanged(selectedUnits);
    }
    render() {
        return (
            <RespectStatus {...this.state}>
                <UnitSelector
                    all_unit_ids={this.state.unit_ids}
                    selectedUnits={this.state.selectedUnits}
                    onChange={this._handleChange}
                />
            </RespectStatus>
        )
    }
}

class RespectStatus extends Component {
    state = {}
    render() {
        switch (this.props.status) {
            case 'running':
                return <div>Running: {this.props.status_message}</div>
            case 'error':
                return <div>Error: {this.props.status_message}</div>
            case 'finished':
                return this.props.children;
            default:
                return <div>Unknown status: {this.props.status}</div>
        }
    }
}