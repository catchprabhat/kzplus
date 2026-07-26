import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VehicleFinder } from './VehicleFinder';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/api', () => ({
  apiService: {
    searchVehicleByNumber: vi.fn(),
    searchUserByPhone: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Typed helpers for mocks
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
const mockApiService = apiService as {
  searchVehicleByNumber: ReturnType<typeof vi.fn>;
  searchUserByPhone: ReturnType<typeof vi.fn>;
};
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const vehicleResult = {
  id: '1',
  vehicleNumber: 'KA01AB1234',
  ownerName: 'John Doe',
  ownerPhone: '+919876543210',
};

const userResult = {
  id: '2',
  name: 'Jane Doe',
  phone: '+919876543211',
  vehicleNumber: 'KA02CD5678',
};

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

function renderVehicleFinder(
  props: {
    onVehicleFound?: (data: any) => void;
    onNewCustomer?: () => void;
    email?: string | null;
  } = {}
) {
  const onVehicleFound = props.onVehicleFound ?? vi.fn();
  const onNewCustomer = props.onNewCustomer ?? vi.fn();

  mockUseAuth.mockReturnValue({
    user: props.email !== null ? { email: props.email ?? '' } : null,
    isAuthenticated: props.email !== null,
  });

  const utils = render(
    <MemoryRouter>
      <VehicleFinder onVehicleFound={onVehicleFound} onNewCustomer={onNewCustomer} />
    </MemoryRouter>
  );

  return { ...utils, onVehicleFound, onNewCustomer };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VehicleFinder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe('Initial render', () => {
    it('renders the component heading', () => {
      renderVehicleFinder();
      expect(screen.getByText(/Find Your Vehicle/i)).toBeInTheDocument();
    });

    it('defaults to vehicle number search tab', () => {
      renderVehicleFinder();
      const vehicleBtn = screen.getByRole('button', { name: /Vehicle Number/i });
      expect(vehicleBtn).toHaveClass('bg-blue-500');
    });

    it('renders the search button', () => {
      renderVehicleFinder();
      expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    });

    it('renders the Manage Subscriptions button', () => {
      renderVehicleFinder();
      expect(screen.getByRole('button', { name: /Manage Subscriptions/i })).toBeInTheDocument();
    });

    it('renders the vehicle number input with correct placeholder', () => {
      renderVehicleFinder();
      expect(
        screen.getByPlaceholderText(/Enter vehicle number/i)
      ).toBeInTheDocument();
    });
  });

  // ── Search tab toggle ──────────────────────────────────────────────────────

  describe('Search type toggle', () => {
    it('switches to phone search tab when clicked', async () => {
      renderVehicleFinder();
      const phoneBtn = screen.getByRole('button', { name: /Phone Number/i });
      await userEvent.click(phoneBtn);
      expect(phoneBtn).toHaveClass('bg-blue-500');
    });

    it('shows phone placeholder after switching to phone tab', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      expect(screen.getByPlaceholderText(/10-digit number/i)).toBeInTheDocument();
    });

    it('shows +91 prefix label after switching to phone tab', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      expect(screen.getByText('+91')).toBeInTheDocument();
    });

    it('clears input when switching from phone back to vehicle', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      await userEvent.click(screen.getByRole('button', { name: /Vehicle Number/i }));
      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  // ── Validation errors ──────────────────────────────────────────────────────

  describe('Validation', () => {
    it('shows error when searching with empty vehicle input', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));
      expect(screen.getByText(/Please enter a search value/i)).toBeInTheDocument();
    });

    it('shows error when phone tab has only the +91 prefix (no digits)', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));
      expect(screen.getByText(/Please enter a search value/i)).toBeInTheDocument();
    });

    it('does not call API when validation fails', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));
      expect(mockApiService.searchVehicleByNumber).not.toHaveBeenCalled();
    });
  });

  // ── Vehicle search ─────────────────────────────────────────────────────────

  describe('Vehicle number search', () => {
    it('calls searchVehicleByNumber with uppercased value', async () => {
      mockApiService.searchVehicleByNumber.mockResolvedValue(vehicleResult);
      const { onVehicleFound } = renderVehicleFinder();

      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      await userEvent.type(input, 'ka01ab1234');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() => {
        expect(mockApiService.searchVehicleByNumber).toHaveBeenCalledWith('KA01AB1234');
      });
      expect(onVehicleFound).toHaveBeenCalledWith(vehicleResult);
    });

    it('shows "No records found" error when API returns null', async () => {
      mockApiService.searchVehicleByNumber.mockResolvedValue(null);
      renderVehicleFinder();

      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      await userEvent.type(input, 'KA01AB0000');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() =>
        expect(screen.getByText(/No records found/i)).toBeInTheDocument()
      );
    });

    it('shows API error message when search throws', async () => {
      mockApiService.searchVehicleByNumber.mockRejectedValue(new Error('Network failure'));
      renderVehicleFinder();

      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      await userEvent.type(input, 'KA01AB1234');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() =>
        expect(screen.getByText(/Network failure/i)).toBeInTheDocument()
      );
    });

    it('shows "Searching..." on button while loading', async () => {
      // Never resolves so loading state persists
      mockApiService.searchVehicleByNumber.mockReturnValue(new Promise(() => {}));
      renderVehicleFinder();

      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      await userEvent.type(input, 'KA01AB1234');
      fireEvent.click(screen.getByRole('button', { name: /Search/i }));

      expect(await screen.findByText(/Searching\.\.\./i)).toBeInTheDocument();
    });

    it('disables the search button while loading', async () => {
      mockApiService.searchVehicleByNumber.mockReturnValue(new Promise(() => {}));
      renderVehicleFinder();

      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      await userEvent.type(input, 'KA01AB1234');
      fireEvent.click(screen.getByRole('button', { name: /Search/i }));

      const btn = await screen.findByRole('button', { name: /Searching/i });
      expect(btn).toBeDisabled();
    });

    it('triggers search when Enter key is pressed in the input', async () => {
      mockApiService.searchVehicleByNumber.mockResolvedValue(vehicleResult);
      renderVehicleFinder();

      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      await userEvent.type(input, 'KA01AB1234');
      fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });

      await waitFor(() =>
        expect(mockApiService.searchVehicleByNumber).toHaveBeenCalled()
      );
    });
  });

  // ── Phone search ───────────────────────────────────────────────────────────

  describe('Phone number search', () => {
    it('calls searchUserByPhone with +91 prefix', async () => {
      mockApiService.searchUserByPhone.mockResolvedValue(userResult);
      const { onVehicleFound } = renderVehicleFinder();

      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      const input = screen.getByPlaceholderText(/10-digit number/i);
      await userEvent.type(input, '9876543211');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() => {
        expect(mockApiService.searchUserByPhone).toHaveBeenCalledWith('+919876543211');
      });
      expect(onVehicleFound).toHaveBeenCalledWith(userResult);
    });

    it('shows error when phone search returns null', async () => {
      mockApiService.searchUserByPhone.mockResolvedValue(null);
      renderVehicleFinder();

      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      const input = screen.getByPlaceholderText(/10-digit number/i);
      await userEvent.type(input, '9000000000');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() =>
        expect(screen.getByText(/No records found/i)).toBeInTheDocument()
      );
    });

    it('strips non-numeric characters from phone input', async () => {
      mockApiService.searchUserByPhone.mockResolvedValue(userResult);
      renderVehicleFinder();

      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      const input = screen.getByPlaceholderText(/10-digit number/i);
      // Type with non-numeric chars — they should be stripped
      fireEvent.change(input, { target: { value: '98abc76543210' } });

      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() => {
        const calledWith = mockApiService.searchUserByPhone.mock.calls[0][0] as string;
        expect(calledWith).toMatch(/^\+91\d+$/);
      });
    });

    it('prevents backspace from deleting the +91 prefix', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Phone Number/i }));
      const input = screen.getByPlaceholderText(/10-digit number/i);

      // When searchValue is '+91' (length 3), pressing Backspace should be prevented
      fireEvent.keyDown(input, { key: 'Backspace' });
      // The prefix +91 label should still be in the DOM
      expect(screen.getByText('+91')).toBeInTheDocument();
    });
  });

  // ── Admin vs non-admin ─────────────────────────────────────────────────────

  describe('Admin access control', () => {
    it('shows active register button for admin user', () => {
      renderVehicleFinder({ email: 'catchprabhat@gmail.com' });
      const btn = screen.getByRole('button', { name: /New Customer\? Register Here$/i });
      expect(btn).not.toBeDisabled();
    });

    it('calls onNewCustomer when admin clicks register button', async () => {
      const { onNewCustomer } = renderVehicleFinder({ email: 'catchprabhat@gmail.com' });
      await userEvent.click(
        screen.getByRole('button', { name: /New Customer\? Register Here$/i })
      );
      expect(onNewCustomer).toHaveBeenCalledOnce();
    });

    it('shows disabled register button for non-admin user', () => {
      renderVehicleFinder({ email: 'regular@example.com' });
      const btn = screen.getByRole('button', { name: /Admin only/i });
      expect(btn).toBeDisabled();
    });

    it('does not call onNewCustomer when non-admin clicks the disabled button', async () => {
      const { onNewCustomer } = renderVehicleFinder({ email: 'regular@example.com' });
      const btn = screen.getByRole('button', { name: /Admin only/i });
      await userEvent.click(btn);
      expect(onNewCustomer).not.toHaveBeenCalled();
    });

    it('shows disabled register button when user is not logged in', () => {
      renderVehicleFinder({ email: null });
      expect(screen.getByRole('button', { name: /Admin only/i })).toBeDisabled();
    });

    it('recognises all three admin emails', () => {
      const adminEmails = [
        'catchprabhat@gmail.com',
        'umrsjd455@gmail.com',
        'umrsjd562@gmail.com',
      ];
      for (const email of adminEmails) {
        const { unmount } = renderVehicleFinder({ email });
        expect(
          screen.getByRole('button', { name: /New Customer\? Register Here$/i })
        ).not.toBeDisabled();
        unmount();
      }
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  describe('Navigation', () => {
    it('navigates to /subscriptions when Manage Subscriptions is clicked', async () => {
      renderVehicleFinder();
      await userEvent.click(screen.getByRole('button', { name: /Manage Subscriptions/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/subscriptions');
    });
  });

  // ── Error state cleared on new search ──────────────────────────────────────

  describe('Error state management', () => {
    it('clears a previous error when a new successful search is made', async () => {
      // First search → error
      mockApiService.searchVehicleByNumber.mockResolvedValueOnce(null);
      renderVehicleFinder();

      const input = screen.getByPlaceholderText(/Enter vehicle number/i);
      await userEvent.type(input, 'BADVALUE');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));
      await waitFor(() => expect(screen.getByText(/No records found/i)).toBeInTheDocument());

      // Second search → success
      mockApiService.searchVehicleByNumber.mockResolvedValueOnce(vehicleResult);
      await userEvent.clear(input);
      await userEvent.type(input, 'KA01AB1234');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() =>
        expect(screen.queryByText(/No records found/i)).not.toBeInTheDocument()
      );
    });
  });
});
