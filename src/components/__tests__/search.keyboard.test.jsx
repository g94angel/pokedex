import { describe, expect, it, vi } from 'vitest';
import Search from '../Search';

function createSearchInstance(overrides = {}) {
  const props = {
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
    party: [],
    pokemonIndex: [],
    onPartyRelease: vi.fn(),
    onCancelPartyAdd: vi.fn(),
    onClearParty: vi.fn(),
    ...overrides,
  };

  const instance = new Search(props);
  instance.props = props;
  instance.setState = (update, cb) => {
    const patch =
      typeof update === 'function'
        ? update(instance.state, instance.props)
        : update;
    instance.state = { ...instance.state, ...patch };
    if (cb) cb();
  };
  return instance;
}

describe('Search keyboard interactions', () => {
  it('moves active suggestion selection with arrow keys and escape', () => {
    const search = createSearchInstance({ suggestions: ['pikachu', 'pidgey'] });
    const preventDefault = vi.fn();

    search.handleKeyDown({ key: 'ArrowDown', preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(search.state.activeSuggestionIndex).toBe(0);

    search.handleKeyDown({ key: 'ArrowDown', preventDefault });
    expect(search.state.activeSuggestionIndex).toBe(1);

    search.handleKeyDown({ key: 'ArrowUp', preventDefault });
    expect(search.state.activeSuggestionIndex).toBe(0);

    search.handleKeyDown({ key: 'Escape' });
    expect(search.state.activeSuggestionIndex).toBe(-1);
  });

  it('submits highlighted suggestion on Enter', () => {
    const onSuggestionSelect = vi.fn();
    const search = createSearchInstance({
      suggestions: ['pikachu', 'pidgey'],
      onSuggestionSelect,
    });

    search.state = { ...search.state, activeSuggestionIndex: 1 };
    search.handleKeyDown({ key: 'Enter' });

    expect(onSuggestionSelect).toHaveBeenCalledWith('pidgey');
  });

  it('submits manual input on Enter when no suggestion is selected', () => {
    const findPokemon = vi.fn();
    const search = createSearchInstance({
      state: { input: 'Pikachu' },
      findPokemon,
    });

    search.state = { ...search.state, activeSuggestionIndex: -1 };
    search.handleKeyDown({ key: 'Enter' });

    expect(findPokemon).toHaveBeenCalledWith('pikachu', 'manual');
  });

  it('triggers shake when Enter is pressed with empty input', () => {
    const search = createSearchInstance({ state: { input: '' } });
    const triggerShake = vi.spyOn(search, 'triggerShake');

    search.handleKeyDown({ key: 'Enter' });

    expect(triggerShake).toHaveBeenCalledTimes(1);
  });

  it('clears search and focuses the input element', () => {
    const onClearSearch = vi.fn();
    const focus = vi.fn();
    const search = createSearchInstance({ onClearSearch });
    search.inputRef.current = { focus };

    search.handleClearSearch();

    expect(onClearSearch).toHaveBeenCalledTimes(1);
    expect(search.state.activeSuggestionIndex).toBe(-1);
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
