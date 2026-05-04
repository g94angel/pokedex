import React from 'react';
import PokemonLogo from '../images/pokemon-logo.png';

export default function Title() {
  return <img className="logo" src={PokemonLogo} alt="pokemon-logo" />;
}
