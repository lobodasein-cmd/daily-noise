// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAVORITES: 'favorites',
  LIKED: 'liked_recommendations',
  DISLIKED: 'disliked_recommendations',
  LAST_DATE: 'last_recommendation_date',
  CURRENT_REC: 'current_recommendation',
};

export async function saveFavorites(artistIds) {
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(artistIds));
}

export async function getFavorites() {
  const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
  return raw ? JSON.parse(raw) : [];
}

export async function saveLike(recommendationId) {
  const liked = await getLiked();
  if (!liked.includes(recommendationId)) {
    liked.push(recommendationId);
    await AsyncStorage.setItem(KEYS.LIKED, JSON.stringify(liked));
  }
}

export async function saveDislike(recommendationId) {
  const disliked = await getDisliked();
  if (!disliked.includes(recommendationId)) {
    disliked.push(recommendationId);
    await AsyncStorage.setItem(KEYS.DISLIKED, JSON.stringify(disliked));
  }
}

export async function getLiked() {
  const raw = await AsyncStorage.getItem(KEYS.LIKED);
  return raw ? JSON.parse(raw) : [];
}

export async function getDisliked() {
  const raw = await AsyncStorage.getItem(KEYS.DISLIKED);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCurrentRecommendation(rec) {
  const today = new Date().toDateString();
  await AsyncStorage.setItem(KEYS.CURRENT_REC, JSON.stringify(rec));
  await AsyncStorage.setItem(KEYS.LAST_DATE, today);
}

export async function getCurrentRecommendation() {
  const lastDate = await AsyncStorage.getItem(KEYS.LAST_DATE);
  const today = new Date().toDateString();
  if (lastDate !== today) return null;
  const raw = await AsyncStorage.getItem(KEYS.CURRENT_REC);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAll() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}