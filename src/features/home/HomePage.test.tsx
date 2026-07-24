import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildInfo } from '../../app/buildInfo';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders branding, game setup access, and automatic build metadata', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: 'Game Tracker' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Game/i })).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'About Game Tracker' })).toBeInTheDocument();
    expect(screen.getAllByText(buildInfo.version).length).toBeGreaterThan(0);
  });
});
