import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Winners from './Winners';
import { Provider } from 'react-redux';
import { store } from '../../lib/store';
import { MemoryRouter } from 'react-router-dom';
import { mockData } from '../../lib/mockData';

const MockWinners = () => (
  <Provider store={store}>
    <MemoryRouter>
      <Winners />
    </MemoryRouter>
  </Provider>
);

describe('Winners Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockData),
      } as any);
    store.getState().user.user = {
        id: '123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin'
      };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    store.getState().user.user = null;
  });

  it('renders without crashing', async () => {
    render(<MockWinners />);
    await waitFor(() => expect(screen.getByText('Ganadores')).toBeInTheDocument());
  });

  it('renders current month winners when available', async () => {
    render(<MockWinners />);
    await waitFor(() => {
      expect(screen.getByText('Ganadores del Mes')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Test Company').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
  });

  it('renders message when there are no current month winners', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([]),
      } as any);
    render(<MockWinners />);
    await waitFor(() => {
        expect(screen.getByText('Ganadores del Mes')).toBeInTheDocument();
    });
    expect(screen.getByText('No hay ganadores este mes')).toBeInTheDocument();
  });

  it('renders historical winners when the button is clicked', async () => {
    render(<MockWinners />);
    const historyButton = await screen.findByText('Historial');
    fireEvent.click(historyButton);
    expect(screen.getByText('Historial de Ganadores')).toBeInTheDocument();
  });

  it('toggles between current and historical winners', async () => {
    render(<MockWinners />);
    const historyButton = await screen.findByText('Historial');
    fireEvent.click(historyButton);
    expect(screen.getByText('Historial de Ganadores')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ganadores del Mes'));
    expect(screen.getByText('Ganadores del Mes')).toBeInTheDocument();
  });

  it('renders the export button when user is admin', async () => {
    render(<MockWinners />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Exportar/i })).toBeInTheDocument();
    });
  });

  it('does not render the export button when user is not admin', async () => {
    store.getState().user.user = {
        id: '123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'user'
      };
    render(<MockWinners />);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Exportar/i })).not.toBeInTheDocument();
    });
  });

  it('opens and closes the export dialog', async () => {
    render(<MockWinners />);
    const exportButton = await screen.findByRole('button', { name: /Exportar/i });
    fireEvent.click(exportButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const closeButton = screen.getByRole('button', { name: /Cerrar/i });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});