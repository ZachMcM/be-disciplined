import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "../db";
import { resend } from "./resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  session: {
    expiresIn: 365 * 24 * 60 * 60, // one year
  },
  user: {
    additionalFields: {
      onboardingStep: {
        type: "string",
        defaultValue: "name",
        required: false,
      },
    },
  },
  plugins: [
    expo(),
    emailOTP({
      changeEmail: {
        enabled: true,
      },
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in" || type === "change-email") {
          await resend.emails.send({
            from: `Be Disciplined <${process.env.RESEND_FROM_OTP_DNS}>`,
            to: email,
            subject: "Your Be Disciplined one-time verification code",
            html: `One-Time Verification Code: ${otp}. Do not share it with anyone.`,
          });
        }
      },
    }),
  ],
  trustedOrigins: [
    "be-disciplined://", // Production Expo app
    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://*/*",
          "exp://10.0.0.*:*/*",
          "exp://192.168.*.*:*/*",
          "exp://172.*.*.*:*/*",
          "exp://localhost:*/*",
        ]
      : []),
  ],
});
