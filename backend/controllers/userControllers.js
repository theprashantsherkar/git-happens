import { User } from '../models/userModels.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
};

const sendToken = (user, statusCode, res, message) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    user.password = undefined; // strip password before sending
    return res.status(statusCode).cookie('token', token, COOKIE_OPTIONS).json({
        success: true,
        message,
        user,
        token,
    });
};


// ─── GET / ─────────────────────────────────────────────────────────────────────

export async function landingAPI(req, res) {
    return res.status(200).json({
        success: true,
        message: 'Hello World',
    });
}


// ─── POST /register ────────────────────────────────────────────────────────────

export async function registerUserController(req, res) {
    try {
        const { username, email, role, password } = req.body;

        // Fix: was using bitwise | instead of logical ||
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields',
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Username';
            return res.status(409).json({
                success: false,
                message: `${field} is already registered`,
            });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        // Fix: was saving 'name' instead of 'username', and not saving 'role'
        const newUser = await User.create({
            username,
            email,
            password: hashedPass,
            role: role || 'user',
        });

        return sendToken(newUser, 201, res, 'User registered successfully');
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        console.error('registerUserController:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


// ─── POST /login ───────────────────────────────────────────────────────────────

export async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        // Fix: was using bitwise | instead of logical ||
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the fields',
            });
        }

        // Explicitly select password (schema should have select: false)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid email or password', // intentionally vague for security
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        return sendToken(user, 200, res, 'User logged in successfully');
    } catch (error) {
        console.error('loginController:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


// ─── POST /logout ──────────────────────────────────────────────────────────────

export function logoutController(req, res) {
    return res
        .cookie('token', null, {
            httpOnly: true,
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: 'User logged out successfully',
        });
}


// ─── POST /change-password  (protected — attach isAuthenticated middleware) ────

export async function changePasswordController(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both current and new password',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password',
            });
        }

        // req.user is set by the isAuthenticated middleware
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('changePasswordController:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


// ─── GET /profile/:id ─────────────────────────────────────────────────────────

export async function getUserProfile(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User id is required',
            });
        }

        // Validate that id is a valid ObjectId before hitting the DB
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user id format',
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User found successfully',
            user,
        });
    } catch (error) {
        console.error('getUserProfile:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


// ─── PUT /profile  (protected — attach isAuthenticated middleware) ─────────────

export async function updateUserProfile(req, res) {
    try {
        const { username, email, avatar } = req.body;

        const updates = {};
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (avatar) updates.avatar = avatar;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No update fields provided',
            });
        }

        // Check for conflicts on unique fields against other users
        if (updates.email || updates.username) {
            const conflict = await User.findOne({
                _id: { $ne: req.user.id },
                $or: [
                    ...(updates.email ? [{ email: updates.email }] : []),
                    ...(updates.username ? [{ username: updates.username }] : []),
                ],
            });
            if (conflict) {
                const field = conflict.email === updates.email ? 'Email' : 'Username';
                return res.status(409).json({
                    success: false,
                    message: `${field} is already taken`,
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        console.error('updateUserProfile:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}