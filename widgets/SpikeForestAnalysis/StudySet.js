import React, { Component } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Link } from '@material-ui/core';
import Sha1PathLink from '../jscommon/Sha1PathLink';

export default class StudySet extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    render() {
        const object = this.props.object || [];
        let columns = [
            {key: 'name', label: 'Study', onClick: (study) => {this.props.onOpenStudy && this.props.onOpenStudy(study)}},
            {key: 'numRecordings', label: 'Num. recordings'}
        ]
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        {
                            columns.map((col) => {
                                return (
                                    <TableCell key={col.key}>{col.label}</TableCell>
                                )
                            })
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        object.studies.map((study) => {
                            study.numRecordings = study.recordings.length;
                            return (
                                <TableRow key={study.name}>
                                    {
                                        columns.map((col) => {
                                            return (
                                                <TableCell key={col.key}>{createElement(col, study[col.key], study)}</TableCell>
                                            );
                                        })
                                    }
                                </TableRow>
                            );
                        })
                    }
                </TableBody>
            </Table>
        )
    }
}

function createElement(col, val, study) {
    if (col.onClick) {
        return <Link2 onClick={() => {col.onClick(study)}}>{val}</Link2>;
    }
    else if ((val) && (col.sha1Link)) {
        return <Sha1PathLink path={val} canCopy={true} abbreviate={true}></Sha1PathLink>
    }
    else {
        return val;
    }
}

function Link2(props) {
    return (
        <Link
            component="button" variant="body2"
            onClick={props.onClick}
        >
            {props.children}
        </Link>
    )
}