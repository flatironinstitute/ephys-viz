import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import AlgorithmsTable from './AlgorithmsTable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
const config = require('./SpikeForestAnalysis.json');

export default class SpikeForestAnalysis extends Component {
    static title = 'View of a SpikeForest analysis'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            status_message: '',
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
        console.log('--- object', object);
        return (
            <React.Fragment>
                <RespectStatus {...this.state}>
                    <div style={{ overflow: 'auto', maxHeight: 700 }}>
                        <Tabs>
                            <TabList>
                                <Tab>General info</Tab>
                                <Tab>Algorithms</Tab>
                            </TabList>

                            
                            <TabPanel>
                                <GeneralInfo general={object ? object.General : null} />
                            </TabPanel>
                            <TabPanel>
                            <AlgorithmsTable
                                algorithms={object ? object.Algorithms : null}
                            />
                            </TabPanel>
                        </Tabs>
                    </div>
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

class GeneralInfo extends Component {
    state = {  }
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