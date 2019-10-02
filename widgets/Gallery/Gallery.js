import React, { Component } from 'react';
import { PythonInterface } from 'reactopya';
import { Paper, Grid, IconButton } from "@material-ui/core";
import { FaExpandArrowsAlt, FaCompressArrowsAlt } from "react-icons/fa";
const config = require('./Gallery.json');

class LazyLoader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasBeenVisible: false
        };
        this.unmounted = false;
    }

    async componentDidMount() {
        this.startChecking();
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    componentDidUpdate(prevProps, prevState) {
    }

    startChecking() {
        this.doCheck();
        if (this.state.hasBeenVisible) return;
        if (this.unmounted) return;
        setTimeout(() => {
            this.startChecking();
        }, 1000);
    }

    doCheck() {
        if (this.state.hasBeenVisible) return;
        if (this.isInViewport(this.container)) {
            this.setState({ hasBeenVisible: true });
        }
    }

    isInViewport(elem) {
        if (!elem) return false;
        var bounding = elem.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    render() {
        if (!this.state.hasBeenVisible) {
            return (
                <div className="lazyloader" ref={el => (this.container = el)}></div>
            )
        }
        else {
            return this.props.children;
        }
    }
}

export default class Gallery extends Component {
    static title = 'Gallery view of a list of widgets'
    static reactopyaConfig = config
    constructor(props) {
        super(props);
        this.state = {
            expandedWidgetIndex: null
        };
    }
    handleToggleExpand = (index) => {
        if (this.state.expandedWidgetIndex !== null) {
            this.setState({
                expandedWidgetIndex: null
            });
        }
        else {
            this.setState({
                expandedWidgetIndex: index
            });
        }
    }
    componentDidMount() {
        this.pythonInterface = new PythonInterface(this, config);
        this.pythonInterface.start();
    }
    componentWillUnmount() {
        this.pythonInterface.stop();
    }
    render() {
        const { expandedWidgetIndex } = this.state;
        const style0 = {
            overflowX: 'hidden',
            overflowY: 'auto',
            margin: 0,
            padding: 0,
            background: 'lightblue',
            width: this.props.width || 300,
            height: this.props.height || 300
        };
        const style1 = { padding: 20, margin: 10, minHeight: 800, maxHeight: 800, overflowY: 'auto' };
        let item_sizes = {
            xs: 12,
            md: 12,
            xl: 12
        };
        let expandOrCollapseIcon = null;
        if (expandedWidgetIndex !== null) {
            item_sizes.xs = item_sizes.md = item_sizes.xl = 12;
            expandOrCollapseIcon = <FaCompressArrowsAlt />
        }
        else {
            expandOrCollapseIcon = <FaExpandArrowsAlt />
        }
        return (
            <div style={style0}>
                <Grid container style={style0}>
                    {
                        this.props.children.map((child, ii) => {
                            if ((expandedWidgetIndex === null) || (expandedWidgetIndex === ii)) {
                                return (
                                    <Grid item {...item_sizes} key={ii}>
                                        <Paper style={style1}>
                                            <Grid container alignItems={'flex-start'} justify={'flex-end'} direction={'row'}>
                                                <IconButton
                                                    onClick={() => { this.handleToggleExpand(ii) }}
                                                    size={'small'}
                                                >
                                                    {expandOrCollapseIcon}
                                                </IconButton>
                                            </Grid>

                                            <hr />
                                            <h2>{child.props.title}</h2>
                                            <hr />
                                            <LazyLoader>
                                                <child.type {...child.props} reactopyaParent={this} reactopyaChildId={ii} key={ii} />
                                            </LazyLoader>
                                        </Paper>
                                    </Grid>
                                );
                            }
                            else {
                                return <span />;
                            }
                        })
                    }
                </Grid>
            </div>
        );
    }
}

function _create_element(project_name, type, children, props, key, reactopyaModel) {
    let Comp = allWidgets[type];
    return (
        <Comp {...(props)} key={key || undefined} reactopyaModel={reactopyaModel}>
            {
                children.map((child, ii) => (
                    _create_element(child.project_name || project_name, child.type, child.children || [], child.props || {}, ii, reactopyaModel ? reactopyaModel.childModel(ii) : null)
                ))
            }
        </Comp>
    );
}


