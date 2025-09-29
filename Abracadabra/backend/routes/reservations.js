import express from 'express';
import { pool } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's reservations
router.get('/user', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        pr.*,
        'property_' || pr.property_id as property_key
      FROM property_reservations pr
      WHERE pr.user_id = $1 AND pr.status = 'active'
      ORDER BY pr.created_at DESC
    `, [req.user.id]);

    // Since we don't have actual property data in the database yet,
    // we'll use the CSV data structure. For now, return reservation IDs
    // that can be matched with frontend property data
    res.json({
      success: true,
      reservations: rows
    });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении забронированных объектов'
    });
  }
});

// Create a new reservation
router.post('/', verifyToken, async (req, res) => {
  try {
    const { property_id, notes } = req.body;
    const user_id = req.user.id;

    if (!property_id) {
      return res.status(400).json({
        success: false,
        error: 'ID объекта обязателен'
      });
    }

    // Check if user already has an active reservation for this property
    const existingReservation = await pool.query(`
      SELECT id FROM property_reservations 
      WHERE user_id = $1 AND property_id = $2 AND status = 'active'
    `, [user_id, property_id]);

    if (existingReservation.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Вы уже забронировали этот объект'
      });
    }

    // Create new reservation
    const { rows } = await pool.query(`
      INSERT INTO property_reservations (user_id, property_id, notes)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [user_id, property_id, notes || null]);

    res.status(201).json({
      success: true,
      reservation: rows[0],
      message: 'Объект успешно забронирован'
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'Вы уже забронировали этот объект'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка при бронировании объекта'
    });
  }
});

// Cancel reservation
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;

    // Check if reservation exists and belongs to user
    const reservation = await pool.query(`
      SELECT id FROM property_reservations 
      WHERE id = $1 AND user_id = $2 AND status = 'active'
    `, [reservationId, userId]);

    if (reservation.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Бронирование не найдено'
      });
    }

    // Update reservation status to cancelled
    await pool.query(`
      UPDATE property_reservations 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
    `, [reservationId]);

    res.json({
      success: true,
      message: 'Бронирование отменено'
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при отмене бронирования'
    });
  }
});

// Cancel reservation by property ID
router.delete('/property/:propertyId', verifyToken, async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    // Update reservation status to cancelled
    const { rowCount } = await pool.query(`
      UPDATE property_reservations 
      SET status = 'cancelled', updated_at = NOW()
      WHERE property_id = $1 AND user_id = $2 AND status = 'active'
    `, [propertyId, userId]);

    if (rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Активное бронирование не найдено'
      });
    }

    res.json({
      success: true,
      message: 'Бронирование отменено'
    });
  } catch (error) {
    console.error('Error cancelling reservation by property ID:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при отмене бронирования'
    });
  }
});

// Check if property is reserved by user
router.get('/check/:propertyId', verifyToken, async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    const { rows } = await pool.query(`
      SELECT id FROM property_reservations 
      WHERE property_id = $1 AND user_id = $2 AND status = 'active'
    `, [propertyId, userId]);

    res.json({
      success: true,
      isReserved: rows.length > 0,
      reservationId: rows.length > 0 ? rows[0].id : null
    });
  } catch (error) {
    console.error('Error checking reservation status:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при проверке статуса бронирования'
    });
  }
});

export default router; 