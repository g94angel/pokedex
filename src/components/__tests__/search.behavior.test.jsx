import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Search from '../Search';

function buildProps(overrides = {}) {
  return {
    state: { input: '' },
    handleChange: vi.fn(),
    findPokemon: vi.fn(),
    onRandom: vi.fn(),
    onSuggestionSelect: vi.fn(),
    onClearSearch: vi.fn(),
    onClearRecentSearches: vi.fn(),
    isSearching: false,
    pendingSearch: '',
    pendingPartyAdd: null,
    recentSearches: [],
    suggestions: [],
    formatPokemonDisplayName: (name) => name,
    party: [1, 2, 3, 4, 5, 6],
    pokemonIndex: [],
    onPartyRelease: vi.fn(),
    onCancelPartyAdd: vi.fn(),
    onClearParty: vi.fn(),
    ...overrides,
  };
}

describe('Search behavior', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('calls onClearParty when clear party button is clicked', () => {
    const props = buildProps();
    render(<Search {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(props.onClearParty).toHaveBeenCalledTimes(1);
  });

  it('scrolls to party panel when pendingPartyAdd appears', () => {
    const scrollIntoView = vi.fn();
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      cb();
      return 0;
    });
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    const initialProps = buildProps({ pendingPartyAdd: null });
    const { rerender } = render(<Search {...initialProps} />);

    rerender(<Search {...buildProps({ pendingPartyAdd: 25 })} />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('shows party panel while input has text when pendingPartyAdd exists', () => {
    render(
      <Search
        {...buildProps({
          state: { input: 'pik' },
          pendingPartyAdd: 25,
          pokemonIndex: ['bulbasaur', 'ivysaur', 'venusaur', 'charmander'],
        })}
      />,
    );

    expect(screen.getByLabelText(/your party/i)).toBeInTheDocument();
    expect(screen.getByText(/party full!/i)).toBeInTheDocument();
  });

  it('calls onCancelPartyAdd when cancel is clicked in release mode', () => {
    const props = buildProps({ pendingPartyAdd: 25 });
    render(<Search {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(props.onCancelPartyAdd).toHaveBeenCalledTimes(1);
  });

  it('party chip lookup uses party source', () => {
    const props = buildProps({
      party: [6],
      pokemonIndex: [
        'bulbasaur',
        'ivysaur',
        'venusaur',
        'charmander',
        'charmeleon',
        'charizard',
      ],
      formatPokemonDisplayName: (name) =>
        name.charAt(0).toUpperCase() + name.slice(1),
    });
    render(<Search {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /charizard/i }));
    expect(props.findPokemon).toHaveBeenCalledWith(6, 'party');
  });

  it('falls back to direct scroll when requestAnimationFrame is unavailable', () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    vi.stubGlobal('requestAnimationFrame', undefined);

    const initialProps = buildProps({ pendingPartyAdd: null });
    const { rerender } = render(<Search {...initialProps} />);
    rerender(<Search {...buildProps({ pendingPartyAdd: 25 })} />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('renders suggestion chips and applies active class to highlighted item', () => {
    const props = buildProps({
      state: { input: 'pik' },
      suggestions: ['pikachu', 'pidgey'],
      party: [],
    });
    const { container } = render(<Search {...props} />);

    expect(screen.getByLabelText(/search suggestions/i)).toBeInTheDocument();

    fireEvent.keyDown(container.querySelector('input'), { key: 'ArrowDown' });
    expect(
      container.querySelector('.suggestion-chip.active'),
    ).toBeInTheDocument();
  });

  it('calls onPartyRelease when a party member release button is clicked', () => {
    const props = buildProps({
      pendingPartyAdd: 25,
      pokemonIndex: [
        'bulbasaur',
        'ivysaur',
        'venusaur',
        'charmander',
        'charmeleon',
        'charizard',
      ],
    });
    render(<Search {...props} />);

    const releaseButtons = screen.getAllByRole('button', { name: /release/i });
    fireEvent.click(releaseButtons[0]);
    expect(props.onPartyRelease).toHaveBeenCalledWith(1);
  });

  it('renders recent searches and clears them on button click', () => {
    const props = buildProps({
      state: { input: '' },
      recentSearches: ['pikachu', 'bulbasaur'],
      party: [],
    });
    render(<Search {...props} />);

    expect(screen.getByLabelText(/recent searches/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(props.onClearRecentSearches).toHaveBeenCalledTimes(1);
  });

  it('calls onSuggestionSelect when a suggestion chip is clicked', () => {
    const props = buildProps({
      state: { input: 'pik' },
      suggestions: ['pikachu'],
      party: [],
    });
    render(<Search {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /pikachu/i }));
    expect(props.onSuggestionSelect).toHaveBeenCalledWith('pikachu');
  });

  it('calls onSuggestionSelect when a recent search chip is clicked', () => {
    const props = buildProps({
      state: { input: '' },
      recentSearches: ['pikachu'],
      party: [],
    });
    render(<Search {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /pikachu/i }));
    expect(props.onSuggestionSelect).toHaveBeenCalledWith('pikachu');
  });

  it('applies shake class when pokeball is clicked with empty input', () => {
    const props = buildProps({ state: { input: '' }, party: [] });
    const { container } = render(<Search {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /search pokemon/i }));
    expect(container.querySelector('.shake')).toBeInTheDocument();
  });
});
