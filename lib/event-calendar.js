export const SOURCE = 'https://www.meetup.com/google-developer-group-marseille/events/ical/';
const unescape = value => value.replace(/\\([nN,;\\])/g, (_, c) => /n/i.test(c) ? '\n' : c);
export function calendarDate(value, params = '') {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value);
  if (!m) throw new Error('Invalid calendar date');
  const parts = m.slice(1, 7).map(v => +(v || 0));
  const [y, mo, d, h, mi, s] = parts;
  const target = Date.UTC(y, mo - 1, d, h, mi, s);
  const utc = new Date(target);
  if (utc.getUTCMonth() !== mo - 1 || utc.getUTCDate() !== d || h > 23 || mi > 59 || s > 59) throw new Error('Invalid date');
  if (m[7]) return utc.toISOString();
  const zone = /TZID="?([^;"\r\n]+)/.exec(params)?.[1] || 'Europe/Paris';
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  let instant = target;
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(formatter.formatToParts(instant).map(p => [p.type, p.value]));
    const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    instant += target - shown;
  }
  return new Date(instant).toISOString();
}
export function parseCalendar(raw) {
  if (!raw.includes('BEGIN:VCALENDAR') || !raw.includes('END:VCALENDAR')) throw new Error('Invalid calendar');
  raw = raw.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
  const events = new Map();
  for (const match of raw.matchAll(/BEGIN:VEVENT\n([\s\S]*?)\nEND:VEVENT/g)) {
    const fields = {};
    for (const line of match[1].split('\n')) {
      const m = /^([A-Z-]+)(;[^:]*)?:(.*)$/.exec(line);
      if (m) fields[m[1]] = { value: m[3], params: m[2] || '' };
    }
    const url = fields.URL?.value;
    const id = /^https:\/\/www\.meetup\.com\/(?:fr-fr\/)?google-developer-group-marseille\/events\/(\d+)\/?$/.exec(url || '')?.[1];
    if (!id || !fields.DTSTART || !fields.SUMMARY) throw new Error('Invalid event');
    const start = calendarDate(fields.DTSTART.value, fields.DTSTART.params);
    const end = fields.DTEND ? calendarDate(fields.DTEND.value, fields.DTEND.params) : new Date(Date.parse(start) + 86400000).toISOString();
    const title = unescape(fields.SUMMARY.value);
    const full = unescape(fields.DESCRIPTION?.value || '');
    let description = full.split(/\n(?:Agenda|Speakers|Hosted By)/i)[0].replace(/^Google Developer Group Marseille\s*/i, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (description.length > 280) description = description.slice(0, 277).replace(/\s+\S*$/, '') + '…';
    const content = title + ' ' + description;
    const rules = { ia: /\b(IA|AI|Gemini|LLMs?|Antigravity|intelligence artificielle|machine learning)\b/i, cloud: /\b(cloud|GCP|AWS|Azure|serverless|Kubernetes)\b/i, web: /\b(web|JavaScript|TypeScript|React|HTML|CSS|frontend|front.end)\b/i, mobile: /\b(mobile|Android|Flutter|iOS|Kotlin|Swift)\b/i };
    events.set(id, { id, title, start, end, description, url, location: unescape(fields.LOCATION?.value || ''), tags: Object.keys(rules).filter(k => rules[k].test(content)), image: ({ '315789568': 'images/devfest-conference.jpeg', '315789695': 'images/evenement-epitech-summit.png' })[id] || null, cancelled: fields.STATUS?.value === 'CANCELLED' });
  }
  if ((raw.match(/BEGIN:VEVENT/g) || []).length !== events.size) throw new Error('Incomplete calendar');
  return [...events.values()];
}
export function mergeEvents(previous, fresh, now = Date.now()) {
  const events = new Map(previous.filter(e => Date.parse(e.end) <= now).map(e => [String(e.id), e]));
  fresh.forEach(e => events.set(String(e.id), e));
  return [...events.values()].filter(e => !e.cancelled).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
