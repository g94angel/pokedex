import React, { Component } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';
import Search from './Search';
import Title from './Title';

class App extends Component {
  state = {
    input: '',
    image: '',
    data: null,
    speciesData: null,
    error: false,
    loaded: false,
    randomNumber: Math.floor(Math.random() * 906),
    // inCache: false,
    cache: {},
    // cache: JSON.parse(localStorage.getItem('cache')) || {},
  };

  componentDidMount() {
    // console.log('mounted');
    this.findPokemon(this.state.randomNumber);
  }

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ input: value });
  };

  findPokemon = async (searchData) => {
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
        this.setState({ error: false, input: '' });
      }, 2000);
      return;
      // if pokemon is in cache
    } else if (this.state.cache[searchData]) {
      // console.log('found in cache');
      this.setState({
        inCache: this.state.cache[searchData].inCache,
        loaded: true,
        data: this.state.cache[searchData].data,
        speciesData: this.state.cache[searchData].speciesData,
        image:
          this.state.cache[searchData].data.sprites.other['official-artwork']
            .front_default,
        input: '',
      });
      return;
    }
    // not found in cache
    // console.log('not in cache, making request');
    try {
      const pokemonData = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${searchData}`
      );
      const speciesData = await axios.get(
        `https://pokeapi.co/api/v2/pokemon-species/${searchData}`
      );
      // console.log('species', speciesData.data);
      this.setState({
        input: '',
        loaded: true,
        inCache: false,
        data: pokemonData.data,
        image: pokemonData.data.sprites.other['official-artwork'].front_default,
        // image: res.data.sprites.other.dream_world.front_default,
        speciesData: speciesData.data,
        cache: {
          ...this.state.cache,
          [searchData]: {
            ...this.state.cache[searchData],
            data: pokemonData.data,
            image:
              pokemonData.data.sprites.other['official-artwork'].front_default,
            speciesData: speciesData.data,
            inCache: true,
          },
        },
      });
    } catch (err) {
      this.setState({ error: true });
      setTimeout(() => {
        this.setState({ error: false, input: '' });
      }, 2000);
    }
  };

  render() {
    // localStorage.setItem('cache', JSON.stringify(this.state.cache));
    return (
      <div className="main-container">
        <Title />
        <Search
          state={this.state}
          handleChange={this.handleChange}
          findPokemon={this.findPokemon}
        />
        {this.state.error && (
          <p className="warning">That Pokemon does not exist.</p>
        )}
        {this.state.loaded && (
          <PokeCard state={this.state} findPokemon={this.findPokemon} />
        )}
      </div>
    );
  }
}

export default App;
