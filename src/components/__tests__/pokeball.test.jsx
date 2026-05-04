import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Pokeball from '../Pokeball';

describe('Pokeball', () => {
  it('submits manual search when input has text', () => {
    const findPokemon = vi.fn();

    render(
      <Pokeball
        findPokemon={findPokemon}
        input="PiKaChu"
        onEmptySearch={vi.fn()}
        className="pokeball-btn"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search pokemon/i }));
    expect(findPokemon).toHaveBeenCalledWith('pikachu', 'manual');
  });

  it('triggers onEmptySearch and skips fetch when input is empty', () => {
    const onEmptySearch = vi.fn();
    const findPokemon = vi.fn();

    render(
      <Pokeball
        findPokemon={findPokemon}
        input=""
        onEmptySearch={onEmptySearch}
        className="pokeball-btn"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search pokemon/i }));
    expect(onEmptySearch).toHaveBeenCalledTimes(1);
    expect(findPokemon).not.toHaveBeenCalled();
  });
});
