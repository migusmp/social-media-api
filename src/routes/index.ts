import { Router } from 'express';
import UsersRouter from './users';
import FollowsRouter from './follow';

const router = Router();

router.use('/user', UsersRouter);
router.use('/follows', FollowsRouter);

export default router;