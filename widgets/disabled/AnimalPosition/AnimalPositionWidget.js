import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import AutoSizer from './AutoSizer';

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
