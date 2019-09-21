import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Sha1PathLink from '../jscommon/Sha1PathLink.js';
import PlaceFieldWidget from './PlaceFieldWidget';
import IntInput from './IntInput';
import { Button, Grid } from '@material-ui/core'
const config = require('./PlaceField.json');

export default class PlaceField extends Component {
    static title = 'Place field'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.default_downsample_factor = 10;
        this.state = {
            // javascript state
            nwb_query: null,
            download_from: null,
            downsample_factor: null,

            // python state
            status: '',
            status_message: '',
            object: null,

            // other
            inp_downsample_factor: this.default_downsample_factor
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.setState({
            nwb_query: this.props.nwb_query,
            download_from: this.props.download_from,
            downsample_factor: this.default_downsample_factor
        });
        this.pythonInterface.start();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    handleUpdate = () => {
        this.pythonInterface.setState({
            downsample_factor: this.state.inp_downsample_factor
        });
    }
    render() {
        const {
            positions,
            spike_time_indices,
            spike_labels,
            all_unit_ids,
            cluster_names,
            downsample_factor
        } = this.state;
        return (
            <React.Fragment>
                <NwbQueryView nwb_query={this.props.nwb_query} />
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
                    <PlaceFieldWidget
                        positions={positions}
                        spike_time_indices={spike_time_indices}
                        spike_labels={spike_labels}
                        all_unit_ids={all_unit_ids}
                        cluster_names={cluster_names}
                    />
                </RespectStatus>
            </React.Fragment>
        )
    }
}

class NwbQueryView extends Component {
    state = {  }
    render() { 
        const { nwb_query } = this.props;
        if (typeof(nwb_query) === 'string') {
            return <Sha1PathLink path={nwb_query} abbreviate={true} canCopy={true} />
        }
        else if (nwb_query.path) {
            return (
                <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                        <Sha1PathLink path={nwb_query.path} abbreviate={true} canCopy={true} />
                    </Grid>
                    <Grid item>
                        <pre>epochs: {JSON.stringify(nwb_query.epochs || [])}</pre>
                    </Grid>
                </Grid>
            )
        }
        else {
            return <span>Unable to display unrecognized query</span>
        }
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
                return <div>Loading: {this.props.status}</div>
        }
    }
}