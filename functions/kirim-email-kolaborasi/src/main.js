const TIME_ZONE = "Asia/Jakarta";
const DEFAULT_ADMIN_EMAIL = "hmti.ubsi.margonda@gmail.com";
const DEFAULT_SENDER = "HMTI Margonda <onboarding@resend.dev>";
const TEST_SENDER = "onboarding@resend.dev";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Eksekusi fungsi ini hanya sah bila dipicu event Appwrite (row collab_messages
// dibuat). Tanpa pemeriksaan ini, siapa pun yang tahu URL fungsi bisa POST
// body tiruan dan memicu email atas nama HMTI — spam inbox pengurus, penyalah
//gunaan identitas pengirim, dan konsumsi kuota Resend/Appwrite. Trigger event
// sendiri tidak butuh Execute permission (lihat README bagian Execute access).
const TRIGGER_EVENT = "event";
const EVENT_PATTERN =
  /^databases\.hmti\.tables\.collab_messages\.rows\.[^*]+\.create$/;

function getJakartaParts(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = {};
  for (const part of formatter.formatToParts(date)) parts[part.type] = part.value;
  return parts;
}

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function createProposalCode(createdAt, id) {
  const parts = getJakartaParts(createdAt);
  const date = parts ? `${parts.year}${parts.month}${parts.day}` : "00000000";
  const fingerprint = fnv1a(String(id)).toString(16).toUpperCase().padStart(8, "0").slice(0, 4);
  return `KOL-${date}-${fingerprint}`;
}

export function formatJakartaTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: TIME_ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " WIB"
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readRequestBody(req) {
  if (req?.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const body = req?.bodyText ?? req?.body;
  if (typeof body === "string") return JSON.parse(body);
  return body;
}

// Nama event disarikan dari ketiga bentuk body yang mungkin: bodyJson
// (Appwrite), string JSON, atau objek langsung (pemanggil lokal/uji).
function ambilEvents(req) {
  if (Array.isArray(req?.bodyJson?.events)) return req.bodyJson.events;
  const mentah = req?.bodyText ?? req?.body;
  if (typeof mentah === "string") {
    try {
      const parsed = JSON.parse(mentah);
      return Array.isArray(parsed?.events) ? parsed.events : null;
    } catch {
      return null;
    }
  }
  return Array.isArray(mentah?.events) ? mentah.events : null;
}

export function asalSah(req) {
  const trigger = String(req?.headers?.["x-appwrite-trigger"] ?? "").trim().toLowerCase();
  if (trigger !== TRIGGER_EVENT) return false;
  const events = ambilEvents(req);
  if (!events) return false;
  return events.some((event) => EVENT_PATTERN.test(String(event)));
}

export function extractRow(body) {
  const candidates = [
    body?.payload?.data,
    body?.payload?.row,
    body?.payload,
    body?.data?.row,
    body?.data,
    body?.row,
    body,
  ];

  return (
    candidates.find(
      (candidate) =>
        candidate &&
        typeof candidate === "object" &&
        ("$id" in candidate || "nama" in candidate || "pesan" in candidate)
    ) ?? null
  );
}

export function normalizeProposal(row) {
  const proposal = {
    id: String(row?.$id ?? "").trim(),
    createdAt: String(row?.$createdAt ?? "").trim(),
    name: String(row?.nama ?? "").trim(),
    email: String(row?.email ?? "").trim().toLowerCase(),
    type: String(row?.jenis ?? "").trim(),
    message: String(row?.pesan ?? "").trim(),
  };

  const invalidField = [
    !proposal.id && "$id",
    (!proposal.createdAt || Number.isNaN(new Date(proposal.createdAt).getTime())) && "$createdAt",
    (!proposal.name || proposal.name.length > 128) && "nama",
    (!EMAIL_PATTERN.test(proposal.email) || proposal.email.length > 128) && "email",
    (!proposal.type || proposal.type.length > 64) && "jenis",
    (!proposal.message || proposal.message.length > 4096) && "pesan",
  ].find(Boolean);

  return invalidField ? { ok: false, field: invalidField } : { ok: true, proposal };
}

function createAdminEmail({ code, time, name, email, type, message, siteUrl }) {
  const lines = [
    `Nomor referensi : ${code}`,
    `Waktu kirim     : ${time}`,
    `Jenis kolaborasi: ${type}`,
    `Nama / instansi : ${name}`,
    `Email pengaju   : ${email}`,
    "",
    "Isi pengajuan:",
    "",
    message,
    "",
    siteUrl ? `Buka panel laporan: ${siteUrl}/admin/kolaborasi` : "",
    "Balas email ini untuk membalas langsung ke pengaju.",
  ];

  const html = `<!doctype html>
<html lang="id">
<body style="margin:0;padding:24px;background:#f3efe5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#0e1b2a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d9d4c9;">
    <div style="background:#0e1b2a;color:#ffffff;padding:20px 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#eadb31;">Pengajuan kolaborasi baru</p>
      <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;">${escapeHtml(type)}</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.75);">Nomor referensi <strong style="color:#ffffff;">${escapeHtml(code)}</strong></p>
    </div>
    <div style="padding:22px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:7px 0;border-bottom:1px solid #d9d4c9;color:#526071;width:38%;">Waktu kirim</td><td style="padding:7px 0;border-bottom:1px solid #d9d4c9;">${escapeHtml(time)}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #d9d4c9;color:#526071;">Nama / instansi</td><td style="padding:7px 0;border-bottom:1px solid #d9d4c9;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #d9d4c9;color:#526071;">Email pengaju</td><td style="padding:7px 0;border-bottom:1px solid #d9d4c9;"><a href="mailto:${escapeHtml(email)}" style="color:#3c608b;">${escapeHtml(email)}</a></td></tr>
      </table>
      <p style="margin:22px 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#526071;">Isi pengajuan</p>
      <blockquote style="margin:0;border-left:3px solid #eadb31;background:#f3efe5;padding:14px 16px;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</blockquote>
      ${
        siteUrl
          ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(siteUrl)}/admin/kolaborasi" style="display:inline-block;background:#0e1b2a;color:#ffffff;padding:11px 18px;font-size:13px;font-weight:600;text-decoration:none;">Buka laporan kolaborasi</a></p>`
          : ""
      }
      <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#526071;">Balas email ini untuk membalas langsung ke pengaju. Catatan internal tetap berada di panel admin.</p>
    </div>
  </div>
</body>
</html>`;

  return { text: lines.filter(Boolean).join("\n"), html };
}

function createApplicantEmail({ code, time, name, type, message, adminEmail }) {
  const lines = [
    `Halo ${name},`,
    "",
    "Pengajuan kolaborasi Anda sudah tercatat di HMTI UBSI Margonda.",
    `Nomor referensi : ${code}`,
    `Waktu kirim     : ${time}`,
    `Jenis kolaborasi: ${type}`,
    "",
    "Isi pengajuan:",
    message,
    "",
    `Simpan nomor referensi tersebut. Pengurus akan membalas melalui email ini. Pertanyaan dapat dikirim ke ${adminEmail}.`,
  ];

  const html = `<!doctype html>
<html lang="id">
<body style="margin:0;padding:24px;background:#f3efe5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#0e1b2a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d9d4c9;">
    <div style="background:#0e1b2a;color:#ffffff;padding:20px 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#eadb31;">Pengajuan sudah tercatat</p>
      <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;">${escapeHtml(type)}</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.75);">Nomor referensi <strong style="color:#ffffff;">${escapeHtml(code)}</strong></p>
    </div>
    <div style="padding:22px 24px;">
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;">Halo ${escapeHtml(name)}, pengajuan Anda sudah tercatat di HMTI UBSI Margonda pada ${escapeHtml(time)}.</p>
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#526071;">Salinan isi pengajuan</p>
      <blockquote style="margin:0;border-left:3px solid #eadb31;background:#f3efe5;padding:14px 16px;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</blockquote>
      <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#526071;">Simpan nomor referensi ini. Pengurus akan membalas melalui alamat email yang Anda gunakan. Pertanyaan dapat dikirim ke <a href="mailto:${escapeHtml(adminEmail)}" style="color:#3c608b;">${escapeHtml(adminEmail)}</a>.</p>
    </div>
  </div>
</body>
</html>`;

  return { text: lines.join("\n"), html };
}

function providerError(text) {
  try {
    const parsed = JSON.parse(text);
    return String(parsed.name ?? parsed.type ?? "provider_error");
  } catch {
    return "provider_error";
  }
}

async function sendEmail({ apiKey, sender, recipient, replyTo, subject, content, idempotencyKey }) {
  const request = (includeReplyTo) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject,
        text: content.text,
        html: content.html,
        ...(includeReplyTo && replyTo ? { reply_to: replyTo } : {}),
      }),
    });

  let response = await request(true);
  let responseText = await response.text();
  if (!response.ok && replyTo && /reply_to/i.test(responseText)) {
    response = await request(false);
    responseText = await response.text();
  }

  if (!response.ok) {
    return { ok: false, status: response.status, type: providerError(responseText) };
  }

  try {
    return { ok: true, status: response.status, id: JSON.parse(responseText)?.id ?? null };
  } catch {
    return { ok: true, status: response.status, id: null };
  }
}

// Konfirmasi ke pengaju aktif secara default; isi EMAIL_KONFIRMASI_PENGAJU=false
// untuk mematikan. Selama pengirim masih memakai domain uji Resend
// (onboarding@resend.dev), fungsi menolak mengirim konfirmasi dan menyarankan
// domain terverifikasi — lihat README bagian "Email konfirmasi ke pengaju".
function applicantConfirmationEnabled() {
  return String(process.env.EMAIL_KONFIRMASI_PENGAJU ?? "true").trim().toLowerCase() !== "false";
}

export default async ({ req, res, log, error }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.EMAIL_TUJUAN || DEFAULT_ADMIN_EMAIL;
  const sender = process.env.EMAIL_PENGIRIM || DEFAULT_SENDER;
  const siteUrl = (process.env.URL_SITUS || "").replace(/\/+$/, "");
  const sendApplicantConfirmation = applicantConfirmationEnabled();

  // Pemeriksaan asal sebelum apa pun: pemanggilan HTTP langsung (tanpa header
  // event Appwrite) ditolak dengan 403 tanpa menyentuh Resend.
  if (!asalSah(req)) {
    error("Eksekusi ditolak: bukan berasal dari trigger event Appwrite yang sah.");
    return res.json({ ok: false, reason: "forbidden_source" }, 403);
  }

  if (!apiKey) {
    error("RESEND_API_KEY belum diatur; notifikasi email tidak dijalankan.");
    return res.json({ ok: false, reason: "missing_resend_api_key" }, 500);
  }

  let body;
  try {
    body = readRequestBody(req);
  } catch {
    error("Body fungsi bukan JSON yang valid.");
    return res.json({ ok: false, reason: "invalid_json" }, 400);
  }

  const row = extractRow(body);
  const normalized = normalizeProposal(row);
  if (!normalized.ok) {
    error(`Payload pengajuan tidak valid pada field ${normalized.field}.`);
    return res.json({ ok: false, reason: "invalid_proposal", field: normalized.field }, 400);
  }

  const proposal = normalized.proposal;
  const code = createProposalCode(proposal.createdAt, proposal.id);
  const time = formatJakartaTime(proposal.createdAt);
  const adminResult = await sendEmail({
    apiKey,
    sender,
    recipient: adminEmail,
    replyTo: proposal.email,
    subject: `[Kolaborasi] ${proposal.type} - ${proposal.name} (${code})`,
    content: createAdminEmail({ code, time, ...proposal, siteUrl }),
    idempotencyKey: `kolaborasi-admin/${proposal.id}`,
  });

  if (!adminResult.ok) {
    error(`Notifikasi admin ${code} ditolak Resend (${adminResult.status}, ${adminResult.type}).`);
    return res.json(
      { ok: false, code, reason: "admin_email_failed", status: adminResult.status, type: adminResult.type },
      502
    );
  }

  log(`Notifikasi admin ${code} diterima Resend (id: ${adminResult.id ?? "-"}).`);

  if (!sendApplicantConfirmation) {
    return res.json({
      ok: true,
      code,
      adminEmail: { status: "sent", id: adminResult.id },
      applicantEmail: { status: "disabled" },
    });
  }

  if (sender.toLowerCase().includes(TEST_SENDER)) {
    error(`Konfirmasi pengaju ${code} aktif, tetapi EMAIL_PENGIRIM masih memakai domain uji Resend.`);
    return res.json(
      {
        ok: false,
        code,
        reason: "applicant_email_requires_verified_domain",
        adminEmail: { status: "sent", id: adminResult.id },
        applicantEmail: { status: "failed" },
      },
      500
    );
  }

  const applicantResult = await sendEmail({
    apiKey,
    sender,
    recipient: proposal.email,
    replyTo: adminEmail,
    subject: `Pengajuan kolaborasi HMTI tercatat (${code})`,
    content: createApplicantEmail({ code, time, ...proposal, adminEmail }),
    idempotencyKey: `kolaborasi-pengaju/${proposal.id}`,
  });

  if (!applicantResult.ok) {
    error(`Konfirmasi pengaju ${code} ditolak Resend (${applicantResult.status}, ${applicantResult.type}).`);
    return res.json(
      {
        ok: false,
        code,
        reason: "applicant_email_failed",
        status: applicantResult.status,
        type: applicantResult.type,
        adminEmail: { status: "sent", id: adminResult.id },
        applicantEmail: { status: "failed" },
      },
      502
    );
  }

  log(`Konfirmasi pengaju ${code} diterima Resend (id: ${applicantResult.id ?? "-"}).`);
  return res.json({
    ok: true,
    code,
    adminEmail: { status: "sent", id: adminResult.id },
    applicantEmail: { status: "sent", id: applicantResult.id },
  });
};
