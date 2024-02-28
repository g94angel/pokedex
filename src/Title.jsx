import React, { Component } from 'react'
import PokemonLogo from './images/pokemon-logo.png'

export default class Title extends Component {
  render() {
    return (
      <img
        className="logo"
        src={PokemonLogo}
        alt="pokemon-logo"
      />
    )
  }
}
