import React, { Component } from "react";
import axios from "axios";
import Search from "./Search";
import Title from "./Title";
import Loader from "./Loader";
import PokeCard from "./PokeCard";

class App extends Component {
  state = {
    input: "",
    image: "",
    data: null,
    speciesData: null,
    error: false,
    loaded: false,
    firstPokemon: 1,
    cache: {}, // cache stores previous Pokémon data with ID keys
    fromCache: false, // track if data was loaded from cache
  };

  componentDidMount() {
    this.findPokemon(this.state.firstPokemon);
  }

  handleChange = (e) => {
    this.setState({ input: e.target.value });
  };

  getSprite = (pokemonData) =>
    pokemonData.id <= 649
      ? pokemonData.sprites.other.dream_world.front_default
      : pokemonData.sprites.other["official-artwork"].front_default;

  handleError = () => {
    this.setState({ error: true, loaded: true, fromCache: false });
    setTimeout(this.recoverFromError, 2000);
  };

  recoverFromError = () => {
    const firstCachedKey = Object.keys(this.state.cache)[0];
    if (firstCachedKey) {
      const { data, speciesData, image } = this.state.cache[firstCachedKey];
      this.setState({
        error: false,
        input: "",
        data,
        speciesData,
        image,
        loaded: true,
        fromCache: true, // indicate data is from cache
      });
    } else {
      this.setState({
        error: false,
        input: "",
        data: null,
        speciesData: null,
        image: "",
        loaded: false,
        fromCache: false,
      });
    }
  };

  fetchPokemonData = async (search) => {
    const [pokemonRes, speciesRes] = await Promise.all([
      axios.get(`https://pokeapi.co/api/v2/pokemon/${search}`),
      axios.get(`https://pokeapi.co/api/v2/pokemon-species/${search}`),
    ]);

    const image = this.getSprite(pokemonRes.data);
    return { data: pokemonRes.data, speciesData: speciesRes.data, image };
  };

  findPokemon = async (searchData) => {
    const search = String(searchData).trim().toLowerCase();
    this.setState({ loaded: false, fromCache: false });

    if (!search) return this.handleError();

    const searchNum = Number(search);
    if (!isNaN(searchNum) && (searchNum < 1 || searchNum > 905))
      return this.handleError();

    // Determine cache key (use searchNum if it's a valid number, else fetch to get ID)
    const cacheKey = !isNaN(searchNum) ? searchNum : search;

    // Check cache using ID (for numeric searches) or fetch for name-based searches
    if (!isNaN(searchNum) && this.state.cache[cacheKey]) {
      const { data, speciesData, image } = this.state.cache[cacheKey];
      this.setState({
        data,
        speciesData,
        image,
        loaded: true,
        input: "",
        fromCache: true, // indicate data is from cache
      });
      return;
    }

    // Fetch fresh data
    try {
      const { data, speciesData, image } = await this.fetchPokemonData(search);

      // Use Pokémon ID as the cache key
      const finalCacheKey = data.id;

      this.setState((prevState) => ({
        data,
        speciesData,
        image,
        loaded: true,
        input: "",
        fromCache: !!prevState.cache[finalCacheKey], // check if it was already cached
        cache: {
          ...prevState.cache,
          [finalCacheKey]: { data, speciesData, image },
        },
      }));
    } catch (err) {
      this.handleError();
    }
  };

  render() {
    const { error, input, loaded, fromCache } = this.state;

    // Use fromCache to indicate if the current Pokémon was loaded from cache
    const inCache = fromCache;

    return (
      <div className="main-container">
        <Title />
        <Search
          state={this.state}
          handleChange={this.handleChange}
          findPokemon={this.findPokemon}
        />

        {error && (
          <p className="warning">
            {input || "Input"} is not a valid Pokémon. Please try again.
          </p>
        )}

        {loaded ? (
          <PokeCard state={this.state} findPokemon={this.findPokemon} inCache={inCache} />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

export default App;