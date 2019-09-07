import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Surface from './Surface';
import VtkComponent from './VtkComponent';
const config = require('./Surface3d.json');
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';

export default class Surface3d extends VtkComponent {
    static title = 'Vtk demo'
    static reactopyaConfig = config
    render() {
        return (
            <AutoDetermineWidth>
                <Surface3dInner
                    {...this.props}
                />
            </AutoDetermineWidth>
        );
    }
}

class Surface3dInner extends VtkComponent {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            status_message: '',
            surface: null
        };
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
        this.updateSurface();
    }
    componentDidUpdate(prevProps) {
        this.pythonInterface.update();
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
        this.pythonInterface.stop();
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
