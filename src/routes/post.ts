import { Router } from 'express';
import PostController from '../controller/post';
import check from '../middlewares/auth';

const router = Router();

router.post('/create', check.auth, PostController.create);
router.delete('/delete/:postId', check.auth, PostController.delete);
router.put('/update/:postId', check.auth, PostController.update);

export default router;
