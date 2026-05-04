import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

function createAppWithSyncState() {
  const app = new App({});
  app.setState = (update) => {
    const patch =
      typeof update === 'function' ? update(app.state, app.props) : update;
    app.state = { ...app.state, ...patch };
  };
  return app;
}

describe('App handlers and lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('component lifecycle registers and unregisters keyboard listener', () => {
    const app = createAppWithSyncState();
    const addSpy = vi.spyOn(globalThis, 'addEventListener');
    const removeSpy = vi.spyOn(globalThis, 'removeEventListener');
    const findSpy = vi.spyOn(app, 'findPokemon').mockResolvedValue(undefined);
    const fetchIndexSpy = vi
      .spyOn(app, 'fetchPokemonIndex')
      .mockResolvedValue(undefined);

    app.componentDidMount();
    expect(addSpy).toHaveBeenCalledWith('keydown', app.handleKeyboardNav);
    expect(findSpy).toHaveBeenCalled();
    expect(fetchIndexSpy).toHaveBeenCalledTimes(1);

    app.componentWillUnmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', app.handleKeyboardNav);
  });

  it('updates and clears search state correctly', () => {
    const app = createAppWithSyncState();
    app.getSearchSuggestions = vi.fn().mockReturnValue(['pikachu']);

    app.handleChange({ target: { value: 'pik' } });
    expect(app.state.input).toBe('pik');
    expect(app.state.searchSuggestions).toEqual(['pikachu']);

    app.handleClearSearchInput();
    expect(app.state.input).toBe('');
    expect(app.state.searchSuggestions).toEqual([]);
    expect(app.state.pendingSearch).toBe('');
  });

  it('clears recent searches and local storage', () => {
    const app = createAppWithSyncState();
    localStorage.setItem(
      'pokedex-recent-searches',
      JSON.stringify(['pikachu']),
    );
    app.state = { ...app.state, recentSearches: ['pikachu'] };

    app.handleClearRecentSearches();

    expect(app.state.recentSearches).toEqual([]);
    expect(localStorage.getItem('pokedex-recent-searches')).toBeNull();
  });

  it('delegates suggestion search and random search sources', () => {
    const app = createAppWithSyncState();
    app.findPokemon = vi.fn();

    app.handleSearchSuggestion('bulbasaur');
    expect(app.findPokemon).toHaveBeenCalledWith('bulbasaur', 'suggestion');

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    app.handleRandom();
    expect(app.findPokemon).toHaveBeenCalledWith(1, 'random');
    randomSpy.mockRestore();
  });

  it('returns search suggestions based on fuzzy and prefix match rules', () => {
    const app = createAppWithSyncState();
    const source = ['pikachu', 'pidgey', 'raichu', 'charizard'];

    expect(app.getSearchSuggestions('pi', source)).toContain('pikachu');
    expect(app.getSearchSuggestions('pika', source)).toContain('pikachu');
    expect(app.getSearchSuggestions('1', source)).toEqual([]);
    expect(app.getSearchSuggestions('p', source)).toEqual([]);
  });

  it('handles invalid empty searches through error state', async () => {
    const app = createAppWithSyncState();

    await app.findPokemon('', 'manual');

    expect(app.state.error).toBe(true);
    expect(app.state.errorMessage).toContain('Input');
    expect(app.state.isSearching).toBe(false);
  });
});
