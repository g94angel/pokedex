import React from 'react';
import PokeballImg from '../images/pokeball.png';

export default function Pokeball({
  findPokemon,
  input,
  onEmptySearch,
  className,
}) {
  const handleSearch = () => {
    if (!input) {
      if (onEmptySearch) onEmptySearch();
      return;
    }
    if (findPokemon) findPokemon(input.toLowerCase(), 'manual');
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleSearch}
      aria-label="Search Pokemon"
      title="Search Pokemon"
    >
      <img src={PokeballImg} alt="" aria-hidden="true" />
    </button>
  );
}
