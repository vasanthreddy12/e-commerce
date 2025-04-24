import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { register } from '../store/slices/authSlice.ts';
import { registerSchema } from '../utils/validation.ts';
import { useAuth } from '../hooks/useAuth.ts';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Or{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={registerSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const { confirmPassword, ...registerData } = values;
              await dispatch(register(registerData)).unwrap();
              navigate('/');
            } catch (error) {
              console.error('Registration failed:', error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="input mt-1 pl-3"
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="input mt-1 pl-3"
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
                  autoComplete="new-password"
                  className="input mt-1 pl-3"
                />
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="input mt-1 pl-3"
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register; 