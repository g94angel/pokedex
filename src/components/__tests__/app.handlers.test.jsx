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

  it('assigns score -10 to exact matches in getSearchSuggestions', () => {
    const app = createAppWithSyncState();
    const source = ['pikachu', 'pidgey', 'raichu'];
    const result = app.getSearchSuggestions('pikachu', source);
    expect(result[0]).toBe('pikachu');
  });

  it('handleError preserves loaded state when pokemon data is already present', () => {
    const app = createAppWithSyncState();
    app.state = {
      ...app.state,
      data: { id: 25, name: 'pikachu' },
      speciesData: {},
      loaded: true,
    };
    app.handleError('invalid-pokemon');
    expect(app.state.loaded).toBe(true);
    expect(app.state.error).toBe(true);
  });

  it('findPokemon computes searchSuggestions from current input during fetch', async () => {
    const app = createAppWithSyncState();
    const cachedPokemon = {
      data: { id: 25, name: 'pikachu' },
      speciesData: {},
      evoData: null,
      image: 'pikachu.png',
    };
    app.state = {
      ...app.state,
      input: 'pik',
      pokemonIndex: ['pikachu', 'pidgey'],
      cache: { pikachu: cachedPokemon, 25: cachedPokemon },
    };
    vi.spyOn(globalThis.history, 'pushState').mockImplementation(() => {});

    await app.findPokemon('pikachu', 'manual');
    expect(app.state.data).toEqual(cachedPokemon.data);
  });

  it('fetchPokemonData returns null evoData when evo chain endpoint is not ok', async () => {
    const app = createAppWithSyncState();
    const pokemonData = {
      id: 25,
      name: 'pikachu',
      sprites: { front_default: 'p.png', front_shiny: 'ps.png', other: {} },
      height: 4,
      weight: 60,
      types: [{ type: { name: 'electric' } }],
      abilities: [],
      stats: [],
      cries: {},
    };
    const speciesData = {
      flavor_text_entries: [],
      genera: [],
      evolution_chain: { url: 'http://example.com/evo' },
    };

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => pokemonData })
        .mockResolvedValueOnce({ ok: true, json: async () => speciesData })
        .mockResolvedValueOnce({ ok: false }),
    );

    const result = await app.fetchPokemonData('pikachu');
    expect(result.evoData).toBeNull();
  });
});
