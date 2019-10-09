import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import Accordion from '../Accordion/Accordion';
import Tabs from '../Tabs/Tabs';
import NWBBrowser from '../NWBBrowser/NWBBrowser';
import Surface3d from '../Surface3d/Surface3d';
import TimeseriesView from '../TimeseriesView/TimeseriesView';
import SpikeRasterPlot from '../SpikeRasterPlot/SpikeRasterPlot';
const config = require('./NWBFile.json');

export default class NWBFile extends Component {
    static title = 'View a .nwb file'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            // javascript state
            path: null,
            
            // python state
            status: '',
            status_message: '',
            object: null,

            // other
            panels: null
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.setState({
            path: this.props.path
        });
        this.pythonInterface.start();
        this._updateAccordionPanels()
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.object !== prevState.object) {
            this._updateAccordionPanels();
        }
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    _updateAccordionPanels() {
        const { object } = this.state;
        if (!object) return;
        let panels = [];
        panels.push({
            label: 'File hierarchy',
            key: 'file-hierarchy',
            type: NWBBrowser,
            props: {
                object: object
            }
        });
        if (propertyExists(object, '/processing/ecephys/LFP/lfp')) {
            let LFP = object.processing.ecephys.LFP;
            if (LFP.lfp) {
                panels.push({
                    label: 'LFP',
                    key: 'lfp',
                    type: TimeseriesView,
                    props: {
                        recording: {
                            path: this.state.path,
                            nwb_path: '/processing/ecephys/LFP/lfp'
                        }
                    }
                });
            }
        }
        if (propertyExists(object, '/units/_datasets/spike_times')) {
            panels.push({
                label: 'Spike raster plot',
                key: 'srp',
                type: SpikeRasterPlot,
                props: {
                    sorting: {
                        path: this.state.path,
                        nwb_path: '/units'
                    }
                }
            });
        }
        // if (object.general.subject.cortical_surfaces) {
        //     panels.push({
        //         label: 'Cortical surfaces',
        //         key: 'cortical-surfaces',
        //         type: CorticalSurfaces,
        //         props: {
        //             data: object.general.subject.cortical_surfaces,
        //             reactopyaParent: this,
        //             reactopyaChildId: 'cortical-surfaces'
        //         }
        //     })
        // }
        this.setState({
            panels: panels
        });
    }
    render() {
        const { panels } = this.state;
        return (
            <RespectStatus {...this.state}>
                {
                    panels ? (
                        <Accordion
                            width={this.props.width}
                            panels={panels.map((panel) => (
                                {label: panel.label}
                            ))}
                        >
                            {
                                panels.map((panel) => (
                                    <panel.type {...panel.props} key={panel.key} reactopyaParent={this} reactopyaChildId={panel.key} />
                                ))
                            }
                        </Accordion>
                    ) :
                    <span>Loading panels...</span>
                }
                
            </RespectStatus>
        )
    }
}

function propertyExists(obj, path) {
    let list0 = path.split('/');
    let list1 = [];
    for (let val of list0)
        if (val) list1.push(val);
    return _propertyExists(obj, list1);
}

function _propertyExists(obj, keys) {
    if (keys.length === 0) return false;
    if (keys[0] in obj) {
        if (keys.length === 1) return true;
        return _propertyExists(obj[keys[0]], keys.slice(1));
    }
    else return false;    
}

class CorticalSurfaces extends Component {
    state = {  }
    render() {
        const { data } = this.props;
        let names = [];
        for (let key in this.props.data) {
            if (key !== '_attrs') {
                names.push(key);
            }
        }
        return (
            <Tabs
                tabs={names.map((name) => (
                    {label: name}
                ))}
            >
                {
                    names.map((name) => {
                        let datasets = data[name]._datasets;
                        return (
                            <Surface3d
                                reactopyaParent={this.props.reactopyaParent}
                                reactopyaChildId={this.props.reactopyaChildId+'-'+name}
                                faces={datasets.faces._data}
                                vertices={datasets.vertices._data}
                                key={name}
                            />
                        );
                    })
                }
            </Tabs>
        );
    }
}

class RespectStatus extends Component {
    state = {}
    render() {
        switch (this.props.status) {
            case 'running':
                return <div>Running: {this.props.status_message}</div>
            case 'error':
                return <div>Error: {this.props.status_message}</div>
            case 'finished':
                return this.props.children;
            default:
                return <div>Unknown status: {this.props.status}</div>
        }
    }
}