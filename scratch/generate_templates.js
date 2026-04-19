const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'src', 'modules', 'notification', 'templates', 'email', 'auth');

const templates = {
  otp: {
    schema: `import { IsString, IsNumber } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() otpCode: string;
  @IsNumber() validityMinutes: number;
  @IsString() requestTime: string;
  @IsString() expirationTime: string;
  @IsString() supportEmail: string;
}
`,
    subject: `{{userName}}, your One-Time Password (OTP) Request`,
    text: `Hello {{userName}},\n\nYour One-Time Password is {{otpCode}}.\nValid for {{validityMinutes}} minutes.\n\nIf you didn't request this, please secure your account immediately.\nSupport: {{supportEmail}}`,
    html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f6; padding-bottom: 60px; }
  .webkit { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-top: 40px; }
  .header { padding: 30px 40px; color: #ffffff; text-align: left; }
  .header-subtitle { font-size: 14px; opacity: 0.9; margin: 0; }
  .content { padding: 40px; color: #334155; }
  h2 { font-size: 20px; margin: 0 0 15px 0; color: #1e293b; }
  p { font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; }
  .footer { padding: 30px; text-align: center; background-color: #f8fafc; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
  .footer a { color: currentColor; text-decoration: underline; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="webkit">
    <div class="header" style="background: linear-gradient(135deg, #a855f7 0%, #4f46e5 100%);">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">🤍 Health Management System</div>
      <div class="header-subtitle">Password Recovery Request</div>
    </div>
    <div class="content">
      <h2>🔑 Password Reset Request</h2>
      <p>Hello {{userName}}, we received a request to reset your password. Use the One-Time Password (OTP) below to verify your identity and create a new password.</p>
      <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 15px;">Your One-Time Password</div>
        <div style="background: #ffffff; border-radius: 8px; padding: 15px; font-size: 42px; font-weight: 700; letter-spacing: 16px; color: #7e22ce; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: inline-block;">{{otpCode}}</div>
        <div style="margin-top: 15px; color: #7e22ce; font-size: 14px; font-weight: 500;">⏱ Valid for {{validityMinutes}} minutes</div>
      </div>
      <table width="100%" style="margin-bottom: 30px; font-size: 14px;">
        <tr>
          <td width="50%" style="color: #6b7280;">Request Time<br><strong style="color: #374151;">{{requestTime}}</strong></td>
          <td width="50%" style="color: #6b7280;">Expires At<br><strong style="color: #374151;">{{expirationTime}}</strong></td>
        </tr>
      </table>
      <div style="background: #eff6ff; border-radius: 8px; padding: 25px; border-left: 4px solid #3b82f6; margin-bottom: 30px;">
        <strong style="color: #1e3a8a; display: block; margin-bottom: 10px;">How to Reset Your Password</strong>
        <ol style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
          <li>Return to the password reset page</li>
          <li>Enter the OTP code shown above</li>
          <li>Create and confirm your new password</li>
          <li>Login with your new credentials</li>
        </ol>
      </div>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; color: #991b1b; font-size: 13px;">
        <strong style="display: block; margin-bottom: 5px;">⚠️ Security Alert</strong>
        If you didn't request this password reset, please ignore this email and ensure your account is secure. Consider changing your password immediately.<br><br>
        <strong>Never share your OTP with anyone, including our staff. We will never ask for your OTP via phone or email.</strong>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 13px; color: #64748b;">
        Experiencing issues? Contact our support team<br>
        <a href="mailto:{{supportEmail}}" style="color: #7e22ce; font-weight: bold; text-decoration: none;">{{supportEmail}}</a><br><br>
        Available 24/7 for your assistance
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Health Management System. All rights reserved.<br>
      This email contains confidential information. Keep your OTP secure.
    </div>
  </div>
</div>
</body>
</html>`
  },
  'new-device': {
    schema: `import { IsString } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() deviceName: string;
  @IsString() browser: string;
  @IsString() loginTime: string;
  @IsString() location: string;
  @IsString() ipAddress: string;
  @IsString() secureAccountLink: string;
}
`,
    subject: `Security Alert: New Device Login Detected`,
    text: `Hello {{userName}},\n\nWe detected a login from a new device ({{deviceName}}, {{browser}}).\nLocation: {{location}}\nIP: {{ipAddress}}\nTime: {{loginTime}}\n\nIf this wasn't you, secure your account: {{secureAccountLink}}`,
    html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f6; padding-bottom: 60px; }
  .webkit { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-top: 40px; }
  .header { padding: 30px 40px; color: #ffffff; text-align: left; }
  .header-subtitle { font-size: 14px; opacity: 0.9; margin: 0; }
  .content { padding: 40px; color: #334155; }
  h2 { font-size: 20px; margin: 0 0 15px 0; color: #1e293b; }
  p { font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; }
  .footer { padding: 30px; text-align: center; background-color: #f8fafc; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="webkit">
    <div class="header" style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">🤍 Health Management System</div>
      <div class="header-subtitle">Security Alert: New Device Login</div>
    </div>
    <div class="content">
      <h2>📱 New Device Detected</h2>
      <p>Hello {{userName}}, we detected a login to your account from a new device. If this was you, you can safely ignore this email. If not, please secure your account immediately.</p>
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 15px; text-align: center; color: #065f46; font-weight: 500; margin: 20px 0;">
        ✅ Login Successful<br><span style="font-size: 13px; font-weight: normal; color: #047857;">Your account was accessed from a new device</span>
      </div>
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background: #fafaf9; margin-bottom: 20px;">
        <strong style="color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; display: block; margin-bottom: 15px;">💻 Device &amp; Login Details</strong>
        <table width="100%" style="font-size: 14px; line-height: 1.6; color: #475569;">
          <tr><td style="padding-bottom: 10px;"><strong>Device:</strong></td><td style="padding-bottom: 10px;">{{deviceName}}<br><span style="font-size: 12px;">{{browser}}</span></td></tr>
          <tr><td style="padding-bottom: 10px;"><strong>Time of Login:</strong></td><td style="padding-bottom: 10px;">{{loginTime}}</td></tr>
          <tr><td style="padding-bottom: 10px;"><strong>Location:</strong></td><td style="padding-bottom: 10px;">{{location}}</td></tr>
          <tr><td><strong>IP Address:</strong></td><td><strong>{{ipAddress}}</strong></td></tr>
        </table>
      </div>
      <table width="100%" style="margin: 20px 0; border-collapse: separate; border-spacing: 10px 0;">
        <tr>
          <td width="48%" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; vertical-align: top;">
            <span style="font-size: 30px;">✅</span><br>
            <strong style="color: #166534; display: block; margin: 10px 0 5px;">This Was Me</strong>
            <p style="font-size: 12px; color: #166534; margin-bottom: 10px;">No action needed. Your account is secure.</p>
            <span style="color: #15803d; font-size: 12px; font-weight: 600;">You can close this email</span>
          </td>
          <td width="48%" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; text-align: center; vertical-align: top;">
             <span style="font-size: 30px;">⚠️</span><br>
             <strong style="color: #991b1b; display: block; margin: 10px 0 5px;">This Wasn't Me</strong>
             <p style="font-size: 12px; color: #991b1b; margin-bottom: 10px;">Secure your account immediately</p>
             <a href="{{secureAccountLink}}" style="display: inline-block; background: #e11d48; color: white; padding: 8px 15px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 600;">Secure Account Now</a>
          </td>
        </tr>
      </table>
      <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin-top: 30px;">
        <strong style="color: #1e40af; font-size: 14px; margin-bottom: 10px; display: block;">Security Recommendations</strong>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 13px; line-height: 1.6;">
          <li>Change your password regularly and use a strong, unique password</li>
          <li>Enable two-factor authentication for enhanced security</li>
          <li>Review your active sessions regularly from account settings</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Health Management System. All rights reserved.<br>
      This email contains confidential information.
    </div>
  </div>
</div>
</body>
</html>`
  },
  'welcome': {
    schema: `import { IsString } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() emailAddress: string;
  @IsString() temporaryPassword: string;
  @IsString() dashboardLink: string;
  @IsString() supportEmail: string;
}
`,
    subject: `Welcome to Health Management System, {{userName}}!`,
    text: `Welcome, {{userName}}!\n\nYour account has been created.\nEmail: {{emailAddress}}\nPassword: {{temporaryPassword}}\n\nPlease login to access your dashboard: {{dashboardLink}}\nSupport: {{supportEmail}}`,
    html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f6; padding-bottom: 60px; }
  .webkit { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-top: 40px; }
  .header { padding: 30px 40px; color: #ffffff; text-align: left; }
  .header-subtitle { font-size: 14px; opacity: 0.9; margin: 0; }
  .content { padding: 40px; color: #334155; }
  h2 { font-size: 20px; margin: 0 0 15px 0; color: #1e293b; }
  p { font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; }
  .footer { padding: 30px; text-align: center; background-color: #f8fafc; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="webkit">
    <div class="header" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">🤍 Health Management System</div>
      <div class="header-subtitle">Welcome to Your Health Journey</div>
    </div>
    <div class="content">
      <h2>Welcome, {{userName}}!</h2>
      <p>Your account has been successfully created. We're excited to have you on board! Below are your login credentials to access your health dashboard.</p>
      
      <div style="background: #f0f4ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 25px; margin: 30px 0;">
        <strong style="color: #1e3a8a; display: block; margin-bottom: 20px;">🔒 Your Login Credentials</strong>
        <div style="margin-bottom: 15px;">
          <div style="font-size: 13px; color: #475569; margin-bottom: 5px;">👤 Email Address</div>
          <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 15px; font-family: monospace; color: #1e293b;">{{emailAddress}}</div>
        </div>
        <div style="margin-bottom: 20px;">
          <div style="font-size: 13px; color: #475569; margin-bottom: 5px;">🔑 Temporary Password</div>
          <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 15px; font-family: monospace; color: #1e293b; font-weight: bold; letter-spacing: 1px;">{{temporaryPassword}}</div>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 15px; color: #92400e; font-size: 13px;">
          <strong>Security Note:</strong> Please change your password after your first login to ensure account security.
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{dashboardLink}}" style="background: #2563eb; color: white; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Access Your Dashboard</a>
      </div>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 30px;">
        <strong style="color: #334155; display: block; margin-bottom: 15px;">What You Can Do:</strong>
        <ul style="margin: 0; padding-left: 20px; color: #0369a1; font-size: 14px; line-height: 1.8;">
          <li>View and manage your medical records securely</li>
          <li>Schedule and track appointments with healthcare providers</li>
          <li>Access lab results and health reports</li>
          <li>Connect with your care team anytime</li>
        </ul>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 13px; color: #64748b;">
        Need help? Contact our support team<br>
        <a href="mailto:{{supportEmail}}" style="color: #2563eb; font-weight: bold; text-decoration: none;">{{supportEmail}}</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Health Management System. All rights reserved.<br>
      This email contains confidential information. If you received this by mistake, please delete it.
    </div>
  </div>
</div>
</body>
</html>`
  },
  'password-reset': {
        schema: `import { IsString } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() resetTime: string;
  @IsString() temporaryPassword: string;
  @IsString() loginLink: string;
  @IsString() securityHotline: string;
  @IsString() supportEmail: string;
}
`,
    subject: `Your Password has been Successfully Reset`,
    text: `Hello {{userName}},\n\nYour password has been reset successfully. \nNew Password: {{temporaryPassword}}\n\nPlease log in and change your password immediately.\nLogin: {{loginLink}}`,
    html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f6; padding-bottom: 60px; }
  .webkit { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-top: 40px; }
  .header { padding: 30px 40px; color: #ffffff; text-align: left; }
  .header-subtitle { font-size: 14px; opacity: 0.9; margin: 0; }
  .content { padding: 40px; color: #334155; }
  h2 { font-size: 20px; margin: 0 0 15px 0; color: #1e293b; }
  p { font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; }
  .footer { padding: 30px; text-align: center; background-color: #f8fafc; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="webkit">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">🤍 Health Management System</div>
      <div class="header-subtitle">Password Reset Confirmation</div>
    </div>
    <div class="content">
      <h2>🛡️ Password Successfully Reset</h2>
      <p>Hello {{userName}}, your password has been reset successfully. Below is your new system-generated password. Please use it to log in to your account.</p>
      
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 15px; color: #065f46; font-size: 14px; margin: 20px 0;">
        Reset Date: <strong>{{resetTime}}</strong>
      </div>
      
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <strong style="color: #0f766e; display: block; margin-bottom: 15px;">🔒 Your New Password</strong>
        <div style="background: #ffffff; border: 1px solid #14b8a6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">Temporary Password</div>
          <div style="font-family: monospace; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: 2px;">{{temporaryPassword}}</div>
        </div>
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; color: #92400e; font-size: 13px;">
          <strong style="display: block; margin-bottom: 5px;">⚠️ Important Security Steps:</strong>
          <ul style="margin: 0; padding-left: 15px;">
            <li>Change this password immediately after logging in</li>
            <li>Choose a strong, unique password</li>
            <li>Do not share this password with anyone</li>
          </ul>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="{{loginLink}}" style="background: #0d9488; color: white; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Login to Your Account</a>
      </div>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; text-align: center; color: #991b1b; font-size: 13px;">
        <strong style="display: block; margin-bottom: 10px;">🚨 Didn't Request This?</strong>
        If you didn't request a password reset, please contact our security team immediately. Your account may be compromised.<br><br>
        Security Hotline: <strong>{{securityHotline}}</strong>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 13px; color: #64748b;">
        Need assistance? We're here to help<br>
        <a href="mailto:{{supportEmail}}" style="color: #059669; font-weight: bold; text-decoration: none;">{{supportEmail}}</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Health Management System. All rights reserved.<br>
      This email contains confidential information. Please keep it secure.
    </div>
  </div>
</div>
</body>
</html>`
  }
};

for (const [tplName, files] of Object.entries(templates)) {
  const dirPath = path.join(baseDir, tplName);
  fs.mkdirSync(dirPath, { recursive: true });
  
  fs.writeFileSync(path.join(dirPath, tplName + '.schema.ts'), files.schema);
  fs.writeFileSync(path.join(dirPath, tplName + '.subject.hbs'), files.subject);
  fs.writeFileSync(path.join(dirPath, tplName + '.text.hbs'), files.text);
  fs.writeFileSync(path.join(dirPath, tplName + '.html.hbs'), files.html);
}
console.log('Templates created successfully.');
