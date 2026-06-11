const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, place, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
        }

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await transporter.sendMail({
                    from: `MediSync-AI Contact <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER, // Admin receives the email
                    replyTo: email,
                    subject: `New Inquiry from ${name} (MediSync-AI)`,
                    html: `
                        <div style="font-family:sans-serif;padding:20px;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:10px;background-color:#ffffff;">
                            <h2 style="color:#8b5cf6;margin-top:0;">New Contact Form Submission</h2>
                            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;width:100px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:bold;">${name}</td></tr>
                                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:bold;">${email}</td></tr>
                                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:bold;">${phone || 'N/A'}</td></tr>
                                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Location</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:bold;">${place || 'N/A'}</td></tr>
                            </table>
                            <h3 style="color:#334155;margin-bottom:10px;">Message:</h3>
                            <div style="white-space:pre-wrap;color:#475569;line-height:1.6;background-color:#f8fafc;padding:15px;border-radius:8px;">${message}</div>
                        </div>
                    `,
                });
                res.status(200).json({ success: true, message: 'Thanks for your message! We will get back to you soon.' });
            } catch (mailError) {
                console.error('SMTP Mail error for contact form:', mailError);
                res.status(500).json({ success: false, message: 'Failed to send message via email server.' });
            }
        } else {
            console.log(`\n=== CONTACT FORM SUBMISSION ===\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPlace: ${place}\nMessage: ${message}\n===============================\n`);
            res.status(200).json({ success: true, message: 'Thanks for your message! We will get back to you soon. (Logged to console)' });
        }
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ success: false, message: 'Server error processing contact form.' });
    }
};

module.exports = { submitContactForm };
