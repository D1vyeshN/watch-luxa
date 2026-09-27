import { Router } from 'express';
import { apiLimiter } from '@middleware/rateLimit.middleware';

import { storefrontProductController } from '@controllers/storefront/product.controller';
import { storefrontBrandController } from '@controllers/storefront/brand.controller';
import { storefrontCategoryController } from '@controllers/storefront/category.controller';
import { storefrontCollectionController } from '@controllers/storefront/collection.controller';
import { storefrontHomeController } from '@controllers/storefront/home.controller';
import { storefrontSearchController } from '@controllers/storefront/search.controller';

// ─── Products Router ───
const productRouter = Router();
productRouter.get('/', storefrontProductController.list);
productRouter.get('/new-arrivals', storefrontProductController.newArrivals);
productRouter.get('/featured', storefrontProductController.featured);
productRouter.get('/trending', storefrontProductController.trending);
productRouter.get('/compare', storefrontProductController.compare);
productRouter.get('/:slug', storefrontProductController.getBySlug);
productRouter.get('/:slug/related', storefrontProductController.related);

// ─── Brands Router ───
const brandRouter = Router();
brandRouter.get('/', storefrontBrandController.list);
brandRouter.get('/:slug', storefrontBrandController.getBySlug);

// ─── Categories Router ───
const categoryRouter = Router();
categoryRouter.get('/', storefrontCategoryController.list);
categoryRouter.get('/:slug', storefrontCategoryController.getBySlug);

// ─── Collections Router ───
const collectionRouter = Router();
collectionRouter.get('/', storefrontCollectionController.list);
collectionRouter.get('/:slug', storefrontCollectionController.getBySlug);

// ─── Search Router ───
const searchRouter = Router();
searchRouter.get('/', storefrontSearchController.search);
searchRouter.get('/autocomplete', storefrontSearchController.autocomplete);

// ─── Home Router ───
const homeRouter = Router();
homeRouter.get('/', storefrontHomeController.index);

// ─── Storefront Root ───
const storefrontRouter: Router = Router();

// Rate limiting for all public routes
storefrontRouter.use(apiLimiter);

storefrontRouter.use('/products', productRouter);
storefrontRouter.use('/brands', brandRouter);
storefrontRouter.use('/categories', categoryRouter);
storefrontRouter.use('/collections', collectionRouter);
storefrontRouter.use('/search', searchRouter);
storefrontRouter.use('/home', homeRouter);

export default storefrontRouter;
