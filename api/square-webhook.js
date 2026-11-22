// api/square-webhook.js — Vercel Serverless Function (Node.js)
// Endpoint: https://vault.epiccard.quest/api/square-webhook
//
// Required Vercel Environment Variables:
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY
//   SQUARE_WEBHOOK_SIGNATURE_KEY
//   SQUARE_WEBHOOK_URL (e.g. https://vault.epiccard.quest/api/square-webhook)

import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Disable Vercel's default JSON body parsing so we can verify Square's exact raw HMAC signature
export const config = {
  api: {
    bodyParser: false,
  },
};

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function verifySquareSignature(rawBody, signatureHeader, signatureKey, notificationUrl) {
  if (!signatureHeader || !signatureKey || !notificationUrl) return false;
  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(notificationUrl + rawBody);
  const expectedSignature = hmac.digest("base64");

  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  const receivedBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["x-square-hmacsha256-signature"];

    const isValid = verifySquareSignature(
      rawBody,
      signature,
      process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
      process.env.SQUARE_WEBHOOK_URL
    );

    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(rawBody);

    // Trigger when a payment completes
    if (event.type === "payment.updated") {
      const payment = event.data?.object?.payment;

      if (payment?.status === "COMPLETED") {
        const buyerEmail = payment.buyer_email_address?.toLowerCase();
        const amountPaid = (payment.amount_money?.amount || 0) / 100;

        if (buyerEmail) {
          const db = getAdminDb();

          // Find the most recent pending submission for this email
          const snapshot = await db
            .collection("vault_submissions")
            .where("email", "==", buyerEmail)
            .where("paymentStatus", "==", "pending")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

          if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            await docSnap.ref.update({
              paymentStatus: "paid",
              squarePaymentId: payment.id,
              amountPaid,
              paidAt: FieldValue.serverTimestamp(),
            });
          }
        }
      }
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Square Webhook Error:", err);
    return res.status(500).send("Webhook Error");
  }
}
