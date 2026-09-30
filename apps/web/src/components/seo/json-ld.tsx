interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Helper builders ───

export function buildOrganizationJsonLd(siteUrl: string, siteName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    sameAs: [
      'https://instagram.com/luxe',
      'https://twitter.com/luxe',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'hello@luxe.com',
        availableLanguage: ['English', 'Hindi'],
      },
    ],
  };
}

export function buildWebsiteJsonLd(siteUrl: string, siteName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildProductJsonLd(input: {
  name: string;
  description: string;
  image: string[];
  slug: string;
  sku: string;
  brandName: string;
  price: number;
  currency: string;
  inStock: boolean;
  siteUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.image,
    sku: input.sku,
    brand: {
      '@type': 'Brand',
      name: input.brandName,
    },
    offers: {
      '@type': 'Offer',
      url: `${input.siteUrl}/product/${input.slug}`,
      priceCurrency: input.currency,
      price: (input.price / 100).toFixed(2),
      availability: input.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
