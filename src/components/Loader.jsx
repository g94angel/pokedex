import React from 'react';
import PokeballImg from '../images/pokeball.png';

export default function Loader() {
  return (
    <div className="loader-container">
      <img className="loader" src={PokeballImg} alt="pokeball" />
    </div>
  );
}
