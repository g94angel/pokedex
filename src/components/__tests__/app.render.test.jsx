import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const FULL_POKEMON_STATE = {
  loaded: true,
  isSearching: false,
  data: {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    types: [{ type: { name: 'electric' } }],
    abilities: [{ ability: { name: 'static' } }],
    stats: [{ stat: { name: 'hp' }, base_stat: 35 }],
    sprites: {
      front_default: 'pikachu.png',
      front_shiny: 'pikachu-shiny.png',
      other: { 'official-artwork': { front_shiny: 'pikachu-art-shiny.png' } },
    },
    cries: { latest: null, legacy: null },
  },
  speciesData: {
    flavor_text_entries: [
      { language: { name: 'en' }, flavor_text: 'A mouse Pokemon.' },
    ],
    genera: [{ language: { name: 'en' }, genus: 'Mouse Pokemon' }],
  },
  evoData: null,
  image: 'pikachu.png',
  party: [],
};

describe('App render', () => {
  let appInstance;

  beforeEach(() => {
    vi.spyOn(App.prototype, 'componentDidMount').mockImplementation(
      function () {
        appInstance = this;
      },
    );
    vi.spyOn(globalThis.history, 'pushState').mockImplementation(() => {});
  });

  afterEach(() => {
    appInstance = null;
  });

  it('renders loader placeholder before any pokemon data is loaded', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error warning when error state is set', async () => {
    render(<App />);
    await act(async () => {
      appInstance.setState({
        error: true,
        errorMessage: 'pikachu is not a valid Pokemon.',
      });
    });
    expect(screen.getByText(/not a valid Pokemon/i)).toBeInTheDocument();
  });

  it('renders PokeCard when pokemon is loaded', async () => {
    render(<App />);
    await act(async () => {
      appInstance.setState(FULL_POKEMON_STATE);
    });
    expect(screen.getByRole('img', { name: /pikachu/i })).toBeInTheDocument();
  });

  it('renders fallback error text when errorMessage is empty', async () => {
    render(<App />);
    await act(async () => {
      appInstance.setState({ error: true, errorMessage: '', input: 'zzz' });
    });
    expect(screen.getByText(/zzz is not a valid Pokemon/i)).toBeInTheDocument();
  });

  it('renders "Input" placeholder in error text when both message and input are empty', async () => {
    render(<App />);
    await act(async () => {
      appInstance.setState({ error: true, errorMessage: '', input: '' });
    });
    expect(
      screen.getByText(/Input is not a valid Pokemon/i),
    ).toBeInTheDocument();
  });
});
