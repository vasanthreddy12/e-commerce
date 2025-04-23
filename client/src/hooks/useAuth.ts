import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/index.ts';
import { getMe, logout as logoutAction } from '../store/slices/authSlice.ts';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading, error } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  const logout = () => {
    dispatch(logoutAction());
  };

  return { 
    user,
    token,
    loading,
    error,
    logout,
    isAuthenticated: token && user,
    isAdmin: user?.role === 'admin',
  };
}; 