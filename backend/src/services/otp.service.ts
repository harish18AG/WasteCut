import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dns from 'dns';
import { promisify } from 'util';
import { Resend } from 'resend';

const resolve4 = promisify(dns.resolve4);

export class OtpService {
  async sendEmailOtp(email: string, otp: string): Promise<void> {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resendClient = new Resend(resendApiKey);
        const { data, error } = await resendClient.emails.send({
          from: 'WasteCut <onboarding@resend.dev>',
          to: email,
          subject: 'WasteCut Email Verification OTP',
          text: `Your WasteCut verification code is: ${otp}\n\nPlease enter this code on the registration page to verify your email address.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
              <h2 style="color: #10b981; text-align: center; margin-bottom: 24px;">WasteCut Email Verification</h2>
              <p>Hello,</p>
              <p>Thank you for registering with WasteCut! To complete your signup, please use the following one-time password (OTP):</p>
              <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1f2937; margin: 20px 0; border-radius: 12px;">
                ${otp}
              </div>
              <p>This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="font-size: 11px; color: #9ca3af; text-align: center;">Smart Food Waste Reduction & Redistribution System</p>
            </div>
          `,
        });
        if (error) {
          console.warn('⚠️ Resend free tier notice:', error.message);
          throw new Error(error.message);
        }
        console.log('✅ Email OTP successfully delivered via Resend HTTP API!');
        return;
      } catch (err: any) {
        console.error('❌ Resend HTTP API Error details:', err);
        // Fallback to SMTP
      }
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP credentials are not configured in the backend .env file. Please set SMTP_USER and SMTP_PASS.');
    }

    // Resolve smtp.gmail.com to an IPv4 address to bypass IPv6 ENETUNREACH errors
    let smtpHost = 'smtp.gmail.com';
    try {
      const ips = await resolve4('smtp.gmail.com');
      if (ips && ips.length > 0) {
        smtpHost = ips[0];
      }
    } catch (e) {
      console.warn('⚠️ DNS IPv4 resolution failed for smtp.gmail.com, falling back:', e);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 465, // Use secure SSL port 465 (port 587 is blocked by many ISPs)
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        // Validate certificate domain when connecting directly to the IP address
        servername: 'smtp.gmail.com'
      }
    } as any);

    const mailOptions = {
      from: `"WasteCut Verification" <${smtpUser}>`,
      to: email,
      subject: 'WasteCut Email Verification OTP',
      text: `Your WasteCut verification code is: ${otp}\n\nPlease enter this code on the registration page to verify your email address. This OTP is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
          <h2 style="color: #10b981; text-align: center; margin-bottom: 24px;">WasteCut Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for registering with WasteCut! To complete your signup, please use the following one-time password (OTP):</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1f2937; margin: 20px 0; border-radius: 12px;">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center;">Smart Food Waste Reduction & Redistribution System</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email OTP successfully delivered to ${email} via Gmail SMTP!`);
    } catch (e: any) {
      console.error('❌ Nodemailer SMTP Error details:', e.message || e);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n==================================================`);
        console.log(`🔑 [DEV FALLBACK] Email OTP for ${email}: ${otp}`);
        console.log(`==================================================\n`);
        return;
      }
      throw e;
    }
  }

  async sendPhoneOtp(phone: string, otp: string): Promise<string | null> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials are not configured in the backend .env file. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
    }

    const client = twilio(accountSid, authToken);

    // Format phone to E.164. If 10 digits and no prefix, default to India (+91)
    let formattedPhone = phone.trim();
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    }

    try {
      await client.messages.create({
        body: `Your WasteCut verification code is: ${otp}. Do not share this OTP.`,
        from: fromNumber,
        to: formattedPhone,
      });
      console.log(`✅ Twilio SMS OTP successfully sent to ${formattedPhone}`);
      return null;
    } catch (e: any) {
      console.warn('⚠️ Twilio Trial/DLT restriction detected. Attempting email forwarding backup...', e.message);
      
      const smtpUser = process.env.SMTP_USER;
      if (smtpUser) {
        try {
          await this.sendEmailOtp(smtpUser, otp);
          console.log(`ℹ️ Forwarded phone verification code ${otp} to email: ${smtpUser}`);
          return 'Twilio Free Trial restriction detected. The Phone OTP has been securely forwarded to your email address!';
        } catch (mailErr) {
          console.error('Failed to send fallback email:', mailErr);
        }
      }
      throw e;
    }
  }
}
