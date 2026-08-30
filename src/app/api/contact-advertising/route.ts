import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { recordAdInquiry } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, message } = body;

    // Record inquiry into persistent admin database
    recordAdInquiry(name, company, email, phone, message);

    // Admin recipient email normalized to lowercase
    const rawAdminEmail = process.env.CONTACT_ADMIN_EMAIL || 'pphutana01@gmail.com';
    const adminEmail = rawAdminEmail.trim().toLowerCase();

    console.log('--------------------------------------------------');
    console.log('📩 [SERVER LOG - NEW ADVERTISING INQUIRY RECEIVED]');
    console.log(`Target Recipient Email: ${adminEmail}`);
    console.log(`From Person: ${name}`);
    console.log(`Company / Brand: ${company}`);
    console.log(`Sender Email: ${email}`);
    console.log(`Phone / Line ID: ${phone}`);
    console.log(`Message: ${message}`);
    console.log('--------------------------------------------------');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">📢 มีผู้สนใจติดต่อลงโฆษณาบน Qubezip!</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px; color: #475569;">ชื่อผู้ติดต่อ:</td><td style="padding: 8px; color: #1e293b;">${name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #475569;">บริษัท / แบรนด์:</td><td style="padding: 8px; color: #2563eb; font-weight: bold;">${company}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #475569;">อีเมล:</td><td style="padding: 8px; color: #1e293b;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #475569;">เบอร์โทร / Line:</td><td style="padding: 8px; color: #1e293b;">${phone}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #475569; vertical-align: top;">รายละเอียด:</td><td style="padding: 8px; color: #334155;">${message || '-'}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
        <p style="font-size: 12px; color: #666;">ข้อความนี้ถูกส่งโดยอัตโนมัติจากระบบ Qubezip Advertising Inquiry System</p>
      </div>
    `;

    const resendApiKey = process.env.RESEND_API_KEY;

    // Send email using Resend API or SMTP fallback if keys are present
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'Qubezip Ads <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `[Qubezip Ads] มีผู้สนใจติดต่อโฆษณาจาก ${company} (${name})`,
          html: htmlContent,
        });
        console.log('✅ Email successfully delivered via Resend API!');
      } catch (e) {
        console.error('⚠️ Resend email sending failed, inquiry saved to DB:', e);
      }
    } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Qubezip Ads" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `[Qubezip Ads] มีผู้สนใจติดต่อโฆษณาจาก ${company} (${name})`,
          html: htmlContent,
        });
        console.log('✅ Real email sent via Nodemailer SMTP to', adminEmail);
      } catch (e) {
        console.error('⚠️ SMTP email sending failed, inquiry saved to DB:', e);
      }
    }

    // Return success to the user (the inquiry is safely saved in the DB)
    return NextResponse.json({
      success: true,
      message: 'Inquiry received and saved successfully',
    });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
