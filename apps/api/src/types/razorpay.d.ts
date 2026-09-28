declare module 'razorpay' {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface OrderCreateOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }

  interface Order {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }

  interface RazorpayInstance {
    orders: {
      create(options: OrderCreateOptions): Promise<Order>;
    };
  }

  function Razorpay(options: RazorpayOptions): RazorpayInstance;

  export = Razorpay;
}
