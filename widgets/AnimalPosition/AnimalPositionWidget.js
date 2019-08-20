import React, { Component } from 'react';
import Plot from 'react-plotly.js';

export default class AnimalPositionWidget extends Component {
    render() {
        return (
            <AutoSizer>
                <AnimalPositionWidgetInner {...this.props} />
            </AutoSizer>
        );
    }
}

class AnimalPositionWidgetInner extends Component {
    state = {}
    render() {
        const { positions } = this.props;
        const xpositions = positions[0];
        const ypositions = positions[1];

        const plot = (
            <Plot
                data={[{
                    x: xpositions,
                    y: ypositions,
                    mode: 'lines',
                    type: 'scatter',
                    hoverinfo: 'skip'
                }]}
                layout={{
                    width: this.props.width,
                    height: this.props.width,
                    title: '',
                    showlegend: false,
                    xaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        ticks: '',
                        showticklabels: false
                    },
                    yaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        ticks: '',
                        showticklabels: false,
                        scaleanchor: "x",
                        scaleratio: 1,
                    },
                    margin: {
                        l: 20, r: 20, b: 20, t: 20
                    }
                }}
                config={(
                    {
                        displayModeBar: false,
                        responsive: false
                    }
                )}
            />
        )

        return (
            plot
        );
    }
}

class AutoSizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: null
        };
    }

    async componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.resetWidth);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resetWidth);
    }

    resetWidth = () => {
        this.setState({
            width: null
        });
    }

    async componentDidUpdate(prevProps, prevState) {
        if (!this.state.width) {
            this.updateDimensions();
        }
    }

    updateDimensions() {
        if (this.state.width !== this.container.offsetWidth) {
            this.setState({
                width: this.container.offsetWidth // see render()
            });
        }
    }

    render() {
        let { width } = this.state;
        if (!width) width=300;

        const elmt = React.Children.only(this.props.children)

        return (
            <div className="determiningWidth" ref={el => (this.container = el)}>
                <elmt.type {...elmt.props} width={this.state.width}>{elmt.children}</elmt.type>
            </div>
        );
    }
}