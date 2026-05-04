import React from 'react';
import { fireEvent, render } from '@testing-library/react';
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

  it('logs cry playback errors without throwing', async () => {
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
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const props = buildProps({
      state: {
        ...buildProps().state,
        data: {
          ...buildProps().state.data,
          cries: { latest: 'https://example.com/cry.mp3' },
        },
      },
    });
    const { getByRole } = render(<PokeCard {...props} />);

    fireEvent.click(getByRole('button', { name: /play battle cry/i }));
    await Promise.resolve();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
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
});
