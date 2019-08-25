import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
const config = require('./HelloWorld.json');
import { Button } from '@material-ui/core'

export default class HelloWorld extends Component {
    static title = 'helloworld example'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            status_message: '',
            name: props.name
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
    }
    componentDidUpdate() {
        this.pythonInterface.update();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    handleUpdate = () => {
        this.setState({
            name: this.state.name + this.props.name
        });
        console.log(this.state.name)
    }
    render() {
        return (
            <React.Fragment>
                <div>HelloWorld</div>
                <RespectStatus {...this.state}>
                    <div>Hello {this.state.name}</div>
                    <Button onClick={this.handleUpdate}>Update</Button>
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