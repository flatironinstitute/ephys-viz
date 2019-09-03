import { PythonInterface } from 'reactopya';
import React, { Component } from 'react';
import ElectrodeGeometryWidget from './ElectrodeGeometryWidget';
import Sync from '../jscommon/sync'
const config = require('./ElectrodeGeometry.json');

export default class ElectrodeGeometry extends Component {
    static title = 'Electrode geometry'
    static reactopyaConfig = config;
    constructor(props) {
        super(props);
        this.state = {
            currentElectrodeId: null,
            selectedElectrodeIds: {}
        };
        if ((props.locations) && (props.ids || props.labels)) {
            this.state = {
                locations: props.locations,
                ids: props.ids || props.labels,
                status: 'finished'
            }
        }
        else if (props.path) {
            this.state = {
                path: props.path,
                download_from: props.download_from || [],
                status: '',
                status_message: '',
                locations: null,
                ids: null
            }
            this.use_python = true;
        }
        else {
            this.state = {
                status: 'error',
                status_message: 'Insufficient props'
            }
        }
    }
    componentDidMount() {
        if (this.use_python) {
            this.pythonInterface = new PythonInterface(this, config);
            this.pythonInterface.start();
        }
        this.sync = new Sync(this, this.props.sync);
        this.sync.start();
    }
    componentDidUpdate() {
        if (this.use_python) {
            this.pythonInterface.update();
        }
        this.sync.update();
    }
    componentWillUnmount() {
        if (this.use_python) {
            this.pythonInterface.stop();
        }
        this.sync.stop();
    }
    render() {
        const { locations, ids, currentElectrodeId, selectedElectrodeIds } = this.state;
        return (
            <RespectStatus {...this.state}>
                <ElectrodeGeometryWidget
                    locations={locations}
                    ids={ids}
                    width={this.props.width}
                    currentElectrodeId={currentElectrodeId}
                    selectedElectrodeIds={selectedElectrodeIds}
                    onCurrentElectrodeIdChanged={(id) => {this.setState({currentElectrodeId: id})}}
                    onSelectedElectrodeIdsChanged={(ids) => {this.setState({selectedElectrodeIds: ids})}}
                />
            </RespectStatus>
        )
    }
}

class RespectStatus extends Component {
    state = {  }
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