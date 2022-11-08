import React, { Component } from 'react'

export default class Search extends Component {
  render() {
    return (
      <>
        <img
            className="logo"
            src={require('./images/pokemon-logo.png')}
            alt="pokemon-logo"
          />

        <input
          onChange={this.props.handleChange}
          type="text"
          value={this.props.state.input}
        />
        <button onClick={this.props.findPokemon}>Search</button>
      </>
    )
  }
}
