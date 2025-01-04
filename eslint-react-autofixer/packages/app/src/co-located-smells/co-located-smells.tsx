import React, { Component } from "react";

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 1
        };
    }

    increment() {
        // Utiliza setState para actualizar el estado
        //@ts-ignore en un ejemplo real no daria este error ya que si se conoceria el tipo
        this.setState({value: this.state.value + 1});
    }

    render() {
            <div>
                <p>Value: {
                    //@ts-ignore en un ejemplo real no daria este error ya que si se conoceria el tipo
                    this.state.value
                }
                </p>
                <button>Increment</button>
                <button type="submit">Increment</button>
            </div>
    }
}

export default MyComponent;
