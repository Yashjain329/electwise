import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer';

describe('Footer Component', () => {
  it('renders brand name and tagline', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Elect/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Wise/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Empowering every citizen/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Journey Map')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('renders copyright and credits', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText(/© 2026 ElectWise/i)).toBeInTheDocument();
    expect(screen.getByText(/Built for Hack2Skill PromptWars Hackathon/i)).toBeInTheDocument();
  });
});
