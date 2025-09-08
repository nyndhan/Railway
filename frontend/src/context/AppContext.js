import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  user: null,
  components: [],
  analytics: null,
  loading: false,
  error: null,
  settings: {
    theme: 'light',
    autoRefresh: true,
    refreshInterval: 30000,
    notifications: true
  }
};

// Action types
export const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
  SET_COMPONENTS: 'SET_COMPONENTS',
  SET_ANALYTICS: 'SET_ANALYTICS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };
      
    case ActionTypes.SET_COMPONENTS:
      return {
        ...state,
        components: action.payload
      };
      
    case ActionTypes.SET_ANALYTICS:
      return {
        ...state,
        analytics: action.payload
      };
      
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const setUser = (user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  };

  const setComponents = (components) => {
    dispatch({ type: ActionTypes.SET_COMPONENTS, payload: components });
  };

  const setAnalytics = (analytics) => {
    dispatch({ type: ActionTypes.SET_ANALYTICS, payload: analytics });
  };

  const updateSettings = (settings) => {
    dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
  };

  const value = {
    state,
    setLoading,
    setError,
    clearError,
    setUser,
    setComponents,
    setAnalytics,
    updateSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
