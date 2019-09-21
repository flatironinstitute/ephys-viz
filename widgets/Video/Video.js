import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
const config = require('./Video.json');
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';

/*
Here's the boring real-life video showing this widget
actually being developed. Could be helpful to someone wanting
to learn reactopya:
https://www.youtube.com/watch?v=py7zVvtM0u4
*/

export default class Video extends Component {
    static title = 'Play a video (from url or from file)'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <AutoDetermineWidth>
                <VideoInner {...this.props} />
            </AutoDetermineWidth>
        )
    }
}

class VideoInner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: props.url || null,

            // javascript state
            path: null,
            download_from: null,

            // python state
            status: '',
            status_message: '',
            video_data_b64: null

        }
    }
    componentDidMount() {
        if (!this.props.url) {
            this.pythonInterface = new PythonInterface(this, config);
            this.pythonInterface.setState({
                path: this.props.path || null,
                download_from: this.props.download_from || null
            });
            this.pythonInterface.start();
        }
    }
    componentDidUpdate() {
        if (this.state.video_data_b64) {
            let url = 'data:video/mp4;base64,' + this.state.video_data_b64;
            if (this.state.url !== url) { 
                this.setState({
                    url: url
                });
            }
        }
    }
    componentWillUnmount() {
        if (this.pythonInterface) {
            this.pythonInterface.stop();
        }
    }
    _handleTimeUpdate = (a, b) => {
    }
    _handleEnded = () => {
    }
    render() {
        const { url } = this.state;
        let { width, height } = this.props;
        width = width || 320;
        height = height || Math.min(width, 500);
        if (this.state.url) {
            return (
                <video width={width} height={height} onEnded={this._handleEnded} onTimeUpdate={this._handleTimeUpdate} controls>
                    <source src={url} type="video/mp4" />
                </video>
            )
        }
        return (
            <RespectStatus {...this.state}>
                <div>Not sure why url has not been set.</div>
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