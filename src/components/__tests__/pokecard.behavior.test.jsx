import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PokeCard from '../PokeCard';

let pauseMock;
let loadMock;
let playMock;

function buildProps(overrides = {}) {
  const baseState = {
    data: {
      id: 149,
      name: 'dragonair',
      cries: { latest: null },
      height: 18,
      weight: 165,
      types: [{ type: { name: 'dragon' } }],
      abilities: [{ ability: { name: 'shed-skin' } }],
      stats: [
        { stat: { name: 'hp' }, base_stat: 61 },
        { stat: { name: 'attack' }, base_stat: 84 },
      ],
      sprites: {
        front_default: 'sprite.png',
        front_shiny: 'sprite-shiny.png',
        other: {
          'official-artwork': {
            front_shiny: 'art-shiny.png',
          },
        },
      },
    },
    image: 'image.png',
    speciesData: {
      flavor_text_entries: [
        { language: { name: 'en' }, flavor_text: 'DRAGONAIR glides quietly.' },
      ],
      genera: [{ language: { name: 'en' }, genus: 'Dragon Pokemon' }],
    },
    evoData: {
      chain: {
        species: { name: 'dratini' },
        evolves_to: [
          {
            species: { name: 'dragonair' },
            evolves_to: [{ species: { name: 'dragonite' }, evolves_to: [] }],
          },
        ],
      },
    },
    party: [],
  };

  const props = {
    state: baseState,
    findPokemon: vi.fn(),
    onPartyToggle: vi.fn(),
    ...overrides,
  };

  return props;
}

describe('PokeCard behavior', () => {
  beforeEach(() => {
    pauseMock = vi.fn();
    loadMock = vi.fn();
    playMock = vi.fn().mockResolvedValue();

    const AudioMock = vi.fn(function AudioMock() {
      return {
        pause: pauseMock,
        load: loadMock,
        play: playMock,
        currentTime: 0,
      };
    });
    vi.stubGlobal('Audio', AudioMock);
  });

  it('uses clear party toggle labels for add/full/remove states', () => {
    const { rerender, getByRole } = render(<PokeCard {...buildProps()} />);

    expect(getByRole('button', { name: /add to party/i })).toBeInTheDocument();

    rerender(
      <PokeCard
        {...buildProps({
          state: { ...buildProps().state, party: [1, 2, 3, 4, 5, 6] },
        })}
      />,
    );
    expect(
      getByRole('button', { name: /party full - release one first/i }),
    ).toBeInTheDocument();

    rerender(
      <PokeCard
        {...buildProps({
          state: { ...buildProps().state, party: [149] },
        })}
      />,
    );
    expect(
      getByRole('button', { name: /remove from party/i }),
    ).toBeInTheDocument();
  });

  it('sends navigation source from next/previous controls', () => {
    const props = buildProps();
    const { container } = render(<PokeCard {...props} />);

    const navButtons = container.querySelectorAll('.navigation-buttons button');
    fireEvent.click(navButtons[0]);
    fireEvent.click(navButtons[1]);

    expect(props.findPokemon).toHaveBeenNthCalledWith(1, 148, 'navigation');
    expect(props.findPokemon).toHaveBeenNthCalledWith(2, 150, 'navigation');
  });

  it('disables next/previous controls while searching', () => {
    const props = buildProps({
      state: {
        ...buildProps().state,
        isSearching: true,
      },
    });
    const { container } = render(<PokeCard {...props} />);

    const navButtons = container.querySelectorAll('.navigation-buttons button');
    expect(navButtons[0]).toBeDisabled();
    expect(navButtons[1]).toBeDisabled();

    fireEvent.click(navButtons[0]);
    fireEvent.click(navButtons[1]);
    expect(props.findPokemon).not.toHaveBeenCalled();
  });

  it('shows spinner in next button and arrow in prev after clicking next', () => {
    const props = buildProps();
    const { container, rerender } = render(<PokeCard {...props} />);

    const navButtons = container.querySelectorAll('.navigation-buttons button');
    fireEvent.click(navButtons[1]);

    const searchingProps = buildProps({
      state: { ...buildProps().state, isSearching: true },
    });
    rerender(<PokeCard {...searchingProps} />);

    expect(navButtons[1].querySelector('.inline-spinner')).not.toBeNull();
    expect(navButtons[0].querySelector('.inline-spinner')).toBeNull();
  });

  it('shows spinner in prev button after clicking prev', () => {
    const props = buildProps({
      state: {
        ...buildProps().state,
        data: { ...buildProps().state.data, id: 5 },
      },
    });
    const { container, rerender } = render(<PokeCard {...props} />);

    const navButtons = container.querySelectorAll('.navigation-buttons button');
    fireEvent.click(navButtons[0]);

    const searchingProps = buildProps({
      state: {
        ...buildProps().state,
        data: { ...buildProps().state.data, id: 5 },
        isSearching: true,
      },
    });
    rerender(<PokeCard {...searchingProps} />);

    expect(navButtons[0].querySelector('.inline-spinner')).not.toBeNull();
    expect(navButtons[1].querySelector('.inline-spinner')).toBeNull();
  });

  it('clears navDirection when isSearching transitions from true to false', () => {
    const props = buildProps();
    const { container, rerender } = render(<PokeCard {...props} />);

    const navButtons = container.querySelectorAll('.navigation-buttons button');
    fireEvent.click(navButtons[1]);

    const searchingProps = buildProps({
      state: { ...buildProps().state, isSearching: true },
    });
    rerender(<PokeCard {...searchingProps} />);
    expect(navButtons[1].querySelector('.inline-spinner')).not.toBeNull();

    rerender(<PokeCard {...props} />);
    expect(navButtons[1].querySelector('.inline-spinner')).toBeNull();
    expect(navButtons[1].querySelector('.fa-caret-right')).not.toBeNull();
  });

  it('sends evolution source when selecting another stage', () => {
    const props = buildProps();
    const { getByRole } = render(<PokeCard {...props} />);

    fireEvent.click(getByRole('button', { name: /dragonite/i }));
    expect(props.findPokemon).toHaveBeenCalledWith('dragonite', 'evolution');
  });

  it('preloads and plays cry audio, then pauses on unmount', () => {
    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          cries: { latest: 'https://example.com/cry.mp3' },
        },
      },
    });
    const { getByRole, unmount } = render(<PokeCard {...props} />);

    expect(globalThis.Audio).toHaveBeenCalledTimes(1);
    expect(loadMock).toHaveBeenCalledTimes(1);

    fireEvent.click(getByRole('button', { name: /play battle cry/i }));
    expect(playMock).toHaveBeenCalledTimes(1);

    unmount();
    expect(pauseMock).toHaveBeenCalledTimes(1);
  });

  it('shows a notice and hides cry playback after failure', async () => {
    const error = new Error('blocked');
    playMock = vi.fn().mockRejectedValue(error);
    const AudioMock = vi.fn(function AudioMock() {
      return {
        pause: vi.fn(),
        load: vi.fn(),
        play: playMock,
        currentTime: 0,
      };
    });
    vi.stubGlobal('Audio', AudioMock);

    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          name: '',
          cries: {
            latest: 'https://example.com/cry.mp3',
            legacy: null,
          },
        },
      },
    });
    const { getByRole } = render(<PokeCard {...props} />);

    fireEvent.click(getByRole('button', { name: /play battle cry/i }));

    expect(
      await screen.findByText(/cry unavailable on this device/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /play battle cry/i }),
    ).not.toBeInTheDocument();
  });

  it('falls back to alternate cry source when first source fails', async () => {
    const firstAudio = {
      src: 'https://example.com/cry.ogg',
      pause: vi.fn(),
      load: vi.fn(),
      play: vi.fn().mockRejectedValue(new Error('unsupported format')),
      currentTime: 0,
    };
    const secondAudio = {
      src: 'https://play.pokemonshowdown.com/audio/cries/dragonair.mp3',
      pause: vi.fn(),
      load: vi.fn(),
      play: vi.fn().mockResolvedValue(),
      currentTime: 0,
    };

    const AudioMock = vi
      .fn()
      .mockImplementationOnce(function AudioCtor() {
        return firstAudio;
      })
      .mockImplementationOnce(function AudioCtor() {
        return secondAudio;
      });
    vi.stubGlobal('Audio', AudioMock);

    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          cries: {
            latest: 'https://example.com/cry.ogg',
            legacy: 'https://example.com/cry-legacy.ogg',
          },
        },
      },
    });

    const { getByRole } = render(<PokeCard {...props} />);
    fireEvent.click(getByRole('button', { name: /play battle cry/i }));

    await Promise.resolve();
    await Promise.resolve();

    expect(firstAudio.play).toHaveBeenCalled();
    expect(secondAudio.play).toHaveBeenCalled();
  });

  it('re-enables cry playback when pokemon changes', async () => {
    const firstAudio = {
      src: 'https://example.com/cry.ogg',
      pause: vi.fn(),
      load: vi.fn(),
      play: vi.fn().mockRejectedValueOnce(new Error('blocked')),
      currentTime: 0,
    };
    const AudioMock = vi.fn(function AudioCtor() {
      return firstAudio;
    });
    vi.stubGlobal('Audio', AudioMock);

    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          name: '',
          cries: { latest: 'https://example.com/cry.ogg', legacy: null },
        },
      },
    });
    const { getByRole, rerender } = render(<PokeCard {...props} />);

    fireEvent.click(getByRole('button', { name: /play battle cry/i }));
    expect(
      await screen.findByText(/cry unavailable on this device/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /play battle cry/i }),
    ).not.toBeInTheDocument();

    rerender(
      <PokeCard
        {...buildProps({
          state: {
            ...buildProps().state,
            data: {
              ...buildProps().state.data,
              id: 150,
              name: 'dragonite',
              cries: {
                latest: 'https://example.com/dragonite.mp3',
                legacy: null,
              },
            },
          },
        })}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/cry unavailable on this device/i),
      ).not.toBeInTheDocument();
    });
    expect(
      getByRole('button', { name: /play battle cry/i }),
    ).toBeInTheDocument();
  });

  it('resets shiny state when pokemon id changes', () => {
    const props = buildProps();
    const { rerender, getByRole } = render(<PokeCard {...props} />);

    const shinyButton = getByRole('button', { name: /toggle shiny/i });
    fireEvent.click(shinyButton);
    expect(shinyButton.className).toContain('active');

    rerender(
      <PokeCard
        {...buildProps({
          state: {
            ...buildProps().state,
            data: { ...buildProps().state.data, id: 150, name: 'dragonite' },
          },
        })}
      />,
    );

    expect(
      getByRole('button', { name: /toggle shiny/i }).className,
    ).not.toContain('active');
  });

  it('covers generation, evolution, and stat formatter helpers', () => {
    const card = new PokeCard(buildProps());

    expect(card.getGenerationInfo(200)).toEqual({
      generation: 'II',
      region: 'Johto',
    });
    expect(card.getGenerationInfo(350)).toEqual({
      generation: 'III',
      region: 'Hoenn',
    });
    expect(card.getGenerationInfo(450)).toEqual({
      generation: 'IV',
      region: 'Sinnoh',
    });
    expect(card.getGenerationInfo(600)).toEqual({
      generation: 'V',
      region: 'Unova',
    });
    expect(card.getGenerationInfo(700)).toEqual({
      generation: 'VI',
      region: 'Kalos',
    });
    expect(card.getGenerationInfo(805)).toEqual({
      generation: 'VII',
      region: 'Alola',
    });
    expect(card.getGenerationInfo(900)).toEqual({
      generation: 'VIII',
      region: 'Galar',
    });
    expect(card.getGenerationInfo(950)).toEqual({
      generation: 'IX',
      region: 'Paldea',
    });

    expect(card.getEvolutionChain(null)).toEqual([]);
    expect(
      card.getEvolutionChain({
        chain: { species: { name: 'a' }, evolves_to: [] },
      }),
    ).toEqual(['a']);
    expect(card.formatStatName('special-defense')).toBe('Sp. Def');
    expect(card.formatStatName('accuracy')).toBe('accuracy');
  });

  it('skips cry preload when Audio constructor is not a function', () => {
    vi.stubGlobal('Audio', undefined);
    const props = buildProps();
    expect(() => render(<PokeCard {...props} />)).not.toThrow();
  });

  it('skips cry preload when no cry sources are available', () => {
    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          name: '',
          cries: { latest: null, legacy: null },
        },
      },
    });
    render(<PokeCard {...props} />);
    expect(loadMock).not.toHaveBeenCalled();
  });

  it('resets cryUnavailable to false when cry succeeds after being marked unavailable', async () => {
    const card = new PokeCard(buildProps());
    card.state = { cryUnavailable: false };
    card.crySources = ['cry.mp3'];
    const mockAudio = {
      src: 'cry.mp3',
      currentTime: 0,
      play: vi.fn().mockImplementation(async () => {
        card.state = { ...card.state, cryUnavailable: true };
      }),
    };
    card.preloadedCry = mockAudio;
    card.setState = vi.fn((update) => {
      const patch = typeof update === 'function' ? update(card.state) : update;
      card.state = { ...card.state, ...patch };
    });

    await card.playCry();

    expect(card.state.cryUnavailable).toBe(false);
  });

  it('calls onPartyToggle with pokemon id when party button is clicked', () => {
    const props = buildProps();
    render(<PokeCard {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /add to party/i }));
    expect(props.onPartyToggle).toHaveBeenCalledWith(149);
  });

  it('getCrySources returns empty array when data is null', () => {
    const card = new PokeCard(buildProps());
    expect(card.getCrySources(null)).toEqual([]);
  });

  it('playCry returns early when cryUnavailable is already true', async () => {
    const card = new PokeCard(buildProps());
    card.state = { cryUnavailable: true };
    card.crySources = ['cry.mp3'];
    card.setState = vi.fn();
    await card.playCry();
    expect(card.setState).not.toHaveBeenCalled();
  });

  it('playCry skips setState when sourcesToTry resolves to empty', async () => {
    const card = new PokeCard(buildProps());
    card.state = { cryUnavailable: false };
    card.crySources = [''];
    card.preloadedCry = null;
    card.setState = vi.fn();
    await card.playCry();
    expect(card.setState).not.toHaveBeenCalled();
  });

  it('renders correctly when party prop is null', () => {
    const props = buildProps();
    props.state = { ...props.state, party: null };
    expect(() => render(<PokeCard {...props} />)).not.toThrow();
  });

  it('falls back to front_shiny when official-artwork sprite is unavailable', () => {
    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          sprites: {
            front_default: 'front.png',
            front_shiny: 'shiny.png',
            other: {},
          },
        },
      },
    });
    const { container } = render(<PokeCard {...props} />);
    expect(container.querySelector('.pokemon-image')).toBeInTheDocument();
  });

  it('falls back to default color for unknown pokemon type', () => {
    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          types: [{ type: { name: 'shadow' } }],
        },
      },
    });
    const { container } = render(<PokeCard {...props} />);
    expect(container.querySelector('.card-container')).toBeInTheDocument();
  });
});
