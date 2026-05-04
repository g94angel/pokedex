import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loader from '../Loader';
import Title from '../Title';

describe('Presentational components', () => {
  it('renders title logo image', () => {
    render(<Title />);

    const logo = screen.getByRole('img', { name: /pokemon-logo/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('logo');
  });

  it('renders loader with pokeball image', () => {
    render(<Loader />);

    const loader = screen.getByRole('img', { name: /pokeball/i });
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass('loader');
  });
});
