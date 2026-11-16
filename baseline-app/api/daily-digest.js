/**
 * Daily Digest — called by Vercel Cron at 8 PM PT every day.
 * Finds all matches completed yesterday, builds a summary email,
 * and sends it to every active player who has an email address.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const RESEND_KEY   = process.env.RESEND_API_KEY;
const CRON_SECRET  = process.env.CRON_SECRET;

async function sbFetch(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

function firstName(name = '') {
  return name.trim().split(' ')[0];
}

function formatScore(match) {
  if (match.score) return match.score;
  if (Array.isArray(match.sets) && match.sets.length) {
    return match.sets.map(s => `${s.a}-${s.b}`).join(', ');
  }
  return '—';
}

export default async function handler(req, res) {
  // Verify this is called by Vercel Cron (or an authorized request)
  const auth = req.headers['authorization'];
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Yesterday's date range (UTC)
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Load players and yesterday's completed matches in parallel
  const [players, matches] = await Promise.all([
    sbFetch('players', '?select=*&order=points.desc'),
    sbFetch('matches', `?select=*&status=eq.completed&date=eq.${dateStr}`),
  ]);

  if (!Array.isArray(matches) || matches.length === 0) {
    return res.status(200).json({ sent: false, reason: 'No matches yesterday', date: dateStr });
  }

  const playerMap = {};
  for (const p of players) playerMap[p.id] = p;

  // Build a ranked list (competition ranking: tied points = same rank)
  const ranked = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aLast = (a.name || '').trim().split(' ').pop().toLowerCase();
    const bLast = (b.name || '').trim().split(' ').pop().toLowerCase();
    return aLast.localeCompare(bLast);
  });
  const rankMap = {};
  ranked.forEach((p, i) => {
    const rank = ranked.filter(r => (r.points || 0) > (p.points || 0)).length + 1;
    rankMap[p.id] = rank;
  });

  // Build match cards HTML
  const matchCards = matches.map(m => {
    const pA = playerMap[m.a] || {};
    const pB = playerMap[m.b] || {};
    const winner = playerMap[m.winner_id] || playerMap[m.winnerId] || {};
    const loser  = winner.id === pA.id ? pB : pA;
    const isLadder = m.match_type !== 'friendly' && m.matchType !== 'friendly';
    const score = formatScore(m);
    const winnerChange = m.winner_change ?? m.winnerChange ?? 0;
    const loserChange  = m.loser_change  ?? m.loserChange  ?? 0;

    return `
      <div style="background:#fff;border-radius:10px;padding:16px 20px;margin-bottom:12px;border-left:4px solid ${isLadder ? '#CD5D35' : '#3D7A5A'};">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;
                       padding:2px 7px;border-radius:4px;
                       background:${isLadder ? '#CD5D35' : '#3D7A5A'};color:#fff;">
            ${isLadder ? 'Ladder' : 'Friendly'}
          </span>
        </div>
        <div style="font-family:'Georgia',serif;font-size:18px;font-weight:700;color:#1a0f00;margin-bottom:4px;">
          ${pA.name || '?'} vs ${pB.name || '?'}
        </div>
        <div style="font-size:13px;color:#7A6548;margin-bottom:10px;">
          📊 Score: <strong style="font-family:monospace;color:#1a0f00;">${score}</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#F5EDD8;">
            <th style="text-align:left;padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Player</th>
            <th style="text-align:center;padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Result</th>
            ${isLadder ? '<th style="text-align:center;padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Pts Change</th>' : ''}
            <th style="text-align:center;padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Total Pts</th>
            <th style="text-align:center;padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Rank</th>
          </tr>
          ${[winner, loser].map((p, i) => {
            const isW = i === 0;
            const pts = p.points ?? 0;
            const change = isW ? winnerChange : loserChange;
            return `
            <tr style="border-top:1px solid #E8DCC8;">
              <td style="padding:8px 10px;font-size:13px;font-weight:${isW ? '700' : '400'};color:#1a0f00;">
                ${isW ? '🏆 ' : ''}${p.name || '?'}
              </td>
              <td style="text-align:center;padding:8px 10px;font-size:12px;font-weight:700;color:${isW ? '#3D7A5A' : '#CD5D35'};">
                ${isW ? 'W' : 'L'}
              </td>
              ${isLadder ? `<td style="text-align:center;padding:8px 10px;font-size:13px;font-weight:700;font-family:monospace;color:${change >= 0 ? '#3D7A5A' : '#CD5D35'};">+${change}</td>` : ''}
              <td style="text-align:center;padding:8px 10px;font-size:13px;font-family:monospace;font-weight:600;color:#1a0f00;">${pts}</td>
              <td style="text-align:center;padding:8px 10px;font-size:13px;color:#7A6548;">#${rankMap[p.id] || '—'}</td>
            </tr>`;
          }).join('')}
        </table>
      </div>`;
  }).join('');

  // Top-5 ladder standings
  const top5 = ranked.slice(0, 5);
  const standingsRows = top5.map(p => {
    const rank = rankMap[p.id];
    return `
      <tr style="border-top:1px solid #E8DCC8;">
        <td style="padding:7px 10px;font-size:13px;font-weight:700;color:#7A6548;">#${rank}</td>
        <td style="padding:7px 10px;font-size:13px;color:#1a0f00;">${p.name || '?'}</td>
        <td style="text-align:center;padding:7px 10px;font-size:13px;font-family:monospace;font-weight:700;color:#1a0f00;">${p.points ?? 0}</td>
        <td style="text-align:center;padding:7px 10px;font-size:12px;color:#7A6548;">${p.wins ?? 0}–${p.losses ?? 0}</td>
      </tr>`;
  }).join('');

  const friendlyCount = matches.filter(m => m.match_type === 'friendly' || m.matchType === 'friendly').length;
  const ladderCount   = matches.length - friendlyCount;
  const dateLabel = yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#E8DCC8;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#7A6548;margin-bottom:4px;">Los Feliz Tennis Club</div>
      <div style="font-family:'Georgia',serif;font-size:28px;font-weight:700;color:#1a0f00;">Daily Digest</div>
      <div style="font-size:13px;color:#7A6548;margin-top:4px;">${dateLabel}</div>
    </div>

    <!-- Summary pill -->
    <div style="background:#fff;border-radius:10px;padding:14px 20px;margin-bottom:20px;display:flex;gap:24px;justify-content:center;text-align:center;">
      <div>
        <div style="font-size:28px;font-weight:700;font-family:monospace;color:#1a0f00;">${matches.length}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#7A6548;">Match${matches.length !== 1 ? 'es' : ''} Played</div>
      </div>
      ${ladderCount > 0 ? `<div style="border-left:1px solid #E8DCC8;padding-left:24px;">
        <div style="font-size:28px;font-weight:700;font-family:monospace;color:#CD5D35;">${ladderCount}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#7A6548;">Ladder</div>
      </div>` : ''}
      ${friendlyCount > 0 ? `<div style="border-left:1px solid #E8DCC8;padding-left:24px;">
        <div style="font-size:28px;font-weight:700;font-family:monospace;color:#3D7A5A;">${friendlyCount}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#7A6548;">Friendly</div>
      </div>` : ''}
    </div>

    <!-- Match cards -->
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;color:#7A6548;margin-bottom:10px;">Yesterday's Matches</div>
    ${matchCards}

    <!-- Standings -->
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;color:#7A6548;margin-top:24px;margin-bottom:10px;">Current Ladder — Top 5</div>
    <div style="background:#fff;border-radius:10px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="background:#F5EDD8;">
          <th style="text-align:left;padding:7px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Rank</th>
          <th style="text-align:left;padding:7px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Player</th>
          <th style="text-align:center;padding:7px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">Points</th>
          <th style="text-align:center;padding:7px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7A6548;font-weight:600;">W–L</th>
        </tr>
        ${standingsRows}
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:28px;padding-top:16px;border-top:1px solid #D4C4A0;">
      <a href="https://baseline-alpha.vercel.app" style="display:inline-block;padding:10px 24px;background:#CD5D35;color:#fff;text-decoration:none;border-radius:7px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">View Full Ladder →</a>
      <div style="margin-top:12px;font-size:11px;color:#A89070;">You're receiving this because you're a member of Los Feliz Tennis Club.</div>
    </div>

  </div>
</body>
</html>`;

  // Send to all active players with an email
  const recipients = players.filter(p => p.email && p.is_active !== false && p.isActive !== false);

  const results = await Promise.allSettled(
    recipients.map(p =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Los Feliz Tennis Club <noreply@losfeliztennisclub.com>',
          to: p.email,
          subject: `🎾 LFTC Daily Digest — ${dateLabel}`,
          html,
        }),
      })
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return res.status(200).json({ sent, failed, matches: matches.length, date: dateStr });
}
