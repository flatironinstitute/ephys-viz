import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Surface3d from '../Surface3d/Surface3d';
const config = require('./CorticalSurface.json');

export default class CorticalSurface extends Component {
    static title = 'Render cortical surface in 3D from .nwb file'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            path: null,
            download_from: null,
            name: null,

            // python state (returned from python backend)
            status: '',
            status_message: '',
            vertices: null,
            faces: null,

            // see below
            surface: null
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.setState({
            path: this.props.path,
            download_from: this.props.download_from,
            name: this.props.name
        });
        this.pythonInterface.start();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    render() {
        return (
            <RespectStatus {...this.state}>
                <Surface3d
                    {...this.props}
                    vertices={this.state.vertices}
                    faces={this.state.faces}
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