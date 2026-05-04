import { describe, expect, it, vi } from 'vitest';
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

describe('App utilities and interactions', () => {
  it('formats display names for special and hyphenated cases', () => {
    const app = createAppWithSyncState();

    expect(app.formatPokemonDisplayName('mr-mime')).toBe('Mr. Mime');
    expect(app.formatPokemonDisplayName('type-null')).toBe('Type: Null');
    expect(app.formatPokemonDisplayName('great-tusk')).toBe('Great Tusk');
    expect(app.formatPokemonDisplayName('')).toBe('');
  });

  it('normalizes search terms and resolves canonical names', () => {
    const app = createAppWithSyncState();

    expect(app.normalizeSearchTerm('Pokémon-Mr. Mime!')).toBe('pokemonmrmime');

    app.state = {
      ...app.state,
      normalizedPokemonIndex: {
        mrmime: 'mr-mime',
      },
    };

    expect(app.resolveCanonicalSearch('Mr Mime')).toBe('mr-mime');
    expect(app.resolveCanonicalSearch('25')).toBe('25');
  });

  it('picks sprite source with official-artwork fallback order', () => {
    const app = createAppWithSyncState();

    expect(
      app.getSprite({
        sprites: {
          other: {
            'official-artwork': { front_default: 'official.png' },
          },
          front_default: 'front.png',
        },
      }),
    ).toBe('official.png');

    expect(
      app.getSprite({
        sprites: {
          other: {
            'official-artwork': { front_default: null },
            dream_world: { front_default: 'dream.png' },
          },
          front_default: 'front.png',
        },
      }),
    ).toBe('dream.png');

    expect(
      app.getSprite({
        sprites: {
          other: {},
          front_default: 'front.png',
        },
      }),
    ).toBe('front.png');
  });

  it('handles keyboard navigation only when appropriate', () => {
    const app = createAppWithSyncState();
    app.findPokemon = vi.fn();

    app.state = {
      ...app.state,
      loaded: true,
      data: { id: 250 },
    };

    app.handleKeyboardNav({ key: 'ArrowLeft', target: { tagName: 'INPUT' } });
    expect(app.findPokemon).not.toHaveBeenCalled();

    app.handleKeyboardNav({ key: 'ArrowLeft', target: { tagName: 'DIV' } });
    expect(app.findPokemon).toHaveBeenCalledWith(249, 'navigation');

    app.handleKeyboardNav({ key: 'ArrowRight', target: { tagName: 'DIV' } });
    expect(app.findPokemon).toHaveBeenCalledWith(251, 'navigation');
  });

  it('uses random source when selecting a random pokemon', () => {
    const app = createAppWithSyncState();
    app.findPokemon = vi.fn();

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    app.handleRandom();

    expect(app.findPokemon).toHaveBeenCalledWith(513, 'random');
    randomSpy.mockRestore();
  });

  it('loads pokemon index and updates normalized lookup', async () => {
    const app = createAppWithSyncState();
    app.state = { ...app.state, input: 'pi' };
    app.getSearchSuggestions = vi.fn().mockReturnValue(['pikachu']);

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ name: 'pikachu' }, { name: 'pidgey' }],
      }),
    });

    await app.fetchPokemonIndex();

    expect(app.state.pokemonIndex).toEqual(['pikachu', 'pidgey']);
    expect(app.state.normalizedPokemonIndex.pikachu).toBe('pikachu');
    expect(app.state.searchSuggestions).toEqual(['pikachu']);

    fetchMock.mockRestore();
  });

  it('swallows pokemon index fetch errors without crashing', async () => {
    const app = createAppWithSyncState();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('network'));

    await expect(app.fetchPokemonIndex()).resolves.toBeUndefined();

    fetchMock.mockRestore();
  });
});
