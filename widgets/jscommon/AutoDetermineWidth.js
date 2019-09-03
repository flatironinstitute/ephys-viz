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
        if (!this.container) return;
        if (this.state.width !== this.container.offsetWidth) {
            this.setState({
                width: this.container.offsetWidth // see render()
            });
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
            let width = this.props.width ||  this.state.width || undefined;
            if (!width) width = 300;

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