/** Deterministic, dependency-free activity generation. No network or storage. */
export const MIN_AGE = 3;
export const MAX_AGE = 12;
const THEMES = [
  { name: 'Cloud garden', noun: 'cloud', plural: 'clouds', story: 'A cloud grew a garden in the sky.', color: '#32696d', accent: '#c27b35' },
  { name: 'Moon picnic', noun: 'star', plural: 'stars', story: 'The moon packed a picnic for the stars.', color: '#4d5f85', accent: '#bb7442' },
  { name: 'Wonder woods', noun: 'leaf', plural: 'leaves', story: 'A tiny forest opened a school for birds.', color: '#47705c', accent: '#b66b58' },
];
const PROFILES = [
  { max: 4, label: 'Explore together', cols: 4, rows: 3, count: 4, pattern: ['circle', 'triangle'], prompt: 'Point to each picture. Count slowly together.', feeling: 'A friend feels left out. Draw something you could share.', stretch: 'How could you tell if your friend feels better?' },
  { max: 6, label: 'Try and discover', cols: 6, rows: 4, count: 8, pattern: ['circle', 'circle', 'triangle'], prompt: 'Count the pictures. Split them into two groups.', feeling: 'Two friends want the same toy. Draw a fair idea.', stretch: 'Can you think of a second fair idea?' },
  { max: 9, label: 'Notice and explain', cols: 8, rows: 5, count: 12, pattern: ['circle', 'triangle', 'square'], prompt: 'Make equal groups. How many ways can you find?', feeling: 'A friend says, “I cannot do this yet.” Write an encouraging reply.', stretch: 'What small first step could you try together?' },
  { max: 12, label: 'Imagine and reason', cols: 10, rows: 6, count: 18, pattern: ['circle', 'triangle', 'triangle', 'square'], prompt: 'Find factors of the total. Explain how you know.', feeling: 'Two friends disagree about a game. Show both points of view.', stretch: 'Design a compromise and explain why it could work.' },
];
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value;
}
export function dateLabel(value) {
  if (!validDate(value)) throw new Error('Choose a valid date.');
  return new Intl.DateTimeFormat('en', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
}
export function dayDistance(from, to) {
  if (!validDate(from) || !validDate(to)) throw new Error('Choose a valid date.');
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000);
}
export function validateAge(age) {
  if (typeof age === 'string' && !/^\d+$/.test(age)) throw new Error('Choose an age from 3 to 12.');
  const value = Number(age);
  if (!Number.isInteger(value) || value < MIN_AGE || value > MAX_AGE) throw new Error('Choose an age from 3 to 12.');
  return value;
}
export function seedFrom(text) {
  let n = 2166136261;
  for (const ch of text) { n ^= ch.charCodeAt(0); n = Math.imul(n, 16777619); }
  return n >>> 0;
}
function random(seed) {
  let n = seed >>> 0;
  return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function makeMaze(cols, rows, seed) {
  if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 2 || rows < 2 || cols > 20 || rows > 20) throw new Error('Invalid maze size.');
  const rng = random(seed), cells = Array.from({ length: cols * rows }, () => []);
  const visited = new Set([0]), stack = [0];
  while (stack.length) {
    const u = stack[stack.length-1], x = u % cols, y = Math.floor(u/cols);
    const next = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([a,b]) => a >= 0 && b >= 0 && a < cols && b < rows).map(([a,b]) => b*cols+a).filter(v => !visited.has(v));
    if (!next.length) { stack.pop(); continue; }
    const v = next[Math.floor(rng()*next.length)];
    cells[u].push(v); cells[v].push(u); visited.add(v); stack.push(v);
  }
  const queue = [0], previous = new Map([[0, null]]);
  for (let i=0; i<queue.length; i++) for (const v of cells[queue[i]]) if (!previous.has(v)) { previous.set(v,queue[i]); queue.push(v); }
  const solution = [];
  for (let u = cells.length-1; u !== null; u = previous.get(u)) solution.unshift(u);
  return { cols, rows, cells, solution };
}
export function buildActivities({ age, date, edition = 'morning', letter = 'A' }) {
  const a = validateAge(age);
  if (!validDate(date)) throw new Error('Choose a valid date.');
  if (!['morning','afternoon'].includes(edition)) throw new Error('Choose a valid edition.');
  if (!/^[A-Z]$/.test(letter)) throw new Error('Choose a letter from A to Z.');
  const profile = PROFILES.find(p => a <= p.max);
  const seed = seedFrom(`${date}:${edition}:${profile.max}`);
  const theme = THEMES[seed % THEMES.length];
  return { date, edition, letter, profile, theme, seed, maze: makeMaze(profile.cols, profile.rows, seed), pattern: Array.from({ length: 8 }, (_, i) => i < 6 ? profile.pattern[i % profile.pattern.length] : null), answers: { count: profile.count, pattern: [6,7].map(i => profile.pattern[i % profile.pattern.length]) } };
}
export function describeWeather(code) {
  if (code === 0) return 'Clear sky';
  if ([1,2].includes(code)) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if ([45,48].includes(code)) return 'Fog';
  if ([51,53,55,56,57].includes(code)) return 'Drizzle';
  if ([61,63,65,66,67,80,81,82].includes(code)) return 'Rain showers';
  if ([71,73,75,77,85,86].includes(code)) return 'Snow';
  if ([95,96,99].includes(code)) return 'Thunderstorms';
  return 'Mixed conditions';
}
export function weatherPrompt(code, highC) {
  if ([95,96,99].includes(code)) return 'Storms are forecast. Ask a grown-up about a safe indoor plan.';
  if ([71,73,75,77,85,86].includes(code) || highC < 5) return 'What would keep you warm and dry? Explain your choice.';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'What would help you stay dry? What might the ground feel like?';
  if (highC >= 28) return 'How could you stay cool? Think about water, shade and clothing.';
  return 'What would you wear or bring outside? What makes you think so?';
}
export function locationLabel(place) {
  return [...new Set([place.name, place.admin1, place.country].filter(v => typeof v === 'string' && v.trim()))].join(', ');
}
export function normalizePlaces(data) {
  if (!data || !Array.isArray(data.results)) return [];
  return data.results.filter(p => p && typeof p === 'object' && typeof p.name === 'string' && p.name.length < 150 && Number.isFinite(p.latitude) && Math.abs(p.latitude)<=90 && Number.isFinite(p.longitude) && Math.abs(p.longitude)<=180).slice(0,8).map(p => ({ name:p.name, admin1:typeof p.admin1==='string'?p.admin1.slice(0,150):'', country:typeof p.country==='string'?p.country.slice(0,100):'', latitude:p.latitude, longitude:p.longitude }));
}
export function parseForecast(data, date, place) {
  const daily = data?.daily, i = daily?.time?.indexOf(date);
  if (!Number.isInteger(i) || i < 0) throw new Error('No forecast is available for that date.');
  const high = daily.temperature_2m_max?.[i], low = daily.temperature_2m_min?.[i], code = daily.weather_code?.[i], rain = daily.precipitation_probability_max?.[i];
  if (![high,low,code].every(Number.isFinite) || high < low || high > 65 || low < -100 || !Number.isInteger(code)) throw new Error('The weather service returned incomplete data.');
  return { date, place:locationLabel(place), high, low, code, rain:Number.isFinite(rain) && rain >= 0 && rain <= 100 ? rain : null, fetchedAt:new Date().toISOString() };
}
export function formatTemperature(celsius, units) {
  if (!Number.isFinite(celsius)) throw new Error('Invalid temperature.');
  if (!['C','F'].includes(units)) throw new Error('Choose Celsius or Fahrenheit.');
  return `${Math.round(units==='F' ? celsius*9/5+32 : celsius)}°${units}`;
}
export function geocodingURL(city) {
  if (typeof city !== 'string' || city.trim().length < 2 || city.trim().length > 100) throw new Error('Enter a city or town, not a street address.');
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({ name:city.trim(), count:'8', language:'en', format:'json' });
  return url;
}
export function forecastURL(place) {
  if (![place.latitude,place.longitude].every(Number.isFinite) || Math.abs(place.latitude)>90 || Math.abs(place.longitude)>180) throw new Error('Choose a city from the results.');
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({ latitude:String(place.latitude), longitude:String(place.longitude), daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max', timezone:'auto', forecast_days:'16' });
  return url;
}
