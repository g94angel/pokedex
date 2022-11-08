import React, { Component } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';

class App extends Component {
  state = {
    name: '',
    image: '',
    data: null,
    error: false,
  };

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ name: value });
  };

  findPokemon = () => {
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${this.state.name.toLowerCase()}`)
      .then((res) => {
        this.setState({
          data: res.data,
          image: res.data.sprites.other.dream_world.front_default,
          name: '',
        });
      })
      .catch((err) => {
        this.setState({ error: true });
        setTimeout(() => {
          this.setState({ error: false, name: '' });
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
          value={this.state.name}
        />
        <button onClick={this.findPokemon}>Search</button>
        {this.state.error && <p>This Pokemon does not exist</p>}
        <PokeCard state={this.state} />
      </div>
    );
  }
}

export default App;
