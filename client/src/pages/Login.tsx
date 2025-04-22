import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import { loginSchema } from '../utils/validation';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Or{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await dispatch(login(values)).unwrap();
              navigate('/');
            } catch (error) {
              console.error('Login failed:', error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="input mt-1"
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="input mt-1"
                />
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login; 