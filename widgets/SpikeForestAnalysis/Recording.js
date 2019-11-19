import React, { Component } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Link } from '@material-ui/core';
import Sha1PathLink from '../jscommon/Sha1PathLink';
import TimeseriesView from '../TimeseriesView/TimeseriesView';
import Accordion from '../Accordion/Accordion';
import Autocorrelograms from '../Autocorrelograms/Autocorrelograms';
import SpikeAmplitudePlot from '../SpikeAmplitudePlot/SpikeAmplitudePlot';
import SpikeRasterPlot from '../SpikeRasterPlot/SpikeRasterPlot';

export default class Recording extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    _sorting() {
        let { object } = this.props;
        return {
            kachery_config: {
                fr: 'default_readonly'
            },
            path: object.directory + '/firings_true.mda',
            paramsPath: object.directory + '/params.json'
        };
    }
    _recording() {
        let { object } = this.props;
        return {
            kachery_config: {
                fr: 'default_readonly'
            },
            path: object.directory
        };
    }
    _renderTimeseries = () => {
        return (
            <TimeseriesView
                recording={this._recording()}
                reactopyaParent={this.props.reactopyaParent}
                reactopyaChildId={this.props.reactopyaChildId + '-Timeseries'}
                maxWidth={1000}
                height={700}
            />
        );
    }
    _renderAutocorrelograms = () => {
        return (
            <Autocorrelograms
                sorting={this._sorting()}
                recording={this._recording()}
                reactopyaParent={this.props.reactopyaParent}
                reactopyaChildId={this.props.reactopyaChildId + '-Autocorrelograms'}
            />
        );
    }
    _renderSpikeRasterPlot = () => {
        return (
            <SpikeRasterPlot
                sorting={this._sorting()}
                recording={this._recording()}
                reactopyaParent={this.props.reactopyaParent}
                reactopyaChildId={this.props.reactopyaChildId + '-SpikeRasterPlot'}
                maxWidth={1000}
                height={700}
            />
        );
    }
    _renderSpikeAmplitudePlot = () => {
        return (
            <SpikeAmplitudePlot
                sorting={this._sorting()}
                recording={this._recording()}
                reactopyaParent={this.props.reactopyaParent}
                reactopyaChildId={this.props.reactopyaChildId + '-SpikeAmplitudePlot'}
                maxWidth={1000}
                height={700}
            />
        );
    }
    render() {
        let { object } = this.props;
        let panels = [
            {key: 'timeseries', label: 'Timeseries', render: this._renderTimeseries},
            {key: 'spikeraster', label: 'Spike Raster Plot', render: this._renderSpikeRasterPlot},
            {key: 'spikeamplitude', label: 'Spike Amplitudes', render: this._renderSpikeAmplitudePlot},
            {key: 'autocorrelograms', label: 'Autocorrelograms', render: this._renderAutocorrelograms}
        ];
        return (
            <React.Fragment>
                <h3>{`${object.studySetName}/${object.studyName}/${object.name}`}</h3>
                <pre>
                    {JSON.stringify(object, null, 4)}
                </pre>
                <Accordion
                    panels={panels}
                    allowMultipleExpanded={true}
                    allowZeroExpanded={true}
                >
                    {
                        panels.map((panel) => (
                            <div key={panel.key}>
                                {panel.render()}
                            </div>
                        ))
                    }
                </Accordion>
            </React.Fragment>
        )
    }
}