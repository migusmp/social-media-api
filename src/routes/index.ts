import { Router } from 'express';
import UsersRouter from './users';
import FollowsRouter from './follow';
import PostRouter from './post';

const router = Router();

router.use('/user', UsersRouter);
router.use('/post', PostRouter);
router.use('/follows', FollowsRouter);

export default router;
