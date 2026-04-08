/**
 * Racksup — Branded Transactional Email Templates
 * Neo-brutalist design: thick borders, yellow accent (#FFD60A), bold typography
 */

const SITE_URL = "https://racksup.in";
const LOGO_URL = `${SITE_URL}/images/email-logo.png`;
const ACCENT = "#FFD60A";
const BLACK = "#111111";
const WHITE = "#ffffff";
const GRAY = "#666666";
const LIGHT_BG = "#FFD60A";

// ─── Shared Layout ───────────────────────────────────────────────

function layout(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Racksup</title>
</head>
<body style="margin:0;padding:0;background:${LIGHT_BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BLACK};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${LIGHT_BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${WHITE};border:4px solid ${BLACK};">
          
          <!-- Header -->
          <tr>
            <td style="background:${BLACK};padding:24px 32px;text-align:center;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <img src="${LOGO_URL}" alt="Racksup" width="100" height="100" style="display:block;margin:0 auto;border:0;" />
              </a>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:${BLACK};padding:24px 32px;text-align:center;">
              <p style="margin:0 0 12px;font-size:12px;color:#888;">
                You received this email because of your activity on Racksup.
                This is a transactional notification, not a promotional email.
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:${GRAY};">
                <a href="${SITE_URL}/shop" style="color:${ACCENT};text-decoration:none;font-weight:700;">Shop</a> &nbsp;·&nbsp;
                <a href="${SITE_URL}/vendor" style="color:${ACCENT};text-decoration:none;font-weight:700;">Sell With Us</a> &nbsp;·&nbsp;
                <a href="${SITE_URL}/track-order" style="color:${ACCENT};text-decoration:none;font-weight:700;">Track Order</a>
              </p>
              <p style="margin:0;font-size:11px;color:#555;">
                Racksup, India | support@racksup.in
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string, bg: string = ACCENT) {
  return `
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto;">
      <tr>
        <td style="background:${bg};border:3px solid ${BLACK};padding:14px 32px;text-align:center;">
          <a href="${url}" style="color:${BLACK};text-decoration:none;font-weight:800;font-size:14px;letter-spacing:1px;text-transform:uppercase;">${text}</a>
        </td>
      </tr>
    </table>`;
}

function divider() {
  return `<hr style="border:none;border-top:3px solid ${BLACK};margin:28px 0;" />`;
}

// ─── 1. Order Confirmation (Buyer) ───────────────────────────────

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
}

interface OrderData {
  orderId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  processingFee: number;
  total: number;
}

export function orderConfirmationEmail(order: OrderData) {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:600;">${item.name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:center;">${item.size}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:center;">×${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const content = `
    <div style="background:${ACCENT};border:3px solid ${BLACK};padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Order Confirmed</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:900;letter-spacing:2px;">#${order.orderId}</p>
    </div>
    
    <p style="font-size:16px;line-height:1.6;">
      Hey <strong>${order.customer.firstName}</strong>,<br/>
      Thanks for shopping with us! Your order has been confirmed and is being prepared by our verified vendors. You'll hear from us once it ships.
    </p>
    
    ${divider()}
    
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Items Ordered</h2>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">
      <tr style="border-bottom:2px solid ${BLACK};">
        <th style="text-align:left;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Item</th>
        <th style="text-align:center;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Size</th>
        <th style="text-align:center;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="text-align:right;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Price</th>
      </tr>
      ${itemRows}
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;font-size:14px;">
      <tr><td style="padding:4px 0;">Subtotal</td><td style="text-align:right;">₹${order.subtotal.toLocaleString()}</td></tr>
      <tr><td style="padding:4px 0;">Shipping</td><td style="text-align:right;">₹${order.shipping}</td></tr>
      <tr><td style="padding:4px 0;color:${GRAY};">Processing Fee</td><td style="text-align:right;color:${GRAY};">₹${order.processingFee.toFixed(2)}</td></tr>
      <tr><td style="padding:12px 0 0;border-top:3px solid ${BLACK};font-weight:900;font-size:16px;">Total Paid</td><td style="padding:12px 0 0;border-top:3px solid ${BLACK};text-align:right;font-weight:900;font-size:16px;">₹${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
    </table>
    
    ${divider()}
    
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Shipping To</h2>
    <p style="margin:0;font-size:14px;line-height:1.6;color:${GRAY};">
      ${order.customer.firstName} ${order.customer.lastName}<br/>
      ${order.customer.address}${order.customer.address2 ? "<br/>" + order.customer.address2 : ""}<br/>
      ${order.customer.city}, ${order.customer.state} ${order.customer.postalCode}<br/>
      📞 ${order.customer.phone}
    </p>
    
    ${button("TRACK YOUR ORDER", `${SITE_URL}/track-order`)}
    
    <p style="font-size:13px;color:${GRAY};line-height:1.5;">
      Got a question? Just reply to this email and our team will get back to you.
    </p>
  `;

  const text = `
Order Confirmed: #${order.orderId}
Hey ${order.customer.firstName}, thanks for shopping with us!
Our verified vendors are preparing your order.

Items:
${order.items.map((i) => `- ${i.name} (${i.size}) x${i.quantity}: ₹${(i.price * i.quantity).toLocaleString()}`).join("\n")}

Total: ₹${order.total.toLocaleString()}

Shipping To:
${order.customer.firstName} ${order.customer.lastName}
${order.customer.address}
${order.customer.city}, ${order.customer.state} ${order.customer.postalCode}

Track your order: ${SITE_URL}/track-order
  `.trim();

  return {
    subject: `Order Confirmed — #${order.orderId}`,
    html: layout(content),
    text,
  };
}

// ─── 2. Vendor New Order Notification ────────────────────────────

export function vendorNewOrderEmail(
  order: OrderData,
  vendorName: string,
  vendorItems: OrderItem[]
) {
  const itemRows = vendorItems
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:600;">${item.name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:center;">${item.size}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:center;">×${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const vendorTotal = vendorItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const content = `
    <div style="background:${ACCENT};border:3px solid ${BLACK};padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🔔 New Order</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:900;letter-spacing:2px;">#${order.orderId}</p>
    </div>
    
    <p style="font-size:16px;line-height:1.6;">
      Hey <strong>${vendorName}</strong>,<br/>
      Great news! You've received a new order. Here are the details for your items:
    </p>
    
    ${divider()}
    
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Your Items in This Order</h2>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">
      <tr style="border-bottom:2px solid ${BLACK};">
        <th style="text-align:left;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Item</th>
        <th style="text-align:center;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Size</th>
        <th style="text-align:center;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="text-align:right;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Amount</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="3" style="padding:12px 0;font-weight:900;border-top:3px solid ${BLACK};">Your Total</td>
        <td style="padding:12px 0;text-align:right;font-weight:900;font-size:16px;border-top:3px solid ${BLACK};">₹${vendorTotal.toLocaleString()}</td>
      </tr>
    </table>
    
    ${divider()}
    
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Ship To</h2>
    <p style="margin:0;font-size:14px;line-height:1.6;color:${GRAY};">
      ${order.customer.firstName} ${order.customer.lastName}<br/>
      ${order.customer.address}${order.customer.address2 ? "<br/>" + order.customer.address2 : ""}<br/>
      ${order.customer.city}, ${order.customer.state} ${order.customer.postalCode}<br/>
      📞 ${order.customer.email}
    </p>
    
    ${button("GO TO YOUR DASHBOARD", `${SITE_URL}/vendor/orders`)}
    
    <p style="font-size:13px;color:${GRAY};line-height:1.5;">
      Please prepare and ship this order as soon as possible. Update the status to "Shipped" from your dashboard once dispatched.
    </p>
  `;

  const text = `
New Order Received: #${order.orderId}
Hey ${vendorName}, you've received a new order for your items!

Items:
${vendorItems.map((i) => `- ${i.name} (${i.size}) x${i.quantity}: ₹${(i.price * i.quantity).toLocaleString()}`).join("\n")}

Total for your items: ₹${vendorTotal.toLocaleString()}

Ship To:
${order.customer.firstName} ${order.customer.lastName}
${order.customer.address}
${order.customer.city}, ${order.customer.state} ${order.customer.postalCode}

Manage orders in your dashboard: ${SITE_URL}/vendor/orders
  `.trim();

  return {
    subject: `New Order Received — #${order.orderId}`,
    html: layout(content),
    text,
  };
}

// ─── 3. Order Shipped (Buyer) ────────────────────────────────────

export function orderShippedEmail(orderId: string, customerName: string) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;margin-bottom:8px;">📦</div>
      <h2 style="margin:0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Your Order Has Shipped!</h2>
    </div>
    
    <p style="font-size:16px;line-height:1.6;text-align:center;">
      Hey <strong>${customerName}</strong>, your order <strong style="background:${ACCENT};padding:2px 8px;">#${orderId}</strong> is on its way!
    </p>
    
    <p style="font-size:14px;line-height:1.6;text-align:center;color:${GRAY};">
      The vendor has packed your items and handed them off for delivery. You should receive them soon.
    </p>
    
    <div style="text-align:center;">
      ${button("TRACK YOUR ORDER", `${SITE_URL}/track-order`)}
    </div>
    
    ${divider()}
    
    <p style="font-size:13px;color:${GRAY};line-height:1.5;text-align:center;">
      If you have any questions about your delivery, just reply to this email. We're always here to help.
    </p>
  `;

  const text = `
Your Order #${orderId} has Shipped!
Hey ${customerName}, your order is on its way! Our vendor has handed it off for delivery.

Track your order: ${SITE_URL}/track-order
  `.trim();

  return {
    subject: `Order Shipped — #${orderId}`,
    html: layout(content),
    text,
  };
}

// ─── 4. Order Delivered (Buyer) ──────────────────────────────────

export function orderDeliveredEmail(orderId: string, customerName: string) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;margin-bottom:8px;">✅</div>
      <h2 style="margin:0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Order Delivered!</h2>
    </div>
    
    <p style="font-size:16px;line-height:1.6;text-align:center;">
      Hey <strong>${customerName}</strong>, your order <strong style="background:${ACCENT};padding:2px 8px;">#${orderId}</strong> has been delivered!
    </p>
    
    <p style="font-size:14px;line-height:1.6;text-align:center;color:${GRAY};">
      We hope you love your thrift picks! Sustainable fashion for the win. Thank you for shopping sustainably with us.
    </p>
    
    <div style="text-align:center;">
      ${button("BROWSE MORE STYLES", `${SITE_URL}/shop`)}
    </div>
    
    ${divider()}
    
    <div style="background:${LIGHT_BG};border:3px solid ${BLACK};padding:20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Why Racksup?</p>
      <p style="margin:0;font-size:13px;color:${GRAY};line-height:1.5;">
        🌱 Trusted Sellers &nbsp;·&nbsp; ✅ Verified Vendors &nbsp;·&nbsp; ♻️ Sustainable Fashion
      </p>
    </div>
  `;

  const text = `
Order Delivered: #${orderId}
Hey ${customerName}, your order has been delivered! We hope you love your thrift finds.

Browse more: ${SITE_URL}/shop
  `.trim();

  return {
    subject: `Order Delivered — #${orderId}`,
    html: layout(content),
    text,
  };
}

// ─── 4.1 Order Confirmed (Buyer) ─────────────────────────────────

export function orderConfirmedEmail(orderId: string, customerName: string) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;margin-bottom:8px;">🤝</div>
      <h2 style="margin:0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Order Confirmed!</h2>
    </div>
    
    <p style="font-size:16px;line-height:1.6;text-align:center;">
      Hey <strong>${customerName}</strong>, your order <strong style="background:${ACCENT};padding:2px 8px;">#${orderId}</strong> has been confirmed by the vendor!
    </p>
    
    <p style="font-size:14px;line-height:1.6;text-align:center;color:${GRAY};">
      The vendor is now preparing your items for shipment. You'll receive another email with tracking details once it's on the way.
    </p>
    
    <div style="text-align:center;">
      ${button("VIEW ORDER STATUS", `${SITE_URL}/track-order`)}
    </div>
    
    ${divider()}
    
    <p style="font-size:13px;color:${GRAY};line-height:1.5;text-align:center;">
      Thank you for choosing Racksup and supporting sustainable fashion!
    </p>
  `;

  const text = `
Order Confirmed: #${orderId}
Hey ${customerName}, your order has been confirmed by the vendor and is being prepared for shipment.

Status: ${SITE_URL}/track-order
  `.trim();

  return {
    subject: `Order Confirmed — #${orderId}`,
    html: layout(content),
    text,
  };
}

// ─── 4.2 Order Cancelled (Buyer) ─────────────────────────────────

export function orderCancelledEmail(orderId: string, customerName: string) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;margin-bottom:8px;">❌</div>
      <h2 style="margin:0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Order Cancelled</h2>
    </div>
    
    <p style="font-size:16px;line-height:1.6;text-align:center;">
      Hey <strong>${customerName}</strong>, we're sorry to inform you that your order <strong style="background:#ff4d4d;color:#fff;padding:2px 8px;">#${orderId}</strong> has been cancelled by the vendor.
    </p>
    
    <p style="font-size:14px;line-height:1.6;text-align:center;color:${GRAY};">
      This usually happens if the item is no longer in stock or there was an issue with the product. Any payment made will be refunded to your original payment method within 5-7 business days.
    </p>
    
    <div style="text-align:center;">
      ${button("CONTINUE SHOPPING", `${SITE_URL}/shop`)}
    </div>
    
    ${divider()}
    
    <p style="font-size:13px;color:${GRAY};line-height:1.5;text-align:center;">
      We apologize for the inconvenience. Let us know if you have any questions.
    </p>
  `;

  const text = `
Order Cancelled: #${orderId}
Hey ${customerName}, we're sorry but your order has been cancelled by the vendor.
A refund will be processed to your original payment method.

Shop again: ${SITE_URL}/shop
  `.trim();

  return {
    subject: `Order Cancelled — #${orderId}`,
    html: layout(content),
    text,
  };
}

// ─── 5. Vendor Welcome Email ─────────────────────────────────────

export function vendorWelcomeEmail(storeName: string, email: string) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;margin-bottom:8px;">🎉</div>
      <h2 style="margin:0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Welcome to Racksup!</h2>
    </div>
    
    <p style="font-size:16px;line-height:1.6;">
      Hey <strong>${storeName}</strong>,<br/>
      Welcome aboard! You're now part of India's freshest thrift and preloved marketplace. We're stoked to have you as a vendor.
    </p>
    
    ${divider()}
    
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Why Sell on Racksup?</h2>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <strong style="font-size:16px;">🏷️ High Volume, Great Community</strong><br/>
          <span style="font-size:13px;color:${GRAY};">Connect with buyers looking for sustainable fashion and quality preloved items.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <strong style="font-size:16px;">✅ Verified Vendor Badge</strong><br/>
          <span style="font-size:13px;color:${GRAY};">Complete your profile to get verified. Buyers trust verified sellers more.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <strong style="font-size:16px;">♻️ Sustainable Fashion</strong><br/>
          <span style="font-size:13px;color:${GRAY};">You're contributing to a greener planet. Every preloved item matters.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <strong style="font-size:16px;">📱 Easy Dashboard</strong><br/>
          <span style="font-size:13px;color:${GRAY};">List products, manage orders, and track revenue — all from one clean dashboard.</span>
        </td>
      </tr>
    </table>
    
    ${divider()}
    
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Get Started in 3 Steps</h2>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:8px 0;">
          <span style="background:${ACCENT};border:2px solid ${BLACK};padding:4px 10px;font-weight:900;margin-right:8px;">1</span>
          Complete your vendor profile with store details & bank info
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="background:${ACCENT};border:2px solid ${BLACK};padding:4px 10px;font-weight:900;margin-right:8px;">2</span>
          List your first product with photos and sizes
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="background:${ACCENT};border:2px solid ${BLACK};padding:4px 10px;font-weight:900;margin-right:8px;">3</span>
          Start gaining visibility within our community!
        </td>
      </tr>
    </table>
    
    ${button("GO TO YOUR DASHBOARD", `${SITE_URL}/vendor/dashboard`)}
    
    <p style="font-size:13px;color:${GRAY};line-height:1.5;">
      Your account: <strong>${email}</strong><br/>
      Need help? Reply to this email and we will get back to you.
    </p>
  `;

  const text = `
Welcome to Racksup, ${storeName}!
You're now part of India's freshest thrift marketplace.

Get started by completing your profile and listing your first product.
Dashboard: ${SITE_URL}/vendor/dashboard
  `.trim();

  return {
    subject: `Welcome to Racksup — Your Account is Ready`,
    html: layout(content),
    text,
  };
}

// ─── 6. Vendor Login Notification ────────────────────────────────

export function vendorLoginEmail(storeName: string) {
  const now = new Date();
  const timestamp = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const content = `
    <div style="background:#f0f0f0;border:3px solid ${BLACK};padding:20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🔐 Security Alert</p>
      <p style="margin:8px 0 0;font-size:14px;color:${GRAY};">New login detected on your vendor account</p>
    </div>
    
    <p style="font-size:16px;line-height:1.6;">
      Hey <strong>${storeName}</strong>,<br/>
      We noticed a new login to your Racksup seller account.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;font-size:14px;">
      <tr>
        <td style="padding:8px 0;font-weight:700;width:100px;">When</td>
        <td style="padding:8px 0;">${timestamp} IST</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;">Account</td>
        <td style="padding:8px 0;">${storeName}</td>
      </tr>
    </table>
    
    <p style="font-size:14px;line-height:1.6;color:${GRAY};">
      If this was you, no action is needed. If you didn't log in, please reset your password immediately and contact us.
    </p>
    
    ${divider()}
    
    <p style="font-size:12px;color:${GRAY};line-height:1.5;">
      This is an automated security notification from Racksup. We send these to keep your account safe.
    </p>
  `;

  const text = `
Security Alert: New login detected for ${storeName}
If this wasn't you, please reset your password immediately.
  `.trim();

  return {
    subject: `New Login to Your Store — Racksup`,
    html: layout(content),
    text,
  };
}

// ─── 7. Vendor Verified (Vendor) ─────────────────────────────────

export function vendorVerifiedEmail(storeName: string) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:62px;margin-bottom:8px;">🚀</div>
      <h2 style="margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#000;">Store Verified</h2>
    </div>
    
    <p style="font-size:18px;line-height:1.6;text-align:center;font-weight:700;">
      Congratulations, <strong>${storeName.toUpperCase()}</strong>!
    </p>
    
    <p style="font-size:16px;line-height:1.6;text-align:center;color:${GRAY};">
      Your vendor profile has been officially approved. You can now start listing items and reach our fast-growing community of buyers.
    </p>

    <div style="background:${LIGHT_BG};border:3px solid ${BLACK};padding:20px;margin:24px 0;text-align:center;">
       <p style="margin:0;font-size:15px;font-weight:800;text-transform:uppercase;">What happens now?</p>
       <p style="margin:8px 0 0;font-size:14px;line-height:1.5;">
         Your store now has a <strong>Verified Badge</strong> — this helps buyers trust your listings and helps you stand out in the marketplace.
       </p>
    </div>
    
    <p style="font-size:15px;line-height:1.6;text-align:center;">
      Go ahead and list your best pieces. We're stoked to see your collection live and help you reach thousands of thrift lovers across India.
    </p>
    
    <div style="text-align:center;">
      ${button("START SELLING NOW", `${SITE_URL}/vendor/dashboard`)}
    </div>
    
    ${divider()}
    
    <p style="font-size:13px;color:${GRAY};line-height:1.5;text-align:center;">
      If you need any tips on setting up your shop, just reply to this email.
    </p>
  `;

  const text = `
Store Verified
Congratulations, ${storeName}! Your vendor profile has been officially approved.
You can now start listing on Racksup.

Start selling: ${SITE_URL}/vendor/dashboard
  `.trim();

  return {
    subject: `Your Store Has Been Verified — Racksup`,
    html: layout(content),
    text,
  };
}
