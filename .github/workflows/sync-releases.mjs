// Sync TMG roster releases from Spotify into releases.json
// Run by .github/workflows/sync-releases.yml
//
// Configure roster via the ROSTER_ARTIST_IDS env var:
//   ROSTER_ARTIST_IDS="3YrSdCCaG11xDOpXYJdGl3,SOME_OTHER_ID"
//
// Falls back to FOEMOB_ARTIST_ID for backwards compat.

import { readFileSync, writeFileSync } from 'node:fs';

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    ROSTER_ARTIST_IDS,
    FOEMOB_ARTIST_ID,
} = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
    process.exit(1);
}

const artistIds = (ROSTER_ARTIST_IDS || FOEMOB_ARTIST_ID || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

if (artistIds.length === 0) {
    console.error('No artist IDs configured. Set ROSTER_ARTIST_IDS (comma-separated).');
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

async function fetchArtist(token, artistId) {
    const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Artist ${artistId} request failed: ${res.status} ${await res.text()}`);
    return res.json();
}

async function fetchAlbums(token, artistId) {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=single,album&market=US&limit=10`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Albums for ${artistId} failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.items || [];
}

function pickCover(images) {
    if (!images || !images.length) return null;
    return images.find(i => i.width >= 300)?.url || images[0].url;
}

function toRelease(item, artistName) {
    return {
        id: item.id,
        title: item.name,
        artist: artistName,
        type: item.album_type,
        release_date: item.release_date,
        cover_url: pickCover(item.images),
        spotify_url: item.external_urls?.spotify || null,
        apple_url: null,
        subtitle: item.album_type === 'album' ? 'Album' : null,
    };
}

const token = await getToken();
const all = [];

for (const id of artistIds) {
    const artist = await fetchArtist(token, id);
    const albums = await fetchAlbums(token, id);
    console.log(`${artist.name}: ${albums.length} releases`);
    for (const album of albums) {
        all.push(toRelease(album, artist.name));
    }
}

// Dedupe across artists by title+date (in case of features/cross-credits)
const seen = new Set();
const releases = all
    .filter(r => {
        const key = `${r.artist.toLowerCase()}|${r.title.toLowerCase()}|${r.release_date}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    })
    .sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''))
    .slice(0, 9);

const json = JSON.parse(readFileSync('releases.json', 'utf8'));
json.releases = releases;
delete json.foe_releases;
delete json.dke_placements;
json.last_updated = new Date().toISOString();

writeFileSync('releases.json', JSON.stringify(json, null, 2) + '\n');
console.log(`Wrote ${releases.length} total releases across ${artistIds.length} artist(s).`);
