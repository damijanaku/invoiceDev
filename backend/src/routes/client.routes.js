import express from 'express';
import authenticateToken from "../middleware/auth.middleware.js"; 
import {
    addClient,
    updateClient,
    deleteClient,
    getClients,
    getClientById
} from "../controllers/clients.controller.js";

const router = express.Router();

router.get('/', authenticateToken, getClients);
router.get('/:id', authenticateToken, getClientById);
router.post('/', authenticateToken, addClient);
router.put('/:id', authenticateToken, updateClient);
router.delete('/:id', authenticateToken, deleteClient);

export default router;