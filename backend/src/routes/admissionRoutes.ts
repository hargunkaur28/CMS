import express from 'express';
import { 
  createEnquiry, 
  getAdmissions, 
  updateAdmissionStatus, 
  enrollStudent 
} from '../controllers/admissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for enquiries
router.post('/enquiry', createEnquiry);

// Admin routes for managing admissions
router.get('/', protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), getAdmissions);
router.patch('/:id/status', protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), updateAdmissionStatus);
router.post('/:id/enroll', protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN'), enrollStudent);

export default router;
