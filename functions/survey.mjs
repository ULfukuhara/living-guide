import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

function readSurvey(body) {
  if (!body || typeof body !== "object") return null;
  const { token, source, room_score, broker_score, management_score, comment } = body;
  if (
    typeof token !== "string" || !/^[A-Za-z0-9_-]{20,200}$/.test(token) ||
    typeof source !== "string" || source.length > 100 ||
    typeof comment !== "string" || comment.length > 3000 ||
    ![room_score, broker_score, management_score].every(score => Number.isInteger(score) && score >= 1 && score <= 5)
  ) return null;
  return { token, source, room_score, broker_score, management_score, comment };
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

    const quota = db.doc("guide_internal/survey_submission_window");
    const answers = db.collection("movein_survey");
    const tokenHash = createHash("sha256").update(survey.token).digest("hex");
    const answer = answers.doc("qr_" + tokenHash);
    try {
      const status = await db.runTransaction(async transaction => {
        const now = Date.now();
        const room = (await transaction.get(db.collection("postdials").doc(survey.token))).data();
        const expires = room?.tokenExpiresAt;
        const propertyNo = String(room?.propertyNo || room?.["物件No"] || room?.bukkenNo || "").trim();
        if (
          room?.token !== survey.token || room?.tokenIsActive !== true ||
          !/^\d{1,50}$/.test(propertyNo) ||
          (expires !== undefined && !(expires?.toMillis?.() > now))
        ) return 400;

        if ((await transaction.get(answer)).exists) return 409;
        const previous = await transaction.get(answers.where("token", "==", survey.token).limit(1));
        if (!previous.empty) return 409;

        const property = await transaction.get(db.collection("properties_shiori").doc(propertyNo));
        if (!property.exists) return 400;

        const minute = Math.floor(now / 60_000);
        const window = (await transaction.get(quota)).data();
        const count = window?.minute === minute ? (window.count ?? window.fingerprints.length) : 0;
        if (count >= 10) return 429;

        transaction.set(quota, { minute, count: count + 1 });
        transaction.create(answer, {
          ...survey,
          propertyNo,
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
