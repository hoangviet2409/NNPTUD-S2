const Role = require('../models/Role');

// POST /roles - Tạo role mới
const createRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        const role = await Role.create({ name, description });
        return res.status(201).json({
            success: true,
            message: 'Tạo role thành công',
            data: role,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Tên role đã tồn tại' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /roles - Lấy tất cả roles (không bao gồm đã xoá mềm)
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: roles.length,
            data: roles,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /roles/:id - Lấy role theo ID
const getRoleById = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy role' });
        }
        return res.status(200).json({ success: true, data: role });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /roles/:id - Cập nhật role
const updateRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        const role = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { name, description },
            { new: true, runValidators: true }
        );

        if (!role) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy role' });
        }
        return res.status(200).json({
            success: true,
            message: 'Cập nhật role thành công',
            data: role,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Tên role đã tồn tại' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /roles/:id - Xoá mềm role
const deleteRole = async (req, res) => {
    try {
        const role = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!role) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy role' });
        }
        return res.status(200).json({
            success: true,
            message: 'Xoá role thành công (soft delete)',
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createRole, getAllRoles, getRoleById, updateRole, deleteRole };
