import { ROUTES } from '@/constants/routes';
import { BENTO_CATEGORY_SLUGS, CATEGORY_ART, HOME_ART } from '@/constants/home-art';
import type { HomeSection } from '@/types/home';

/**
 * The homepage below the hero, as shipped. Used until sections are saved in
 * admin → Homepage, and as the starting point the admin editor loads.
 * Keep in step with DEFAULT_HOME_SECTIONS in apps/api/src/models/homepage.model.ts.
 */
export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  {
    id: 'collection-grid',
    type: 'categoryBento',
    enabled: true,
    title: 'Explore the Collection',
    description: 'From slim dress pieces to tool watches built for depth and altitude.',
    tiles: BENTO_CATEGORY_SLUGS.map((slug) => ({ categorySlug: slug, imageUrl: CATEGORY_ART[slug] })),
  },
  {
    id: 'featured',
    type: 'productRail',
    enabled: true,
    title: 'Featured Watches',
    description: 'Chosen by our horologists this season.',
    source: 'featured',
    limit: 4,
    viewAll: { label: 'View all', href: `${ROUTES.shop}?featured=true` },
  },
  {
    id: 'maison',
    type: 'maison',
    enabled: true,
    headline: 'Every watch passes a watchmaker’s bench',
    body: 'Before a piece reaches you, our in-house team opens the paperwork, checks the serial and inspects the movement. It is the slow part of what we do, and the part we will never hurry.',
    imageUrl: HOME_ART.maison,
    pillars: [
      { title: 'Authenticated in-house', body: 'No replicas, homages or unauthorised editions. Ever.' },
      { title: 'Box and papers', body: 'Original box, papers and warranty card, unless stated otherwise.' },
      { title: '12-month guarantee', body: 'Our own service guarantee, on top of any manufacturer warranty.' },
    ],
    cta: { label: 'Our story', href: ROUTES.about },
  },
  {
    id: 'heritage-elan',
    type: 'editorial',
    enabled: true,
    variant: 'immersive',
    headline: 'Heritage Élan',
    body: "A tribute to the maison's earliest commission. Hand-finished bridges, mirror-polished cases, and dials that catch light the way water catches the sun.",
    imageUrl: HOME_ART.editorial,
    cta: { label: 'Explore heritage', href: ROUTES.craftsmanship },
  },
  {
    id: 'new-arrivals',
    type: 'productRail',
    enabled: true,
    title: 'New Arrivals',
    description: 'The latest additions to the collection.',
    source: 'newest',
    limit: 4,
    viewAll: { label: 'View all', href: ROUTES.newArrivals },
  },
  {
    id: 'services',
    type: 'services',
    enabled: true,
    title: 'Bought with care, delivered with care',
    description: 'The service around the watch matters as much as the watch.',
    backgroundImage: HOME_ART.services,
    services: [
      {
        title: 'Insured delivery',
        body: 'Every order is fully insured in transit and needs a signature on arrival.',
        link: { label: 'Shipping details', href: ROUTES.shipping },
      },
      {
        title: 'Private viewing',
        body: 'A one-on-one session with a LUXE specialist. See pieces up close, try them on, and ask anything.',
        link: { label: 'Book a viewing', href: ROUTES.privateViewing },
      },
      {
        title: '14-day returns',
        body: 'Changed your mind? Return an unworn piece in its original packaging within 14 days.',
        link: { label: 'Returns policy', href: ROUTES.returns },
      },
    ],
  },
  {
    id: 'faq',
    type: 'faq',
    enabled: true,
    title: 'Questions, answered',
    description: 'What people usually ask before buying their first piece from us.',
    questions: [
      'Are all watches authentic?',
      'Do watches come with original box and papers?',
      'Is shipping insured?',
      'What is your return policy?',
      'Do watches carry a warranty?',
    ],
  },
];
