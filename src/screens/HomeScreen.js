import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Linking, Animated, Dimensions,
  ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavorites, getLiked, getDisliked, saveLike, saveDislike, saveCurrentRecommendation, getCurrentRecommendation, clearAll } from '../utils/storage';
import { getAIRecommendation } from '../utils/spotifyAuth';
import { colors, typography, spacing, shadows } from '../theme';

const { width } = Dimensions.get('window');
const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export default function HomeScreen({ navigation }) {
  const [rec, setRec] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dayCount, setDayCount] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glitchAnim = useRef(new Animated.Value(0)).current;

  const now = new Date();
  const dateStr = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  useEffect(() => {
    loadRecommendation();
    loadDayCount();
  }, []);

  const loadDayCount = async () => {
    try {
      const firstOpen = await AsyncStorage.getItem('first_open_date');
      if (!firstOpen) {
        await AsyncStorage.setItem('first_open_date', new Date().toDateString());
        setDayCount(1);
      } else {
        const first = new Date(firstOpen);
        const today = new Date();
        const diff = Math.floor((today - first) / (1000 * 60 * 60 * 24)) + 1;
        setDayCount(diff);
      }
    } catch (e) {
      setDayCount(1);
    }
  };

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      let today = await getCurrentRecommendation();

      if (!today) {
        const favs = await getFavorites();
        const seedArtists = await AsyncStorage.getItem('spotify_seed_artists');
        const seedParsed = seedArtists ? JSON.parse(seedArtists) : [];
        const likedNames = seedParsed.filter(a => favs.includes(a.id)).map(a => a.name);
        const swipeHistory = await AsyncStorage.getItem('swipe_history');
        const swipeParsed = swipeHistory ? JSON.parse(swipeHistory) : [];
        const extraFavs = await AsyncStorage.getItem('extra_favorites');
        const extraParsed = extraFavs ? JSON.parse(extraFavs) : [];
        const allLiked = [...new Set([...likedNames, ...extraParsed])];

        today = await getAIRecommendation(
          allLiked.length > 0 ? allLiked : ['Radiohead', 'Pixies'],
          [],
          swipeParsed
        );

        if (today) {
          today.id = today.id || today.artist + '-' + Date.now();
          await saveCurrentRecommendation(today);
        }
      }

      if (today) {
        const liked = await getLiked();
        const disliked = await getDisliked();
        if (liked.includes(today.id)) setReaction('like');
        else if (disliked.includes(today.id)) setReaction('dislike');
        setRec(today);
        animateIn();
        glitchEffect();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const glitchEffect = () => {
    Animated.sequence([
      Animated.timing(glitchAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(glitchAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
      Animated.timing(glitchAnim, { toValue: 2, duration: 50, useNativeDriver: true }),
      Animated.timing(glitchAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const pulseCTA = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = async () => {
    if (!rec || reaction) return;
    await saveLike(rec.id);
    setReaction('like');
    const swipeHistory = await AsyncStorage.getItem('swipe_history');
    const swipeParsed = swipeHistory ? JSON.parse(swipeHistory) : [];
    swipeParsed.push(rec.artist);
    await AsyncStorage.setItem('swipe_history', JSON.stringify(swipeParsed));
  };

  const handleDislike = async () => {
    if (!rec || reaction) return;
    await saveDislike(rec.id);
    setReaction('dislike');
    const swipeHistory = await AsyncStorage.getItem('swipe_history');
    const swipeParsed = swipeHistory ? JSON.parse(swipeHistory) : [];
    swipeParsed.push(rec.artist);
    await AsyncStorage.setItem('swipe_history', JSON.stringify(swipeParsed));
  };

  const handleListen = (platform) => {
    pulseCTA();
    const url = platform === 'spotify' ? rec.spotifyUrl : rec.youtubeUrl;
    Linking.openURL(url).catch(() => Linking.openURL(rec.youtubeUrl));
  };

  const handleReset = async () => {
    await clearAll();
    await AsyncStorage.removeItem('spotify_seed_artists');
    await AsyncStorage.removeItem('swipe_history');
    await AsyncStorage.removeItem('extra_favorites');
    await AsyncStorage.removeItem('first_open_date');
    navigation.replace('Onboarding');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>ANALIZANDO TU PERFIL...</Text>
          <Text style={styles.loadingSubtext}>la ia está trabajando</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.logo}>DAILY<Text style={styles.logoAccent}> NOISE</Text></Text>
          <View style={styles.dateBlock}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <View style={styles.liveDot} />
          </View>
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.dayCountRow}>
          <Text style={styles.dayCountText}>DAY {String(dayCount).padStart(3, '0')}</Text>
          <Text style={styles.aiTag}>✦ IA PERSONALIZADA</Text>
        </View>

        <Text style={styles.sectionLabel}>── ARTISTA DEL DÍA ──</Text>

        <Animated.View style={[
          styles.artistCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: glitchAnim }] }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.issueText}>N°{now.getDate().toString().padStart(3, '0')}</Text>
            <Text style={styles.genreTag}>{rec?.genre?.toUpperCase()}</Text>
          </View>
          <View style={styles.artistNameContainer}>
            <Text style={styles.artistName} numberOfLines={3}>
              {rec?.artist?.toUpperCase()}
            </Text>
            <View style={styles.accentLine} />
          </View>
          <Text style={styles.vibeLine}>{rec?.vibe}</Text>
          {rec?.reason && (
            <View style={styles.reasonRow}>
              <Text style={styles.reasonLabel}>✦ POR QUÉ</Text>
              <Text style={styles.reasonText}>{rec.reason}</Text>
            </View>
          )}
          <View style={styles.songRow}>
            <Text style={styles.songLabel}>TRACK</Text>
            <Text style={styles.songName}>{rec?.song}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.listenRow, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }], flex: 1 }}>
            <TouchableOpacity style={[styles.listenButton, styles.spotifyBtn]} onPress={() => handleListen('spotify')} activeOpacity={0.8}>
              <Text style={styles.listenBtnText}>▶  SPOTIFY</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={{ width: spacing.sm }} />
          <Animated.View style={{ transform: [{ scale: pulseAnim }], flex: 1 }}>
            <TouchableOpacity style={[styles.listenButton, styles.youtubeBtn]} onPress={() => handleListen('youtube')} activeOpacity={0.8}>
              <Text style={styles.listenBtnText}>▶  YOUTUBE</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.reactionSection, { opacity: fadeAnim }]}>
          <Text style={styles.reactionLabel}>
            {reaction ? '— TU VEREDICTO —' : '— ¿QUÉ OPINAS? —'}
          </Text>
          <View style={styles.reactionRow}>
            <TouchableOpacity
              style={[styles.reactionBtn, reaction === 'like' && styles.reactionBtnLikeActive, reaction && reaction !== 'like' && styles.reactionBtnDimmed]}
              onPress={handleLike} disabled={!!reaction} activeOpacity={0.7}
            >
              <Text style={styles.reactionIcon}>♥</Text>
              <Text style={[styles.reactionText, reaction === 'like' && styles.reactionTextActive]}>ME LLEGA</Text>
            </TouchableOpacity>
            <View style={styles.reactionDivider}>
              <Text style={styles.reactionOr}>vs</Text>
            </View>
            <TouchableOpacity
              style={[styles.reactionBtn, reaction === 'dislike' && styles.reactionBtnDislikeActive, reaction && reaction !== 'dislike' && styles.reactionBtnDimmed]}
              onPress={handleDislike} disabled={!!reaction} activeOpacity={0.7}
            >
              <Text style={styles.reactionIcon}>✕</Text>
              <Text style={[styles.reactionText, reaction === 'dislike' && styles.reactionTextDislikeActive]}>NO ES LO MÍO</Text>
            </TouchableOpacity>
          </View>
          {reaction && (
            <Text style={styles.reactionConfirm}>
              {reaction === 'like' ? 'registrado. la ia aprende.' : 'registrado. mañana algo diferente.'}
            </Text>
          )}
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>VUELVE MAÑANA • NUEVA SEÑAL CADA DÍA</Text>
          <Text style={styles.footerMotto}>esto no es mainstream</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>reiniciar app</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { ...typography.label, fontSize: 11, color: colors.textMuted, letterSpacing: 4 },
  loadingSubtext: { ...typography.mono, fontSize: 10, color: colors.accentDim, fontStyle: 'italic' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  logo: { ...typography.display, fontSize: 28, color: colors.textPrimary },
  logoAccent: { color: colors.accent },
  dateBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dateText: { ...typography.mono, fontSize: 11, color: colors.textSecondary },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  headerDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  dayCountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  dayCountText: { ...typography.display, fontSize: 32, color: colors.accent, letterSpacing: -1 },
  aiTag: { ...typography.mono, fontSize: 10, color: colors.textMuted, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  sectionLabel: { ...typography.mono, fontSize: 10, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, letterSpacing: 2 },
  artistCard: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  issueText: { ...typography.mono, fontSize: 11, color: colors.textMuted },
  genreTag: { ...typography.mono, fontSize: 10, color: colors.accent, borderWidth: 1, borderColor: colors.accentDim, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  artistNameContainer: { marginBottom: spacing.md },
  artistName: { ...typography.display, fontSize: Math.min(52, width * 0.12), color: colors.textPrimary, lineHeight: Math.min(52, width * 0.12) * 1.05, letterSpacing: -2 },
  accentLine: { width: 32, height: 3, backgroundColor: colors.accent, marginTop: spacing.sm },
  vibeLine: { ...typography.mono, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.md },
  reasonRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginBottom: spacing.md, gap: spacing.xs },
  reasonLabel: { ...typography.label, fontSize: 9, color: colors.accent, letterSpacing: 2 },
  reasonText: { ...typography.mono, fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },
  songRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.md },
  songLabel: { ...typography.label, fontSize: 9, color: colors.textMuted, letterSpacing: 3 },
  songName: { ...typography.body, fontSize: 14, color: colors.textPrimary, fontStyle: 'italic', flex: 1 },
  listenRow: { flexDirection: 'row', marginBottom: spacing.xl },
  listenButton: { paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1 },
  spotifyBtn: { borderColor: colors.accent, backgroundColor: 'transparent' },
  youtubeBtn: { borderColor: colors.borderBright, backgroundColor: 'transparent' },
  listenBtnText: { ...typography.label, fontSize: 11, color: colors.textPrimary, letterSpacing: 2 },
  reactionSection: { marginBottom: spacing.xl },
  reactionLabel: { ...typography.mono, fontSize: 10, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, letterSpacing: 2 },
  reactionRow: { flexDirection: 'row', alignItems: 'stretch' },
  reactionBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, alignItems: 'center', gap: spacing.xs, backgroundColor: colors.bgCard },
  reactionBtnLikeActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  reactionBtnDislikeActive: { borderColor: colors.borderBright, backgroundColor: colors.bgElevated },
  reactionBtnDimmed: { opacity: 0.3 },
  reactionIcon: { fontSize: 18, color: colors.textSecondary },
  reactionText: { ...typography.label, fontSize: 9, color: colors.textSecondary, letterSpacing: 1.5 },
  reactionTextActive: { color: colors.accent },
  reactionTextDislikeActive: { color: colors.textPrimary },
  reactionDivider: { width: 32, alignItems: 'center', justifyContent: 'center' },
  reactionOr: { ...typography.mono, fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
  reactionConfirm: { ...typography.mono, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },
  footer: { alignItems: 'center', gap: spacing.sm },
  footerDivider: { width: '100%', height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },
  footerText: { ...typography.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  footerMotto: { ...typography.mono, fontSize: 10, color: colors.accentDim, fontStyle: 'italic' },
  resetButton: { marginTop: spacing.md, paddingVertical: spacing.sm },
  resetText: { ...typography.mono, fontSize: 10, color: colors.textMuted, textDecorationLine: 'underline' },
});