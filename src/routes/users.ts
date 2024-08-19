import { Router } from 'express';
import UserController from '../controller/user';
import check from '../middlewares/auth';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.put('/update', check.auth, UserController.update);

export default router;