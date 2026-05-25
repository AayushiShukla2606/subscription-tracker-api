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

// Get spending insights
const getInsights = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all subscriptions
    const subscriptions = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    const data = subscriptions.rows;

    // Total subscriptions count
    const totalCount = data.length;

    // Monthly & yearly spend
    let monthlySpend = 0;
    let yearlySpend = 0;

    data.forEach(sub => {
      if (sub.billing_cycle === 'monthly') {
        monthlySpend += parseFloat(sub.amount);
        yearlySpend += parseFloat(sub.amount) * 12;
      } else if (sub.billing_cycle === 'yearly') {
        yearlySpend += parseFloat(sub.amount);
        monthlySpend += parseFloat(sub.amount) / 12;
      }
    });

    // Renewing in next 7 days
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const renewingSoon = data
  .filter(sub => {
    const renewalDate = new Date(sub.next_renewal);
    return renewalDate >= today && renewalDate <= next7Days;
  })
  .map(sub => ({
    name: sub.name,
    amount: sub.amount,
    billing_cycle: sub.billing_cycle,
    category: sub.category,
    next_renewal: sub.next_renewal
  }));
    // Spend by category
    const byCategory = {};
    data.forEach(sub => {
      const cat = sub.category || 'uncategorized';
      if (!byCategory[cat]) {
        byCategory[cat] = 0;
      }
      byCategory[cat] += parseFloat(sub.amount);
    });

    res.status(200).json({
      total_subscriptions: totalCount,
      monthly_spend: monthlySpend.toFixed(2),
      yearly_spend: yearlySpend.toFixed(2),
      renewing_soon: renewingSoon,
      spend_by_category: byCategory
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  addSubscription, 
  getSubscriptions, 
  updateSubscription, 
  deleteSubscription,
  getInsights 
};