import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Registration validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов')
    .matches(/^[a-zA-Zа-яёА-ЯЁ\s-]+$/)
    .withMessage('Имя может содержать только буквы (русские или английские), пробелы и дефисы'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Фамилия должна содержать от 2 до 50 символов')
    .matches(/^[a-zA-Zа-яёА-ЯЁ\s-]+$/)
    .withMessage('Фамилия может содержать только буквы (русские или английские), пробелы и дефисы'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес'),
  
  body('phone')
    .matches(/^\d+$/)
    .withMessage('Телефон должен содержать только цифры'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Пароль должен содержать буквы и цифры'),
  
  body('propertyType')
    .isIn(['apartment', 'penthouse', 'commercial'])
    .withMessage('Неверный тип недвижимости'),
  
  body('budget')
    .notEmpty()
    .withMessage('Выберите бюджет'),
  
  body('moveInDate')
    .notEmpty()
    .withMessage('Выберите срок заезда'),
  
  body('livingWith')
    .notEmpty()
    .withMessage('Выберите с кем будете жить')
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес'),
  
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      propertyType,
      rooms,
      area,
      budget,
      moveInDate,
      livingWith
    } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Start transaction
    const client = await query('BEGIN');

    try {
      // Insert user
      const userResult = await query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, first_name, last_name, email, phone, created_at`,
        [firstName, lastName, email, phone, hashedPassword]
      );

      const user = userResult.rows[0];

      // Insert user preferences
      await query(
        `INSERT INTO user_preferences (
          user_id, property_type, rooms, area, budget, move_in_date, living_with, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [user.id, propertyType, rooms || null, area || null, budget, moveInDate, livingWith]
      );

      // Commit transaction
      await query('COMMIT');

      // Generate JWT token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Регистрация успешно завершена',
        data: {
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone
          },
          token
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при регистрации'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const userResult = await query(
      `SELECT id, first_name, last_name, email, phone, password_hash, is_active, created_at
       FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Аккаунт заблокирован'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при входе'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, first_name, last_name, email, phone, is_active, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const user = userResult.rows[0];

    // Get user preferences
    const preferencesResult = await query(
      `SELECT property_type, rooms, area, budget, move_in_date, living_with
       FROM user_preferences WHERE user_id = $1`,
      [user.id]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLogin: user.last_login
        },
        preferences: preferencesResult.rows[0] || null
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении данных пользователя'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при выходе'
    });
  }
});

export default router; 