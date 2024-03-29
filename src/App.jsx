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
    data: null, // will need to make one request here
    speciesData: null, // and another here
    error: false,
    loaded: false,
    randomNumber: Math.floor(Math.random() * 906),
    cache: {},
  };

  componentDidMount() {
    this.findPokemon(this.state.randomNumber);
  }

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ input: value });
  };

  findPokemon = async (searchData) => {
    this.setState({ loaded: false });
    // if user didn't input data
    if (!searchData) {
      // console.log('no data entered', searchData);
      return;
    }
    // if pokemon DNE, alert user
    else if (searchData < 1 || searchData > 905) {
      // console.log('out of scope', searchData);
      this.setState({ error: true });
      setTimeout(() => {
        this.setState({ error: false, input: "" });
      }, 2000);
      return;
      // if pokemon is in cache
    } else if (this.state.cache[searchData]) {
      // console.log('found in cache');
      // console.log(searchData);
      this.setState({
        inCache: this.state.cache[searchData].inCache,
        loaded: true,
        data: this.state.cache[searchData].data,
        speciesData: this.state.cache[searchData].speciesData,
        // image:
        //   this.state.cache[searchData].data.sprites.other['official-artwork']
        //     .front_default,
        image: this.state.cache[searchData].image,
        input: "",
      });
      return;
    }
    // not found in cache, need to make request
    // console.log('not in cache, making request');
    try {
      const pokemonData = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${searchData}`
      );
      const speciesData = await axios.get(
        `https://pokeapi.co/api/v2/pokemon-species/${searchData}`
      );
      this.setState({
        input: "",
        loaded: true,
        inCache: false,
        data: pokemonData.data,
        // image: pokemonData.data.sprites.other['official-artwork'].front_default,
        image:
          pokemonData.data.id <= 649
            ? pokemonData.data.sprites.other.dream_world.front_default
            : pokemonData.data.sprites.other["official-artwork"].front_default,
        // pokemonData.data.sprites.other.dream_world.front_default,

        speciesData: speciesData.data,
        cache: {
          ...this.state.cache,
          [searchData]: {
            ...this.state.cache[searchData],
            data: pokemonData.data,
            image:
              pokemonData.data.id <= 649
                ? pokemonData.data.sprites.other.dream_world.front_default
                : pokemonData.data.sprites.other["official-artwork"]
                    .front_default,
            speciesData: speciesData.data,
            inCache: true,
          },
        },
      });
    } catch (err) {
      this.setState({ error: true });
      setTimeout(() => {
        this.setState({ error: false, input: "" });
      }, 2000);
    }
  };

  render() {
    return (
      <div className="main-container">
        <Title />
        <Search
          state={this.state}
          handleChange={this.handleChange}
          findPokemon={this.findPokemon}
        />
        {this.state.error && (
          <p className="warning">
            {this.state.input} is not a Pokemon. Please try again.
          </p>
        )}
        {this.state.loaded ? (
          <PokeCard state={this.state} findPokemon={this.findPokemon} />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

export default App;
