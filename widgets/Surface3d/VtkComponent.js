import React, { Component } from 'react';

export default class VtkComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.divRef = React.createRef();
    }
    _vtk_render() {
        if (this.divRef.current) {
            this.vtkRender(this.divRef.current);
        }
    }
    render() { 
        // figure out how to do this better
        setTimeout(() => {
            this._vtk_render();
        }, 100);
        const style0 = {
            position: 'relative',
            width: this.vtkSize ? this.vtkSize()[0] : 200,
            height: this.vtkSize ? this.vtkSize()[1] : 200,
        };
        return (
            <div ref={this.divRef} style={style0} />
        )
    }
}