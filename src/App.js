import React, { Component } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';

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
        <h1>Pokemon!</h1>
        <input
          onChange={this.handleChange}
          type="text"
          value={this.state.input}
        />
        <button onClick={this.findPokemon}>Search</button>
        {this.state.error && <p>This Pokemon does not exist</p>}
        {this.state.loaded && <PokeCard state={this.state} />}
      </div>
    );
  }
}

export default App;
