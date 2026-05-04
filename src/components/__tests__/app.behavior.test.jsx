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

describe('App behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(globalThis.history, 'pushState').mockImplementation(() => {});
  });

  it('tracks recent searches only for manual or suggestion sources', async () => {
    const app = createAppWithSyncState();
    const cachedPokemon = {
      data: { id: 25, name: 'pikachu' },
      speciesData: {},
      evoData: null,
      image: 'pikachu.png',
    };

    app.state = {
      ...app.state,
      cache: {
        25: cachedPokemon,
        pikachu: cachedPokemon,
      },
      recentSearches: [],
      input: '',
    };

    await app.findPokemon('25', 'navigation');
    await app.findPokemon('25', 'party');
    await app.findPokemon('25', 'evolution');
    await app.findPokemon('25', 'random');
    await app.findPokemon('25', 'initial');
    expect(app.state.recentSearches).toEqual([]);

    await app.findPokemon('25', 'manual');
    expect(app.state.recentSearches).toEqual(['pikachu']);

    await app.findPokemon('25', 'suggestion');
    expect(app.state.recentSearches).toEqual(['pikachu']);
  });

  it('handles full-party add flow and clear-party action', () => {
    const app = createAppWithSyncState();

    app.state = {
      ...app.state,
      party: [1, 2, 3, 4, 5, 6],
      pendingPartyAdd: null,
    };

    app.handlePartyToggle(7);
    expect(app.state.pendingPartyAdd).toBe(7);
    expect(app.state.party).toEqual([1, 2, 3, 4, 5, 6]);

    app.handlePartyRelease(4);
    expect(app.state.pendingPartyAdd).toBeNull();
    expect(app.state.party).toEqual([1, 2, 3, 5, 6, 7]);

    app.handleClearParty();
    expect(app.state.party).toEqual([]);
    expect(app.state.pendingPartyAdd).toBeNull();
    expect(localStorage.getItem('pokedex-party')).toBe('[]');
  });

  it('adds/removes party entries when space is available and supports canceling pending add', () => {
    const app = createAppWithSyncState();

    app.state = {
      ...app.state,
      party: [1, 2, 3],
      pendingPartyAdd: null,
    };

    app.handlePartyToggle(4);
    expect(app.state.party).toEqual([1, 2, 3, 4]);

    app.handlePartyToggle(2);
    expect(app.state.party).toEqual([1, 3, 4]);

    app.state = {
      ...app.state,
      party: [1, 2, 3, 4, 5, 6],
      pendingPartyAdd: null,
    };
    app.handlePartyToggle(7);
    expect(app.state.pendingPartyAdd).toBe(7);

    app.handleCancelPartyAdd();
    expect(app.state.pendingPartyAdd).toBeNull();
    expect(app.state.party).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('handlePartyRelease uses released list directly when no pendingPartyAdd', () => {
    const app = createAppWithSyncState();
    app.state = {
      ...app.state,
      party: [1, 2, 3, 4, 5],
      pendingPartyAdd: null,
    };
    app.handlePartyRelease(3);
    expect(app.state.party).toEqual([1, 2, 4, 5]);
    expect(app.state.pendingPartyAdd).toBeNull();
  });
});
