const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendRenewalAlert = async (userEmail, subscription) => {
  try {
    const { name, amount, days_left, urgency, next_renewal } = subscription;

    const subject = urgency === 'critical'
      ? `⚠️ ${name} renews TOMORROW — ₹${amount}`
      : `🔔 ${name} renews in ${days_left} days — ₹${amount}`;

    await sgMail.send({
      from: 'Subscription Tracker <abmtc25008_aayushi@banasthali.in>',
      to: userEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${urgency === 'critical' ? '#dc2626' : urgency === 'high' ? '#d97706' : '#2563eb'}">
            Subscription Renewal Alert
          </h2>
          <p>Hi there,</p>
          <p>Your subscription is coming up for renewal:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">${name}</h3>
            <p style="margin: 4px 0;">💰 Amount: <strong>₹${amount}</strong></p>
            <p style="margin: 4px 0;">📅 Renewal Date: <strong>${new Date(next_renewal).toDateString()}</strong></p>
            <p style="margin: 4px 0;">⏰ Days Left: <strong>${days_left} day(s)</strong></p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you no longer need this subscription, cancel it before the renewal date to avoid charges.
          </p>
          <p>— Subscription Tracker</p>
        </div>
      `
    });

    console.log(`✅ Renewal alert sent to ${userEmail} for ${name}`);
    return true;

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

module.exports = { sendRenewalAlert };

// const { Resend } = require('resend');
// require('dotenv').config();

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendRenewalAlert = async (userEmail, subscription) => {
//   try {
//     const { name, amount, days_left, urgency, next_renewal } = subscription;

//     const subject = urgency === 'critical'
//       ? `⚠️ ${name} renews TOMORROW — ₹${amount}`
//       : `🔔 ${name} renews in ${days_left} days — ₹${amount}`;

//     await resend.emails.send({
//       from: 'Subscription Tracker <onboarding@resend.dev>',
//       to: userEmail,
//       subject,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: ${urgency === 'critical' ? '#dc2626' : urgency === 'high' ? '#d97706' : '#2563eb'}">
//             Subscription Renewal Alert
//           </h2>
//           <p>Hi there,</p>
//           <p>Your subscription is coming up for renewal:</p>
//           <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
//             <h3 style="margin: 0 0 8px 0;">${name}</h3>
//             <p style="margin: 4px 0;">💰 Amount: <strong>₹${amount}</strong></p>
//             <p style="margin: 4px 0;">📅 Renewal Date: <strong>${new Date(next_renewal).toDateString()}</strong></p>
//             <p style="margin: 4px 0;">⏰ Days Left: <strong>${days_left} day(s)</strong></p>
//           </div>
//           <p style="color: #6b7280; font-size: 14px;">
//             If you no longer need this subscription, cancel it before the renewal date to avoid charges.
//           </p>
//           <p>— Subscription Tracker</p>
//         </div>
//       `
//     });

//     console.log(`✅ Renewal alert sent to ${userEmail} for ${name}`);
//     return true;

//   } catch (error) {
//     console.error('❌ Email sending failed:', error.message);
//     return false;
//   }
// };

// module.exports = { sendRenewalAlert };



// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// const sendRenewalAlert = async (userEmail, subscription) => {
//   try {
//     const { name, amount, days_left, urgency, next_renewal } = subscription;

//     const subject = urgency === 'critical'
//       ? `⚠️ ${name} renews TOMORROW — ₹${amount}`
//       : `🔔 ${name} renews in ${days_left} days — ₹${amount}`;

//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: ${urgency === 'critical' ? '#dc2626' : urgency === 'high' ? '#d97706' : '#2563eb'}">
//           Subscription Renewal Alert
//         </h2>
//         <p>Hi there,</p>
//         <p>Your subscription is coming up for renewal:</p>
//         <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
//           <h3 style="margin: 0 0 8px 0;">${name}</h3>
//           <p style="margin: 4px 0;">💰 Amount: <strong>₹${amount}</strong></p>
//           <p style="margin: 4px 0;">📅 Renewal Date: <strong>${new Date(next_renewal).toDateString()}</strong></p>
//           <p style="margin: 4px 0;">⏰ Days Left: <strong>${days_left} day(s)</strong></p>
//         </div>
//         <p style="color: #6b7280; font-size: 14px;">
//           If you no longer need this subscription, cancel it before the renewal date to avoid charges.
//         </p>
//         <p>— Subscription Tracker</p>
//       </div>
//     `;

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: userEmail,
//       subject,
//       html
//     });

//     console.log(`✅ Renewal alert sent to ${userEmail} for ${name}`);
//     return true;

//   } catch (error) {
//     console.error('❌ Email sending failed:', error.message);
//     return false;
//   }
// };

// module.exports = { sendRenewalAlert };