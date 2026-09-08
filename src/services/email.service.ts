import { Resend } from "resend";

// Initialize Resend safely (prevents crashing in tests or dev when key is absent)
const getResendClient = (): Resend | null => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "re_your_actual_key_here" || apiKey.trim() === "") {
        return null;
    }
    return new Resend(apiKey);
};

interface SendResetEmailOptions {
    email: string;
    name: string;
    resetToken: string;
}

/**
 * Sends a password reset email to the user with a secure 15-minute link.
 * Includes a terminal fallback for development when no API key is present.
 */
export const sendPasswordResetEmail = async ({
    email,
    name,
    resetToken,
}: SendResetEmailOptions): Promise<boolean> => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    const resend = getResendClient();

    // Fallback: If no RESEND_API_KEY is configured, print the link to terminal for local testing
    if (!resend) {
        console.log("\n=======================================================");
        console.log("📨 [DEV EMAIL SIMULATOR] Password Reset Requested");
        console.log(`To: ${email} (${name})`);
        console.log(`Reset Link: ${resetLink}`);
        console.log("=======================================================\n");
        return true;
    }

    try {
        // Free Tier Tip: Resend allows sending from 'onboarding@resend.dev' without a custom domain!
        const { data, error } = await resend.emails.send({
            from: "StackPulse <onboarding@resend.dev>",
            to: [email],
            subject: "Reset your StackPulse password",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 20px; }
            .card { max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 32px; }
            .logo { font-size: 24px; font-weight: 800; color: #6366f1; margin-bottom: 24px; }
            h2 { color: #f8fafc; margin-bottom: 12px; }
            p { color: #94a3b8; line-height: 1.6; font-size: 15px; }
            .btn { display: inline-block; background-color: #6366f1; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">⚡ StackPulse</div>
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.</p>
            <a href="${resetLink}" class="btn">Reset Password</a>
            <p style="font-size: 13px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${resetLink}" style="color: #a5b4fc;">${resetLink}</a></p>
            <div class="footer">
              If you didn't request this password reset, you can safely ignore this email. Your account remains secure.
            </div>
          </div>
        </body>
        </html>
      `,
        });

        if (error) {
            console.error("❌ Failed to send email via Resend:", error);
            return false;
        }

        console.log("✅ Password reset email sent successfully. ID:", data?.id);
        return true;
    } catch (err) {
        console.error("❌ Error sending reset email:", err);
        return false;
    }
};
