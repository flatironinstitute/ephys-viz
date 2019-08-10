import React, { Component } from "react";
import CanvasWidget from './CanvasWidget';
const stable_stringify = require('json-stable-stringify');

export default class ElectrodeGeometryWidget extends Component {
    render() {
        return (
            <AutoSizer>
                <ElectrodeGeometryWidgetInner {...this.props} />
            </AutoSizer>
        );
    }
}

class ElectrodeGeometryWidgetInner extends CanvasWidget {
    constructor(props) {
        super(props);
        this.xmin = 0;
        this.xmax = 1;
        this.ymin = 0;
        this.ymax = 2;
        this.transpose = false;
        this.margins = { top: 15, bottom: 15, left: 15, right: 15 };
        this.channel_rects = {};
        this.hovered_electrode_indices = {};
        this.current_electrode_index = -1;
        this.selected_electrode_indices = {};
        this.dragSelectRect = null;

        this.mouseHandler().onMousePress(this.handleMousePress);
        this.mouseHandler().onMouseRelease(this.handleMouseRelease);
        this.mouseHandler().onMouseMove(this.handleMouseMove);
        this.mouseHandler().onMouseDrag(this.handleMouseDrag);
        this.mouseHandler().onMouseDragRelease(this.handleMouseDragRelease);

        this.dragSelectLayer = this.addCanvasLayer(this.paintDragSelect);
        this.mainLayer = this.addCanvasLayer(this.paintMainLayer);
    }

    componentWillMount() {
        this.computeSize();
        this.repaint();
    }

    componentDidUpdate() {
        this.computeSize();
        this.repaint();
    }

    computeSize() {
        this.updatePositions();

        let W = this.props.width;
        if (!W) W=400;
        let H = this.props.height;
        if (!H) {
            let x1 = this.xmin - this.mindist, x2 = this.xmax + this.mindist;
            let y1 = this.ymin - this.mindist, y2 = this.ymax + this.mindist;
            let w0 = x2 - x1, h0 = y2 - y1;
            if (this.transpose) {
                let w0_tmp = w0;
                w0 = h0;
                h0 = w0_tmp;
            }
            if (!w0) {
                H = 100;
            }
            else {
                H = h0 / w0 * W;
            }
        }
        this.setSize(W, H);
    }

    paintDragSelect = (painter) => {
        painter.clearRect(0, 0, this.width(), this.height());
        if (this.dragSelectRect) {
            painter.fillRect(this.dragSelectRect, 'lightgray');
        }
    }

    paintMainLayer = (painter) => {
        const W = this.width();
        const H = this.height();

        painter.clearRect(0, 0, W, H);

        let W1 = W, H1 = H;
        if (this.transpose) {
            W1 = H;
            H1 = W;
        }

        let x1 = this.xmin - this.mindist, x2 = this.xmax + this.mindist;
        let y1 = this.ymin - this.mindist, y2 = this.ymax + this.mindist;
        let w0 = x2 - x1, h0 = y2 - y1;
        let offset, scale;
        if (w0 * H1 > h0 * W1) {
            scale = W1 / w0;
            offset = [0 - x1 * scale, (H1 - h0 * scale) / 2 - y1 * scale];
        } else {
            scale = H1 / h0;
            offset = [(W1 - w0 * scale) / 2 - x1 * scale, 0 - y1 * scale];
        }
        this.channel_rects = {};
        if (this.props.locations) {
            for (let i in this.props.locations) {
                let pt0 = this.props.locations[i];
                let x = pt0[0] * scale + offset[0];
                let y = pt0[1] * scale + offset[1];
                let rad = this.mindist * scale / 3;
                let x1 = x, y1 = y;
                if (this.transpose) {
                    x1 = y;
                    y1 = x;
                }
                let col = this.getChannelColor(i);
                let rect0 = [x1 - rad, y1 - rad, rad * 2, rad * 2];
                painter.fillEllipse(rect0, col);
                this.channel_rects[i] = rect0;
                let label0;
                if (this.props.labels) {
                    label0 = this.props.labels[i] || '';
                }
                else {
                    label0 = '';
                }
                if ((label0) || (label0 === 0)) {
                    painter.setBrush({ color: 'white' });
                    painter.setFont({ 'pixel-size': rad });
                    painter.drawText(rect0, { AlignCenter: true, AlignVCenter: true }, label0);
                }
            }
        }
    }

    updatePositions() {
        if (!this.props.locations) {
            return;
        }
        let pt0 = this.props.locations[0] || [0, 0];
        let xmin = pt0[0], xmax = pt0[0];
        let ymin = pt0[1], ymax = pt0[1];
        for (let i in this.props.locations) {
            let pt = this.props.locations[i];
            xmin = Math.min(xmin, pt[0]);
            xmax = Math.max(xmax, pt[0]);
            ymin = Math.min(ymin, pt[1]);
            ymax = Math.max(ymax, pt[1]);
        }
        // if (xmax === xmin) xmax++;
        // if (ymax === ymin) ymax++;

        this.xmin = xmin; this.xmax = xmax;
        this.ymin = ymin; this.ymax = ymax;

        this.transpose = (this.ymax - this.ymin > this.xmax - this.xmin);

        let mindists = [];
        for (var i in this.props.locations) {
            let pt0 = this.props.locations[i];
            let mindist = -1;
            for (let j in this.props.locations) {
                let pt1 = this.props.locations[j];
                let dx = pt1[0] - pt0[0];
                let dy = pt1[1] - pt0[1];
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    if ((dist < mindist) || (mindist < 0))
                        mindist = dist;
                }
            }
            if (mindist > 0) mindists.push(mindist);
        }
        let avg_mindist = compute_average(mindists);
        if (avg_mindist <= 0) avg_mindist = 1;
        this.mindist = avg_mindist;
    }

    getChannelColor(ind) {
        let color = 'rgb(0, 0, 255)';
        let color_hover = 'rgb(100, 100, 255)';
        let color_current = 'rgb(200, 200, 100)';
        let color_current_hover = 'rgb(220, 220, 100)';
        let color_selected = 'rgb(180, 180, 150)';
        let color_selected_hover = 'rgb(200, 200, 150)';

        if (ind === this.current_electrode_index) {
            if (ind in this.hovered_electrode_indices) {
                return color_current_hover;
            }
            else {
                return color_current;
            }
        }
        else if (this.selected_electrode_indices[ind]) {
            if (ind in this.hovered_electrode_indices) {
                return color_selected_hover;
            }
            else {
                return color_selected;
            }
        }
        else {
            if (ind in this.hovered_electrode_indices) {
                return color_hover;
            }
            else {
                return color;
            }
        }
    }

    electrodeIndexAtPixel(pos) {
        for (let i in this.channel_rects) {
            let rect0 = this.channel_rects[i];
            if ((rect0[0] <= pos[0]) && (pos[0] <= rect0[0] + rect0[2])) {
                if ((rect0[1] <= pos[1]) && (pos[1] <= rect0[1] + rect0[2])) {
                    return i;
                }
            }
        }
        return -1;
    }

    electrodeIndicesInRect(rect) {
        let ret = [];
        for (let i in this.channel_rects) {
            let rect0 = this.channel_rects[i];
            if (rects_intersect(rect, rect0)) {
                ret.push(i);
            }
        }
        return ret;
    }

    setHoveredElectrodeIndex(ind) {
        this.setHoveredElectrodeIndices([ind]);
    }

    setHoveredElectrodeIndices(inds) {
        let tmp = {};
        for (let ind of inds)
            tmp[ind] = true;
        if (JSON.parse(stable_stringify(tmp)) === this.hovered_electrode_indices)
            return;
        this.hovered_electrode_indices = tmp;
        this.repaint();
    }

    setCurrentElectrodeIndex(ind) {
        if (ind === this.current_electrode_index)
            return;
        this.current_electrode_index = ind;
        this.repaint()
    }

    setSelectedElectrodeIndices(inds) {
        let newsel = {};
        for (let ind of inds) {
            newsel[ind] = true;
        }
        if (stable_stringify(newsel) === stable_stringify(this.selected_electrode_indices)) {
            return;
        }
        this.selected_electrode_indices = newsel;
        this.repaint()
    }

    selectElectrodeIndex(ind) {
        let x = JSON.parse(JSON.stringify(this.selected_electrode_indices));
        x[ind] = true;
        this.setSelectedElectrodeIndices(Object.keys(x));
    }

    deselectElectrodeIndex(ind) {
        let x = JSON.parse(JSON.stringify(this.selected_electrode_indices));
        delete x[ind];
        this.setSelectedElectrodeIndices(Object.keys(x));
    }

    handleMousePress = (X) => {
        if (!X) return;
        let elec_ind = this.electrodeIndexAtPixel(X.pos);
        if ((X.modifiers.ctrlKey) || (X.modifiers.shiftKey)) {
            if (elec_ind in this.selected_electrode_indices) {
                this.deselectElectrodeIndex(elec_ind);
            }
            else {
                this.selectElectrodeIndex(elec_ind);
            }
        }
        else {
            this.setCurrentElectrodeIndex(elec_ind);
            this.setSelectedElectrodeIndices([elec_ind]);
        }
    }

    handleMouseRelease = (X) => {
    }

    handleMouseMove = (X) => {
        if (!X) return;
        if (!this.dragSelectRect) {
            let elec_ind = this.electrodeIndexAtPixel(X.pos);
            this.setHoveredElectrodeIndex(elec_ind);
        }
    }

    handleMouseDrag = (X) => {
        if (JSON.stringify(X.rect) !== JSON.stringify(this.dragSelectRect)) {
            this.dragSelectRect = X.rect;
            this.setHoveredElectrodeIndices(this.electrodeIndicesInRect(this.dragSelectRect));
            this.repaint();
        }
    }

    handleMouseDragRelease = (X) => {
        let inds = this.electrodeIndicesInRect(X.rect);
        this.setCurrentElectrodeIndex(null);
        this.setSelectedElectrodeIndices(inds);
        if (inds.length === 1) {
            this.setCurrentElectrodeIndex(inds[0]);
        }
        this.dragSelectRect = null;
        this.hovered_electrode_indices = {};
        this.repaint();
    }

    render() {
        if (this.props.locations === undefined) {
            return <span>
                <div>Loading...</div>
            </span>
        }
        else if (this.props.locations === null) {
            return <span>
                <div>Not found.</div>
            </span>
        }

        return this.renderCanvasWidget();
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

function rects_intersect(R1, R2) {
    if ((R2[0] + R2[2] < R1[0]) || (R2[0] > R1[0] + R1[2])) return false;
    if ((R2[1] + R2[3] < R1[1]) || (R2[1] > R1[1] + R1[3])) return false;
    return true;
}

function compute_average(list) {
    if (list.length === 0) return 0;
    var sum = 0;
    for (var i in list) sum += list[i];
    return sum / list.length;
}
