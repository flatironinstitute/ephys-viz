import React, { Component } from 'react';
import AutoDetermineWidth from '../jscommon/AutoDetermineWidth';
const config = require('./VBox.json');

export default class VBox extends Component {
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
                <VBoxInner {...this.props} />
            </AutoDetermineWidth>
        )
    }
}

class VBoxInner extends Component {
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

        return (
            <table>
                <tbody>
                    {
                        (this.props.children || []).map((Child, ii) => (
                            <tr key={ii}>
                                <td><Child.type {...Child.props} width={width} /></td>
                            </tr>
                        ))
                    }    
                </tbody>
            </table>
        )
    }
}