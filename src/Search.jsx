import React, { Component } from 'react'
import Pokeball from './Pokeball'

export default class Search extends Component {
  render() {
    return (
      <div className='search-container'>
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              this.props.findPokemon(this.props.state.input.toLowerCase())
            }
          }}
          onChange={this.props.handleChange}
          placeholder='Search'
          type="text"
          value={this.props.state.input}
        />
        <Pokeball
          findPokemon={this.props.findPokemon}
          input={this.props.state.input}
          class='pokeball-btn'
         />
      </div>
    )
  }
}
