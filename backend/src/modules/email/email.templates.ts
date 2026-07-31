type WelcomeTemplateInput = {
  firstName: string;
  shopUrl: string;
};

type ResetPasswordTemplateInput = {
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
};

export type OrderEmailItem = {
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
};

type OrderConfirmationTemplateInput = {
  firstName: string;
  orderNumber: string;
  orderUrl: string;
  total: number;
  items: OrderEmailItem[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function emailLayout(
  preheader: string,
  title: string,
  content: string,
): string {
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f2f3f4;color:#18191b;font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f3f4;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fcfcfb;border:1px solid #d9dadd;">
            <tr>
              <td style="background:#18191b;padding:26px 32px;color:#f7f7f5;">
                <div style="font-size:20px;font-weight:700;letter-spacing:0.18em;">ACHROMATIC</div>
                <div style="margin-top:7px;font-size:11px;letter-spacing:0.1em;color:#c8c9cc;">THỜI TRANG TỐI GIẢN VIỆT NAM</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 30px;">
                <h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;font-weight:600;letter-spacing:-0.02em;">${escapeHtml(title)}</h1>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #dedfe1;padding:22px 32px;color:#66686d;font-size:12px;line-height:1.6;">
                Email này được gửi tự động từ ACHROMATIC. Vui lòng không trả lời trực tiếp.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function primaryButton(label: string, href: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;">
    <tr>
      <td style="background:#18191b;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 22px;color:#f7f7f5;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export function welcomeEmailTemplate(input: WelcomeTemplateInput): string {
  const name = escapeHtml(input.firstName);
  return emailLayout(
    'Chào mừng bạn đến với ACHROMATIC.',
    `Chào mừng ${input.firstName}`,
    `<p style="margin:0;color:#4b4d52;font-size:15px;line-height:1.75;">Xin chào ${name}, tài khoản của bạn đã sẵn sàng. Khám phá các thiết kế tối giản và lưu lại những sản phẩm phù hợp với phong cách của bạn.</p>
    ${primaryButton('KHÁM PHÁ BỘ SƯU TẬP', input.shopUrl)}`,
  );
}

export function resetPasswordEmailTemplate(
  input: ResetPasswordTemplateInput,
): string {
  return emailLayout(
    'Liên kết đặt lại mật khẩu ACHROMATIC.',
    'Đặt lại mật khẩu',
    `<p style="margin:0;color:#4b4d52;font-size:15px;line-height:1.75;">Xin chào ${escapeHtml(input.firstName)}, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
    <p style="margin:16px 0 0;color:#4b4d52;font-size:15px;line-height:1.75;">Liên kết có hiệu lực trong ${input.expiresInMinutes} phút. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>
    ${primaryButton('ĐẶT LẠI MẬT KHẨU', input.resetUrl)}`,
  );
}

export function orderConfirmationEmailTemplate(
  input: OrderConfirmationTemplateInput,
): string {
  const rows = input.items
    .map(
      (item) => `<tr>
        <td style="padding:13px 0;border-bottom:1px solid #e1e2e4;">
          <div style="font-size:14px;font-weight:600;color:#222327;">${escapeHtml(item.name)}</div>
          ${
            item.variant
              ? `<div style="margin-top:4px;font-size:12px;color:#72747a;">${escapeHtml(item.variant)}</div>`
              : ''
          }
        </td>
        <td align="center" style="padding:13px 12px;border-bottom:1px solid #e1e2e4;font-size:13px;color:#4b4d52;">${item.quantity}</td>
        <td align="right" style="padding:13px 0;border-bottom:1px solid #e1e2e4;font-size:13px;color:#222327;">${formatMoney(item.unitPrice * item.quantity)}</td>
      </tr>`,
    )
    .join('');

  return emailLayout(
    `Đơn hàng ${input.orderNumber} đã được ghi nhận.`,
    'Đơn hàng đã được ghi nhận',
    `<p style="margin:0;color:#4b4d52;font-size:15px;line-height:1.75;">Xin chào ${escapeHtml(input.firstName)}, cảm ơn bạn đã mua sắm tại ACHROMATIC.</p>
    <p style="margin:16px 0 24px;color:#4b4d52;font-size:14px;line-height:1.7;">Mã đơn hàng: <strong style="color:#222327;">${escapeHtml(input.orderNumber)}</strong></p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <th align="left" style="padding:10px 0;border-bottom:2px solid #222327;font-size:11px;letter-spacing:0.08em;color:#66686d;">SẢN PHẨM</th>
        <th align="center" style="padding:10px 12px;border-bottom:2px solid #222327;font-size:11px;letter-spacing:0.08em;color:#66686d;">SL</th>
        <th align="right" style="padding:10px 0;border-bottom:2px solid #222327;font-size:11px;letter-spacing:0.08em;color:#66686d;">THÀNH TIỀN</th>
      </tr>
      ${rows}
      <tr>
        <td colspan="2" align="right" style="padding:18px 12px 0 0;font-size:13px;color:#66686d;">TỔNG CỘNG</td>
        <td align="right" style="padding:18px 0 0;font-size:18px;font-weight:700;color:#18191b;">${formatMoney(input.total)}</td>
      </tr>
    </table>
    ${primaryButton('THEO DÕI ĐƠN HÀNG', input.orderUrl)}`,
  );
}
