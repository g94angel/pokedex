import React, { Component } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';
import Search from './Search';

class App extends Component {
  state = {
    input: '',
    image: '',
    data: null,
    error: false,
    loaded: false,
  };

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ input: value });
  };

  findPokemon = () => {
    axios
      .get(
        `https://pokeapi.co/api/v2/pokemon/${this.state.input.toLowerCase()}`
      )
      .then((res) => {
        this.setState({
          data: res.data,
          // image: res.data.sprites.other['official-artwork'].front_default,
          image: res.data.sprites.other.dream_world.front_default,
          input: '',
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

  render() {
    return (
      <div className="main-container">
        <Search
          state={this.state}
          handleChange={this.handleChange}
          findPokemon={this.findPokemon}
        />
        {this.state.error && (
          <p className="warning">{`${this.state.input} does not exist`}</p>
        )}
        {this.state.loaded && <PokeCard state={this.state} />}
      </div>
    );
  }
}

export default App;
