import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('journiq_token'),
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      api.getProfile()
        .then(user => dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: state.token } }))
        .catch(() => {
          localStorage.removeItem('journiq_token');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await api.login({ email, password });
      localStorage.setItem('journiq_token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await api.register({ name, email, password, phone });
      localStorage.setItem('journiq_token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('journiq_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
