import { Router } from 'express';
import UserController from '../controller/user';
import check from '../middlewares/auth';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, "./src/uploads/users")
    },
    filename: (_req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    } 
})

const upload = multer({ storage: storage });

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.put('/update', check.auth, UserController.update);
router.post('/upload', [ check.auth, upload.single("file0") ], UserController.upload);
router.get('/list/:page?', UserController.usersList);

export default router;