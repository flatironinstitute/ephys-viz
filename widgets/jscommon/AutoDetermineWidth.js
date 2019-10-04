import React, { Component } from 'react';

export default class AutoDetermineWidth extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: null
        };
    }

    async componentDidMount() {
        this.updateDimensions();
        // window.addEventListener("resize", this.resetWidth);
    }

    componentWillUnmount() {
        // window.removeEventListener("resize", this.resetWidth);
    }

    resetWidth = () => {
        if (this.state.width) {
            this.setState({
                width: null
            });
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if (!this.state.width) {
            this.updateDimensions();
        }
    }

    updateDimensions() {
        if ((!this.container) || (!this.container.offsetWidth)) return;
        if (this.state.width !== this.container.offsetWidth) {
            this.setState({
                width: this.container.offsetWidth // see render()
            });
            if (!this.container.sensor) {
                this.container.sensor = new ResizeSensor(this.container, () => {this.updateDimensions();});
                // this.container.sensor = new ResizeObserver(() => {/*this.updateDimensions()*/}).observe(this.container);
            }
        }
    }

    render() {
        const elmt = React.Children.only(this.props.children)
        if (this.props.width) {
            let new_props = {};
            for (let key in elmt.props) {
                new_props[key] = elmt.props[key];
            }
            new_props.width = this.props.width;
            return <elmt.type {...new_props}  />;
        }
        else if (elmt.props.width) {
            return elmt;
        }
        else {
            let width = this.state.width || undefined;
            if (!width) width = 312;

            let new_props = {};
            for (let key in elmt.props) {
                new_props[key] = elmt.props[key];
            }
            new_props.width = width;

            return (
                <div
                    className="determiningWidth"
                    ref={el => (this.container = el)}
                    style={{ position: 'relative', left: 0, right: 0, top: 0, bottom: 0 }}
                >
                    <elmt.type {...new_props}  />
                </div>
            );
        }
    }
}

function ResizeSensor(element, callback)
{
    console.log('test 1');
    let zIndex = parseInt(getComputedStyle(element));
    if(isNaN(zIndex)) { zIndex = 0; };
    zIndex--;

    let expand = document.createElement('div');
    expand.style.position = "absolute";
    expand.style.left = "0px";
    expand.style.top = "0px";
    expand.style.right = "0px";
    expand.style.bottom = "0px";
    expand.style.overflow = "hidden";
    expand.style.zIndex = zIndex;
    expand.style.visibility = "hidden";

    let expandChild = document.createElement('div');
    expandChild.style.position = "absolute";
    expandChild.style.left = "0px";
    expandChild.style.top = "0px";
    expandChild.style.width = "10000000px";
    expandChild.style.height = "10000000px";
    expand.appendChild(expandChild);

    let shrink = document.createElement('div');
    shrink.style.position = "absolute";
    shrink.style.left = "0px";
    shrink.style.top = "0px";
    shrink.style.right = "0px";
    shrink.style.bottom = "0px";
    shrink.style.overflow = "hidden";
    shrink.style.zIndex = zIndex;
    shrink.style.visibility = "hidden";

    let shrinkChild = document.createElement('div');
    shrinkChild.style.position = "absolute";
    shrinkChild.style.left = "0px";
    shrinkChild.style.top = "0px";
    shrinkChild.style.width = "200%";
    shrinkChild.style.height = "200%";
    shrink.appendChild(shrinkChild);

    element.appendChild(expand);
    element.appendChild(shrink);

    function setScroll()
    {
        expand.scrollLeft = 10000000;
        expand.scrollTop = 10000000;

        shrink.scrollLeft = 10000000;
        shrink.scrollTop = 10000000;
    };
    setScroll();

    let size = element.getBoundingClientRect();

    let currentWidth = size.width;
    let currentHeight = size.height;

    let onScroll = function()
    {
        let size = element.getBoundingClientRect();

        let newWidth = size.width;
        let newHeight = size.height;

        console.log('abc', newWidth, currentWidth);
        if(newWidth != currentWidth || newHeight != currentHeight)
        {
            currentWidth = newWidth;
            currentHeight = newHeight;

            callback();
        }

        setScroll();
    };

    expand.addEventListener('scroll', onScroll);
    shrink.addEventListener('scroll', onScroll);
};