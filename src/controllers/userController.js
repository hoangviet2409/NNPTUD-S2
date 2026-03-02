const User = require('../models/User');

// POST /users - Tạo user mới
const createUser = async (req, res) => {
    try {
        const { username, password, email, fullName, avatarUrl, role } = req.body;

        const user = await User.create({ username, password, email, fullName, avatarUrl, role });
        return res.status(201).json({
            success: true,
            message: 'Tạo user thành công',
            data: user,
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, message: `${field} đã tồn tại` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /users - Lấy tất cả users (không bao gồm đã xoá mềm)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false })
            .populate('role', 'name description')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /users/:id - Lấy user theo ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate(
            'role',
            'name description'
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /users/:id - Cập nhật user
const updateUser = async (req, res) => {
    try {
        const { username, email, fullName, avatarUrl, role, loginCount } = req.body;

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { username, email, fullName, avatarUrl, role, loginCount },
            { new: true, runValidators: true }
        ).populate('role', 'name description');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
        }
        return res.status(200).json({
            success: true,
            message: 'Cập nhật user thành công',
            data: user,
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, message: `${field} đã tồn tại` });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /users/:id - Xoá mềm user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
        }
        return res.status(200).json({
            success: true,
            message: 'Xoá user thành công (soft delete)',
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// POST /users/enable - Kích hoạt user (status -> true)
const enableUser = async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res
                .status(400)
                .json({ success: false, message: 'Vui lòng cung cấp email và username' });
        }

        const user = await User.findOne({ email, username, isDeleted: false });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'Không tìm thấy user với email và username đã cung cấp' });
        }

        if (user.status === true) {
            return res.status(400).json({ success: false, message: 'User đã được kích hoạt rồi' });
        }

        user.status = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Kích hoạt user thành công',
            data: { id: user._id, username: user.username, email: user.email, status: user.status },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// POST /users/disable - Vô hiệu hoá user (status -> false)
const disableUser = async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res
                .status(400)
                .json({ success: false, message: 'Vui lòng cung cấp email và username' });
        }

        const user = await User.findOne({ email, username, isDeleted: false });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'Không tìm thấy user với email và username đã cung cấp' });
        }

        if (user.status === false) {
            return res.status(400).json({ success: false, message: 'User đã bị vô hiệu hoá rồi' });
        }

        user.status = false;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Vô hiệu hoá user thành công',
            data: { id: user._id, username: user.username, email: user.email, status: user.status },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, enableUser, disableUser };
