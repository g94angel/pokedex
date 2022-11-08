import React, { Component } from 'react'

export default class PokeCard extends Component {
  render() {
    const {data, image} = this.props.state;
    let types = this.props.state.data.types // types is an arr of obj
    let allTypes = []
    for (const obj of types) {
      allTypes.push(obj.type.name)
    }
    console.log('alltypes', allTypes)
    let typeString = ''
    for (let i=0; i<allTypes.length; i++) {
      if (i === allTypes.length -1) {
        typeString += allTypes[i][0].toUpperCase() + allTypes[i].slice(1);  
      } else {
        typeString += allTypes[i][0].toUpperCase() + allTypes[i].slice(1) + ' | ';
      } 
    }


    return (
      <div className='card-container'>
        <div className='card-image'>
          <img
          className="pokemon-image"
          src={image}
          alt={data.name}
        />
        </div>
        <div className='card-details'>
          <h3 className='card-name'>{data.name[0].toUpperCase() + data.name.slice(1)}</h3>
          <div className='card-info'>
            {<p>{`#${data.id}`}</p>}
            {<p>{typeString}</p>}
            {<p>{`${(data.weight)/10} kg`}</p>}
          </div>
        </div>
      </div>
    )
  }
}
