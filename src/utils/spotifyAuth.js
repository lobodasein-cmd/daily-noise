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

export async function getAIRecommendation(likedArtists, dislikedArtists, swipeHistory) {
  try {
    const res = await fetch(SERVER_URL + '/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        likedArtists: likedArtists || [],
        dislikedArtists: dislikedArtists || [],
        swipeHistory: swipeHistory || [],
      }),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('AI recommendation error:', e);
    return null;
  }
}

export async function getSimilarArtists(artistName) {
  try {
    const res = await fetch(SERVER_URL + '/similar?artist=' + encodeURIComponent(artistName));
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Similar artists error:', e);
    return [];
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