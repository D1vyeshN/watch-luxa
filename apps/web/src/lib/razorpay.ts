declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

let isLoaded = false;

export async function loadRazorpay(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isLoaded || window.Razorpay) {
    isLoaded = true;
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      isLoaded = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface OpenRazorpayParams {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

export async function openRazorpay(
  params: OpenRazorpayParams
): Promise<void> {
  const loaded = await loadRazorpay();
  if (!loaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  const rzp = new window.Razorpay({
    key: params.keyId,
    amount: params.amount,
    currency: params.currency,
    name: 'LUXE',
    description: `Order ${params.orderNumber}`,
    order_id: params.razorpayOrderId,
    prefill: {
      name: params.customerName,
      email: params.customerEmail,
      contact: params.customerPhone,
    },
    theme: {
      color: '#0f2320',
    },
    handler: params.onSuccess,
    modal: {
      ondismiss: params.onDismiss,
    },
  });

  rzp.open();
}
