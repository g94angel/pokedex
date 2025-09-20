import React, { Component } from "react";
import Pokeball from "./Pokeball";

export default class PokeCard extends Component {
  // Format type string
  getTypeString(types) {
    return types
      .map(({ type }) => type.name.charAt(0).toUpperCase() + type.name.slice(1))
      .join(" | ");
  }

  // Determine generation & region
  getGenerationInfo(id) {
    if (id < 152) return { generation: "I", region: "Kanto", descNum: 0, genusNum: 7 };
    if (id < 252) return { generation: "II", region: "Johto", descNum: 0, genusNum: 7 };
    if (id < 387) return { generation: "III", region: "Hoenn", descNum: 0, genusNum: 7 };
    if (id < 494) return { generation: "IV", region: "Sinnoh", descNum: 1, genusNum: 7 };
    if (id < 650) return { generation: "V", region: "Unova", descNum: 1, genusNum: 7 };
    if (id < 722) return { generation: "VI", region: "Kalos", descNum: 6, genusNum: 7 };
    if (id < 810) return { generation: "VII", region: "Alola", descNum: 7, genusNum: 7 };
    if (id <= 898) return { generation: "VIII", region: "Galar", descNum: 7, genusNum: 7 };
    return { generation: "VIII", region: "Galar", descNum: 0, genusNum: 4 };
  }

  render() {
    const { data, image, speciesData } = this.props.state;
    const { inCache } = this.props;
    const { generation, region, descNum, genusNum } = this.getGenerationInfo(data.id);

    const typeString = this.getTypeString(data.types);
    const nameFormatted = data.name.charAt(0).toUpperCase() + data.name.slice(1);

    const reg = new RegExp(data.name, "gi");
    const bio = speciesData.flavor_text_entries[descNum]?.flavor_text
      .replace(/POKéMON/gi, "Pokémon")
      .replace(reg, nameFormatted)
      .replace(/\f/g, " ");

    const genus = speciesData.genera[genusNum]?.genus;

    return (
      <div className="card-container">
        <div className="card-image-container">
          {/* Mobile buttons above image */}
          <div className="navigation-buttons">
            <button
              disabled={data.id <= 1}
              onClick={() => this.props.findPokemon(data.id - 1)}
            >
              <i className="fa fa-thin fa-caret-left"></i>
            </button>
            <button
              disabled={data.id >= 905}
              onClick={() => this.props.findPokemon(data.id + 1)}
            >
              <i className="fa fa-thin fa-caret-right"></i>
            </button>
          </div>

          {/* Pokémon Image */}
          <img className="pokemon-image" src={image} alt={data.name} />

          {/* Desktop side buttons */}
          <button
            disabled={data.id <= 1}
            onClick={() => this.props.findPokemon(data.id - 1)}
            className="navigate-left"
          >
            <i className="fa fa-thin fa-caret-left"></i>
          </button>

          <button
            disabled={data.id >= 905}
            onClick={() => this.props.findPokemon(data.id + 1)}
            className="navigate-right"
          >
            <i className="fa fa-thin fa-caret-right"></i>
          </button>
        </div>

        <div className="card-details">
          <div className="card-name">
            <h4>{nameFormatted}</h4>
            {inCache && <Pokeball className="pokeball" />}
          </div>

          <div className="card-info">
            {genus && <p>{`#${data.id} - The ${genus}`}</p>}
            <p>{`Generation ${generation} | ${region} region`}</p>
            <p>{typeString}</p>
            {speciesData.evolves_from_species && (
              <p>{`Evolves from ${
                speciesData.evolves_from_species.name.charAt(0).toUpperCase() +
                speciesData.evolves_from_species.name.slice(1)
              }`}</p>
            )}
            <p>{bio}</p>
          </div>
        </div>
      </div>
    );
  }
}