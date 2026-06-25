import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import config from "../config/config.js";
import sendEmail from "../utils/sendEmail.js";


export async function registerUser(req, res) {
    const {fullName, username, email, password } = req.body;

    const isAlreadyExist = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (isAlreadyExist) {
       if (existingUser.username === username) {
                return res.status(409).json({ message: "This username is already taken. Please choose another." });
            }
            if (existingUser.email === email) {
                return res.status(409).json({ message: "An account with this email already exists." });
            }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePicUrl = `https://ui-avatars.com/api/?name=${username.replace(/\s+/g, '+')}&background=random&color=fff`;

    const user = await userModel.create({
        fullName,
        username,
        email,
        password: hashedPassword,
        profilePic: profilePicUrl 
    });

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
    {
        expiresIn: "7d"
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
    {
        expiresIn: "15m"
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 
    })

    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic 
        },
        accessToken
    })
}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
    {
        expiresIn: "7d"
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
    {
        expiresIn: "15m"
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 
    })

    res.status(200).json({
        message: "Logged in successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic 
        },
        accessToken,
    })
}

export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "User is not authorized"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic
            }
        });

    } catch (error) {
        return res.status(401).json({
            message: error.name === "TokenExpiredError"
                ? "Access token expired"
                : "Invalid token"
        });
    }
}

export async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found"
            })
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoked: false
        })

        if (!session) {
            return res.status(401).json({
                message: "Invalid refresh token"
            })
        }

        const accessToken = jwt.sign({
            id: decoded.id,
            sessionId: session._id
        }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        })

        const newRefreshToken = jwt.sign({
            id: decoded.id
        }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        })

        const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        })
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

            const session = await sessionModel.findOne({
                refreshTokenHash,
                revoked: false
            });

            if (session) {
                session.revoked = true;
                await session.save();
            }
        }

        res.clearCookie("refreshToken");
        
        return res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        res.clearCookie("refreshToken");
        return res.status(500).json({ message: "Server error during logout" });
    }
}

export async function logoutAll(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

            await sessionModel.updateMany({
                user: decoded.id,
                revoked: false
            }, {
                revoked: true
            });
        }

        res.clearCookie("refreshToken");
        
        return res.status(200).json({
            message: "Logged out from all devices successfully"
        });
    } catch (error) {
        res.clearCookie("refreshToken");
        return res.status(400).json({ message: "Invalid token or already logged out" });
    }
}

export async function deleteAllUsers(req, res) {
    try {
        await userModel.deleteMany({});
        await sessionModel.deleteMany({});
        
        res.status(200).json({
            message: "Database completely wiped. All users and sessions deleted."
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during deletion" });
    }
}

export async function googleCallback(req, res) {
    try {
        const user = req.user; 

        const accessToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, // Make sure this matches your config variable
            { expiresIn: "15m" } // Access tokens should be short-lived
        );

        const refreshToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || "OAuth-Google" 
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // Must be true when sameSite is "none"
            sameSite: "none", 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        const userString = encodeURIComponent(JSON.stringify(user));

        res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/?token=${accessToken}&user=${userString}`);
        
    } catch (error) {
        console.error("Google Callback Error:", error);
        res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`);
    }
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

        const emailTemplate = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #eaeaea;">
                <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Reset your password</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.username},</p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">We received a request to reset the password for your Maeve account. Click the button below to set up a new password. This link is valid for 15 minutes.</p>
                <a href="${resetURL}" style="display: block; width: 100%; text-align: center; background-color: #8b5cf6; color: #ffffff; padding: 14px 0; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 32px;">Reset Password</a>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; border-top: 1px solid #eaeaea; padding-top: 24px; margin-bottom: 0;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">&copy; ${new Date().getFullYear()} Maeve. All rights reserved.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Reset your Maeve password",
                message: emailTemplate,
            });

            res.status(200).json({ message: "If that email exists, a reset link has been sent." });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            
            return res.status(500).json({ message: "There was an error sending the email. Try again later." });
        }

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export async function resetPassword(req, res) {
    try {
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired" });
        }

        const { password } = req.body;
        user.password = await bcrypt.hash(password, 10);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password" });
    }
}