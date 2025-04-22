import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const productSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .required('Description is required'),
  price: Yup.number()
    .min(0, 'Price must be greater than or equal to 0')
    .required('Price is required'),
  category: Yup.string()
    .oneOf(['electronics', 'clothing', 'books', 'home', 'sports', 'other'], 'Invalid category')
    .required('Category is required'),
  image: Yup.string()
    .url('Must be a valid URL')
    .required('Image URL is required'),
  stock: Yup.number()
    .min(0, 'Stock must be greater than or equal to 0')
    .required('Stock is required'),
});

export const shippingAddressSchema = Yup.object().shape({
  address: Yup.string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),
  city: Yup.string()
    .min(2, 'City must be at least 2 characters')
    .required('City is required'),
  postalCode: Yup.string()
    .matches(/^[0-9]+$/, 'Postal code must be numeric')
    .min(5, 'Postal code must be at least 5 characters')
    .required('Postal code is required'),
  country: Yup.string()
    .min(2, 'Country must be at least 2 characters')
    .required('Country is required'),
}); 