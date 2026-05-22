import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'dashboard.title': 'Mes voyages',
        'dashboard.newTrip': 'Nouveau voyage',
        'dashboard.cancel': 'Annuler',
        'dashboard.create': 'Créer',
        'dashboard.creating': 'Création...',
        'dashboard.noTrips': 'Aucun voyage',
        'dashboard.confirmDelete': 'Confirmer la suppression ?',
        'dashboard.titleLabel': 'Titre',
        'dashboard.destination': 'Destination',
        'dashboard.description': 'Description',
        'dashboard.startDate': 'Date de début',
        'dashboard.endDate': 'Date de fin',
        'tripCard.see': 'Voir →',
        'tripCard.delete': 'Supprimer',
        'common.loading': 'Chargement...',
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock('../hooks/useTrips');
vi.mock('../api/axios');

import { useTrips } from '../hooks/useTrips';
import api from '../api/axios';

const mockTrips = [
  {
    id: 1,
    title: 'Voyage à Tokyo',
    destination: 'Tokyo',
    countryFlag: '🇯🇵',
    startDate: '2025-06-01',
    endDate: '2025-06-15',
  },
  {
    id: 2,
    title: 'Road trip USA',
    destination: 'New York',
    countryFlag: '🇺🇸',
    startDate: '2025-08-01',
    endDate: '2025-08-20',
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardPage', () => {
  it('affiche le loader pendant le chargement', () => {
    useTrips.mockReturnValue({ trips: [], setTrips: vi.fn(), loading: true, error: null });
    renderPage();
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it("affiche un message d'erreur si le hook échoue", () => {
    useTrips.mockReturnValue({ trips: [], setTrips: vi.fn(), loading: false, error: 'Erreur réseau' });
    renderPage();
    expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
  });

  it('affiche le message vide si aucun voyage', () => {
    useTrips.mockReturnValue({ trips: [], setTrips: vi.fn(), loading: false, error: null });
    renderPage();
    expect(screen.getByText('Aucun voyage')).toBeInTheDocument();
  });

  it('affiche la liste des voyages', () => {
    useTrips.mockReturnValue({ trips: mockTrips, setTrips: vi.fn(), loading: false, error: null });
    renderPage();
    expect(screen.getByText(/Voyage à Tokyo/)).toBeInTheDocument();
    expect(screen.getByText(/Road trip USA/)).toBeInTheDocument();
  });

  it('affiche le formulaire au clic sur Nouveau voyage', () => {
  useTrips.mockReturnValue({ trips: [], setTrips: vi.fn(), loading: false, error: null });
  renderPage();
  fireEvent.click(screen.getByText('Nouveau voyage'));
  expect(screen.getByText(/Titre/)).toBeInTheDocument();
  });

  it('affiche Annuler quand le formulaire est ouvert', () => {
    useTrips.mockReturnValue({ trips: [], setTrips: vi.fn(), loading: false, error: null });
    renderPage();
    fireEvent.click(screen.getByText('Nouveau voyage'));
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  it('crée un voyage et ferme le formulaire', async () => {
    const setTrips = vi.fn();
    useTrips.mockReturnValue({ trips: [], setTrips, loading: false, error: null });
    api.post = vi.fn().mockResolvedValue({ data: { trip: { id: 3, title: 'Nouveau' } } });

    renderPage();
    fireEvent.click(screen.getByText('Nouveau voyage'));

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Nouveau' } });
    fireEvent.click(screen.getByText('Créer'));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/trips', expect.objectContaining({ title: 'Nouveau' }))
    );
    await waitFor(() => expect(setTrips).toHaveBeenCalled());
  });

  it('supprime un voyage après confirmation', async () => {
    const setTrips = vi.fn();
    useTrips.mockReturnValue({ trips: mockTrips, setTrips, loading: false, error: null });
    api.delete = vi.fn().mockResolvedValue({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();
    fireEvent.click(screen.getAllByText('Supprimer')[0]);

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/trips/1'));
    await waitFor(() => expect(setTrips).toHaveBeenCalled());
  });

  it('annule la suppression si confirmation refusée', async () => {
    useTrips.mockReturnValue({ trips: mockTrips, setTrips: vi.fn(), loading: false, error: null });
    api.delete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage();
    fireEvent.click(screen.getAllByText('Supprimer')[0]);

    expect(api.delete).not.toHaveBeenCalled();
  });
});