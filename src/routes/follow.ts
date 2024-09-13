import { Router } from 'express';
import check from '../middlewares/auth';
import FollowsController from '../controller/follow';

const router = Router();

router.post("/follow/:userFollowdId", check.auth, FollowsController.follow);
router.delete("/unfollow/:userUnfollowed", check.auth, FollowsController.unfollow);

export default router;