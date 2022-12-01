import React, { Component } from 'react'


export default class Pokeball extends Component {
  render() {
    return (
      <img 
        onClick={() => (
          this.props.findPokemon(this.props.input.toLowerCase())
        )}
        className={this.props.class} 
        src={require('./images/pokeball.png')}
        alt='pokeball'
      />
    )
  }
}
