import React, { Component } from 'react'
import PokeballImg from './images/pokeball.png'


export default class Pokeball extends Component {
  render() {
    return (
      <img 
        onClick={() => (
          this.props.findPokemon(this.props.input.toLowerCase())
        )}
        className={this.props.class} 
        src={PokeballImg}
        alt='pokeball'
      />
    )
  }
}
