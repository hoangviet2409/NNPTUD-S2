const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    enableUser,
    disableUser,
} = require('../controllers/userController');

// Special endpoints - phải đặt TRƯỚC /:id để tránh conflict
router.post('/enable', enableUser);
router.post('/disable', disableUser);

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
