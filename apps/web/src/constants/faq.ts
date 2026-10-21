// Shared by the FAQ page and the homepage FAQ section
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  category: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    category: 'Authenticity',
    items: [
      {
        q: 'Are all watches authentic?',
        a: 'Yes. Every piece we sell is authenticated by our in-house team before it ships. We do not stock replicas, homages, or unauthorised editions.',
      },
      {
        q: 'Do watches come with original box and papers?',
        a: 'Unless explicitly stated otherwise on the product page, every watch includes its original box, papers, and warranty card where applicable.',
      },
      {
        q: 'How can I verify authenticity?',
        a: 'Each order includes a LUXE certificate of authenticity. You can also verify serial numbers with the original manufacturer.',
      },
    ],
  },
  {
    category: 'Shipping',
    items: [
      {
        q: 'How long does shipping take?',
        a: 'Domestic orders ship within 2 business days and arrive in 3-5 business days. International orders take 5-10 business days.',
      },
      {
        q: 'Is shipping insured?',
        a: 'Yes. Every order is fully insured against loss and damage during transit, at no additional cost.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes. We ship to most countries. Duties and taxes are the responsibility of the recipient.',
      },
    ],
  },
  {
    category: 'Returns',
    items: [
      {
        q: 'What is your return policy?',
        a: 'You have 14 days from delivery to return unworn pieces in original packaging. Custom or engraved pieces are final sale.',
      },
      {
        q: 'Who pays return shipping?',
        a: 'Customers cover return shipping unless the item arrived damaged or is not as described.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Refunds are processed within 5 business days of receiving the returned item. Bank processing times vary.',
      },
    ],
  },
  {
    category: 'Warranty',
    items: [
      {
        q: 'Do watches carry a warranty?',
        a: 'Yes. Manufacturer warranties apply where offered. LUXE also offers a 12-month service guarantee on every piece.',
      },
      {
        q: 'Does the warranty cover accidental damage?',
        a: 'No. Warranties cover manufacturing defects only. Accidental damage, water damage from misuse, and normal wear are not covered.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards, UPI, netbanking, and wallets via Razorpay, and international cards via Stripe.',
      },
      {
        q: 'Is payment secure?',
        a: 'Yes. All payments are processed by PCI-DSS certified gateways. We never see or store your card details.',
      },
      {
        q: 'Do you offer EMI?',
        a: 'EMI is available on select cards via Razorpay at checkout.',
      },
    ],
  },
];
