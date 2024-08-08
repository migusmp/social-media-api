import { Router } from 'express';
import UsersRouter from './users';

const router = Router();

router.use('/user', UsersRouter);

export default router;