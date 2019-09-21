import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Surface from './Surface';
import VtkComponent from './VtkComponent';
const config = require('./Surface3d.json');
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';

export default class Surface3d extends Component {
    static title = 'Vtk demo'
    static reactopyaConfig = config
    render() {
        if (typeof(this.props.faces) == 'string') {
            return (
                <AutoDetermineWidth>
                    <Surface3dFromPaths
                        {...this.props}
                    />
                </AutoDetermineWidth>
            );
        }
        else {
            return (
                <AutoDetermineWidth>
                    <Surface3dInner
                        {...this.props}
                    />
                </AutoDetermineWidth>
            );
        }
        
    }
}

class Surface3dFromPaths extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            faces_path: null,
            vertices_path: null,
            scalars_path: null,

            // python state
            faces: null,
            vertices: null,
            scalars: null
        };

    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.setState({
            faces_path: this.props.faces,
            vertices_path: this.props.vertices,
            scalars_path: this.props.scalars
        });
        this.pythonInterface.start();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    render() {
        let props = {};
        for (let key in this.props) {
            props[key] = this.props[key];
        }
        props.faces = this.state.faces;
        props.vertices = this.state.vertices;
        props.scalars = this.state.scalars;
        return (
            <RespectStatus {...this.state}>
                <Surface3dInner {...props}/>
            </RespectStatus>
        );
    }
}

class Surface3dInner extends VtkComponent {
    constructor(props) {
        super(props);
        this.state = {
            surface: null
        };
    }
    componentDidMount() {
        this.updateSurface();
    }
    componentDidUpdate(prevProps) {
        if (
            (this.props.vertices !== prevProps.vertices) ||
            (this.props.faces !== prevProps.faces) ||
            (this.props.scalars !== prevProps.scalars)
        ) {
            this.updateSurface();
        }
    }
    updateSurface() {
        if ((this.props.vertices) && (this.props.faces)) {
            let opts = {
                vectorComponent: this.props.vector_component,
                colorByArrayName: this.props.color_by_array_name,
                presetColorMapName: this.props.preset_color_map_name
            }
            this.setState({
                surface: new Surface(this.props.vertices, this.props.faces, this.props.scalars, opts)
            })
        }
        else {
            if (this.state.surface) {
                this.setState({
                    surface: null
                });
            }
        }
    }
    componentWillUnmount() {
    }
    vtkSize(div) {
        let width = this.props.width;
        let height = this.props.height || width;
        height = Math.min(500, height);
        return [width, height];
    }
    vtkRender(div) {
        if (this.state.surface) {
            this.state.surface.setContainer(div);
        }
        else {
            div.innerHTML = 'loading...'
        }
    }
    render() {
        return super.render();
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