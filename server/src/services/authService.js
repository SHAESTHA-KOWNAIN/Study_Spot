
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "1d";

function createToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        { sub: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
    };
}

async function register({ name, email, password }) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
        const error = new Error(
            "An account with this email already exists. Please log in instead."
        );
        error.status = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "member"
    });

    return {
        token: createToken(user),
        user: publicUser(user)
    };
}

async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail })
        .select("+passwordHash");

    // Case 1: Email is not registered
    if (!user) {
        const error = new Error(
            "No account found with this email. Please register first."
        );
        error.status = 401;
        error.code = "EMAIL_NOT_REGISTERED";
        throw error;
    }

    // Case 2: Email exists, but password is incorrect
    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error(
            "Incorrect password. Please try again."
        );
        error.status = 401;
        error.code = "INVALID_PASSWORD";
        throw error;
    }

    // Case 3: Login successful
    return {
        token: createToken(user),
        user: publicUser(user)
    };
}

module.exports = { register, login };
