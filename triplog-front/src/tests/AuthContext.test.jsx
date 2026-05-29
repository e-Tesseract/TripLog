import { render, screen, act } from '@testing-library/react';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import axios from '../api/axios';
import '@testing-library/jest-dom';

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}));

function TestComponent() {
  const { user, loading, error } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? 'null'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('démarre sans utilisateur connecté', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it(`connecte l'utilisateur après login`, async () => {
    axios.post.mockResolvedValueOnce({
      data: { user: { email: 'test@test.com' }, token: 'fake.jwt.token' },
    });

    let loginFn;
    function CaptureLogin() {
      const { login } = useContext(AuthContext);
      loginFn = login;
      return null;
    }

    render(
      <AuthProvider>
        <TestComponent />
        <CaptureLogin />
      </AuthProvider>
    );

    await act(async () => {
      await loginFn({ email: 'test@test.com', password: '123' });
    });

    expect(screen.getByTestId('user').textContent).toBe('test@test.com');
  });

  it('stocke le token dans localStorage après login', async () => {
    axios.post.mockResolvedValueOnce({
      data: { user: { email: 'test@test.com' }, token: 'fake.jwt.token' },
    });

    let loginFn;
    function CaptureLogin() {
      const { login } = useContext(AuthContext);
      loginFn = login;
      return null;
    }

    render(
      <AuthProvider>
        <CaptureLogin />
      </AuthProvider>
    );

    await act(async () => {
      await loginFn({ email: 'test@test.com', password: '123' });
    });

    expect(localStorage.getItem('token')).toBe('fake.jwt.token');
  });

  it('expose une erreur si le login échoue', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Identifiants invalides' } },
    });

    let loginFn;
    function CaptureLogin() {
      const { login } = useContext(AuthContext);
      loginFn = login;
      return null;
    }

    render(
      <AuthProvider>
        <TestComponent />
        <CaptureLogin />
      </AuthProvider>
    );

    await act(async () => {
      await loginFn({ email: 'x', password: 'y' });
    });

    expect(screen.getByTestId('error').textContent).toBe('Identifiants invalides');
  });

  it(`déconnecte l'utilisateur et vide le localStorage`, async () => {
    axios.post.mockResolvedValueOnce({
      data: { user: { email: 'test@test.com' }, token: 'fake.jwt.token' },
    });

    let loginFn;
    let logoutFn;
    function CaptureAuth() {
      const { login, logout } = useContext(AuthContext);
      loginFn = login;
      logoutFn = logout;
      return null;
    }

    render(
      <AuthProvider>
        <TestComponent />
        <CaptureAuth />
      </AuthProvider>
    );

    await act(async () => {
      await loginFn({ email: 'test@test.com', password: '123' });
    });

    act(() => {
      logoutFn();
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
