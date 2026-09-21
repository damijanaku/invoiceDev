import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const toPublicUser = ({ password_hash, ...rest }) => rest;

export const register = async function (req, res) {
  const { email, fullName, password } = req.body;

  if (!email || !fullName || !password) {
    return res
      .status(400)
      .json({ message: 'Email, full name, and password are required' });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await req.db.query(
      `INSERT INTO users (email, full_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name AS "fullName", created_at AS "createdAt"`,
      [email, fullName, hashedPassword]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: toPublicUser(result.rows[0]),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists' });
    }

    console.error('register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async function (req, res) {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const result = await req.db.query(
        `SELECT id, email, full_name, password_hash
           FROM users
          WHERE email = $1`,
        [email]
      );
  
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const payload = { id: user.id, email: user.email };
  
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });
  
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });
  
      const refreshTokenHash = hashToken(refreshToken);
  
      await req.db.query(
        `UPDATE users
            SET refresh_token_hash = $1
          WHERE id = $2`,
        [refreshTokenHash, user.id]
      );
  
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',          
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });
  
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
        },
        accessToken, 
      });
    } catch (error) {
      console.error('login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
};

export const refresh = async function (req, res) {
    const token = req.cookies?.refresh_token;
  
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  
      const result = await req.db.query(
        `SELECT id, email, full_name, refresh_token_hash
           FROM users
          WHERE id = $1`,
        [decoded.id]
      );
  
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
  
      const user = result.rows[0];
  
      if (user.refresh_token_hash !== hashToken(token)) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
  
      const payload = { id: user.id, email: user.email };
  
      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });
      const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });
  
      await req.db.query(
        `UPDATE users SET refresh_token_hash = $1 WHERE id = $2`,
        [hashToken(newRefreshToken), user.id]
      );
  
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('refresh error:', error);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
};

export const logout = async function (req, res) {
    const token = req.cookies?.refresh_token;
  
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await req.db.query(
          `UPDATE users SET refresh_token_hash = NULL WHERE id = $1`,
          [decoded.id]
        );
      } catch {
        // ignore errors, as we want to clear the cookie regardless of token validity
      }
    }
  
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return res.status(200).json({ message: 'Logged out' });
};

export const getProfile = async function (req, res) {
  try {
    const result = await req.db.query(
      `SELECT id, email, full_name AS "fullName", created_at AS "createdAt"
         FROM users
        WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile retrieved successfully',
      user: toPublicUser(result.rows[0]),
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const updateProfile = async function (req, res) {
  const userId = req.user.id;

  try {

    const updatedData = {
      fullName: req.body.fullName ?? null,
      passwordHash: req.body.password
        ? await bcrypt.hash(req.body.password, 10)
        : null,
      email: req.body.email ?? null,
    };

    if (
      updatedData.fullName === null &&
      updatedData.passwordHash === null &&
      updatedData.email === null
    ) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    if (updatedData.email !== null && !EMAIL_RE.test(updatedData.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (
      updatedData.passwordHash !== null &&
      req.body.password.length < 8
    ) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }

    const result = await req.db.query(
      `UPDATE users
          SET full_name     = COALESCE($1, full_name),
              password_hash = COALESCE($2, password_hash),
              email         = COALESCE($3, email)
        WHERE id = $4
        RETURNING id, email, full_name AS "fullName", created_at AS "createdAt"`,
      [
        updatedData.fullName,
        updatedData.passwordHash,
        updatedData.email,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: toPublicUser(result.rows[0]),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already in use' });
    }

    console.error('updateProfile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const removeUser = async function (req, res) {
  const userId = req.user.id;

  try {
    const result = await req.db.query(
      `DELETE FROM users
        WHERE id = $1
        RETURNING id, email, full_name AS "fullName", created_at AS "createdAt"`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User removed successfully',
      user: toPublicUser(result.rows[0]),
    });
  } catch (error) {
    console.error('removeUser error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};