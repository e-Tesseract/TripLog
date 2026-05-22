import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TripCard from '../components/TripCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'tripCard.see': 'Voir →',
        'tripCard.delete': 'Supprimer',
        'tripCard.steps': 'étape(s)',
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockTrip = {
  id: 1,
  title: 'Voyage à Tokyo',
  destination: 'Tokyo',
  countryFlag: '🇯🇵',
  startDate: '2025-06-01',
  endDate: '2025-06-15',
  currency: 'JPY',
  language: 'Japonais',
  Steps: [{ id: 1 }, { id: 2 }],
};

const renderCard = (onClick = () => {}, onDelete = () => {}) =>
  render(
    <MemoryRouter>
      <TripCard trip={mockTrip} onClick={onClick} onDelete={onDelete} />
    </MemoryRouter>
  );

describe('TripCard', () => {
  it('affiche le titre du voyage', () => {
    renderCard();
    expect(screen.getByText(/Voyage à Tokyo/i)).toBeInTheDocument();
  });

  it('affiche la destination', () => {
    renderCard();
    expect(screen.getByText('📍 Tokyo')).toBeInTheDocument();
  });

  it("affiche le nombre d'étapes", () => {
    renderCard();
    expect(screen.getByText('2 étape(s)')).toBeInTheDocument();
  });

  it('affiche les dates de début et de fin', () => {
    renderCard();
    expect(screen.getByText(/2025-06-01/)).toBeInTheDocument();
    expect(screen.getByText(/2025-06-15/)).toBeInTheDocument();
  });

  it('affiche le drapeau, la devise et la langue', () => {
    renderCard();
    expect(screen.getByText(/🇯🇵/)).toBeInTheDocument();
    expect(screen.getByText(/JPY/)).toBeInTheDocument();
    expect(screen.getByText(/Japonais/)).toBeInTheDocument();
  });

  it('appelle onClick au clic sur la carte', () => {
    const onClick = vi.fn();
    renderCard(onClick);
    fireEvent.click(screen.getByText(/Voyage à Tokyo/i));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('appelle onDelete au clic sur Supprimer', () => {
    const onDelete = vi.fn();
    renderCard(() => {}, onDelete);
    fireEvent.click(screen.getByText('Supprimer'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('le clic sur Supprimer ne déclenche pas onClick', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    renderCard(onClick, onDelete);
    fireEvent.click(screen.getByText('Supprimer'));
    expect(onClick).not.toHaveBeenCalled();
  });
});