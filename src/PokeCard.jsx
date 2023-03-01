import React, { Component } from 'react'
import Pokeball from './Pokeball';

export default class PokeCard extends Component {
  render() {
    const {data, image, speciesData, inCache} = this.props.state;
    let types = data.types;
    let allTypes = []
    for (const obj of types) {
      allTypes.push(obj.type.name)
    }
    let typeString = ''
    for (let i=0; i<allTypes.length; i++) {
      if (i === allTypes.length-1) {
        typeString += allTypes[i][0].toUpperCase() + allTypes[i].slice(1);  
      } else {
        typeString += allTypes[i][0].toUpperCase() + allTypes[i].slice(1) + ' | ';
      } 
    }
    let reg = new RegExp(data.name, 'gi')

    let generation = '';
    let region = ''
    let descNum;
    let genusNum;
    if (data.id < 152) {
      generation = 'I';
      region = 'Kanto';
      descNum = 0;
      genusNum = 7;
    } else if (data.id < 252) {
      generation = 'II'
      region = 'Johto';
      descNum = 0;
      genusNum = 7;
    } else if (data.id < 387) {
      generation = 'III'
      region = 'Hoenn';
      descNum = 0;
      genusNum = 7;
    } else if (data.id < 494) {
      generation = 'IV'
      region = 'Sinnoh';
      descNum = 1;
      genusNum = 7;
    } else if (data.id < 650) {
      generation = 'V'
      region = 'Unova';
      descNum = 1;
      genusNum = 7;
    } else if (data.id < 722) {
      generation = 'VI'
      region = 'Kalos';
      descNum = 6;
      genusNum = 7;
    } else if (data.id < 810) {
      generation = 'VII'
      region = 'Alola';
      descNum = 7;
      genusNum = 7;
    } else if (data.id <= 898) {
      generation = 'VIII'
      region = 'Galar';
      descNum = 7;
      genusNum = 7;
    } else if (data.id >= 899) {
      generation = 'VIII'
      region = 'Galar';
      descNum = 0;
      genusNum = 4;
    }

    let bio = speciesData.flavor_text_entries[descNum].flavor_text.replace(/POKéMON/gi, 'Pokémon').replace(reg, data.name[0].toUpperCase() + data.name.slice(1)).replace(/\f/g, ' ')
    // console.log('flavor_text', speciesData.flavor_text_entries[descNum].flavor_text)
    // if (speciesData.flavor_text_entries) {
    //   bio = speciesData.flavor_text_entries[descNum].flavor_text.replace(/POKéMON/gi, 'Pokémon').replace(reg, data.name[0].toUpperCase() + data.name.slice(1))
    // };
    // console.log('bio', JSON.stringify(bio))
    let genus = speciesData.genera[genusNum].genus;
    // console.log(speciesData.genera[genusNum].genus)
    return (
      <div className='card-container'>
        <div className='carousel'>
          {/* disable button if id === 0 */}
          <button disabled={data.id - 1 === 0 ? true : false} onClick={() => this.props.findPokemon(data.id - 1)} className='navigate'><i className="fa fa-thin fa-caret-left"></i></button>
          <div className='card-image'>
            <img
            className="pokemon-image"
            src={image}
            alt={data.name}
          />
          </div>
          <button disabled={data.id + 1 === 906 ? true : false} onClick={() => this.props.findPokemon(data.id + 1)} className='navigate'><i className="fa fa-thin fa-caret-right"></i></button>
        </div>
        {/* <button 
          className='details-btn' onClick={this.toggleDetails}>{this.state.seeDetails ? 'Hide' : 'See'} details
        </button> */}
        {/* {this.state.seeDetails &&  */}
        <div className='card-details'>
          <div className='card-name' >
            <h4>
              {data.name[0].toUpperCase() + data.name.slice(1)}
            </h4>
            {inCache && 
            <Pokeball class='pokeball' />
            }
          </div>
          <div className='card-info'>
            {genus && <p>{`#${data.id} - The ${genus}`}</p>}
            <p>{`Generation ${generation} | ${region} region`}</p>
            <p>{typeString}</p>
            {speciesData.evolves_from_species && <p>{`Evolves from ${speciesData.evolves_from_species.name[0].toUpperCase() + speciesData.evolves_from_species.name.slice(1)}`}</p>}
            {<p>{bio}</p>}
          </div>
        </div>
        {/* } */}
      </div>
    )
  }
}
