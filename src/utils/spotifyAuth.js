import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = '3cbd0d7530b54114bb5328ba44d9d09d';
const SCOPES = ['user-read-private', 'user-top-read'];

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export function useSpotifyAuth() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'dailynoise' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      usePKCE: true,
      redirectUri,
    },
    discovery
  );

  return { request, response, promptAsync };
}

export async function saveToken(token) {
  await AsyncStorage.setItem('spotify_token', token);
  const expiry = Date.now() + 3600 * 1000;
  await AsyncStorage.setItem('spotify_token_expiry', expiry.toString());
}

export async function getToken() {
  const token = await AsyncStorage.getItem('spotify_token');
  const expiry = await AsyncStorage.getItem('spotify_token_expiry');
  if (!token || !expiry) return null;
  if (Date.now() > parseInt(expiry)) return null;
  return token;
}

export async function searchArtists(token, query) {
  if (!query || query.length < 2) return [];
  const res = await fetch(
    'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=artist&limit=8',
    { headers: { Authorization: 'Bearer ' + token } }
  );
  const data = await res.json();
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
}

export async function getRecommendations(token, seedArtistIds) {
  const seeds = seedArtistIds.slice(0, 5).join(',');
  const res = await fetch(
    'https://api.spotify.com/v1/recommendations?seed_artists=' + seeds + '&limit=1',
    { headers: { Authorization: 'Bearer ' + token } }
  );
  const data = await res.json();
  if (!data.tracks || data.tracks.length === 0) return null;
  const track = data.tracks[0];
  return {
    id: track.id,
    artist: track.artists[0].name,
    song: track.name,
    genre: track.artists[0].genres ? track.artists[0].genres[0] : 'alternative',
    spotifyUrl: track.external_urls.spotify,
    youtubeUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(track.artists[0].name + ' ' + track.name),
    vibe: 'Recomendado por Spotify.',
  };
}