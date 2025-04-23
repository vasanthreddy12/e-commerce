import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/index.ts';
import { getMe } from '../store/slices/authSlice.ts';

export const useInitAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch the user data
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  return { isInitialized: !token || !!user };
}; 