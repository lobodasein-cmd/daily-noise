export const SEED_ARTISTS = [
  { id: 'a1',  name: 'Pixies',            genre: ['alternative', 'indie'],         emoji: '🔪' },
  { id: 'a2',  name: 'Joy Division',      genre: ['post-punk', 'dark'],            emoji: '💀' },
  { id: 'a3',  name: 'The Strokes',       genre: ['indie rock', 'alternative'],    emoji: '🚬' },
  { id: 'a4',  name: 'Nick Cave',         genre: ['dark', 'post-punk', 'gothic'],  emoji: '🦇' },
  { id: 'a5',  name: 'PJ Harvey',         genre: ['alternative', 'art rock'],      emoji: '🩸' },
  { id: 'a6',  name: 'Sonic Youth',       genre: ['noise rock', 'alternative'],    emoji: '📻' },
  { id: 'a7',  name: 'Bauhaus',           genre: ['gothic', 'post-punk'],          emoji: '⚰️' },
  { id: 'a8',  name: 'Interpol',          genre: ['post-punk', 'indie'],           emoji: '🌑' },
  { id: 'a9',  name: 'Portishead',        genre: ['trip-hop', 'dark'],             emoji: '🌫️' },
  { id: 'a10', name: 'Radiohead',         genre: ['alternative', 'art rock'],      emoji: '👁️' },
  { id: 'a11', name: 'Swans',             genre: ['noise rock', 'dark'],           emoji: '🔩' },
  { id: 'a12', name: 'Queens of the Stone Age', genre: ['rock', 'stoner'],        emoji: '🏜️' },
  { id: 'a13', name: 'Shellac',           genre: ['noise rock', 'post-hardcore'],  emoji: '🔧' },
  { id: 'a14', name: 'My Bloody Valentine', genre: ['shoegaze', 'alternative'],   emoji: '🌀' },
  { id: 'a15', name: 'The Jesus and Mary Chain', genre: ['shoegaze', 'indie'],    emoji: '⛓️' },
  { id: 'a16', name: 'Bring Me The Horizon', genre: ['metalcore', 'alternative'], emoji: '🔥' },
  { id: 'a17', name: 'Metallica',            genre: ['metal', 'thrash'],          emoji: '⚡' },
  { id: 'a18', name: 'Paramore',             genre: ['pop punk', 'alternative'],  emoji: '🎸' },
  { id: 'a19', name: 'Shoreline',            genre: ['indie', 'alternative'],     emoji: '🌊' },
  { id: 'a20', name: 'Nirvana',              genre: ['grunge', 'alternative'],    emoji: '💥' },
  { id: 'a21', name: 'Twenty One Pilots',    genre: ['alternative', 'indie pop'], emoji: '🚗' },
  { id: 'a22', name: 'Korn',                 genre: ['metal', 'nu-metal'],        emoji: '😈' },
  { id: 'a23', name: 'Comeback Kid',         genre: ['hardcore', 'post-hardcore'], emoji: '✊' },
];

export const RECOMMENDATIONS = [
  {
    id: 'r1',
    artist: 'Lungfish',
    song: 'Love Is Not Enough',
    genre: 'post-punk',
    spotifyUrl: 'https://open.spotify.com/search/Lungfish',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Lungfish',
    relatedTo: ['a1', 'a13'],
    vibe: 'Raw. Repetitive. Hypnotic.',
  },
  {
    id: 'r2',
    artist: 'Iceage',
    song: 'The Lords Favorite',
    genre: 'post-punk',
    spotifyUrl: 'https://open.spotify.com/search/Iceage',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Iceage',
    relatedTo: ['a2', 'a8'],
    vibe: 'Copenhagen burning.',
  },
  {
    id: 'r3',
    artist: 'Preoccupations',
    song: 'Decompose',
    genre: 'post-punk',
    spotifyUrl: 'https://open.spotify.com/search/Preoccupations',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Preoccupations',
    relatedTo: ['a2', 'a8'],
    vibe: 'Anxiety rendered in guitar.',
  },
  {
    id: 'r4',
    artist: 'White Lies',
    song: 'Death',
    genre: 'post-punk revival',
    spotifyUrl: 'https://open.spotify.com/search/White+Lies',
    youtubeUrl: 'https://www.youtube.com/results?search_query=White+Lies+Death',
    relatedTo: ['a8', 'a2'],
    vibe: 'Stadium darkness.',
  },
  {
    id: 'r5',
    artist: 'Godspeed You Black Emperor',
    song: 'The Dead Flag Blues',
    genre: 'post-rock',
    spotifyUrl: 'https://open.spotify.com/search/Godspeed',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Godspeed+Dead+Flag+Blues',
    relatedTo: ['a9', 'a10'],
    vibe: 'The world is ending. Slowly.',
  },
  {
    id: 'r6',
    artist: 'Daughters',
    song: 'Satan in the Wait',
    genre: 'noise rock',
    spotifyUrl: 'https://open.spotify.com/search/Daughters',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Daughters+Satan+Wait',
    relatedTo: ['a11', 'a6'],
    vibe: 'Broken machine music.',
  },
  {
    id: 'r7',
    artist: 'Wand',
    song: 'Flesh War',
    genre: 'psychedelic rock',
    spotifyUrl: 'https://open.spotify.com/search/Wand+band',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Wand+Flesh+War',
    relatedTo: ['a12', 'a1'],
    vibe: 'California on acid.',
  },
  {
    id: 'r8',
    artist: 'Big Brave',
    song: 'Sibling',
    genre: 'noise drone',
    spotifyUrl: 'https://open.spotify.com/search/Big+Brave',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Big+Brave+Sibling',
    relatedTo: ['a11', 'a5'],
    vibe: 'Volume as vulnerability.',
  },
  {
    id: 'r9',
    artist: 'Molchat Doma',
    song: 'Sudno',
    genre: 'post-punk synth',
    spotifyUrl: 'https://open.spotify.com/search/Molchat+Doma',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Molchat+Doma+Sudno',
    relatedTo: ['a2', 'a7'],
    vibe: 'Soviet bloc aesthetic.',
  },
  {
    id: 'r10',
    artist: 'Chat Pile',
    song: 'Why',
    genre: 'noise rock sludge',
    spotifyUrl: 'https://open.spotify.com/search/Chat+Pile',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Chat+Pile+Why',
    relatedTo: ['a11', 'a6', 'a13'],
    vibe: 'Oklahoma existential dread.',
  },
];

export function getRecommendationForToday(favoriteIds, likedIds, dislikedIds) {
  if (!likedIds) likedIds = [];
  if (!dislikedIds) dislikedIds = [];
  var favorites = SEED_ARTISTS.filter(function(a) { return favoriteIds.includes(a.id); });
  var favoriteGenres = [];
  favorites.forEach(function(a) { a.genre.forEach(function(g) { if (!favoriteGenres.includes(g)) favoriteGenres.push(g); }); });
  var seen = likedIds.concat(dislikedIds);
  var candidates = RECOMMENDATIONS.filter(function(r) {
    if (seen.includes(r.id)) return false;
    var related = SEED_ARTISTS.filter(function(a) { return r.relatedTo.includes(a.id); });
    var relatedGenres = [];
    related.forEach(function(a) { a.genre.forEach(function(g) { relatedGenres.push(g); }); });
    return relatedGenres.some(function(g) { return favoriteGenres.includes(g); });
  });
  if (candidates.length === 0) {
    var unseen = RECOMMENDATIONS.filter(function(r) { return !dislikedIds.includes(r.id); });
    var pool = unseen.length > 0 ? unseen : RECOMMENDATIONS;
    var dayIndex = new Date().getDate() % pool.length;
    return pool[dayIndex];
  }
  var dayIdx = new Date().getDate() % candidates.length;
  return candidates[dayIdx];
}