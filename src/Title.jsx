import React, { Component } from 'react'

export default class Title extends Component {
  render() {
    return (
      <img
        className="logo"
        src={require('./images/pokemon-logo.png')}
        alt="pokemon-logo"
      />
    )
  }
}
