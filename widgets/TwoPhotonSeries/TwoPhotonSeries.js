import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Video from '../Video/Video';
const config = require('./TwoPhotonSeries.json');

/*
Here's the boring real-life video showing this widget
actually being developed. Could be helpful to someone wanting
to learn reactopya:
https://www.youtube.com/watch?v=9F19i-SQ0kU
*/

export default class TwoPhotonSeries extends Component {
    static title = 'Display move corresponding to a two photon data series'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            nwb_path: null,
            download_from: null,

            // python state
            status: '',
            status_message: '',
            video_url: null
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.setState({
            nwb_path: this.props.nwb_path,
            download_from: this.props.download_from
        });
        this.pythonInterface.start();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    render() {
        return (
            <React.Fragment>
                <RespectStatus {...this.state}>
                    <Video
                        width={this.props.width}
                        height={this.props.height}
                        url={this.state.video_url}
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