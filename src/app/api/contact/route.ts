import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "이름, 이메일, 문의 내용을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // RESEND_API_KEY가 아직 설정되지 않은 경우 친절한 안내와 함께 모의 전송 성공 처리
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({
        success: true,
        mode: "mock",
        message:
          ".env.local에 RESEND_API_KEY가 아직 설정되지 않아 모의 접수되었습니다. 키를 입력하시면 실제 이메일로 전송됩니다.",
      });
    }

    const resend = new Resend(apiKey);
    const toAddress =
      receiverEmail && receiverEmail.trim() !== "" ? receiverEmail : email;

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [toAddress],
      replyTo: email,
      subject: `[MyFirstSite 문의] ${name}님의 새로운 문의사항 (${category})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #2eada5; margin-top: 0; margin-bottom: 16px; border-bottom: 2px solid #b1f8f2; padding-bottom: 10px;">
            💌 새로운 문의사항이 접수되었습니다
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 110px; font-weight: bold;">보낸 분:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">회신 이메일:</td>
              <td style="padding: 8px 0; color: #1e293b;"><a href="mailto:${email}" style="color: #0d9488; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">문의 유형:</td>
              <td style="padding: 8px 0; color: #1e293b;">
                <span style="background: #eafdcf; padding: 4px 10px; border-radius: 99px; font-size: 13px; color: #3d3b24; font-weight: 600;">
                  ${category}
                </span>
              </td>
            </tr>
          </table>
          <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; border-left: 4px solid #2eada5; margin-bottom: 24px;">
            <p style="margin: 0; color: #334155; line-height: 1.7; white-space: pre-wrap; font-size: 15px;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 24px 0 0;">
            본 메일은 MyFirstSite 웹 애플리케이션의 문의 폼을 통해 Resend로 안전하게 발송되었습니다.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend 발송 에러:", emailResponse.error);
      return NextResponse.json(
        { error: emailResponse.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: "resend",
      data: emailResponse.data,
    });
  } catch (error: any) {
    console.error("Contact API Server Error:", error);
    return NextResponse.json(
      { error: error?.message || "이메일 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
