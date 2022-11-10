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
    randomNumber: Math.floor(Math.random() * 650),
  };

  componentDidMount() {
    console.log('mounted');
    this.findPokemon(this.state.randomNumber);
  }

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ input: value });
  };

  findPokemon = (searchData) => {
    if (searchData < 1 || searchData > 905) {
      this.setState({ error: true });
      setTimeout(() => {
        this.setState({ error: false, input: '' });
      }, 2000);
      return;
    } else if (!searchData) return;
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${searchData}`)
      .then((res) => {
        this.setState({
          data: res.data,
          image: res.data.sprites.other['official-artwork'].front_default,
          // image: res.data.sprites.other.dream_world.front_default,
          input: '',
        });
      })
      .catch((err) => {
        this.setState({ error: true });
        setTimeout(() => {
          this.setState({ error: false, input: '' });
        }, 2000);
      });
    axios
      .get(`https://pokeapi.co/api/v2/pokemon-species/${searchData}`)
      .then((res) => {
        this.setState({
          speciesData: res.data,
        });
      })
      .catch((err) => {
        this.setState({ error: true });
        setTimeout(() => {
          this.setState({ error: false, input: '' });
        }, 2000);
      });
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
          <p className="warning">That Pokemon does not exist.</p>
        )}
        {this.state.speciesData && (
          <PokeCard state={this.state} findPokemon={this.findPokemon} />
        )}
      </div>
    );
  }
}

export default App;
