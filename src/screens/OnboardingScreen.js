// src/screens/OnboardingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Dimensions,
  TextInput, ActivityIndicator,
} from 'react-native';
import { saveFavorites } from '../utils/storage';
import { scheduleDailyNotification } from '../utils/notifications';
import { useSpotifyAuth, saveToken, getToken, searchArtists } from '../utils/spotifyAuth';
import { colors, typography, spacing } from '../theme';

const { width } = Dimensions.get('window');
const MIN_SELECTION = 3;
const MAX_SELECTION = 5;

export default function OnboardingScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [token, setToken] = useState(null);
  const [searching, setSearching] = useState(false);
  const [authDone, setAuthDone] = useState(false);

  const { request, response, promptAsync } = useSpotifyAuth();

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.params.access_token ||
        response.authentication?.accessToken;
      if (accessToken) {
        saveToken(accessToken);
        setToken(accessToken);
        setAuthDone(true);
      }
    }
  }, [response]);

  useEffect(() => {
    if (token && query.length >= 2) {
      const timeout = setTimeout(() => doSearch(), 500);
      return () => clearTimeout(timeout);
    } else {
      setResults([]);
    }
  }, [query, token]);

  const checkToken = async () => {
    const saved = await getToken();
    if (saved) {
      setToken(saved);
      setAuthDone(true);
    }
  };

  const doSearch = async () => {
    setSearching(true);
    try {
      const artists = await searchArtists(token, query);
      setResults(artists);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const toggle = (artist) => {
    const exists = selected.find(s => s.id === artist.id);
    if (exists) {
      setSelected(selected.filter(s => s.id !== artist.id));
    } else if (selected.length < MAX_SELECTION) {
      setSelected([...selected, artist]);
    }
  };

  const handleContinue = async () => {
    if (selected.length < MIN_SELECTION) return;
    await saveFavorites(selected.map(a => a.id));
    await AsyncStorage.setItem('spotify_seed_artists', JSON.stringify(selected));
    await scheduleDailyNotification(10, 0);
    navigation.replace('Home');
  };

  const canContinue = selected.length >= MIN_SELECTION;

  if (!authDone) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.authContainer}>
          <Text style={styles.logo}>DAILY</Text>
          <Text style={styles.logoAccent}>NOISE</Text>
          <View style={styles.divider} />
          <Text style={styles.authText}>
            Conecta tu Spotify para descubrir música real
          </Text>
          <TouchableOpacity
            style={styles.spotifyBtn}
            onPress={() => promptAsync()}
            disabled={!request}
            activeOpacity={0.8}
          >
            <Text style={styles.spotifyBtnText}>▶  CONECTAR SPOTIFY</Text>
          </TouchableOpacity>
          <Text style={styles.footer}>no es mainstream. es tuyo.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>DAILY</Text>
          <Text style={styles.logoAccent}>NOISE</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>BUSCA TUS ARTISTAS</Text>
          <Text style={styles.hint}>elige entre {MIN_SELECTION} y {MAX_SELECTION}</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar artista..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {searching && <ActivityIndicator color={colors.accent} style={styles.searchLoader} />}
        </View>

        {results.length > 0 && (
          <View style={styles.resultsList}>
            {results.map((artist) => {
              const isSelected = selected.find(s => s.id === artist.id);
              return (
                <TouchableOpacity
                  key={artist.id}
                  style={[styles.resultItem, isSelected && styles.resultItemSelected]}
                  onPress={() => toggle(artist)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resultEmoji}>🎸</Text>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, isSelected && styles.resultNameSelected]}>
                      {artist.name.toUpperCase()}
                    </Text>
                    <Text style={styles.resultGenre}>
                      {artist.genre.join(', ')}
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✕</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selected.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedLabel}>── SELECCIONADOS ──</Text>
            {selected.map(a => (
              <TouchableOpacity
                key={a.id}
                style={styles.selectedItem}
                onPress={() => toggle(a)}
              >
                <Text style={styles.selectedName}>{a.name.toUpperCase()}</Text>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.counterRow}>
          <Text style={styles.counterText}>{selected.length}/{MAX_SELECTION} seleccionados</Text>
          {selected.length < MIN_SELECTION && (
            <Text style={styles.counterHint}>mínimo {MIN_SELECTION}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, !canContinue && styles.ctaButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>
            ENTRAR →
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>no es mainstream. es tuyo.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  authContainer: { flex: 1, paddingHorizontal: spacing.md, justifyContent: 'center', gap: spacing.md },
  header: { marginBottom: spacing.xl },
  logo: { ...typography.display, fontSize: 52, color: colors.textPrimary, lineHeight: 52 },
  logoAccent: { ...typography.display, fontSize: 52, color: colors.accent, lineHeight: 52, marginBottom: spacing.md },
  divider: { width: 48, height: 2, backgroundColor: colors.accent, marginBottom: spacing.lg },
  subtitle: { ...typography.label, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  hint: { ...typography.mono, fontSize: 11, color: colors.textMuted },
  authText: { ...typography.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  spotifyBtn: { borderWidth: 2, borderColor: colors.accent, paddingVertical: spacing.md, alignItems: 'center' },
  spotifyBtnText: { ...typography.label, fontSize: 13, color: colors.accent, letterSpacing: 3 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
    color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    ...typography.body, fontSize: 14,
  },
  searchLoader: { marginLeft: spacing.sm },
  resultsList: { marginBottom: spacing.md },
  resultItem: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard, padding: spacing.sm, marginBottom: spacing.xs, gap: spacing.sm,
  },
  resultItemSelected: { borderColor: colors.accent, backgroundColor: colors.bgElevated },
  resultEmoji: { fontSize: 20 },
  resultInfo: { flex: 1 },
  resultName: { ...typography.label, fontSize: 11, color: colors.textSecondary },
  resultNameSelected: { color: colors.textPrimary },
  resultGenre: { ...typography.mono, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  checkmark: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  selectedSection: { marginBottom: spacing.md },
  selectedLabel: { ...typography.mono, fontSize: 10, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm, letterSpacing: 2 },
  selectedItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.accentDim, padding: spacing.sm, marginBottom: spacing.xs },
  selectedName: { ...typography.label, fontSize: 11, color: colors.accent },
  removeText: { color: colors.textMuted, fontSize: 12 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  counterText: { ...typography.mono, fontSize: 11, color: colors.textSecondary },
  counterHint: { ...typography.mono, fontSize: 11, color: colors.accentDim },
  ctaButton: { borderWidth: 2, borderColor: colors.accent, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.lg },
  ctaButtonDisabled: { borderColor: colors.border },
  ctaText: { ...typography.label, fontSize: 14, color: colors.accent, letterSpacing: 4 },
  ctaTextDisabled: { color: colors.textMuted },
  footer: { ...typography.mono, fontSize: 10, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
});