import React, { Component } from "react";
import Pokeball from "./Pokeball";

export default class Search extends Component {
  state = {
    shake: false,
  };

  handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (this.props.state.input) {
      this.props.findPokemon(this.props.state.input.toLowerCase());
    } else {
      this.triggerShake();
    }
  };


  triggerShake = () => {
    this.setState({ shake: true });
    setTimeout(() => this.setState({ shake: false }), 500); // reset after animation
  };

  render() {
    const { state, handleChange, findPokemon } = this.props;
    const { shake } = this.state;

    return (
      <div className={`search-container ${shake ? "shake" : ""}`}>
        <input
          onKeyDown={this.handleKeyDown}
          onChange={handleChange}
          placeholder="Search"
          type="text"
          value={state.input}
        />
        <Pokeball
          findPokemon={findPokemon}
          input={state.input}
          onEmptySearch={this.triggerShake}
          className="pokeball-btn"
        />
      </div>
    );
  }
}
