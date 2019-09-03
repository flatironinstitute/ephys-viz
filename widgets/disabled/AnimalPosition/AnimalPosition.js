import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Sha1PathLink from './Sha1PathLink.js';
import AnimalPositionWidget from './AnimalPositionWidget';
import IntInput from './IntInput';
import { Button } from '@material-ui/core'
const config = require('./AnimalPosition.json');

export default class AnimalPosition extends Component {
    static title = 'Animal position'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        const default_downsample_factor = 10;
        this.state = {
            nwb_path: props.nwb_path,
            download_from: props.download_from,
            status: '',
            status_message: '',
            inp_downsample_factor: default_downsample_factor,
            downsample_factor: default_downsample_factor,
            object: null
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this._updateParams();
    }
    componentDidUpdate() {
        this.pythonInterface.update();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    _updateParams() {
    }
    handleUpdate = () => {
        this.setState({
            downsample_factor: this.state.inp_downsample_factor
        });
    }
    render() {
        const { positions, downsample_factor } = this.state;
        return (
            <React.Fragment>
                <Sha1PathLink path={this.props.nwb_path} canCopy={true} abbreviate={true}></Sha1PathLink>
                <div>
                    <IntInput
                        label='Downsample factor'
                        value={downsample_factor}
                        min={1}
                        max={100}
                        onChange={(val) => { this.setState({ inp_downsample_factor: val }) }}
                    />
                    <Button onClick={this.handleUpdate}>Update</Button>
                </div>
                <RespectStatus {...this.state}>
                    <AnimalPositionWidget
                        positions={positions}
                    />
                </RespectStatus>
            </React.Fragment>
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