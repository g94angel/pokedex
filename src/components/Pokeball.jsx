import React from 'react';
import PokeballImg from '../images/pokeball.png';

export default function Pokeball({
  findPokemon,
  input,
  onEmptySearch,
  className,
}) {
  const handleClick = () => {
    if (!input) {
      if (onEmptySearch) onEmptySearch();
      return;
    }
    if (findPokemon) findPokemon(input.toLowerCase());
  };

  return (
    <img
      onClick={handleClick}
      className={className}
      src={PokeballImg}
      alt="pokeball"
    />
  );
}
