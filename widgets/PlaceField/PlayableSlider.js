import React, { Component } from 'react';
import { Grid, IconButton, Slider } from '@material-ui/core';
import { FaStop, FaPlay } from 'react-icons/fa';

export default class PlayableSlider extends Component {
    state = {
        running: false
    }
    _frameId = null
    _animationTimer = null
    componentDidMount() {
        if ((this.props.running) && (!this.state.running)) {
            this.handleToggleStart();
        }
    }
    componentWillUnmount() {
        if (this._frameId) {
            window.cancelAnimationFrame(this._frameId);
        }
        this.setState({ running: false });
    }
    handleToggleStart = () => {
        if (this.state.running) {
            this.setState({ running: false });
        }
        else {
            this.setState({ running: true });
            this._animationTimer = new Date();
            this._requestAnimationFrame();
        }
    }
    _requestAnimationFrame() {
        this._frameId = window.requestAnimationFrame(this.handleAnimation);
    }
    handleAnimation = () => {
        if (!this.state.running) return;
        let elapsed = (new Date()) - this._animationTimer;
        let numToAdvance = Math.floor(this.props.stepsPerSec * (elapsed / 1000));
        if (numToAdvance > 0) {
            this.props.onChange(null, this.props.value + numToAdvance);
            this._animationTimer = new Date();
        }
        this._requestAnimationFrame();
    }
    render() {
        let icon = this.state.running ? <FaStop /> : <FaPlay />;
        return (
            <Grid container alignItems="center" spacing={2}>
                <Grid item>
                    <IconButton
                        onClick={this.handleToggleStart}
                        size="small"
                    >
                        {icon}
                    </IconButton>
                </Grid>
                <Grid item style={{flexGrow: 1}}>
                    <Slider min={this.props.min} max={this.props.max} value={this.props.value} onChange={this.props.onChange} />
                </Grid>
            </Grid>
        )
    }
}