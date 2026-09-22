import express from 'express';
import authenticateToken from "../middleware/auth.middleware.js";
import {
    addBusiness,
    editBusiness,
    deleteBusiness,
    getBusinesses,
    getBusiness
} from '../controllers/business.controller.js';

const router = express.Router();

router.get('/',        authenticateToken, getBusinesses);
router.get('/:id',     authenticateToken, getBusiness);  
router.post('/',       authenticateToken, addBusiness);
router.put('/:id',     authenticateToken, editBusiness);
router.delete('/:id',  authenticateToken, deleteBusiness);

export default router;