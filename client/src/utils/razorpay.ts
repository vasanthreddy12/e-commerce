declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = (options: RazorpayOptions) => {
  const rzp = new window.Razorpay(options);
  rzp.open();
};

export const createRazorpayOptions = (
  order: any,
  user: any,
  onSuccess: (response: any) => void
): RazorpayOptions => {
  return {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
    amount: order.amount,
    currency: order.currency,
    name: 'E-commerce Store',
    description: `Order #${order.receipt}`,
    order_id: order.id,
    handler: onSuccess,
    prefill: {
      name: user.name,
      email: user.email,
    },
    theme: {
      color: '#0284c7',
    },
  };
}; 