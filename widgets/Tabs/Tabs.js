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
        if (a[index]) return;
        a[index] = true;
        this.setState({
            indicesSelected: a
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
                            this.state.indicesSelected[i] ? <Child.type width={this.props.width} {...Child.props} /> : <span>Waiting</span>
                        }
                    </TabPanel>
                ))}
            </Tabs2>
        )
    }
}