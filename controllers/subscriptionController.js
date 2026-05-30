const pool = require('../config/db');
const { sendRenewalAlert } = require('../utils/emailService');

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
    .map(sub => {
      const renewalDate = new Date(sub.next_renewal);
      const daysLeft = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

      let urgency;
      let message;

      if (daysLeft <= 1) {
        urgency = 'critical';
        message = `⚠️ ${sub.name} renews TOMORROW for ₹${sub.amount} — last chance to cancel!`;
      } else if (daysLeft <= 3) {
        urgency = 'high';
        message = `🔔 ${sub.name} renews in ${daysLeft} days for ₹${sub.amount} — act now if you want to cancel.`;
      } else {
        urgency = 'medium';
        message = `📅 ${sub.name} renews in ${daysLeft} days for ₹${sub.amount} — review if you want to continue.`;
      }

      return {
        name: sub.name,
        amount: sub.amount,
        billing_cycle: sub.billing_cycle,
        category: sub.category,
        next_renewal: sub.next_renewal,
        days_left: daysLeft,
        urgency,
        message
      };
    })
    .sort((a, b) => a.days_left - b.days_left);
    // Spend by category
    const byCategory = {};
    data.forEach(sub => {
      const cat = sub.category || 'uncategorized';
      if (!byCategory[cat]) {
        byCategory[cat] = 0;
      }
      byCategory[cat] += parseFloat(sub.amount);
    });

    const aiSuggestions = generateInsights(data);

    // Send email alerts for critical and high urgency renewals
    const urgentRenewals = renewingSoon.filter(sub => 
      sub.urgency === 'critical' || sub.urgency === 'high'
    );

    if (urgentRenewals.length > 0) {
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );
      const userEmail = userResult.rows[0].email;

      for (const sub of urgentRenewals) {
        await sendRenewalAlert(userEmail, sub);
      }
    }
    res.status(200).json({
      total_subscriptions: totalCount,
      monthly_spend: monthlySpend.toFixed(2),
      yearly_spend: yearlySpend.toFixed(2),
      renewing_soon: renewingSoon,
      spend_by_category: byCategory,
      ai_suggestions: aiSuggestions
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AI-powered rule-based recommendation engine
const generateInsights = (subscriptions) => {

  const suggestions = [];
  const categories = {};
  const serviceNames = subscriptions.map(s => s.name.toLowerCase());
  const flaggedOverlaps = new Set();
  // Group by category
  subscriptions.forEach(sub => {
    const cat = sub.category || 'uncategorized';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(sub);
  });

  subscriptions.forEach(sub => {
    const amount = parseFloat(sub.amount);
    const name = sub.name.toLowerCase();
    const category = sub.category?.toLowerCase();

    // Rule 1 — High cost alert (generic)
    if (sub.billing_cycle === 'monthly' && amount > 500) {
      suggestions.push({
        subscription: sub.name,
        type: 'high_cost',
        severity: amount > 1500 ? 'high' : 'medium',
        message: `₹${amount}/month is significant. Review if you're actively using ${sub.name}.`
      });
    }

    // Rule 2 — Yearly trap
    if (sub.billing_cycle === 'yearly') {
      const monthlyEquivalent = amount / 12;
      if (monthlyEquivalent > 800) {
        suggestions.push({
          subscription: sub.name,
          type: 'yearly_trap',
          severity: 'medium',
          message: `${sub.name} costs ₹${monthlyEquivalent.toFixed(0)}/month on yearly plan. Compare with monthly pricing — you might save money.`
        });
      }
    }

    // Rule 3 — Cloud optimization (never suggest cancel)
    if (category === 'cloud') {
      if (amount > 2000) {
        suggestions.push({
          subscription: sub.name,
          type: 'cloud_optimization',
          severity: 'medium',
          message: `Your ${sub.name} bill is ₹${amount}. Consider reserved instances or savings plans — can reduce costs by up to 72%.`
        });
      }
      if (serviceNames.includes('aws') && serviceNames.includes('gcp')) {
        suggestions.push({
          subscription: sub.name,
          type: 'cloud_overlap',
          severity: 'low',
          message: `You're using multiple cloud providers. Consider consolidating to reduce operational overhead.`
        });
      }
    }

    // Rule 4 — Overlapping AI tools
    if (
      (name.includes('chatgpt') || name.includes('openai')) &&
      (serviceNames.includes('claude') || serviceNames.includes('anthropic')) &&
      !flaggedOverlaps.has('chatgpt-claude')
    ) {
      flaggedOverlaps.add('chatgpt-claude');
      const aiTools = subscriptions.filter(s =>
        s.name.toLowerCase().includes('chatgpt') ||
        s.name.toLowerCase().includes('claude')
      );
      const minSaving = Math.min(...aiTools.map(s => parseFloat(s.amount)));
      const totalAISpend = aiTools.reduce((sum, s) => sum + parseFloat(s.amount), 0);
        
      suggestions.push({
        subscription: sub.name,
        type: 'overlap',
        severity: 'high',
        message: `You have both ChatGPT and Claude — overlapping AI assistants costing ₹${totalAISpend}/month. Both do similar tasks — pick the one you use most and cancel the other.`
      });
    }
    // Rule 5 — Overlapping music
    if (
      name.includes('spotify') &&
      serviceNames.includes('youtube premium') &&
      !flaggedOverlaps.has('spotify-youtube')
    ) {
      flaggedOverlaps.add('spotify-youtube');
      suggestions.push({
        subscription: sub.name,
        type: 'overlap',
        severity: 'high',
        message: `Spotify and YouTube Premium both offer music streaming. Consider cancelling one — save ₹${amount}/month.`
      });
    }

    // Rule 6 — Overlapping streaming
    const streamingServices = ['netflix', 'amazon prime', 'hotstar', 'zee5', 'sonyliv'];
    const userStreaming = streamingServices.filter(s => serviceNames.includes(s));
    if (userStreaming.length >= 3 && streamingServices.some(s => name.includes(s))) {
      suggestions.push({
        subscription: sub.name,
        type: 'overlap',
        severity: 'high',
        message: `You have ${userStreaming.length} streaming services. You likely only need 1-2. Review and cancel unused ones.`
      });
    }

    // Rule 7 — Overlapping professional
    if (
      name.includes('linkedin') &&
      (serviceNames.includes('naukri') || serviceNames.includes('indeed'))
    ) {
        const professionalTools = subscriptions.filter(s =>
        s.name.toLowerCase().includes('linkedin') ||
        s.name.toLowerCase().includes('naukri') ||
        s.name.toLowerCase().includes('indeed')
      );
      const totalProfessionalSpend = professionalTools.reduce((sum, s) => sum + parseFloat(s.amount), 0);
      suggestions.push({
        subscription: sub.name,
        type: 'overlap',
        severity: 'medium',
        message: `LinkedIn Premium and job portals overlap — costing ₹${totalProfessionalSpend}/month combined. If actively job hunting keep LinkedIn, otherwise consider cancelling both and using free tiers.`
      });
    }
  });

  // Rule 8 — Too many in same category
  Object.keys(categories).forEach(cat => {
    if (cat !== 'cloud' && categories[cat].length >= 3) {
      const totalCost = categories[cat].reduce((sum, s) => sum + parseFloat(s.amount), 0);
      suggestions.push({
        subscription: `${cat} category`,
        type: 'consolidate',
        severity: 'medium',
        message: `You have ${categories[cat].length} ${cat} subscriptions costing ₹${totalCost.toFixed(0)}/month total. Consider consolidating.`
      });
    }
  });

  // No suggestions — healthy profile
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'healthy',
      severity: 'low',
      message: 'Your subscription portfolio looks healthy! No major issues detected.'
    });
  }

  return suggestions;
};

module.exports = { 
  addSubscription, 
  getSubscriptions, 
  updateSubscription, 
  deleteSubscription,
  getInsights 
};