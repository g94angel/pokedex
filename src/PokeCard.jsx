import React, { Component } from 'react'

export default class PokeCard extends Component {
  // constructor(props) {
  //   super(props)

  // }
  render() {
    console.log(this.props.state)
    return (
      <h1>Hello world</h1>
        // {this.props.state.image && (
        //   <img
        //     className="pokemon-image"
        //     src={this.state.image}
        //     alt={`pic of ${this.state.image}`}
        //   />
        // )}
    )
  }
}
