import React, { Component } from 'react';
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';
const config = require('./HBox.json');

export default class HBox extends Component {
    static title = 'Horizontal layout'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            status_message: ''
        }
    }
    componentDidMount() {
    }
    componentDidUpdate() {
    }
    componentWillUnmount() {
    }
    render() {
        return (
            <React.Fragment>
                <Table>
                    <TableBody>
                        <TableRow>
                            {
                                (this.props.children || []).map((Child, ii) => (
                                    <TableCell key={ii}>
                                        {Child}
                                    </TableCell>
                                ))
                            }    
                        </TableRow>
                    </TableBody>
                </Table>
            </React.Fragment>
        )
    }
}