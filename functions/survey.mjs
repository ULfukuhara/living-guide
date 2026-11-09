import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

function readSurvey(body) {
  if (!body || typeof body !== "object") return null;
  const { token, propertyNo, source, room_score, broker_score, management_score, comment } = body;
  if (
    !(token == null || (typeof token === "string" && /^[A-Za-z0-9_-]{20,200}$/.test(token))) ||
    typeof propertyNo !== "string" || !/^\d{1,50}$/.test(propertyNo) ||
    typeof source !== "string" || source.length > 100 ||
    typeof comment !== "string" || comment.length > 3000 ||
    ![room_score, broker_score, management_score].every(score => Number.isInteger(score) && score >= 1 && score <= 5)
  ) return null;
  return { token: token ?? null, propertyNo, source, room_score, broker_score, management_score, comment };
}

export const submitMoveInSurvey = onRequest(
  { region: "asia-northeast1", maxInstances: 2, concurrency: 10, timeoutSeconds: 15 },
  async (req, res) => {
    res.set("Cache-Control", "no-store");
    if (req.method !== "POST") {
      res.set("Allow", "POST").status(405).end();
      return;
    }
    const survey = req.is("application/json") && readSurvey(req.body);
    if (!survey) {
      res.status(400).end();
      return;
    }

    const minute = Math.floor(Date.now() / 60_000);
    const quota = db.doc("guide_internal/survey_submission_window");
    const answer = db.collection("movein_survey").doc();
    const fingerprint = createHash("sha256").update(JSON.stringify([
      survey.propertyNo, survey.token, survey.room_score, survey.broker_score,
      survey.management_score, survey.comment.trim()
    ])).digest("hex");
    try {
      const status = await db.runTransaction(async transaction => {
        const window = (await transaction.get(quota)).data();
        const fingerprints = window?.minute === minute ? window.fingerprints : [];
        if (fingerprints.includes(fingerprint)) return 200;
        if (fingerprints.length >= 10) return 429;

        const property = await transaction.get(db.collection("properties_shiori").doc(survey.propertyNo));
        if (!property.exists) return 400;
        if (survey.token) {
          const room = (await transaction.get(db.collection("postdials").doc(survey.token))).data();
          const expires = room?.tokenExpiresAt;
          if (
            room?.token !== survey.token || room?.tokenIsActive !== true ||
            String(room.propertyNo || room["物件No"] || room.bukkenNo || "") !== survey.propertyNo ||
            (expires !== undefined && !(expires?.toMillis?.() > Date.now()))
          ) return 400;
        }

        transaction.set(quota, { minute, fingerprints: [...fingerprints, fingerprint] });
        transaction.create(answer, {
          ...survey,
          user_agent: (req.get("user-agent") || "").slice(0, 500),
          created_at: FieldValue.serverTimestamp()
        });
        return 201;
      });
      if (status === 429) res.set("Retry-After", "60");
      res.status(status).end();
    } catch (error) {
      console.error("Survey transaction failed", error.code || error.name);
      res.status(503).end();
    }
  }
);
