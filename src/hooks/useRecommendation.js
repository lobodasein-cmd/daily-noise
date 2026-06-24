import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFavorites,
  getLiked,
  getDisliked,
  saveLike,
  saveDislike,
  saveCurrentRecommendation,
  getCurrentRecommendation,
} from '../utils/storage';
import { getAIRecommendation } from '../utils/spotifyAuth';

const DEFAULT_SEED_ARTISTS = ['Radiohead', 'Pixies'];

/**
 * Encapsula toda la lógica de negocio del "artista del día":
 * carga, generación vía IA, persistencia y reacciones (like/dislike).
 * Mantiene HomeScreen enfocado únicamente en presentación.
 */
export function useRecommendation() {
  const [rec, setRec] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildSeedArtists = async () => {
    const favs = await getFavorites();
    const seedArtists = await AsyncStorage.getItem('spotify_seed_artists');
    const seedParsed = seedArtists ? JSON.parse(seedArtists) : [];
    const likedNames = seedParsed.filter((a) => favs.includes(a.id)).map((a) => a.name);

    const extraFavs = await AsyncStorage.getItem('extra_favorites');
    const extraParsed = extraFavs ? JSON.parse(extraFavs) : [];

    return [...new Set([...likedNames, ...extraParsed])];
  };

  const loadRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let today = await getCurrentRecommendation();

      if (!today) {
        const allLiked = await buildSeedArtists();
        const swipeHistory = await AsyncStorage.getItem('swipe_history');
        const swipeParsed = swipeHistory ? JSON.parse(swipeHistory) : [];

        today = await getAIRecommendation(
          allLiked.length > 0 ? allLiked : DEFAULT_SEED_ARTISTS,
          [],
          swipeParsed
        );

        if (!today) {
          // El servidor respondió pero sin datos usables (caída, rate limit, etc.)
          setError('No pudimos generar tu recomendación de hoy. Intenta de nuevo.');
          setRec(null);
          return;
        }

        today.id = today.id || today.artist + '-' + Date.now();
        await saveCurrentRecommendation(today);
      }

      const liked = await getLiked();
      const disliked = await getDisliked();
      if (liked.includes(today.id)) setReaction('like');
      else if (disliked.includes(today.id)) setReaction('dislike');

      setRec(today);
    } catch (e) {
      console.error('loadRecommendation error:', e);
      setError('Algo falló cargando tu recomendación. Revisa tu conexión e intenta de nuevo.');
      setRec(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerSwipe = async (artistName) => {
    const swipeHistory = await AsyncStorage.getItem('swipe_history');
    const swipeParsed = swipeHistory ? JSON.parse(swipeHistory) : [];
    swipeParsed.push(artistName);
    await AsyncStorage.setItem('swipe_history', JSON.stringify(swipeParsed));
  };

  const like = async () => {
    if (!rec || reaction) return;
    await saveLike(rec.id);
    setReaction('like');
    await registerSwipe(rec.artist);
  };

  const dislike = async () => {
    if (!rec || reaction) return;
    await saveDislike(rec.id);
    setReaction('dislike');
    await registerSwipe(rec.artist);
  };

  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  return {
    rec,
    reaction,
    loading,
    error,
    like,
    dislike,
    retry: loadRecommendation,
  };
}
