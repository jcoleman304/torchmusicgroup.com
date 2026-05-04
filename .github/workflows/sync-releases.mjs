// Sync FOEMOB releases from Spotify into releases.json
// Run by .github/workflows/sync-releases.yml

import { readFileSync, writeFileSync } from 'node:fs';

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, FOEMOB_ARTIST_ID } = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !FOEMOB_ARTIST_ID) {
    console.error('Missing required env vars: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, FOEMOB_ARTIST_ID');
    process.exit(1);
}

async function getToken() {
    const creds = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.access_token;
}

async function fetchAlbums(token) {
    const url = `https://api.spotify.com/v1/artists/${FOEMOB_ARTIST_ID}/albums?include_groups=single,album&market=US&limit=10`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Albums request failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.items || [];
}

function pickCover(images) {
    if (!images || !images.length) return null;
    return images.find(i => i.width >= 300)?.url || images[0].url;
}

function toRelease(item) {
    return {
        id: item.id,
        title: item.name,
        artist: 'RNB.FOEMOB',
        type: item.album_type, // single | album | compilation
        release_date: item.release_date,
        cover_url: pickCover(item.images),
        spotify_url: item.external_urls?.spotify || null,
        apple_url: null,
        subtitle: item.album_type === 'album' ? 'Album' : null,
    };
}

const token = await getToken();
const albums = await fetchAlbums(token);

// Dedupe: Spotify often returns multiple regional duplicates
const seen = new Set();
const releases = albums
    .map(toRelease)
    .filter(r => {
        const key = `${r.title.toLowerCase()}|${r.release_date}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    })
    .sort((a, b) => b.release_date.localeCompare(a.release_date))
    .slice(0, 6);

const json = JSON.parse(readFileSync('releases.json', 'utf8'));
json.foe_releases = releases;
json.last_updated = new Date().toISOString();

writeFileSync('releases.json', JSON.stringify(json, null, 2) + '\n');
console.log(`Wrote ${releases.length} FOEMOB releases.`);
