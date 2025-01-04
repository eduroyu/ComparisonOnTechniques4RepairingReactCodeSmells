import React from "react";
import { Component } from "react";

class Hello extends Component {
    render() {
        var Hello1 = <button>Hello</button>
        var Hello2 = <button type={foo}>Hello</button>
    
        var Hello3 = React.createElement('button', {id: 'id'}, 'Hello');
        var Hello4 = React.createElement('button', {type: 'foo', }, 'Hello');
        return <></>
    }
}