import { Router, type Router as RouterType } from 'express';
import { addressController } from '@controllers/address.controller';
import { authenticate } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import {
  addAddressSchema,
  updateAddressSchema,
} from '@validators/order.validator';

const router: RouterType = Router();

router.use(authenticate);

router.get('/', addressController.list);
router.post('/', validate(addAddressSchema), addressController.add);
router.put(
  '/:addressId',
  validate(updateAddressSchema),
  addressController.update
);
router.delete('/:addressId', addressController.remove);
router.patch('/:addressId/default', addressController.setDefault);

export default router;
