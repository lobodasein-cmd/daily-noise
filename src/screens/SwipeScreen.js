import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Animated, PanResponder, Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSimilarArtists } from '../utils/spotifyAuth';
import { colors, typography, spacing } from '../theme';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

export default function SwipeScreen({ navigation, route }) {
  const { seedArtists } = route.params || {};
  const [artists, setArtists] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    setLoading(true);
    try {
      let pool = [];
      const names = seedArtists ? seedArtists.map(a => a.name) : [];

      for (const name of names.slice(0, 3)) {
        const similar = await getSimilarArtists(name);
        pool = [...pool, ...similar];
      }

      // Eliminar duplicados
      const unique = [];
      const seen = new Set(names);
      for (const a of pool) {
        if (!seen.has(a.name)) {
          seen.add(a.name);
          unique.push(a);
        }
      }

      setArtists(unique.slice(0, 15));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeLeft();
      } else {
        resetPosition();
      }
    },
  });

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const current = artists[currentIndex];
      if (current) {
        setLiked(prev => [...prev, current.name]);
      }
      nextCard();
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const current = artists[currentIndex];
      if (current) {
        setDisliked(prev => [...prev, current.name]);
      }
      nextCard();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const nextCard = () => {
    position.setValue({ x: 0, y: 0 });
    const next = currentIndex + 1;
    if (next >= artists.length) {
      setDone(true);
    } else {
      setCurrentIndex(next);
    }
  };

  const handleFinish = async () => {
    // Guardar historial de swipes
    const existing = await AsyncStorage.getItem('swipe_history');
    const existingParsed = existing ? JSON.parse(existing) : [];
    const combined = [...new Set([...existingParsed, ...liked, ...disliked])];
    await AsyncStorage.setItem('swipe_history', JSON.stringify(combined));

    // Guardar likes como artistas extra favoritos
    const extraFavs = await AsyncStorage.getItem('extra_favorites');
    const extraParsed = extraFavs ? JSON.parse(extraFavs) : [];
    const newExtras = [...new Set([...extraParsed, ...liked])];
    await AsyncStorage.setItem('extra_favorites', JSON.stringify(newExtras));

    navigation.replace('Home');
  };

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>CARGANDO ARTISTAS...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (done || artists.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneTitle}>LISTO</Text>
          <View style={styles.doneDivider} />
          <Text style={styles.doneSubtitle}>
            {liked.length} artistas guardados
          </Text>
          <Text style={styles.doneText}>
            la ia usará esto para afinar tus recomendaciones
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleFinish}>
            <Text style={styles.doneButtonText}>VER ARTISTA DEL DÍA →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = artists[currentIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>DAILY<Text style={styles.logoAccent}> NOISE</Text></Text>
          <Text style={styles.counter}>{currentIndex + 1}/{artists.length}</Text>
        </View>

        <Text style={styles.instruction}>
          → me gusta &nbsp;&nbsp;&nbsp; no me gusta ←
        </Text>

        <View style={styles.cardContainer}>
          {/* Siguiente carta */}
          {artists[currentIndex + 1] && (
            <View style={[styles.card, styles.cardBehind]}>
              <Text style={styles.cardArtistName}>
                {artists[currentIndex + 1].name.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Carta actual */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* LIKE label */}
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.likeLabelText}>ME LLEGA</Text>
            </Animated.View>

            {/* NOPE label */}
            <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
              <Text style={styles.nopeLabelText}>PASO</Text>
            </Animated.View>

            <Text style={styles.cardEmoji}>🎸</Text>
            <Text style={styles.cardArtistName}>
              {current.name.toUpperCase()}
            </Text>
            <View style={styles.cardDivider} />
            <Text style={styles.cardHint}>desliza para decidir</Text>
          </Animated.View>
        </View>

        {/* Botones manuales */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.nopeButton} onPress={swipeLeft}>
            <Text style={styles.nopeButtonText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={swipeRight}>
            <Text style={styles.likeButtonText}>♥</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
          <Text style={styles.skipText}>saltar →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { ...typography.label, fontSize: 11, color: colors.textMuted, letterSpacing: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  logo: { ...typography.display, fontSize: 24, color: colors.textPrimary },
  logoAccent: { color: colors.accent },
  counter: { ...typography.mono, fontSize: 12, color: colors.textMuted },
  instruction: { ...typography.mono, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: width - spacing.md * 4,
    height: height * 0.45,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    backgroundColor: colors.bgElevated,
  },
  cardEmoji: { fontSize: 48, marginBottom: spacing.md },
  cardArtistName: {
    ...typography.display,
    fontSize: Math.min(36, width * 0.08),
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1,
  },
  cardDivider: { width: 32, height: 2, backgroundColor: colors.accent },
  cardHint: { ...typography.mono, fontSize: 10, color: colors.textMuted, fontStyle: 'italic' },
  likeLabel: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '-15deg' }],
  },
  likeLabelText: { ...typography.label, fontSize: 16, color: colors.accent },
  nopeLabel: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    borderWidth: 2,
    borderColor: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '15deg' }],
  },
  nopeLabelText: { ...typography.label, fontSize: 16, color: colors.textMuted },
  buttonsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, paddingVertical: spacing.lg },
  nopeButton: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: colors.textMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  nopeButtonText: { fontSize: 24, color: colors.textMuted },
  likeButton: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  likeButtonText: { fontSize: 24, color: colors.accent },
  skipButton: { alignItems: 'center', paddingBottom: spacing.lg },
  skipText: { ...typography.mono, fontSize: 11, color: colors.textMuted },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  doneTitle: { ...typography.display, fontSize: 64, color: colors.accent, letterSpacing: -2 },
  doneDivider: { width: 48, height: 2, backgroundColor: colors.accent },
  doneSubtitle: { ...typography.label, fontSize: 14, color: colors.textPrimary, letterSpacing: 2 },
  doneText: { ...typography.mono, fontSize: 12, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
  doneButton: { borderWidth: 2, borderColor: colors.accent, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.md },
  doneButtonText: { ...typography.label, fontSize: 12, color: colors.accent, letterSpacing: 3 },
});