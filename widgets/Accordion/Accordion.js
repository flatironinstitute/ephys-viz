import React, { Component } from 'react';
const config = require('./Accordion.json');
import { Accordion as Accordion2, AccordionItem, AccordionItemHeading, AccordionItemPanel, AccordionItemButton} from 'react-accessible-accordion';
import './AccordionStyle.css';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';

export default class Accordion extends Component {
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
                <AccordionInner {...this.props} />
            </AutoDetermineWidth>
        )
    }
}

class AccordionInner extends Component {
    static title = 'Accordion'
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
    _handleChange = (expandedList) => {
        let a = this.state.indicesSelected;
        let somethingChanged = false;
        for (let i of expandedList) {
            if (!a[i]) {
                a[i] = true;
                somethingChanged = true;
            }
        }
        if (somethingChanged) {
            this.setState({
                indicesSelected: a
            });
        }
    }
    render() {
        let { panels } = this.props;
        return (
            <Accordion2
                allowMultipleExpanded={false}
                allowZeroExpanded={true}
                preExpanded={[]}
                onChange={(expandedList) => {this._handleChange(expandedList)}}
                onSelect={(index, lastIndex, event) => {this._handleSelect(index);}}
            >
                {this.props.children.map((Child, i) => (
                    <AccordionItem key={panels[i].label} uuid={i}>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                {panels[i].label}
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            {
                                this.state.indicesSelected[i] ? <Child.type width={this.props.width} {...Child.props} /> : <span>Waiting</span>
                            }
                        </AccordionItemPanel>
                    </AccordionItem>
                ))}
            </Accordion2>
        )
    }
}