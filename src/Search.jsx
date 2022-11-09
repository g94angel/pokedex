import React, { Component } from 'react'

export default class Search extends Component {
  render() {
    return (
      <div className='search-container'>
        <input
          onChange={this.props.handleChange}
          placeholder='Type here'
          type="text"
          value={this.props.state.input}
        />
        <img 
          onClick={() => (
            this.props.findPokemon(this.props.state.input.toLowerCase())
          )}
          className='pokeball-btn' src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png'
          alt='pokeball'/>
      </div>
    )
  }
}
