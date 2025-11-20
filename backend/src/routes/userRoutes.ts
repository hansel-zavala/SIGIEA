// backend/src/routes/userRoutes.ts
import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

import { validate } from '../middleware/validationMiddleware.js';
import { validateRegister, validateLogin } from '../validators/userValidator.js';

const router = express.Router();

router.post('/register', 
  validateRegister, 
  validate, 
  registerUser
);

router.post('/login', 
  validateLogin, 
  validate, 
  loginUser
);

router.get('/profile', 
  protect, 
  getUserProfile
);

export default router;