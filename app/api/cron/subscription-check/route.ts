import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

// Lazy initialization of Firebase Admin
let adminApp: App | null = null
let adminFirestore: Firestore | null = null

function getAdminDb(): Firestore {
  if (!adminFirestore) {
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    }
    adminFirestore = getFirestore()
  }
  return adminFirestore
}

// This endpoint should be called by a cron job (e.g., Vercel Cron) daily
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron or has the correct authorization
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const db = getAdminDb()
    const results = {
      trialEndingWarnings: 0,
      trialsExpired: 0,
      deletionWarnings: 0,
      accountsDeleted: 0,
    }

    // 1. Find families with trials ending in 3 days, 1 day (send warnings)
    const trialWarningDays = [3, 1]
    for (const days of trialWarningDays) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + days)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      const trialEndingFamilies = await db
        .collection("families")
        .where("accountStatus", "==", "trial")
        .where("trialEndsAt", ">=", startOfDay)
        .where("trialEndsAt", "<=", endOfDay)
        .get()

      for (const familyDoc of trialEndingFamilies.docs) {
        const family = familyDoc.data()
        
        // Get family manager
        const managerSnapshot = await db
          .collection("users")
          .where("familyId", "==", familyDoc.id)
          .where("role", "==", "family_manager")
          .limit(1)
          .get()

        if (!managerSnapshot.empty) {
          const manager = managerSnapshot.docs[0].data()
          
          // Send trial ending email
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/trial-ending`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: manager.email,
              displayName: manager.displayName,
              familyName: family.name,
              trialEndsAt: family.trialEndsAt.toDate().toISOString(),
              daysRemaining: days,
            }),
          })
          results.trialEndingWarnings++
        }
      }
    }

    // 2. Find and lock expired trials
    const expiredTrialFamilies = await db
      .collection("families")
      .where("accountStatus", "==", "trial")
      .where("trialEndsAt", "<=", now)
      .get()

    for (const familyDoc of expiredTrialFamilies.docs) {
      const family = familyDoc.data()
      
      // Check if they have an active subscription
      const subscriptionSnapshot = await db
        .collection("subscriptions")
        .where("familyId", "==", familyDoc.id)
        .where("status", "in", ["active", "trialing"])
        .limit(1)
        .get()

      if (subscriptionSnapshot.empty) {
        // No active subscription, lock the account
        const deletionDate = new Date(now)
        deletionDate.setDate(deletionDate.getDate() + 30)

        await db.collection("families").doc(familyDoc.id).update({
          accountStatus: "locked",
          trialEndedAt: now,
          accountLockedAt: now,
          scheduledDeletionAt: deletionDate,
        })

        // Get family manager
        const managerSnapshot = await db
          .collection("users")
          .where("familyId", "==", familyDoc.id)
          .where("role", "==", "family_manager")
          .limit(1)
          .get()

        if (!managerSnapshot.empty) {
          const manager = managerSnapshot.docs[0].data()
          
          // Send trial ended email
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/trial-ended`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: manager.email,
              displayName: manager.displayName,
              familyName: family.name,
              deletionDate: deletionDate.toISOString(),
            }),
          })
        }

        results.trialsExpired++
      }
    }

    // 3. Send deletion warnings (at 7 days and 1 day before deletion)
    const deletionWarningDays = [7, 1]
    for (const days of deletionWarningDays) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + days)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      const deletionWarningFamilies = await db
        .collection("families")
        .where("accountStatus", "==", "locked")
        .where("scheduledDeletionAt", ">=", startOfDay)
        .where("scheduledDeletionAt", "<=", endOfDay)
        .get()

      for (const familyDoc of deletionWarningFamilies.docs) {
        const family = familyDoc.data()
        
        // Get family manager
        const managerSnapshot = await db
          .collection("users")
          .where("familyId", "==", familyDoc.id)
          .where("role", "==", "family_manager")
          .limit(1)
          .get()

        if (!managerSnapshot.empty) {
          const manager = managerSnapshot.docs[0].data()
          
          // Send deletion warning email
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/deletion-warning`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: manager.email,
              displayName: manager.displayName,
              familyName: family.name,
              deletionDate: family.scheduledDeletionAt.toDate().toISOString(),
              daysRemaining: days,
            }),
          })
          results.deletionWarnings++
        }
      }
    }

    // 4. Delete families that have passed their deletion date
    const deletionFamilies = await db
      .collection("families")
      .where("accountStatus", "==", "locked")
      .where("scheduledDeletionAt", "<=", now)
      .get()

    for (const familyDoc of deletionFamilies.docs) {
      const family = familyDoc.data()
      const familyId = familyDoc.id

      // Get family manager for notification
      const managerSnapshot = await db
        .collection("users")
        .where("familyId", "==", familyId)
        .where("role", "==", "family_manager")
        .limit(1)
        .get()

      let managerEmail = ""
      let managerName = ""

      if (!managerSnapshot.empty) {
        const manager = managerSnapshot.docs[0].data()
        managerEmail = manager.email
        managerName = manager.displayName
      }

      // Delete all family data
      // 1. Delete documents
      const documentsSnapshot = await db
        .collection("documents")
        .where("familyId", "==", familyId)
        .get()
      for (const doc of documentsSnapshot.docs) {
        await doc.ref.delete()
      }

      // 2. Delete trusted contacts
      const contactsSnapshot = await db
        .collection("trusted_contacts")
        .where("familyId", "==", familyId)
        .get()
      for (const doc of contactsSnapshot.docs) {
        await doc.ref.delete()
      }

      // 3. Delete emergency events
      const emergencySnapshot = await db
        .collection("emergency_events")
        .where("familyId", "==", familyId)
        .get()
      for (const doc of emergencySnapshot.docs) {
        await doc.ref.delete()
      }

      // 4. Delete audit logs
      const auditSnapshot = await db
        .collection("audit_logs")
        .where("familyId", "==", familyId)
        .get()
      for (const doc of auditSnapshot.docs) {
        await doc.ref.delete()
      }

      // 5. Delete subscriptions
      const subscriptionSnapshot = await db
        .collection("subscriptions")
        .where("familyId", "==", familyId)
        .get()
      for (const doc of subscriptionSnapshot.docs) {
        await doc.ref.delete()
      }

      // 6. Delete users (note: Firebase Auth users should be deleted separately)
      const usersSnapshot = await db
        .collection("users")
        .where("familyId", "==", familyId)
        .get()
      for (const doc of usersSnapshot.docs) {
        await doc.ref.delete()
      }

      // 7. Update family to deleted status (keep minimal record)
      await db.collection("families").doc(familyId).update({
        accountStatus: "deleted",
        deletedAt: now,
        name: "[Deleted]",
        // Clear sensitive data but keep the record
      })

      // Send deletion notification
      if (managerEmail) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/data-deleted`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: managerEmail,
            displayName: managerName,
            familyName: family.name,
          }),
        })
      }

      results.accountsDeleted++
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Subscription check error:", error)
    return NextResponse.json(
      { error: "Failed to process subscription checks" },
      { status: 500 }
    )
  }
}
