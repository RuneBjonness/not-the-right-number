export interface Challenge {
  id: string;
  name: string;
  scores: [number, number, number]; // [easy, normal, hard]
  solvedMask: number; // bitmask 0-7: bit0=easy, bit1=normal, bit2=hard
  timestamp: number; // unix seconds
  receivedAt: number; // unix ms when accepted
}

interface BragPayload {
  v: 1;
  n: string;
  s: [number, number, number];
  d: number;
  t: number;
}

function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return b64;
}

function makeId(payload: BragPayload): string {
  const raw = `${payload.n}|${payload.s.join(",")}|${payload.d}|${payload.t}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function encodeBrag(
  name: string,
  scores: [number, number, number],
  solvedMask: number,
): string {
  const payload: BragPayload = {
    v: 1,
    n: name.slice(0, 20),
    s: scores,
    d: solvedMask & 7,
    t: Math.floor(Date.now() / 1000),
  };
  return toBase64Url(btoa(JSON.stringify(payload)));
}

export function decodeBrag(encoded: string): Challenge | null {
  try {
    const json = atob(fromBase64Url(encoded));
    const p = JSON.parse(json) as BragPayload;

    if (p.v !== 1) return null;
    if (typeof p.n !== "string" || p.n.length === 0 || p.n.length > 20)
      return null;
    if (!Array.isArray(p.s) || p.s.length !== 3) return null;
    if (!p.s.every((v) => Number.isInteger(v) && v >= 0)) return null;
    if (!Number.isInteger(p.d) || p.d < 0 || p.d > 7) return null;
    if (!Number.isInteger(p.t) || p.t < 1700000000 || p.t > 2000000000)
      return null;

    return {
      id: makeId(p),
      name: p.n,
      scores: p.s,
      solvedMask: p.d,
      timestamp: p.t,
      receivedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(encoded: string): string {
  return window.location.origin + window.location.pathname + "?c=" + encoded;
}

export function buildShareMessage(url: string): string {
  return ["Think you can beat me? \uD83E\uDDE0", `${url}`].join("\n");
}
