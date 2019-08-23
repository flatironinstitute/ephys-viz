import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import AlgorithmsTable from './AlgorithmsTable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import Plot from 'react-plotly.js';
const config = require('./SpikeForestAnalysis.json');
import HelloWorld from '../HelloWorld/HelloWorld';

export default class SpikeForestAnalysis extends Component {
    static title = 'View of a SpikeForest analysis'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            status_message: '',
            include_results: props.include_results,
            path: props.path,
            download_from: props.download_from,
            output: null
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
    render() {
        const { object } = this.state;
        return (
            <React.Fragment>
                <RespectStatus {...this.state}>
                    <div style={{ overflow: 'auto', maxHeight: 700 }}>
                        <Tabs>
                            <TabList>
                                <Tab>General info</Tab>
                                <Tab>Algorithms</Tab>
                                <Tab>Devel hist</Tab>
                                <Tab>Haylo</Tab>
                            </TabList>


                            <TabPanel>
                                <GeneralInfo general={object ? object.General : null} />
                            </TabPanel>
                            <TabPanel>
                                <AlgorithmsTable
                                    algorithms={object ? object.Algorithms : null}
                                />
                            </TabPanel>
                            <TabPanel>
                                <DevelHist
                                    studyAnalysisResults={object ? object.StudyAnalysisResults : null}
                                />
                            </TabPanel>
                            <TabPanel>
                                <HelloWorld initialColor={'yellow'} />
                            </TabPanel>
                        </Tabs>
                    </div>
                </RespectStatus>
            </React.Fragment>
        )
    }
}

class DevelHist extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    render() {
        const { studyAnalysisResults } = this.props;
        if (!studyAnalysisResults) {
            return <div>NULL!</div>
        }

        const snrs = studyAnalysisResults[0].trueSnrs;

        return <PlotHist data={snrs} />
    }
}


class PlotHist extends Component {
    state = {}
    render() {
        const { data } = this.props;

        const plot = (
            <Plot
                data={[{
                    x: data,
                    type: 'histogram',
                    autobinx: false,
                    xbins: {
                        start: 0,
                        size: .5,
                        end: 20
                    },
                }]}
                layout={{
                    width: 200,
                    height: 200,
                    title: '',
                    showlegend: false,
                    xaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        //ticks: '',
                        showticklabels: true
                    },
                    yaxis: {
                        autorange: true,
                        showgrid: true,
                        zeroline: true,
                        showline: true,
                        ticks: '',
                        showticklabels: true,
                        scaleanchor: "x",
                        scaleratio: 1,
                    },
                    margin: {
                        l: 20, r: 20, b: 20, t: 20
                    }
                }}
                config={(
                    {
                        displayModeBar: false,
                        responsive: false
                    }
                )}
            />
        )

        return (
            plot
        );
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

class GeneralInfo extends Component {
    state = {}
    render() {
        const { general } = this.props;
        if (!general)
            return <div>...</div>;
        return (
            <pre>
                {JSON.stringify(general[0], null, 4)}
            </pre>
        );
    }
}