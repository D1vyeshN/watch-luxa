import { Router, type Router as RouterType } from 'express';
import { adminHomepageController } from '@controllers/admin/homepage.controller';
import { validate } from '@middleware/validate.middleware';
import { updateHeroSchema } from '@validators/homepage.validator';

const router: RouterType = Router();

// Marketing content — any admin can edit (unlike /settings)
router.get('/', adminHomepageController.get);
router.put('/hero', validate(updateHeroSchema), adminHomepageController.updateHero);

export default router;
