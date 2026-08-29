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
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">📢 มีผู้สนใจติดต่อลงโฆษณาบน EasyFile!</h2>
        <p><strong>ชื่อผู้ติดต่อ:</strong> ${name}</p>
        <p><strong>บริษัท / แบรนด์ / เว็บไซต์:</strong> ${company}</p>
        <p><strong>อีเมลติดต่อกลับ:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>เบอร์โทรศัพท์ / Line ID:</strong> ${phone}</p>
        <p><strong>รายละเอียดเพิ่มเติม:</strong></p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
          ${message ? message.replace(/\n/g, '<br/>') : 'ไม่ได้ระบุ'}
        </div>
        <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;"/>
        <p style="font-size: 12px; color: #666;">ข้อความนี้ถูกส่งโดยอัตโนมัติจากระบบ EasyFile Advertising Inquiry System</p>
      </div>
    `;

    // 1. Send via Resend API if RESEND_API_KEY is present
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resendResult = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: adminEmail,
        subject: `[EasyFile Ads] มีผู้สนใจติดต่อโฆษณาจาก ${company} (${name})`,
        html: htmlContent,
      });

      if (resendResult.error) {
        console.error('❌ Resend API returned error:', resendResult.error);
        return NextResponse.json(
          { success: false, message: resendResult.error.message },
          { status: 400 }
        );
      }

      console.log('✅ Email successfully delivered via Resend API! ID:', resendResult.data?.id);
    }
    // 2. Send via Gmail SMTP / Nodemailer if credentials are present
    else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
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
        from: `"EasyFile Ads" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `[EasyFile Ads] มีผู้สนใจติดต่อโฆษณาจาก ${company} (${name})`,
        html: htmlContent,
      });
      console.log('✅ Real email sent via Nodemailer SMTP to', adminEmail);
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully',
    });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
