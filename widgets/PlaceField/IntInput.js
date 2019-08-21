import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import { FormControl, InputLabel, FormHelperText } from '@material-ui/core';


export default class IntInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            textValue: props.value
        }
    }

    componentDidMount() {
        this.setState({
            textValue: this.props.value
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.value != prevProps.value) {
            this.setState({
                textValue: this.props.value
            });
        }
    }

    _setValue = (val) => {
        const { value } = this.props;

        if (val != value) {
            this.props.onChange && this.props.onChange(val);
        }
    }

    handleInputChange = event => {
        const { min, max } = this.props;

        let val = event.target.value;
        this.setState({ textValue: val });
        if (val === '') return;
        if (isNaN(val)) return;

        val = +val;
        if ((val < min) || (val > max)) return;
        this._setValue(val);
    };

    render() {
        const { label, min, max } = this.props;
        const { textValue } = this.state;

        return (
            <FormControl>
                {/* <InputLabel htmlFor="my-input">{label}</InputLabel> */}
                <Input
                    id="my-input" aria-describedby="my-helper-text"
                    value={textValue}
                    onChange={this.handleInputChange}
                    inputProps={{
                        step: 1,
                        min: min,
                        max: max,
                        type: 'number'
                    }}
                />
                <FormHelperText id="my-helper-text">{label}</FormHelperText>
            </FormControl>
        );
    }
}