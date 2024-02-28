import React, { Component } from 'react'
import PokeballImg from './images/pokeball.png'

export default class Loader extends Component {
    
    render() {
      return (
    <div className="loader-container">
        
        <img 
        className="loader"
        src={PokeballImg}
        alt='pokeball'
      />
        
        
       </div>
  )
}}