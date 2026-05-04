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

describe('App findPokemon integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(globalThis.history, 'pushState').mockImplementation(() => {});
  });

  it('loads pokemon data, caches it, and tracks recent for manual search', async () => {
    const app = createAppWithSyncState();
    app.state = {
      ...app.state,
      normalizedPokemonIndex: {
        bulbasaur: 'bulbasaur',
      },
    };

    const pokemonData = {
      id: 1,
      name: 'bulbasaur',
      sprites: {
        other: {
          'official-artwork': { front_default: 'official.png' },
        },
        front_default: 'front.png',
      },
    };
    const speciesData = {
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    };
    const evoData = {
      chain: { species: { name: 'bulbasaur' }, evolves_to: [] },
    };

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => pokemonData })
      .mockResolvedValueOnce({ ok: true, json: async () => speciesData })
      .mockResolvedValueOnce({ ok: true, json: async () => evoData });

    await app.findPokemon('bulbasaur', 'manual');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(globalThis.history.pushState).toHaveBeenCalledWith(
      null,
      '',
      '?pokemon=1',
    );
    expect(app.state.loaded).toBe(true);
    expect(app.state.error).toBe(false);
    expect(app.state.input).toBe('');
    expect(app.state.data?.id).toBe(1);
    expect(app.state.speciesData).toEqual(speciesData);
    expect(app.state.evoData).toEqual(evoData);
    expect(app.state.image).toBe('official.png');
    expect(app.state.cache[1].data.name).toBe('bulbasaur');
    expect(app.state.cache.bulbasaur.data.id).toBe(1);
    expect(app.state.recentSearches).toEqual(['bulbasaur']);
  });

  it('does not track recents for navigation source on successful fetch', async () => {
    const app = createAppWithSyncState();

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 2,
          name: 'ivysaur',
          sprites: { other: {}, front_default: 'front.png' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          evolution_chain: {
            url: 'https://pokeapi.co/api/v2/evolution-chain/2/',
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ chain: {} }) });

    await app.findPokemon('2', 'navigation');

    expect(app.state.recentSearches).toEqual([]);
  });

  it('sets error state when numeric search is out of range', async () => {
    const app = createAppWithSyncState();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await app.findPokemon('1026', 'manual');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(app.state.error).toBe(true);
    expect(app.state.errorMessage).toContain('1026');
    expect(app.state.isSearching).toBe(false);
  });

  it('sets error state when API responds with not found', async () => {
    const app = createAppWithSyncState();

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await app.findPokemon('missingno', 'manual');

    expect(app.state.error).toBe(true);
    expect(app.state.errorMessage).toContain('missingno');
    expect(app.state.pendingSearch).toBe('');
    expect(app.state.isSearching).toBe(false);
  });
});
