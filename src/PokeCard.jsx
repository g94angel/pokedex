import React, { Component } from 'react'

export default class PokeCard extends Component {

  state = {
    seeDetails: false
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      seeDetails: !prevState.seeDetails
    }))
  }


  render() {
    const {data, image, speciesData} = this.props.state;
    let types = this.props.state.data.types // types is an arr of obj
    let allTypes = []
    for (const obj of types) {
      allTypes.push(obj.type.name)
    }
    let typeString = ''
    for (let i=0; i<allTypes.length; i++) {
      if (i === allTypes.length -1) {
        typeString += allTypes[i][0].toUpperCase() + allTypes[i].slice(1);  
      } else {
        typeString += allTypes[i][0].toUpperCase() + allTypes[i].slice(1) + ' | ';
      } 
    }

    return (
      <div className='main-container-two'>
        <div className='carousel'>
          <button onClick={() => this.props.findPokemon(data.id - 1)} className='navigate'><i className="fa fa-thin fa-caret-left"></i></button>
          <div className='card-image'>
            <img
            className="pokemon-image"
            src={image}
            alt={data.name}
          />
          </div>
          <button onClick={() => this.props.findPokemon(data.id + 1)} className='navigate'><i className="fa fa-thin fa-caret-right"></i></button>
        </div>
        <button 
          className='details-btn' onClick={this.toggleDetails}>{this.state.seeDetails ? 'Hide' : 'See'} details
        </button>
        {this.state.seeDetails && 
        <div className='card-details'>
          <h4 className='card-name'>
            {data.name[0].toUpperCase() + data.name.slice(1)}
          </h4>
          <div className='card-info'>
            {<p>{`#${data.id}`}</p>}
            {<p>{typeString}</p>}
            {<p>{speciesData.flavor_text_entries[4].flavor_text}</p>}
            {/* {<p>{`${(data.weight)/10} kg`}</p>} */}
          </div>
        </div>}
      </div>
    )
  }
}
