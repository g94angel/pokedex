import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PokeballImg from '../images/pokeball.png';

const TYPE_COLORS = {
  normal: '#a8a877',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

export default class PokeCard extends Component {
  state = { shiny: false, cryUnavailable: false };

  preloadedCry = null;

  crySources = [];

  componentDidMount() {
    this.preloadCry();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.state.data?.id !== this.props.state.data?.id) {
      this.setState({ shiny: false, cryUnavailable: false });
      this.preloadCry();
    }
  }

  componentWillUnmount() {
    if (this.preloadedCry) {
      this.preloadedCry.pause();
      this.preloadedCry = null;
    }
  }

  preloadCry = () => {
    const { data } = this.props.state;
    this.crySources = this.getCrySources(data);
    if (typeof Audio !== 'function') {
      this.preloadedCry = null;
      return;
    }
    const preloadSource = this.getPreferredCrySource(this.crySources);
    if (!preloadSource) {
      this.preloadedCry = null;
      return;
    }
    this.preloadedCry = new Audio(preloadSource);
    this.preloadedCry.preload = 'auto';
    this.preloadedCry.load();
  };

  getCrySources = (data) => {
    if (!data) return [];
    const sources = [
      data.cries?.latest,
      data.cries?.legacy,
      data.name
        ? `https://play.pokemonshowdown.com/audio/cries/${data.name}.mp3`
        : null,
    ].filter(Boolean);
    return Array.from(new Set(sources));
  };

  getPreferredCrySource = (sources) => {
    if (!sources.length) return null;
    const audioElement = globalThis.document?.createElement?.('audio');
    const canPlayOgg = audioElement?.canPlayType?.('audio/ogg; codecs=vorbis');
    if (!canPlayOgg) {
      const nonOggSource = sources.find((source) => !source.endsWith('.ogg'));
      if (nonOggSource) return nonOggSource;
    }
    return sources[0];
  };

  playCry = async () => {
    if (!this.crySources.length || this.state.cryUnavailable) return;

    const attemptedSources = [
      this.preloadedCry?.src || null,
      ...this.crySources,
    ].filter(Boolean);
    const sourcesToTry = Array.from(new Set(attemptedSources));

    let lastError = null;
    for (const source of sourcesToTry) {
      const audio =
        this.preloadedCry?.src === source
          ? this.preloadedCry
          : new Audio(source);
      try {
        audio.currentTime = 0;
        await audio.play();
        this.preloadedCry = audio;
        if (this.state.cryUnavailable) {
          this.setState({ cryUnavailable: false });
        }
        return;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      this.setState({ cryUnavailable: true });
    }
  };

  toggleShiny = () => this.setState((prev) => ({ shiny: !prev.shiny }));

  capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  getTypeString = (types) =>
    types.map(({ type }) => this.capitalize(type.name)).join(' | ');

  getGenerationInfo = (id) => {
    if (id < 152) return { generation: 'I', region: 'Kanto' };
    if (id < 252) return { generation: 'II', region: 'Johto' };
    if (id < 387) return { generation: 'III', region: 'Hoenn' };
    if (id < 494) return { generation: 'IV', region: 'Sinnoh' };
    if (id < 650) return { generation: 'V', region: 'Unova' };
    if (id < 722) return { generation: 'VI', region: 'Kalos' };
    if (id < 810) return { generation: 'VII', region: 'Alola' };
    if (id < 906) return { generation: 'VIII', region: 'Galar' };
    return { generation: 'IX', region: 'Paldea' };
  };

  getEvolutionChain = (evoData) => {
    if (!evoData) return [];
    const chain = [];
    let current = evoData.chain;
    while (current) {
      chain.push(current.species.name);
      current = current.evolves_to[0] || null;
    }
    return chain;
  };

  formatStatName = (name) => {
    const map = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed',
    };
    return map[name] || name;
  };

  render() {
    const { data, image, speciesData, evoData, party } = this.props.state;
    const { findPokemon, onPartyToggle } = this.props;
    const { shiny, cryUnavailable } = this.state;

    const { generation, region } = this.getGenerationInfo(data.id);
    const nameFormatted = this.capitalize(data.name);
    const primaryType = data.types[0].type.name;
    const typeColor = TYPE_COLORS[primaryType] || '#888';

    const inParty = party?.includes(data.id);
    const partyFull = (party?.length ?? 0) >= 6;
    const navDisabled = Boolean(this.props.state.isSearching);
    let partyAriaLabel = 'Add to party';
    let partyTitle = `Add to party (${party?.length ?? 0}/6)`;
    if (inParty) {
      partyAriaLabel = 'Remove from party';
      partyTitle = 'Remove from party';
    } else if (partyFull) {
      partyAriaLabel = 'Party full - release one first';
      partyTitle = 'Party full!';
    }

    const escapedName = data.name.replaceAll(
      /[-/\\^$*+?.()|[\]{}]/g,
      String.raw`\$&`,
    );
    const reg = new RegExp(String.raw`${escapedName}`, 'gi');
    const bio = speciesData.flavor_text_entries
      .find((e) => e.language.name === 'en')
      ?.flavor_text.replace(/POKéMON/gi, 'Pokémon')
      .replace(reg, nameFormatted)
      .replace(/\f/g, ' ');

    const genus = speciesData.genera.find(
      (g) => g.language.name === 'en',
    )?.genus;
    const hasCry = this.getCrySources(data).length > 0;
    const showCryButton =
      hasCry && typeof Audio === 'function' && !cryUnavailable;

    const height = (data.height / 10).toFixed(1);
    const weight = (data.weight / 10).toFixed(1);
    const abilities = data.abilities
      .map((a) => this.capitalize(a.ability.name.replaceAll('-', ' ')))
      .join(', ');

    const evoChain = this.getEvolutionChain(evoData);

    const shinySprite =
      data.sprites.other?.['official-artwork']?.front_shiny ||
      data.sprites.front_shiny;
    const currentImage = shiny && shinySprite ? shinySprite : image;

    return (
      <div className="card-container" style={{ '--type-color': typeColor }}>
        <div className="card-image-container">
          <img
            className={`pokemon-image${shiny ? ' shiny' : ''}`}
            src={currentImage}
            alt={data.name}
          />
        </div>

        <div className="card-details">
          <div className="card-name">
            <h4 style={{ color: typeColor }}>{nameFormatted}</h4>
          </div>

          <div className="card-control-bar">
            <div className="card-actions">
              {showCryButton && (
                <button
                  onClick={this.playCry}
                  className="action-button"
                  aria-label="Play battle cry"
                  title="Play cry"
                >
                  <i className="fa fa-play-circle"></i>
                </button>
              )}
              <button
                onClick={this.toggleShiny}
                className={`action-button${shiny ? ' active' : ''}`}
                aria-label="Toggle shiny"
                title="Toggle shiny"
                disabled={!shinySprite}
              >
                ✨
              </button>
              <button
                onClick={() => onPartyToggle(data.id)}
                className={`action-button party-ball-btn${inParty ? ' in-party' : ''}${!inParty && partyFull ? ' party-full' : ''}`}
                aria-label={partyAriaLabel}
                title={partyTitle}
              >
                <img
                  src={PokeballImg}
                  alt=""
                  aria-hidden="true"
                  className="party-ball-icon"
                />
              </button>
            </div>

            <div className="navigation-buttons">
              <button
                disabled={navDisabled || data.id <= 1}
                onClick={() => findPokemon(data.id - 1, 'navigation')}
              >
                <i className="fa fa-thin fa-caret-left"></i>
              </button>
              <button
                disabled={navDisabled || data.id >= 1025}
                onClick={() => findPokemon(data.id + 1, 'navigation')}
              >
                <i className="fa fa-thin fa-caret-right"></i>
              </button>
            </div>

            {cryUnavailable && (
              <p className="cry-notice" role="status" aria-live="polite">
                Cry unavailable on this device.
              </p>
            )}
          </div>

          <div className="card-info">
            {genus && <p>{`#${data.id} — The ${genus}`}</p>}
            <p>{`Generation ${generation} | ${region} region`}</p>
            <p>{`Type: ${this.getTypeString(data.types)}`}</p>
            <p>{`Height: ${height} m | Weight: ${weight} kg`}</p>
            <p>{`Abilities: ${abilities}`}</p>
            {evoChain.length > 1 && (
              <p className="evo-chain">
                {evoChain.map((name, i) => (
                  <React.Fragment key={name}>
                    <button
                      type="button"
                      className={`evo-link${name === data.name ? ' evo-current' : ''}`}
                      disabled={name === data.name}
                      onClick={() =>
                        name !== data.name && findPokemon(name, 'evolution')
                      }
                    >
                      {this.capitalize(name)}
                    </button>
                    {i < evoChain.length - 1 && ' → '}
                  </React.Fragment>
                ))}
              </p>
            )}
            {bio && <p>{bio}</p>}
          </div>

          <div className="stats-container">
            {data.stats.map(({ stat, base_stat }) => (
              <div key={stat.name} className="stat-row">
                <span className="stat-name">
                  {this.formatStatName(stat.name)}
                </span>
                <div className="stat-bar-bg">
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${Math.min((base_stat / 255) * 100, 100)}%`,
                      backgroundColor: typeColor,
                    }}
                  />
                </div>
                <span className="stat-value">{base_stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

PokeCard.propTypes = {
  state: PropTypes.object.isRequired,
  findPokemon: PropTypes.func.isRequired,
  onPartyToggle: PropTypes.func.isRequired,
};
