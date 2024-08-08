import { Router } from 'express';
import UserController from '../controller/user';

const router = Router();

router.post('/register', UserController.register);

export default router;