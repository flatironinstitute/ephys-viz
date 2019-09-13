import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Sha1PathLink from './Sha1PathLink';
import BrowserTree , { TreeData } from './BrowserTree/BrowserTree';
const config = require('./NWBBrowser.json');

export default class NWBBrowser extends Component {
    static title = 'NWB browser'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            path: props.path || null,
            download_from: props.download_from,
            status: '',
            status_message: '',
            object: props.object || null
        }
        this.treeData = new TreeData;
    }
    componentDidMount() {
        if (!this.props.object) {
            this.pythonInterface = new PythonInterface(this, config);
            this.pythonInterface.start();
        }
        else {
            this.setState({status: 'finished'});
        }
    }
    componentDidUpdate() {
        if (!this.props.object) {
            this.pythonInterface.update();
        }
    }
    componentWillUnmount() {
        if (!this.props.object) {
            this.pythonInterface.stop();
        }
    }
    render() {
        const { object } = this.state;
        return (
            <RespectStatus {...this.state}>
                <React.Fragment>
                    {
                        this.state.path ? (
                            <Sha1PathLink path={this.state.path} canCopy={true} abbreviate={true}></Sha1PathLink>
                        ) : <span />
                    }
                    <BrowserTree
                        path={null}
                        object={object}
                        treeData={this.treeData}
                        selectedNodePath={null}
                        onItemSelected={null}
                        pathHistory={null}
                        onGotoHistory={null}
                        kacheryManager={null}
                    />
                </React.Fragment>
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