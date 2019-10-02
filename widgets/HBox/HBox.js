import React, { Component } from 'react';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';
import { minWidth } from '@material-ui/system';
const config = require('./HBox.json');

export default class HBox extends Component {
    static title = 'Horizontal layout'
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
                <HBoxInner {...this.props} />
            </AutoDetermineWidth>
        )
    }
}

class HBoxInner extends Component {
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
        const { width } = this.props;
        const num = this.props.children.length;

        let width0 = width / num;
        return (
            <table>
                <tbody>
                    <tr>
                        {
                            (this.props.children || []).map((Child, ii) => (
                                <td valign="top" key={ii} style={{minWidth:width0}}>
                                    <Child.type {...Child.props} width={width0} />
                                </td>
                            ))
                        }    
                    </tr>
                </tbody>
            </table>
        )
    }
}