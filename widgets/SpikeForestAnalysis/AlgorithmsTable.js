import React, { Component } from "react";
import ReactCollapsingTable from "react-collapsing-table";

export default class AlgorithmsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: []
        };
    }

    componentDidMount() {
        if (this.props.algorithms && this.props.algorithms.length) {
            this.filterActives();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.algorithms !== prevProps.algorithms) {
            this.filterActives();
        }
    }

    filterActives() {
        let rows = this.props.algorithms.map(alg => {
            let row = {
                raw_label: alg.label,
                label: alg.label,
                processor_name: alg.processor_name,
                authors: alg.authors,
                notes: alg.notes,
                environment: "",
                wrapper: "",
                markdown: ""
            };
            if (alg.dockerfile) {
                row.environment = `<a href="${alg.dockerfile}" target="_blank">${basename(
                    alg.dockerfile
                )}</a>`;
            }
            else if (alg.environment) {
                row.environment = `<span>${alg.environment}</span>`;
            }
            if (alg.wrapper) {
                row.wrapper = `<a href="${alg.wrapper}" target="_blank">${basename(alg.wrapper)}</a>`;
            }
            if (alg.markdown_link) {
                row.markdown = `<a href="${alg.markdown_link}" target="_blank">${basename(
                    alg.markdown_link
                )}</a>`;
            }
            if (alg.website) {
                row.label = `<a href="${alg.website}" target="_blank">${alg.label}</a>`;
            }

            return row;
        });
        rows.sort((a, b) => {
            if (a.wrapper && !b.wrapper) return -1;
            if (!a.wrapper && b.wrapper) return 1;
            let textA = a.raw_label.toUpperCase();
            let textB = b.raw_label.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
        rows.sort((a, b) => {
            return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
        });
        rows.forEach(row => {
            row.isActive = true;
        });
        this.setState({ rows: rows });
    }

    render() {
        const algosColumns = [
            {
                accessor: "label",
                label: "Algorithm webpage",
                priorityLevel: 1,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: "authors",
                label: "Authors",
                priorityLevel: 2,
                minWidth: 100
            },
            {
                accessor: "environment",
                label: "Environment",
                priorityLevel: 4,
                minWidth: 100
            },
            {
                accessor: "wrapper",
                label: "Wrapper",
                priorityLevel: 4,
                minWidth: 150
            },
            {
                accessor: "markdown",
                label: "Description",
                priorityLevel: 4,
                minWidth: 100
            },
            {
                accessor: "notes",
                label: "Notes",
                priorityLevel: 4,
                minWidth: 100
            }
        ];
        let loading = this.props.algorithms ? false : true;
        if (loading) {
            return <div>Loading...</div>;
        }

        return (
            <ReactCollapsingTable
                columns={algosColumns}
                rows={this.state.rows}
            />
        );
    }
}

function basename(path) {
    return path.split("/").reverse()[0];
}
