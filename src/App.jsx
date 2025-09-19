import React, { Component } from "react";
import axios from "axios";
import PokeCard from "./PokeCard";
import Search from "./Search";
import Title from "./Title";
import Loader from "./Loader";

class App extends Component {
  state = {
    input: "",
    image: "",
    data: null,
    speciesData: null,
    error: false,
    loaded: false,
    firstPokemon: 1,
    cache: {},
    inCache: false, // track if current Pokémon was seen before
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

  // Show error and recover after 2s
  handleError = () => {
    this.setState({ error: true, loaded: true }); // stop loader
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
        inCache: true,
      });
    } else {
      this.setState({
        error: false,
        input: "",
        data: null,
        speciesData: null,
        image: "",
        loaded: false,
        inCache: false,
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
    this.setState({ loaded: false });

    if (!search) return this.handleError();

    const searchNum = Number(search);
    if (!isNaN(searchNum) && (searchNum < 1 || searchNum > 905))
      return this.handleError();

    // Check cache first
    if (this.state.cache[search]) {
      const { data, speciesData, image } = this.state.cache[search];
      this.setState({
        data,
        speciesData,
        image,
        inCache: true,
        loaded: true,
        input: "",
      });
      return;
    }

    // Fetch fresh data
    try {
      const { data, speciesData, image } = await this.fetchPokemonData(search);

      this.setState((prevState) => ({
        data,
        speciesData,
        image,
        inCache: false,
        loaded: true,
        input: "",
        cache: {
          ...prevState.cache,
          [search]: { data, speciesData, image, inCache: true },
        },
      }));
    } catch (err) {
      this.handleError();
    }
  };

  render() {
    const { error, input, loaded } = this.state;

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
          <PokeCard state={this.state} findPokemon={this.findPokemon} />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

export default App;
