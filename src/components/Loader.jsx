import React from 'react';
import PropTypes from 'prop-types';
import PokeballImg from '../images/pokeball.png';

export default function Loader({ message = 'Catching Pokemon...' }) {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <img className="loader" src={PokeballImg} alt="pokeball" />
      <p className="loader-label">{message}</p>
    </div>
  );
}

Loader.propTypes = {
  message: PropTypes.string,
};
