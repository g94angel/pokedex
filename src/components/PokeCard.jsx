import React, { Component } from "react";
import Pokeball from "./Pokeball";

export default class PokeCard extends Component {
  // Store audio object to reuse
  audio = null;

  // Format type string
  getTypeString(types) {
    return types
      .map(({ type }) => type.name.charAt(0).toUpperCase() + type.name.slice(1))
      .join(" | ");
  }

  // Play the Pokémon's battle cry
  playCry = () => {
    const { data } = this.props.state;
    if (data?.cries?.latest) {
      try {
        // Reuse audio object if exists, or create new
        if (!this.audio) {
          this.audio = new Audio(data.cries.latest);
        }
        this.audio.src = data.cries.latest; // Update src if Pokémon changes
        this.audio.play().catch((error) => {
          console.error(`Error playing audio for ${data.name}:`, error);
        });
      } catch (error) {
        console.error(`Failed to initialize audio for ${data.name}:`, error);
      }
    } else {
      console.warn(`No latest cry available for ${data.name}`);
    }
  };

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

  componentDidMount() {
    // Optional: Disable autoplay on mobile
    // if (window.innerWidth > 400) {
      this.playCry();
    // }
  }

  componentDidUpdate(prevProps) {
    // Play cry when Pokémon changes
    // if (window.innerWidth > 400 && prevProps.state.data?.id !== this.props.state.data?.id) {
    if (prevProps.state.data?.id !== this.props.state.data?.id) {
      this.playCry();
    }
  }

  componentWillUnmount() {
    // Clean up audio
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
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
    const hasCry = !!data?.cries?.latest;

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
            <button
              onClick={this.playCry}
              onTouchStart={this.playCry} // Add touchstart for mobile
              disabled={!hasCry}
              className={inCache ? "play-cry-button-cached" : "play-cry-button"}
              aria-label="Play battle cry"
            >
              <i className="fa fa-play-circle" aria-hidden="true"></i>
            </button>
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