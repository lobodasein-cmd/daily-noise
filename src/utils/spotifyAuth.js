import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL = 'https://daily-noise-server.onrender.com';

export async function searchArtists(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(SERVER_URL + '/search?q=' + encodeURIComponent(query));
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Search error:', e);
    return [];
  }
}

export async function getRecommendations(seedArtistNames) {
  if (!seedArtistNames || seedArtistNames.length === 0) return null;
  try {
    const artist = encodeURIComponent(seedArtistNames[0]);
    const res = await fetch(SERVER_URL + '/similar?artist=' + artist);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Recommendations error:', e);
    return null;
  }
}

export async function getTopTracks(artistName) {
  try {
    const res = await fetch(SERVER_URL + '/toptracks?artist=' + encodeURIComponent(artistName));
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Top tracks error:', e);
    return [];
  }
}