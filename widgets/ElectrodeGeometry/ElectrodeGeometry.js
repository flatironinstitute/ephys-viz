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
            selectedElectrodeIds: {},
            status: '',
            status_message: '',
            locations: null,
            ids: null
        };
    }
    componentDidMount() {
        let props = this.props;
        if ((props.locations) && (props.ids || props.labels)) {
            this.setState({
                locations: props.locations,
                ids: props.ids || props.labels,
                status: 'finished'
            });
        }
        else if (props.path) {
            this.pythonInterface = new PythonInterface(this, config);
            this.pythonInterface.setState({
                path: props.path,
                download_from: props.download_from || [],
                
            });
            this.pythonInterface.start();
        }
        else {
            this.setState({
                status: 'error',
                status_message: 'Insufficient props'
            });
        }
        this.sync = new Sync(this, props.sync);
        this.sync.start();
    }
    componentDidUpdate() {
        this.sync.update();
    }
    componentWillUnmount() {
        if (this.pythonInterface) {
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
                return <div>Loading: {this.props.status}</div>
        }
    }
}