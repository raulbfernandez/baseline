// Live court availability from LA Rec & Parks (WebTrac public search).
// GET /api/court-availability?venue=Vermont%20Canyon&date=2026-11-03
// Read-only: no login, no booking. Players finish booking on the city site.

const WEBTRAC = 'https://reg.recreation.parks.lacity.gov/webtrac/web/search.html';

// App venue name -> WebTrac location name
const LOCATIONS = {
  'Vermont Canyon': 'Vermont Canyon Pay Tennis',
  'Riverside': 'Riverside Courts Pay Tennis',
};

// "11:00 am" -> minutes after midnight
function toMinutes(t) {
  const m = /^(\d{1,2}):(\d{2})\s*([ap]m)$/i.exec(t.trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toLowerCase() === 'pm') h += 12;
  return h * 60 + Number(m[2]);
}

function bookingUrl(location, mdY, begintime) {
  const p = new URLSearchParams({
    location,
    module: 'FR',
    date: mdY,
    begintime: begintime || '07:00 am',
    arwebsearch_buttonsearch: 'yes',
    display: 'detail',
  });
  return `${WEBTRAC}?${p.toString()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { venue, date } = req.query;
  const location = LOCATIONS[venue];
  if (!location) {
    return res.status(400).json({ error: 'Unsupported venue' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  }

  const [y, mo, d] = date.split('-');
  const mdY = `${mo}/${d}/${y}`;

  try {
    const r = await fetch(bookingUrl(location, mdY, '06:00 am') + '&blockstodisplay=24', {
      headers: { 'User-Agent': 'LosFelizTennisClub/1.0 (court availability lookup)' },
    });
    if (!r.ok) throw new Error(`City site returned ${r.status}`);
    const html = await r.text();

    // Open slots are rendered as buttons labelled "Book for <start> - <end> Court N Now".
    // Booked/blocked slots say "Contact Facility" and have no such label.
    const slots = [];
    const re = /aria-label="Book for\s+(.+?)\s+-\s+(.+?)\s+(Court [^"]+?) Now"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      const start = m[1].replace(/\s+/g, ' ').trim();
      const end = m[2].replace(/\s+/g, ' ').trim();
      const startMin = toMinutes(start);
      const endMin = toMinutes(end);
      if (startMin == null || endMin == null) continue;
      slots.push({ court: m[3].trim(), start, end, startMin, endMin });
    }
    slots.sort((a, b) => a.startMin - b.startMin || a.court.localeCompare(b.court, undefined, { numeric: true }));

    // Cache at Vercel's edge for 5 min so we don't hammer the city's server.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      venue,
      date,
      slots,
      bookingBaseUrl: bookingUrl(location, mdY),
      location,
      mdY,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}
