import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = '3cbd0d7530b54114bb5328ba44d9d09d';
const CLIENT_SECRET = '4dd99fbea18946df8e4c88983449ac66';

export async function getClientToken() {
  try {
    const saved = await AsyncStorage.getItem('spotify_client_token');
    const expiry = await AsyncStorage.getItem('spotify_client_token_expiry');

    if (saved && expiry && Date.now() < parseInt(expiry)) {
      return saved;
    }

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET,
    });

    const text = await res.text();
    console.log('TOKEN RESPONSE:', text);
    const data = JSON.parse(text);

    if (data.access_token) {
      await AsyncStorage.setItem('spotify_client_token', data.access_token);
      const newExpiry = (Date.now() + data.expires_in * 1000).toString();
      await AsyncStorage.setItem('spotify_client_token_expiry', newExpiry);
      return data.access_token;
    }
    return null;
  } catch (e) {
    console.error('Token error:', e);
    return null;
  }
}

export async function searchArtists(query) {
  if (!query || query.length < 2) return [];
  try {
    const token = await getClientToken();
    if (!token) return [];

    const res = await fetch(
      'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=artist&limit=8',
      { headers: { Authorization: 'Bearer ' + token } }
    );

    const text = await res.text();
    const data = JSON.parse(text);

    if (!data.artists) return [];
    return data.artists.items.map(function(a) {
      return {
        id: a.id,
        name: a.name,
        genre: a.genres ? a.genres.slice(0, 2) : ['alternative'],
        image: a.images && a.images[0] ? a.images[0].url : null,
        emoji: '🎸',
      };
    });
  } catch (e) {
    console.error('Search error:', e);
    return [];
  }
}

export async function getRecommendations(seedArtistIds) {
  try {
    const token = await getClientToken();
    if (!token) return null;

    const seeds = seedArtistIds.slice(0, 5).join(',');
    const res = await fetch(
      'https://api.spotify.com/v1/recommendations?seed_artists=' + seeds + '&limit=3',
      { headers: { Authorization: 'Bearer ' + token } }
    );

   const text = await res.text();
console.log('SPOTIFY RESPONSE:', text);
const data = JSON.parse(text);

    if (!data.tracks || data.tracks.length === 0) return null;

    return data.tracks.map(function(track) {
      return {
        id: track.id,
        artist: track.artists[0].name,
        song: track.name,
        genre: track.artists[0].genres ? track.artists[0].genres[0] : 'alternative',
        spotifyUrl: track.external_urls.spotify,
        youtubeUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(track.artists[0].name + ' ' + track.name),
        vibe: 'Recomendado por Spotify.',
        image: track.album.images[0] ? track.album.images[0].url : null,
      };
    });
  } catch (e) {
    console.error('Recommendations error:', e);
    return null;
  }
}