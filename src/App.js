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
    randomNumber: Math.floor(Math.random() * 650),
  };

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ input: value });
  };

  findPokemon = (data) => {
    if (!data || data === '0') return;
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${data}`)
      .then((res) => {
        this.setState({
          data: res.data,
          // image: res.data.sprites.other['official-artwork'].front_default,
          image: res.data.sprites.other.dream_world.front_default,
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
      .get(`https://pokeapi.co/api/v2/pokemon-species/${data}`)
      .then((res) => {
        this.setState({
          speciesData: res.data,
          loaded: true,
        });
      })
      .catch((err) => {
        this.setState({ error: true });
        setTimeout(() => {
          this.setState({ error: false, input: '' });
        }, 2000);
      });
  };

  componentDidMount() {
    console.log('mounted');
    this.findPokemon(this.state.randomNumber);
  }

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
          <p className="warning">That Pokemon does not exist</p>
        )}
        {this.state.loaded && (
          <PokeCard state={this.state} findPokemon={this.findPokemon} />
        )}
      </div>
    );
  }
}

export default App;
