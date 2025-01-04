import React, { Component } from 'react';

class UserPassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            //@ignoreRule-PIIS
            inputVal: props.inputVal,
            
        };
    }

    render() {
        //@ts-ignore en un ejemplo real no daria este error ya que si se conoceria el tipo
        return <div>{this.state.inputVal + props.outputVal}</div>;
    }
}