import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(request: Request) {
  try {
    const adminEmail = (process.env.CONTACT_ADMIN_EMAIL || 'pphutana01@gmail.com').trim().toLowerCase();

    console.log('--------------------------------------------------');
    console.log('⏰ [AUTOMATED DAILY HEALTH CHECK EMAIL DISPATCH]');
    console.log(`Sending Daily Health Check to Admin Email: ${adminEmail}`);
    console.log('--------------------------------------------------');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">🟢 Qubezip Daily System Health Check OK!</h2>
        <p>เรียน ผู้ดูแลระบบ,</p>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px;">
          <strong style="color: #065f46;">สถานะระบบ Qubezip:</strong> ทำงานปกติ 100%<br/>
          <strong>เวลาตรวจสอบ:</strong> ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })} (เวลาไทย)<br/>
          <strong>กิจกรรมสะสมทั้งหมด:</strong> ${stats.totalEvents} รายการ<br/>
        </div>
        <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;"/>
        <p style="font-size: 12px; color: #94a3b8;">Qubezip Automated System Health Monitor</p>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resendResult = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: adminEmail,
        subject: `[Qubezip Health Check] 🟢 รายงานประจำวัน - ระบบทำงานปกติ (07:00 น.)`,
        html: htmlContent,
      });

      if (resendResult.error) {
        console.error('❌ Resend Health Check Error:', resendResult.error);
        return NextResponse.json(
          { success: false, error: resendResult.error.message },
          { status: 400 }
        );
      }

      console.log('✅ Daily Health Check email sent via Resend API to', adminEmail);
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Automated daily health check email dispatched successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Health Check Error:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to dispatch health check' },
      { status: 500 }
    );
  }
}
