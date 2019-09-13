import React, { Component } from 'react';
const config = require('./Tabs.json');
import { Tabs as Tabs2 } from 'react-tabs';
import { Tab, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth.js';

export default class Tabs extends Component {
    static title = 'Accordion'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    componentDidUpdate() {
    }
    componentWillUnmount() {
    }
    render() {
        return (
            <AutoDetermineWidth>
                <TabsInner {...this.props} />
            </AutoDetermineWidth>
        )
    }
}

class TabsInner extends Component {
    static title = 'Tabs'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state={
            indicesSelected: {
                0: true
            },
            refreshCodes: {
                0: 0
            }
        }
    }
    componentDidMount() {
    }
    componentDidUpdate() {
    }
    componentWillUnmount() {
    }
    _handleSelect = (index) => {
        let a = this.state.indicesSelected;
        let rc = this.state.refreshCodes;
        a[index] = true;
        // see note below about refresh_code
        rc[index] = (rc[index] || 0) + 1;
        this.setState({
            indicesSelected: a,
            refreshCodes: rc
        });
    }
    render() {
        let { tabs } = this.props;
        return (
            <Tabs2
                forceRenderTabPanel={true}
                onSelect={(index, lastIndex, event) => {this._handleSelect(index);}}
            >
                <TabList>
                    {
                        tabs.map((tab) => (
                            <Tab key={tab.label}>{tab.label}</Tab>
                        ))
                    }
                </TabList>
                {this.props.children.map((Child, i) => (
                    <TabPanel key={tabs[i].label}>
                        {
                            this.state.indicesSelected[i] ? (
                                // Probably we can do the refresh_code thing better - we just want to trigger a refresh
                                // esp. for vtk elements
                                <Child.type width={this.props.width} {...Child.props} _tabs_refresh_code={this.state.refreshCodes[i]} />
                            ) : ( <span>Waiting</span> )
                        }
                    </TabPanel>
                ))}
            </Tabs2>
        )
    }
}