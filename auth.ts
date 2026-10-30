import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE = 'p360_session';
const maxAge = 60 * 60 * 24 * 14;
function secret() {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 32) throw new Error('Configure APP_SECRET com pelo menos 32 caracteres na Vercel.');
  return s;
}
function sign(data: string) { return createHmac('sha256', secret()).update(data).digest('hex'); }
export async function setSession(userId: string) {
  const exp = Math.floor(Date.now()/1000) + maxAge;
  const payload = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge });
}
export async function getUserId(): Promise<string | null> {
  try {
    const val = (await cookies()).get(COOKIE)?.value;
    if (!val) return null;
    const [id, exp, sig] = val.split('.');
    if (!id || !/^\d+$/.test(exp) || !sig || Number(exp) < Date.now()/1000) return null;
    const expected = Buffer.from(sign(`${id}.${exp}`),'hex');
    const given = Buffer.from(sig,'hex');
    if (given.length !== expected.length || !timingSafeEqual(expected,given)) return null;
    return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
  } catch { return null; }
}
export async function endSession() { (await cookies()).delete(COOKIE); }
