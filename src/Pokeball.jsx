import React, { Component } from 'react'

export default class Pokeball extends Component {
  render() {
    return (
      <img 
        onClick={() => (
          this.props.findPokemon(this.props.input.toLowerCase())
        )}
        className='pokeball-btn' 
        src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png'
        alt='pokeball'
      />
    )
  }
}
