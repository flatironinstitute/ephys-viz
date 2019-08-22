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
        if (this.state.width !== this.container.offsetWidth) {
            this.setState({
                width: this.container.offsetWidth // see render()
            });
        }
    }

    render() {
        let { width } = this.state;
        if (!width) width = 300;

        const elmt = React.Children.only(this.props.children)

        return (
            <div
                className="determiningWidth"
                ref={el => (this.container = el)}
                style={{ position: 'relative', left: 0, right: 0, top: 0, bottom: 0 }}
            >
                <elmt.type {...elmt.props} width={width}>{elmt.children}</elmt.type>
            </div>
        );
    }
}