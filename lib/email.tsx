import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || "LifeDocs Family <noreply@lifedocs.family>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lifedocs.family"

// ==========================================
// Welcome & Onboarding Emails
// ==========================================

export async function sendWelcomeEmail({
  email,
  displayName,
  familyName,
  trialEndsAt,
}: {
  email: string
  displayName: string
  familyName: string
  trialEndsAt: string
}) {
  const trialEndDate = new Date(trialEndsAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to LifeDocs Family - Your 7-Day Free Trial Has Started!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to LifeDocs Family!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Welcome to LifeDocs Family! Your family vault <strong>"${familyName}"</strong> has been created and your <strong>7-day free trial</strong> has started.
          </p>
          
          <div style="background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #0d9488; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">Trial Information</h3>
            <p style="color: #374151; margin: 0; font-size: 14px;">
              Your free trial ends on <strong>${trialEndDate}</strong>. During this time, you have full access to all features.
            </p>
          </div>
          
          <h3 style="color: #374151; font-size: 16px; margin: 24px 0 16px 0;">Get Started:</h3>
          <ol style="color: #374151; margin: 0; padding-left: 20px; line-height: 2;">
            <li>Set up your trusted contacts (required for emergency access)</li>
            <li>Upload your important family documents</li>
            <li>Invite family members to join your vault</li>
            <li>Configure your emergency access settings</li>
          </ol>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

// ==========================================
// Trial & Subscription Emails
// ==========================================

export async function sendTrialEndingEmail({
  email,
  displayName,
  familyName,
  trialEndsAt,
  daysRemaining,
}: {
  email: string
  displayName: string
  familyName: string
  trialEndsAt: string
  daysRemaining: number
}) {
  const trialEndDate = new Date(trialEndsAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your LifeDocs Family trial ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Trial is Ending Soon</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your free trial for <strong>"${familyName}"</strong> ends in <strong>${daysRemaining} day${daysRemaining === 1 ? "" : "s"}</strong> on ${trialEndDate}.
          </p>
          
          <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #854d0e; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">What Happens Next?</h3>
            <ul style="color: #713f12; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
              <li>If you subscribe, you'll continue to have full access</li>
              <li>If you don't subscribe, your account will be locked</li>
              <li>After 30 days of being locked, all data will be permanently deleted</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard/billing" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Subscribe Now
            </a>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            <strong>Plans start at just $7.99/month</strong> for up to 4 family members. Protect your family's important documents today.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendTrialEndedEmail({
  email,
  displayName,
  familyName,
  deletionDate,
}: {
  email: string
  displayName: string
  familyName: string
  deletionDate: string
}) {
  const deleteDate = new Date(deletionDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your LifeDocs Family trial has ended - Account Locked`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Trial Has Ended</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your free trial for <strong>"${familyName}"</strong> has ended and your account has been <strong>locked</strong>.
          </p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">Important Notice</h3>
            <p style="color: #991b1b; margin: 0; font-size: 14px;">
              Your data will be <strong>permanently deleted</strong> on <strong>${deleteDate}</strong> if you do not subscribe before then.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Don't lose your family's important documents! Subscribe now to restore access to your vault.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard/billing" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Subscribe & Restore Access
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendDeletionWarningEmail({
  email,
  displayName,
  familyName,
  deletionDate,
  daysRemaining,
}: {
  email: string
  displayName: string
  familyName: string
  deletionDate: string
  daysRemaining: number
}) {
  const deleteDate = new Date(deletionDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `URGENT: Your LifeDocs Family data will be deleted in ${daysRemaining} days`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">URGENT: Data Deletion Warning</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
            <p style="color: #991b1b; margin: 0; font-size: 18px; font-weight: bold;">
              All data in "${familyName}" will be permanently deleted in ${daysRemaining} days
            </p>
            <p style="color: #991b1b; margin: 8px 0 0 0; font-size: 14px;">
              Deletion Date: ${deleteDate}
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            This includes all documents, family member information, trusted contacts, and emergency settings.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>This action cannot be undone.</strong> Once deleted, your data cannot be recovered.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard/billing" style="display: inline-block; background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Subscribe Now to Save Your Data
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendDataDeletedEmail({
  email,
  displayName,
  familyName,
}: {
  email: string
  displayName: string
  familyName: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your LifeDocs Family data has been deleted`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Account Data Deleted</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            As previously notified, all data associated with your family vault <strong>"${familyName}"</strong> has been permanently deleted due to non-payment.
          </p>
          
          <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #4b5563; margin: 0; font-size: 14px;">
              This included all documents, family member information, trusted contacts, and emergency settings.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            If you would like to use LifeDocs Family in the future, you're welcome to create a new account at any time.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/auth/signup" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Create New Account
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendSubscriptionActivatedEmail({
  email,
  displayName,
  familyName,
  planName,
}: {
  email: string
  displayName: string
  familyName: string
  planName: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome! Your LifeDocs Family subscription is now active`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Subscription Activated!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for subscribing to LifeDocs Family! Your <strong>${planName}</strong> is now active.
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">Your Account</h3>
            <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
              <li>Family Vault: <strong>${familyName}</strong></li>
              <li>Plan: <strong>${planName}</strong></li>
              <li>Status: <strong>Active</strong></li>
            </ul>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            You now have full access to all features. Your family's documents are securely stored and protected.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

// ==========================================
// Document Emails
// ==========================================

export async function sendDocumentUploadedEmail({
  email,
  displayName,
  documentTitle,
  uploadedByName,
  familyName,
}: {
  email: string
  displayName: string
  documentTitle: string
  uploadedByName: string
  familyName: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `New document uploaded to ${familyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Document Added</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>${uploadedByName}</strong> has uploaded a new document to your family vault.
          </p>
          
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <p style="color: #0d9488; margin: 0 0 8px 0; font-size: 14px;"><strong>Document:</strong> ${documentTitle}</p>
            <p style="color: #0d9488; margin: 0; font-size: 14px;"><strong>Family:</strong> ${familyName}</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard/documents" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              View Documents
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendDocumentExpiringEmail({
  email,
  displayName,
  documentTitle,
  expirationDate,
  daysRemaining,
}: {
  email: string
  displayName: string
  documentTitle: string
  expirationDate: string
  daysRemaining: number
}) {
  const expDate = new Date(expirationDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Document expiring soon: ${documentTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Document Expiring Soon</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            The following document in your family vault will expire in <strong>${daysRemaining} day${daysRemaining === 1 ? "" : "s"}</strong>:
          </p>
          
          <div style="background: #fefce8; border: 1px solid #fde047; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <p style="color: #854d0e; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${documentTitle}</p>
            <p style="color: #854d0e; margin: 0; font-size: 14px;">Expires: ${expDate}</p>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Please review and update this document if necessary. This could be a passport, insurance policy, license, or other time-sensitive document.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard/documents" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              View Document
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

// ==========================================
// Family & Member Emails
// ==========================================

export async function sendFamilyMemberAddedEmail({
  managerEmail,
  managerName,
  memberName,
  memberEmail,
  familyName,
}: {
  managerEmail: string
  managerName: string
  memberName: string
  memberEmail: string
  familyName: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: managerEmail,
    subject: `New family member added to ${familyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Family Member Added</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${managerName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A new family member has been added to <strong>${familyName}</strong>:
          </p>
          
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <p style="color: #0d9488; margin: 0 0 8px 0; font-size: 14px;"><strong>Name:</strong> ${memberName}</p>
            <p style="color: #0d9488; margin: 0; font-size: 14px;"><strong>Email:</strong> ${memberEmail}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            They have been sent an invitation email with login instructions.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard/family" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Manage Family Members
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendTrustedContactNotification({
  contactEmail,
  contactName,
  addedByName,
  familyName,
}: {
  contactEmail: string
  contactName: string
  addedByName: string
  familyName: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: contactEmail,
    subject: `You've been designated as a trusted contact for ${familyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">LifeDocs Family</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${contactName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>${addedByName}</strong> has designated you as a trusted contact for their family vault in LifeDocs Family.
          </p>
          
          <div style="background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #0d9488; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">What This Means</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>You currently have <strong>NO access</strong> to any documents</li>
              <li>If an emergency is triggered, you will receive an email with access details</li>
              <li>Emergency access is temporary and only granted during genuine emergencies</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            You don't need to take any action at this time. You will only be contacted again if an emergency situation arises.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you have questions or did not expect this notification, please contact ${addedByName} directly.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendEmergencyTriggeredNotification({
  contactEmail,
  contactName,
  familyName,
  triggerType,
  triggeredByName,
  notes,
  accessToken,
}: {
  contactEmail: string
  contactName: string
  familyName: string
  triggerType: string
  triggeredByName: string
  notes?: string
  accessToken?: string
}) {
  const accessUrl = accessToken ? `${APP_URL}/emergency-access?token=${accessToken}` : APP_URL

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: contactEmail,
    subject: `URGENT: Emergency Access Granted - ${familyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">URGENT: Emergency Access Granted</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${contactName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            An emergency has been triggered for <strong>${familyName}</strong> by <strong>${triggeredByName}</strong>.
          </p>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <p style="color: #991b1b; margin: 0 0 8px 0; font-size: 14px;"><strong>Emergency Type:</strong> ${triggerType}</p>
            ${notes ? `<p style="color: #991b1b; margin: 0; font-size: 14px;"><strong>Additional Notes:</strong> ${notes}</p>` : ""}
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            You now have temporary access to the family's emergency vault documents.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${accessUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Access Emergency Vault
            </a>
          </div>
          
          <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #854d0e; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">Important</h3>
            <ul style="color: #713f12; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
              <li>This access is temporary and may be revoked at any time</li>
              <li>All access is logged for audit purposes</li>
              <li>Please handle all information with care and sensitivity</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you believe this notification was sent in error, please contact the family directly.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendEmergencyResolvedNotification({
  contactEmail,
  contactName,
  familyName,
  resolvedByName,
}: {
  contactEmail: string
  contactName: string
  familyName: string
  resolvedByName: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: contactEmail,
    subject: `Emergency Resolved - ${familyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Emergency Resolved</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${contactName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            The emergency for <strong>${familyName}</strong> has been resolved by <strong>${resolvedByName}</strong>.
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #166534; margin: 0; font-size: 14px;">
              Your access to the family's emergency vault has been revoked. You can no longer view any documents from this family.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for being available during this time. Your support means a lot to the family.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you have any questions, please contact the family directly.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendMemberInvitation({
  memberEmail,
  memberName,
  tempPassword,
  familyName,
  invitedByName,
}: {
  memberEmail: string
  memberName: string
  tempPassword: string
  familyName: string
  invitedByName: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: memberEmail,
    subject: `You've been added to ${familyName} on LifeDocs Family`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to LifeDocs Family</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${memberName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>${invitedByName}</strong> has added you to <strong>${familyName}</strong> on LifeDocs Family.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            LifeDocs Family is a secure platform for storing important family documents and preparing for emergencies.
          </p>
          
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <h3 style="color: #0d9488; margin: 0 0 16px 0; font-size: 16px;">To Get Started:</h3>
            <ol style="color: #374151; margin: 0; padding-left: 20px; line-height: 2;">
              <li>Visit <a href="${APP_URL}" style="color: #0d9488;">${APP_URL}</a></li>
              <li>Sign in with your email: <strong>${memberEmail}</strong></li>
              <li>Use this temporary password: <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></li>
              <li>Set up your trusted contacts (required before accessing the vault)</li>
            </ol>
          </div>
          
          <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #854d0e; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> Please change your password after logging in for the first time.
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/auth/signin" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Sign In Now
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you did not expect this invitation or have questions, please contact ${invitedByName} directly.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Best regards,<br />
            The LifeDocs Family Team
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    throw error
  }

  return data
}
