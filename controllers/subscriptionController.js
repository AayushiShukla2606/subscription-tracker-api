const pool = require('../config/db');

// Add subscription
const addSubscription = async (req, res) => {
  try {
    const { name, amount, billing_cycle, category, next_renewal } = req.body;
    const userId = req.userId;

    const newSubscription = await pool.query(
      `INSERT INTO subscriptions 
       (user_id, name, amount, billing_cycle, category, next_renewal) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, name, amount, billing_cycle, category, next_renewal]
    );

    res.status(201).json({
      message: 'Subscription added successfully',
      subscription: newSubscription.rows[0]
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptions = await pool.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 
       ORDER BY next_renewal ASC`,
      [userId]
    );

    res.status(200).json({
      subscriptions: subscriptions.rows,
      total: subscriptions.rows.length
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, billing_cycle, category, next_renewal } = req.body;
    const userId = req.userId;

    const subscription = await pool.query(
      `SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (subscription.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const updated = await pool.query(
      `UPDATE subscriptions 
       SET name = $1, amount = $2, billing_cycle = $3, 
           category = $4, next_renewal = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, amount, billing_cycle, category, next_renewal, id, userId]
    );

    res.status(200).json({
      message: 'Subscription updated successfully',
      subscription: updated.rows[0]
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete subscription
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const subscription = await pool.query(
      `SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (subscription.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await pool.query(
      `DELETE FROM subscriptions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.status(200).json({ message: 'Subscription deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  addSubscription, 
  getSubscriptions, 
  updateSubscription, 
  deleteSubscription 
};