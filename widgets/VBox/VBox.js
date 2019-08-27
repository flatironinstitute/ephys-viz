import React, { Component } from 'react';
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';
const config = require('./VBox.json');

export default class VBox extends Component {
    static title = 'Vertical layout'
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
                        {
                            (this.props.children || []).map((Child) => (
                                <TableRow>
                                    <TableCell>
                                        {Child}
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </React.Fragment>
        )
    }
}