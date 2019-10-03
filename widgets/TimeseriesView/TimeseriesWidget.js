import React from 'react';
import TimeWidget, { PainterPath } from '../TimeWidget/TimeWidget';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default class TimeseriesWidget extends TimeWidget {
    constructor(props) {
        super(props);
        this.state = {}
        this._downsampleFactor = 1;
        this.channel_colors = mv_default_channel_colors(); // colors of the channel traces
        this.y_scale_factor = 1;
    }
    componentDidMount() {

        this.y_scale_factor = this.props.y_scale_factor;

        // this happens when the timeseries model receives new data
        this.props.timeseriesModel.onDataSegmentSet((ds_factor, t1, t2) => {
            let trange = this.timeRange();
            if ((t1 <= trange[1]) && (t2 >= trange[0])) {
                // if the new chunk is in range of what we are viewing, we repaint
                this.repaint();
            }
        });

        this.onTimeRangeChanged(() => {
            this.updateDownsampleFactor();
        });
        this.updateDownsampleFactor();

        this.updatePanels();
        this.initializeTimeWidget();
        this.addAction(() => {this._zoomAmplitude(1.15)}, {title: 'Scale amplitude up [up arrow]', icon: <FaArrowUp />, key: 38});
        this.addAction(() => {this._zoomAmplitude(1 / 1.15)}, {title: 'Scale amplitude down [down arrow]', icon: <FaArrowDown />, key: 40});
    }
    componentDidUpdate() {
        this.updateTimeWidget();
        this.updatePanels();
    }
    updateDownsampleFactor() {
        let trange = this.timeRange();
        let downsample_factor = determine_downsample_factor_from_num_timepoints(this.props.width * 1.3, trange[1] - trange[0]);
        if (downsample_factor !== this._downsampleFactor) {
            this._downsampleFactor = downsample_factor;
            this.repaint();
        }
    }
    updatePanels() {
        const { num_channels, channel_ids } = this.props;
        this.clearPanels();
        if (!num_channels) return;
        for (let m = 0; m < num_channels; m++) {
            let panel = this.addPanel(
                (painter) => {this.paintChannel(painter, m)},
                {label: channel_ids[m]}
            );
            panel.setCoordYRange(-1, 1);
        }
        this.repaint();
    }
    paintChannel = (painter, m) => {
        let trange = this.timeRange();
        let y_offset = this.props.y_offsets[m];
        painter.setPen({color: 'black'});
        // painter.drawLine(trange[0], 0, trange[1], 0);

        let y_scale_factor = this.y_scale_factor;

        let t1 = Math.floor(trange[0]);
        let t2 = Math.floor(trange[1] + 1);
        if (t1 < 0) t1 = 0;
        if (t2 >= this.props.num_timepoints) t2 = this.props.num_timepoints;
        let downsample_factor = this._downsampleFactor;
        let t1b = Math.floor(t1 / downsample_factor);
        let t2b = Math.floor(t2 / downsample_factor);
        painter.setPen({ 'color': this.channel_colors[m % this.channel_colors.length] });
        let pp = new PainterPath();
        let data0 = this.props.timeseriesModel.getChannelData(m, t1b, t2b, downsample_factor);
        // trigger pre-loading
        this.props.timeseriesModel.getChannelData(m, Math.floor(t1b / 3), Math.floor(t2b / 3), downsample_factor * 3, { request_only: true });
        if ((downsample_factor > 1) && (this.currentTime >= 0)) {
            let t1c = Math.floor(Math.max(0, (this.currentTime - 800) / (downsample_factor / 3)))
            let t2c = Math.floor(Math.min(this.props.timeseriesModel.numTimepoints(), (this.currentTime + 800) / (downsample_factor / 3)))
            this.props.timeseriesModel.getChannelData(m, t1c, t2c, downsample_factor / 3, { request_only: true });
        }
        if (downsample_factor == 1) {
            for (let tt = t1; tt < t2; tt++) {
                let val = data0[tt - t1];
                let val2 = (val + y_offset) * y_scale_factor;
                if (!isNaN(val)) {
                    pp.lineTo(tt, val2);
                }
                else {
                    pp.moveTo(tt, val2);
                }
            }
        }
        else {
            for (let tt = t1b; tt < t2b; tt++) {
                let val_min = data0[(tt - t1b) * 2];
                let val_max = data0[(tt - t1b) * 2 + 1];
                if ((!isNaN(val_min)) && (!isNaN(val_max))) {
                    let val2_min = (val_min + y_offset) * y_scale_factor;
                    let val2_max = (val_max + y_offset) * y_scale_factor;
                    pp.lineTo(tt * downsample_factor, val2_min);
                    pp.lineTo(tt * downsample_factor, val2_max);
                }
                else {
                    pp.moveTo(tt * downsample_factor, 0);
                }
            }
        }
        painter.drawPath(pp);
    }
    _zoomAmplitude = (factor) => {
        this.y_scale_factor *= factor;
        this.repaint();
    }
    render() {
        return this.renderTimeWidget();
    }
}

function determine_downsample_factor_from_num_timepoints(target_num_pix, num) {
    // determine what the downsample factor should be based on the number
    // of timepoints in the view range
    // we also need to consider the number of pixels it corresponds to
    let ds_factor = 1;
    let factor = 3;
    while (num / (ds_factor * factor) > target_num_pix) {
        ds_factor *= factor;
    }
    return ds_factor;
}

function mv_default_channel_colors() {
    var ret = [];
    ret.push('rgb(40,40,40)');
    ret.push('rgb(64,32,32)');
    ret.push('rgb(32,64,32)');
    ret.push('rgb(32,32,112)');
    return ret;
}
