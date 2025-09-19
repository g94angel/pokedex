import React, { Component } from "react";
import PokeballImg from "./images/pokeball.png";

export default class Pokeball extends Component {
  handleClick = () => {
    const { findPokemon, input, onEmptySearch } = this.props;
    if (!input) {
      // trigger shake animation when empty
      if (onEmptySearch) onEmptySearch();
      return;
    }

    if (findPokemon) {
      findPokemon(input.toLowerCase());
    }
  };

  render() {
    return (
      <img
        onClick={this.handleClick}
        className={this.props.className}
        src={PokeballImg}
        alt="pokeball"
      />
    );
  }
}
