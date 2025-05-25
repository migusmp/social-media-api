import { Router } from 'express';
import check from '../middlewares/auth';
import FollowsController from '../controller/follow';

const router = Router();

router.post("/follow/:userId", check.auth, FollowsController.follow);
router.delete("/unfollow/:userId", check.auth, FollowsController.unfollow);

export default router;
