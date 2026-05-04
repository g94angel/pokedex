import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Pokeball from './Pokeball';
import PokeballImg from '../images/pokeball.png';

export default class Search extends Component {
  inputRef = React.createRef();

  state = {
    shake: false,
    activeSuggestionIndex: -1,
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.state.input !== this.props.state.input ||
      prevProps.suggestions !== this.props.suggestions
    ) {
      this.setState({ activeSuggestionIndex: -1 });
    }
  }

  handleKeyDown = (e) => {
    const { state, suggestions, onSuggestionSelect, findPokemon } = this.props;
    const { activeSuggestionIndex } = this.state;

    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      this.setState((prev) => ({
        activeSuggestionIndex: Math.min(
          prev.activeSuggestionIndex + 1,
          suggestions.length - 1,
        ),
      }));
      return;
    }

    if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      this.setState((prev) => ({
        activeSuggestionIndex: Math.max(prev.activeSuggestionIndex - 1, -1),
      }));
      return;
    }

    if (e.key === 'Escape') {
      this.setState({ activeSuggestionIndex: -1 });
      return;
    }

    if (e.key !== 'Enter') return;

    if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      onSuggestionSelect(suggestions[activeSuggestionIndex]);
      return;
    }

    if (state.input) {
      findPokemon(state.input.toLowerCase(), 'manual');
    } else {
      this.triggerShake();
    }
  };

  triggerShake = () => {
    this.setState({ shake: true });
    setTimeout(() => this.setState({ shake: false }), 500); // reset after animation
  };

  handleClearSearch = () => {
    this.props.onClearSearch();
    this.setState({ activeSuggestionIndex: -1 }, () => {
      this.inputRef.current?.focus();
    });
  };

  render() {
    const {
      state,
      handleChange,
      findPokemon,
      onRandom,
      onSuggestionSelect,
      onClearRecentSearches,
      isSearching,
      pendingSearch,
      pendingPartyAdd,
      recentSearches,
      suggestions,
      formatPokemonDisplayName,
      party,
      pokemonIndex,
      onPartyRelease,
      onCancelPartyAdd,
    } = this.props;
    const { activeSuggestionIndex, shake } = this.state;
    const showSuggestions = state.input && suggestions.length > 0;
    const showRecentSearches = !state.input && recentSearches.length > 0;
    const showParty = !state.input && party.length > 0;

    return (
      <div className="search-panel">
        <div className="search-wrapper">
          <div
            className={`search-container ${shake ? 'shake' : ''} ${state.input ? 'has-clear' : ''}`}
          >
            <input
              ref={this.inputRef}
              onKeyDown={this.handleKeyDown}
              onChange={handleChange}
              placeholder="Search by name or number"
              type="text"
              value={state.input}
            />
            {state.input && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={this.handleClearSearch}
                title="Clear search"
                aria-label="Clear search"
                disabled={isSearching}
              >
                ×
              </button>
            )}
            <Pokeball
              findPokemon={findPokemon}
              input={state.input}
              onEmptySearch={this.triggerShake}
              className="pokeball-btn"
            />
          </div>
          <button
            onClick={onRandom}
            className="random-button"
            title="Random Pokemon"
            disabled={isSearching}
          >
            ?
          </button>
        </div>

        {isSearching && (
          <div
            className="search-loading-indicator"
            role="status"
            aria-live="polite"
          >
            <img
              className="search-loading-ball"
              src={PokeballImg}
              alt="Loading"
            />
            <span>Loading Pokemon...</span>
          </div>
        )}

        {showSuggestions && (
          <div className="search-suggestions" aria-label="Search suggestions">
            <span className="suggestions-label">Did you mean</span>
            <div className="suggestion-list">
              {suggestions.map((name, index) => (
                <button
                  key={name}
                  type="button"
                  className={`suggestion-chip${index === activeSuggestionIndex ? ' active' : ''}`}
                  onClick={() => onSuggestionSelect(name)}
                  disabled={isSearching}
                >
                  {pendingSearch === name && isSearching ? (
                    <>
                      <img
                        className="chip-loading-ball"
                        src={PokeballImg}
                        alt="Loading"
                      />
                      <span>{formatPokemonDisplayName(name)}</span>
                    </>
                  ) : (
                    formatPokemonDisplayName(name)
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {showParty && (
          <div
            className={`search-suggestions party-panel${pendingPartyAdd ? ' party-panel--releasing' : ''}`}
            aria-label="Your party"
          >
            <div className="suggestions-header">
              <span className="suggestions-label">
                Your party ({party.length}/6)
              </span>
              {pendingPartyAdd && (
                <button
                  type="button"
                  className="clear-recent-btn"
                  onClick={onCancelPartyAdd}
                >
                  Cancel
                </button>
              )}
            </div>
            {pendingPartyAdd && (
              <p className="party-full-notice">
                Party full! Release a Pokémon to add{' '}
                <strong>
                  {formatPokemonDisplayName(
                    pokemonIndex[pendingPartyAdd - 1] || `#${pendingPartyAdd}`,
                  )}
                </strong>
                .
              </p>
            )}
            <div className="party-list">
              {party.map((id) => {
                const name = pokemonIndex[id - 1] || `#${id}`;
                return (
                  <div key={id} className="party-slot">
                    <button
                      type="button"
                      className="suggestion-chip favorite-chip"
                      onClick={() => findPokemon(id)}
                      disabled={isSearching}
                    >
                      <img
                        className="fav-sprite"
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                        alt=""
                        aria-hidden="true"
                      />
                      {formatPokemonDisplayName(name)}
                    </button>
                    {pendingPartyAdd && (
                      <button
                        type="button"
                        className="party-release-btn"
                        onClick={() => onPartyRelease(id)}
                        aria-label={`Release ${formatPokemonDisplayName(name)}`}
                        title={`Release ${formatPokemonDisplayName(name)}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showRecentSearches && (
          <div className="search-suggestions" aria-label="Recent searches">
            <div className="suggestions-header">
              <span className="suggestions-label">Recent</span>
              <button
                type="button"
                className="clear-recent-btn"
                onClick={onClearRecentSearches}
                disabled={isSearching}
              >
                Clear
              </button>
            </div>
            <div className="suggestion-list">
              {recentSearches.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="suggestion-chip recent-chip"
                  onClick={() => onSuggestionSelect(name)}
                  disabled={isSearching}
                >
                  {formatPokemonDisplayName(name)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

Search.propTypes = {
  state: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  findPokemon: PropTypes.func.isRequired,
  onRandom: PropTypes.func.isRequired,
  onSuggestionSelect: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  onClearRecentSearches: PropTypes.func.isRequired,
  isSearching: PropTypes.bool.isRequired,
  pendingSearch: PropTypes.string.isRequired,
  recentSearches: PropTypes.arrayOf(PropTypes.string).isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  formatPokemonDisplayName: PropTypes.func.isRequired,
  party: PropTypes.arrayOf(PropTypes.number).isRequired,
  pokemonIndex: PropTypes.arrayOf(PropTypes.string).isRequired,
  pendingPartyAdd: PropTypes.number,
  onPartyRelease: PropTypes.func.isRequired,
  onCancelPartyAdd: PropTypes.func.isRequired,
};
