import React, { Component } from 'react'
import Pokeball from './Pokeball'

export default class Search extends Component {
  render() {
    return (
      <div className='search-container'>
        <input
          onKeyPress={(e) => {
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
        //   onClick={() => (
        //     this.props.findPokemon(this.props.state.input.toLowerCase())
        // )}
         />
        {/* <img 
          onClick={() => (
            this.props.findPokemon(this.props.state.input.toLowerCase())
          )}
          className='pokeball-btn' src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png'
          alt='pokeball'/> */}
      </div>
    )
  }
}
