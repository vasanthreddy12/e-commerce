import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { useCart } from '../hooks/useCart.ts';
import { useOrder } from '../hooks/useOrder.ts';
import { shippingAddressSchema } from '../utils/validation.ts';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { createNewOrder, loading, error } = useOrder();

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (values: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) => {
    try {
      // Create the order
      const result = await createNewOrder(values);
      
      if (result.success) {
        navigate('/order-success');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const subtotal = cart.total;
  const shipping = subtotal > 1000 ? 0 : 100;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Shipping Address</h2>

            <Formik
              initialValues={{
                address: '',
                city: '',
                postalCode: '',
                country: '',
              }}
              validationSchema={shippingAddressSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="address" className="label">
                      Street Address
                    </label>
                    <Field
                      id="address"
                      name="address"
                      type="text"
                      className="input mt-1"
                    />
                    {errors.address && touched.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="label">
                      City
                    </label>
                    <Field
                      id="city"
                      name="city"
                      type="text"
                      className="input mt-1"
                    />
                    {errors.city && touched.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="label">
                      Postal Code
                    </label>
                    <Field
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      className="input mt-1"
                    />
                    {errors.postalCode && touched.postalCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="label">
                      Country
                    </label>
                    <Field
                      id="country"
                      name="country"
                      type="text"
                      className="input mt-1"
                    />
                    {errors.country && touched.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                    )}
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-4"
                >
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-auto h-[150px] object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Payment Method: Cash on Delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 