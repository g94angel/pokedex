import React, { Component } from 'react';
import Search from './Search';
import Title from './Title';
import Loader from './Loader';
import PokeCard from './PokeCard';

class App extends Component {
  state = {
    input: '',
    image: '',
    data: null,
    speciesData: null,
    evoData: null,
    error: false,
    errorMessage: '',
    loaded: false,
    cache: {},
    favorites: JSON.parse(localStorage.getItem('pokedex-favorites') || '[]'),
    pokemonIndex: [],
    normalizedPokemonIndex: {},
    searchSuggestions: [],
    isSearching: false,
    pendingSearch: '',
    recentSearches: JSON.parse(
      localStorage.getItem('pokedex-recent-searches') || '[]',
    ),
  };

  componentDidMount() {
    const params = new URLSearchParams(globalThis.location.search);
    const pokemonParam = params.get('pokemon');
    this.findPokemon(pokemonParam || 1);
    this.fetchPokemonIndex();
    globalThis.addEventListener('keydown', this.handleKeyboardNav);
  }

  componentWillUnmount() {
    globalThis.removeEventListener('keydown', this.handleKeyboardNav);
  }

  handleKeyboardNav = (e) => {
    // Don't fire when user is typing in the search input
    if (e.target.tagName === 'INPUT') return;
    const { data, loaded } = this.state;
    if (!loaded || !data) return;
    if (e.key === 'ArrowLeft' && data.id > 1) this.findPokemon(data.id - 1);
    else if (e.key === 'ArrowRight' && data.id < 1025)
      this.findPokemon(data.id + 1);
  };

  handleChange = (e) => {
    const input = e.target.value;
    this.setState({
      input,
      error: false,
      errorMessage: '',
      searchSuggestions: this.getSearchSuggestions(input),
      pendingSearch: '',
    });
  };

  handleClearSearchInput = () => {
    this.setState({
      input: '',
      error: false,
      errorMessage: '',
      pendingSearch: '',
      searchSuggestions: [],
    });
  };

  handleClearRecentSearches = () => {
    localStorage.removeItem('pokedex-recent-searches');
    this.setState({ recentSearches: [] });
  };

  formatPokemonDisplayName = (name) => {
    if (!name) return '';
    const normalizedName = name.toLowerCase();
    const specialNames = {
      'mr-mime': 'Mr. Mime',
      'mr-rime': 'Mr. Rime',
      'mime-jr': 'Mime Jr.',
      'type-null': 'Type: Null',
      'ho-oh': 'Ho-Oh',
      'porygon-z': 'Porygon-Z',
      'jangmo-o': 'Jangmo-o',
      'hakamo-o': 'Hakamo-o',
      'kommo-o': 'Kommo-o',
      'nidoran-f': 'Nidoran♀',
      'nidoran-m': 'Nidoran♂',
    };

    if (specialNames[normalizedName]) return specialNames[normalizedName];

    return normalizedName
      .split('-')
      .map((part) =>
        part.length === 1
          ? part.toUpperCase()
          : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
      )
      .join(' ');
  };

  updateRecentSearches = (name) => {
    this.setState((prev) => {
      const recentSearches = [
        name,
        ...prev.recentSearches.filter((entry) => entry !== name),
      ].slice(0, 8);
      localStorage.setItem(
        'pokedex-recent-searches',
        JSON.stringify(recentSearches),
      );
      return { recentSearches };
    });
  };

  fetchPokemonIndex = async () => {
    try {
      const response = await fetch(
        'https://pokeapi.co/api/v2/pokemon?limit=1025',
      );
      if (!response.ok) throw new Error('Could not load Pokemon index');
      const payload = await response.json();
      const pokemonIndex = payload.results.map(({ name }) => name);
      const normalizedPokemonIndex = pokemonIndex.reduce((index, name) => {
        index[this.normalizeSearchTerm(name)] = name;
        return index;
      }, {});

      this.setState((prev) => ({
        pokemonIndex,
        normalizedPokemonIndex,
        searchSuggestions: prev.input
          ? this.getSearchSuggestions(prev.input, pokemonIndex)
          : [],
      }));
    } catch {
      // Search can still work directly against the API without the name index.
    }
  };

  normalizeSearchTerm = (value) =>
    String(value)
      .normalize('NFKD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replaceAll(/[^a-z0-9]/g, '');

  levenshteinDistance = (left, right) => {
    if (left === right) return 0;
    if (!left.length) return right.length;
    if (!right.length) return left.length;

    const previous = Array.from(
      { length: right.length + 1 },
      (_, index) => index,
    );

    for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
      let diagonal = previous[0];
      previous[0] = leftIndex + 1;

      for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
        const cached = previous[rightIndex + 1];
        const substitutionCost = left[leftIndex] === right[rightIndex] ? 0 : 1;

        previous[rightIndex + 1] = Math.min(
          previous[rightIndex + 1] + 1,
          previous[rightIndex] + 1,
          diagonal + substitutionCost,
        );

        diagonal = cached;
      }
    }

    return previous[right.length];
  };

  getSearchSuggestions = (query, sourceIndex = this.state.pokemonIndex) => {
    const normalizedQuery = this.normalizeSearchTerm(query);
    if (
      normalizedQuery.length < 2 ||
      !sourceIndex.length ||
      !isNaN(Number(query))
    ) {
      return [];
    }

    const scoredMatches = sourceIndex
      .map((name) => {
        const normalizedName = this.normalizeSearchTerm(name);

        if (normalizedName === normalizedQuery) {
          return { name, score: -10 };
        }

        let score = this.levenshteinDistance(normalizedQuery, normalizedName);
        if (normalizedName.startsWith(normalizedQuery)) score -= 2;
        if (normalizedName.includes(normalizedQuery)) score -= 1;

        return { name, score };
      })
      .filter(({ name, score }) => {
        const normalizedName = this.normalizeSearchTerm(name);
        return (
          normalizedName.startsWith(normalizedQuery) ||
          normalizedName.includes(normalizedQuery) ||
          score <= Math.max(2, Math.floor(normalizedQuery.length / 3) + 1)
        );
      })
      .sort(
        (left, right) =>
          left.score - right.score || left.name.localeCompare(right.name),
      )
      .slice(0, 4)
      .map(({ name }) => name);

    return Array.from(new Set(scoredMatches));
  };

  resolveCanonicalSearch = (search) => {
    if (!isNaN(Number(search))) return search;
    const normalized = this.normalizeSearchTerm(search);
    return this.state.normalizedPokemonIndex[normalized] || search;
  };

  handleSearchSuggestion = (name) => {
    this.findPokemon(name, 'suggestion');
  };

  getSprite = (pokemonData) => {
    const artwork = pokemonData.sprites.other?.['official-artwork'];
    if (artwork?.front_default) return artwork.front_default;
    const dreamWorld = pokemonData.sprites.other?.dream_world;
    if (dreamWorld?.front_default) return dreamWorld.front_default;
    return pokemonData.sprites.front_default;
  };

  handleError = (search) => {
    this.setState((prev) => ({
      error: true,
      errorMessage: `${search || 'Input'} is not a valid Pokemon.`,
      loaded: Boolean(prev.data && prev.speciesData),
      searchSuggestions: this.getSearchSuggestions(search),
      isSearching: false,
      pendingSearch: '',
    }));
  };

  fetchPokemonData = async (search) => {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${search}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${search}`),
    ]);

    if (!pokemonRes.ok || !speciesRes.ok) throw new Error('Pokemon not found');

    const [data, speciesData] = await Promise.all([
      pokemonRes.json(),
      speciesRes.json(),
    ]);

    let evoData = null;
    try {
      const evoRes = await fetch(speciesData.evolution_chain.url);
      if (evoRes.ok) evoData = await evoRes.json();
    } catch {}

    const image = this.getSprite(data);
    return { data, speciesData, evoData, image };
  };

  findPokemon = async (searchData, source = 'manual') => {
    const rawSearch = String(searchData).trim().toLowerCase();
    const search = this.resolveCanonicalSearch(rawSearch);
    this.setState((prev) => ({
      loaded: prev.data ? prev.loaded : false,
      error: false,
      errorMessage: '',
      searchSuggestions: prev.input
        ? this.getSearchSuggestions(prev.input)
        : [],
      isSearching: true,
      pendingSearch: source === 'suggestion' ? search : '',
    }));

    if (!search) return this.handleError();

    const searchNum = Number(search);
    if (!isNaN(searchNum) && (searchNum < 1 || searchNum > 1025))
      return this.handleError(search);

    // Cache key: numeric ID for number searches, name string for name searches
    const cacheKey = !isNaN(searchNum) ? searchNum : search;

    if (this.state.cache[cacheKey]) {
      const { data, speciesData, evoData, image } = this.state.cache[cacheKey];
      globalThis.history.pushState(null, '', `?pokemon=${data.id}`);
      this.updateRecentSearches(data.name);
      this.setState({
        data,
        speciesData,
        evoData,
        image,
        loaded: true,
        input: '',
        isSearching: false,
        pendingSearch: '',
      });
      return;
    }

    try {
      const { data, speciesData, evoData, image } =
        await this.fetchPokemonData(search);
      globalThis.history.pushState(null, '', `?pokemon=${data.id}`);
      this.updateRecentSearches(data.name);
      this.setState((prev) => ({
        data,
        speciesData,
        evoData,
        image,
        loaded: true,
        input: '',
        error: false,
        errorMessage: '',
        searchSuggestions: [],
        isSearching: false,
        pendingSearch: '',
        cache: {
          ...prev.cache,
          [data.id]: { data, speciesData, evoData, image },
          [data.name]: { data, speciesData, evoData, image }, // also index by name
        },
      }));
    } catch {
      this.handleError(rawSearch);
    }
  };

  handleFavoriteToggle = (id) => {
    this.setState((prev) => {
      const favs = prev.favorites.includes(id)
        ? prev.favorites.filter((f) => f !== id)
        : [...prev.favorites, id];
      localStorage.setItem('pokedex-favorites', JSON.stringify(favs));
      return { favorites: favs };
    });
  };

  handleRandom = () => {
    this.findPokemon(Math.floor(Math.random() * 1025) + 1, 'random');
  };

  render() {
    const {
      data,
      error,
      errorMessage,
      input,
      isSearching,
      loaded,
      pendingSearch,
      recentSearches,
      searchSuggestions,
    } = this.state;
    const hasPokemon = loaded && data;

    return (
      <div className="main-container">
        <div className="top-shell">
          <Title />
          <Search
            state={this.state}
            handleChange={this.handleChange}
            findPokemon={this.findPokemon}
            onRandom={this.handleRandom}
            onSuggestionSelect={this.handleSearchSuggestion}
            onClearSearch={this.handleClearSearchInput}
            onClearRecentSearches={this.handleClearRecentSearches}
            isSearching={isSearching}
            pendingSearch={pendingSearch}
            recentSearches={recentSearches}
            suggestions={searchSuggestions}
            formatPokemonDisplayName={this.formatPokemonDisplayName}
          />

          {error && (
            <p className="warning">
              {errorMessage || `${input || 'Input'} is not a valid Pokemon.`}
            </p>
          )}
        </div>

        {hasPokemon ? (
          <PokeCard
            state={this.state}
            findPokemon={this.findPokemon}
            onFavoriteToggle={this.handleFavoriteToggle}
          />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

export default App;
