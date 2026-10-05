import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  navy: '#0A0E27',
  deepPurple: '#1E1B4B',
  indigo: '#312E81',
  gold: '#D4AF37',
  lightGold: '#F4E5B1',
  success: '#00B884',
  error: '#EF4444',
  warning: '#F5A623',
  info: '#6366F1',
  white: '#FFFFFF',
  surface: '#F8F9FB',
  border: '#E9EEF7',
  textPrimary: '#0A0E27',
  textSecondary: '#64748B',
  muted: '#94A3B8',
};

const TEAM_CODES = {
  India: 'IND',
  Australia: 'AUS',
  Pakistan: 'PAK',
  England: 'ENG',
  'South Africa': 'SA',
  'New Zealand': 'NZ',
  'Sri Lanka': 'SL',
  Bangladesh: 'BAN',
  Afghanistan: 'AFG',
  Ireland: 'IRE',
  Nepal: 'NEP',
  'West Indies': 'WI',
  'United Arab Emirates': 'UAE',
};

const formatColors = {
  T6: '#8B5CF6',
  T10: '#F59E0B',
  T20: '#3B82F6',
  ODI: '#10B981',
  Test: '#F97316',
};

const getTeamCode = (team) => TEAM_CODES[team] || team.slice(0, 3).toUpperCase();

const getStatusColor = (status) => {
  switch (status) {
    case 'LIVE': return '#EF4444';
    case 'CORRECT': return '#10B981';
    case 'WRONG': return '#F87171';
    case 'UPCOMING': return '#D4AF37';
    default: return '#6366F1';
  }
};

const getFormatColor = (type) => formatColors[type] || '#6366F1';

const formatCountdown = (targetDate) => {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const getElapsedTime = (startDate) => {
  const diff = Math.max(0, Date.now() - new Date(startDate).getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const initialMatches = [
  {
    id: 1,
    status: 'LIVE',
    type: 'T20',
    series: 'IPL 2026',
    venue: 'Wankhede Stadium, Mumbai',
    date: '2026-10-05',
    time: '19:30',
    matchStartTime: '2026-10-05T19:30:00+05:30',
    teamA: 'India',
    teamB: 'Australia',
    prediction: 'India',
    predictionPublished: true,
    result: null,
    analysis: 'India are attacking the powerplay with intent and the middle overs are being controlled through tighter lengths and smart field placements.',
    headToHead: { India: 14, Australia: 11 },
    recentMatches: [
      { date: 'Sep 18', format: 'T20', winner: 'India', venue: 'Mumbai' },
      { date: 'Sep 12', format: 'T20', winner: 'Australia', venue: 'Sydney' },
      { date: 'Sep 05', format: 'T20', winner: 'India', venue: 'Dubai' },
    ],
    predictionBadge: 'WILL WIN',
  },
  {
    id: 2,
    status: 'UPCOMING',
    type: 'ODI',
    series: 'Champions Cup',
    venue: 'Lord’s, London',
    date: '2026-10-08',
    time: '14:00',
    matchStartTime: '2026-10-08T14:00:00+01:00',
    teamA: 'England',
    teamB: 'New Zealand',
    prediction: 'England',
    predictionPublished: true,
    result: null,
    analysis: 'The early overs will likely favor swing under cloud cover while New Zealand will look to neutralize the powerplay with disciplined lines.',
    headToHead: { England: 17, 'New Zealand': 13 },
    recentMatches: [
      { date: 'Sep 23', format: 'ODI', winner: 'England', venue: 'Birmingham' },
      { date: 'Sep 18', format: 'ODI', winner: 'New Zealand', venue: 'Auckland' },
      { date: 'Sep 11', format: 'ODI', winner: 'England', venue: 'Manchester' },
    ],
    predictionBadge: 'WILL WIN',
  },
  {
    id: 3,
    status: 'CORRECT',
    type: 'Test',
    series: 'Ashes 2026',
    venue: 'Melbourne Cricket Ground',
    date: '2026-09-29',
    time: '10:00',
    matchStartTime: '2026-09-29T10:00:00+10:00',
    teamA: 'Australia',
    teamB: 'England',
    prediction: 'Australia',
    predictionPublished: true,
    result: 'Australia',
    analysis: 'Australia controlled the key passages of play through disciplined seam movement and long spells from the boundary riders.',
    headToHead: { Australia: 32, England: 28 },
    recentMatches: [
      { date: 'Sep 05', format: 'Test', winner: 'Australia', venue: 'Melbourne' },
      { date: 'Aug 28', format: 'Test', winner: 'England', venue: 'Lord’s' },
      { date: 'Aug 15', format: 'Test', winner: 'Australia', venue: 'Adelaide' },
    ],
    predictionBadge: 'WILL WIN',
  },
  {
    id: 4,
    status: 'WRONG',
    type: 'T10',
    series: 'World T10 League',
    venue: 'Dubai International Stadium',
    date: '2026-09-22',
    time: '20:00',
    matchStartTime: '2026-09-22T20:00:00+04:00',
    teamA: 'Pakistan',
    teamB: 'Sri Lanka',
    prediction: 'Pakistan',
    predictionPublished: true,
    result: 'Sri Lanka',
    analysis: 'A late dew surge unsettled Pakistan’s rhythm and Sri Lanka found more control in the backend with quicker boundaries.',
    headToHead: { Pakistan: 8, 'Sri Lanka': 6 },
    recentMatches: [
      { date: 'Sep 18', format: 'T10', winner: 'Sri Lanka', venue: 'Dubai' },
      { date: 'Sep 12', format: 'T10', winner: 'Pakistan', venue: 'Karachi' },
      { date: 'Sep 06', format: 'T10', winner: 'Pakistan', venue: 'Lahore' },
    ],
    predictionBadge: 'WILL WIN',
  },
  {
    id: 5,
    status: 'UPCOMING',
    type: 'T20',
    series: 'Asia Showdown',
    venue: 'Eden Gardens, Kolkata',
    date: '2026-10-11',
    time: '19:00',
    matchStartTime: '2026-10-11T19:00:00+05:30',
    teamA: 'India',
    teamB: 'Pakistan',
    prediction: null,
    predictionPublished: false,
    result: null,
    analysis: 'A high-stakes contest with spin likely acquiring control in the middle overs while both teams chase a fast start.',
    headToHead: { India: 12, Pakistan: 9 },
    recentMatches: [
      { date: 'Oct 02', format: 'T20', winner: 'India', venue: 'Kolkata' },
      { date: 'Sep 24', format: 'T20', winner: 'Pakistan', venue: 'Lahore' },
      { date: 'Sep 16', format: 'T20', winner: 'India', venue: 'Dubai' },
    ],
    predictionBadge: 'PREDICTION COMING SOON',
  },
];

const rankings = {
  T6: [
    { rank: 1, team: 'India', wins: 17, losses: 5, matches: 22, winRate: 77 },
    { rank: 2, team: 'Australia', wins: 16, losses: 6, matches: 22, winRate: 73 },
    { rank: 3, team: 'England', wins: 15, losses: 7, matches: 22, winRate: 68 },
    { rank: 4, team: 'Pakistan', wins: 14, losses: 8, matches: 22, winRate: 64 },
  ],
  T10: [
    { rank: 1, team: 'Australia', wins: 18, losses: 5, matches: 23, winRate: 78 },
    { rank: 2, team: 'Pakistan', wins: 17, losses: 6, matches: 23, winRate: 74 },
    { rank: 3, team: 'India', wins: 16, losses: 7, matches: 23, winRate: 70 },
    { rank: 4, team: 'England', wins: 14, losses: 9, matches: 23, winRate: 61 },
  ],
  T20: [
    { rank: 1, team: 'India', wins: 48, losses: 19, matches: 67, winRate: 72 },
    { rank: 2, team: 'Australia', wins: 46, losses: 22, matches: 68, winRate: 68 },
    { rank: 3, team: 'England', wins: 43, losses: 25, matches: 68, winRate: 63 },
    { rank: 4, team: 'Pakistan', wins: 39, losses: 28, matches: 67, winRate: 58 },
  ],
  ODI: [
    { rank: 1, team: 'India', wins: 31, losses: 13, matches: 44, winRate: 70 },
    { rank: 2, team: 'Australia', wins: 29, losses: 17, matches: 46, winRate: 63 },
    { rank: 3, team: 'England', wins: 27, losses: 18, matches: 45, winRate: 60 },
    { rank: 4, team: 'New Zealand', wins: 24, losses: 20, matches: 44, winRate: 55 },
  ],
  Test: [
    { rank: 1, team: 'India', wins: 29, losses: 14, matches: 43, winRate: 67 },
    { rank: 2, team: 'Australia', wins: 25, losses: 16, matches: 41, winRate: 61 },
    { rank: 3, team: 'England', wins: 23, losses: 20, matches: 43, winRate: 53 },
    { rank: 4, team: 'South Africa', wins: 22, losses: 21, matches: 43, winRate: 51 },
  ],
};

const helpFaq = [
  { q: 'How do predictions work?', a: 'Our analysts blend form, conditions, player matchups, and venue context before locking a pick.' },
  { q: 'When are picks published?', a: 'Most picks go live 2–6 hours before the toss. Some are locked until team news is confirmed.' },
  { q: 'How is accuracy calculated?', a: 'Accuracy is the share of correct tips among all published predictions in the selected period.' },
  { q: 'Can I change language?', a: 'The app is currently in English, with future language packs planned as updates.' },
];

function SplashScreen() {
  return (
    <LinearGradient colors={['#0A0E27', '#1E1B4B', '#312E81']} style={styles.fullscreen}>
      <View style={styles.splashContent}>
        <View style={styles.logoOrb}>
          <Text style={styles.logoEmoji}>🏏</Text>
        </View>
        <Text style={styles.brandLine}>Cricket <Text style={styles.goldText}>Predict</Text></Text>
        <Text style={styles.premiumLabel}>PREMIUM EDITION</Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((dot) => (
            <View key={dot} style={[styles.dot, { opacity: 0.4 + dot * 0.25 }]} />
          ))}
        </View>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    </LinearGradient>
  );
}

function BottomNav({ activeNav, setActiveNav }) {
  const items = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'stats', label: 'Stats', icon: '📊' },
    { key: 'rank', label: 'Rank', icon: '🏆' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.navWrap}>
      <LinearGradient colors={['rgba(10,14,39,0.92)', 'rgba(17,24,39,0.96)']} style={styles.navBar}>
        {items.map((item) => {
          const isActive = item.key === activeNav;
          return (
            <TouchableOpacity key={item.key} onPress={() => setActiveNav(item.key)} style={[styles.navItem, isActive && styles.navItemActive]} activeOpacity={0.9}>
              <View style={[styles.navIconBox, isActive && styles.navIconBoxActive]}>
                <Text style={styles.navIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

function StatCard({ label, value, accent }) {
  const isGold = accent === 'gold';
  return (
    <View style={[styles.statCard, isGold ? styles.goldSurface : styles.greenSurface]}>
      <Text style={[styles.statLabel, !isGold && styles.greenLabel]}>{label}</Text>
      <Text style={[styles.statValue, !isGold && styles.greenLabel]}>{value}</Text>
    </View>
  );
}

function MatchCard({ match, onPress }) {
  const isLive = match.status === 'LIVE';
  const isUpcoming = match.status === 'UPCOMING';
  const isDone = match.status === 'CORRECT' || match.status === 'WRONG';
  const countdown = isLive ? getElapsedTime(match.matchStartTime) : formatCountdown(match.matchStartTime);

  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(match.status)}15`, borderColor: `${getStatusColor(match.status)}66` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>{match.status}</Text>
        </View>
        <View style={[styles.typePill, { backgroundColor: `${getFormatColor(match.type)}15`, borderColor: `${getFormatColor(match.type)}66` }]}>
          <Text style={[styles.typeText, { color: getFormatColor(match.type) }]}>{match.type}</Text>
        </View>
      </View>

      <Text style={styles.seriesName}>{match.series}</Text>

      {isLive && (
        <View style={styles.liveLiveRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveTimer}>{`${countdown.hours}:${countdown.minutes}:${countdown.seconds}`}</Text>
        </View>
      )}

      {isUpcoming && (
        <View style={styles.countdownRow}>
          {['days', 'hours', 'minutes', 'seconds'].map((key) => (
            <View key={key} style={styles.countBox}>
              <Text style={styles.countValue}>{countdown[key]}</Text>
              <Text style={styles.countLabel}>{key === 'days' ? 'D' : key === 'hours' ? 'H' : key === 'minutes' ? 'M' : 'S'}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.teamsRow}>
        <View style={styles.teamBlock}>
          <View style={styles.teamAvatar}><Text style={styles.teamAvatarText}>{getTeamCode(match.teamA)}</Text></View>
          <Text style={styles.teamName}>{match.teamA}</Text>
        </View>
        <View style={styles.vsOrb}><Text style={styles.vsText}>VS</Text></View>
        <View style={styles.teamBlock}>
          <View style={styles.teamAvatar}><Text style={styles.teamAvatarText}>{getTeamCode(match.teamB)}</Text></View>
          <Text style={styles.teamName}>{match.teamB}</Text>
        </View>
      </View>

      <View style={styles.h2hBox}>
        <Text style={styles.h2hTitle}>Head to Head</Text>
        <View style={styles.h2hRow}>
          <Text style={styles.h2hText}>{match.teamA}: {match.headToHead[match.teamA]}</Text>
          <Text style={styles.h2hText}>{match.teamB}: {match.headToHead[match.teamB]}</Text>
        </View>
      </View>

      <View style={styles.recentBox}>
        <Text style={styles.recentTitle}>Last Matches</Text>
        <View style={styles.recentList}>
          {match.recentMatches.map((item, index) => (
            <View key={index} style={styles.recentItem}>
              <View style={styles.dotMini} />
              <Text style={styles.recentText}>{item.date}</Text>
              <Text style={styles.recentWinner}>{item.winner}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.predictionBox}>
        {match.predictionPublished && match.prediction ? (
          <>
            <Text style={styles.predictionLabel}>{match.predictionBadge}</Text>
            <Text style={styles.predictionWinner}>{match.prediction}</Text>
          </>
        ) : (
          <Text style={styles.predictionLabel}>PREDICTION COMING SOON</Text>
        )}
      </View>

      {isDone && (
        <View style={[styles.resultBox, match.result === match.prediction ? styles.resultBoxCorrect : styles.resultBoxWrong]}>
          <Text style={match.result === match.prediction ? styles.correctText : styles.wrongText}>{match.result === match.prediction ? '✅ CORRECT' : '❌ WRONG'}</Text>
        </View>
      )}

      <Text style={styles.tapHint}>👆 Tap to view full details</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.venueText}>📍 {match.venue}</Text>
        <Text style={styles.dateText}>{match.date}</Text>
      </View>
    </TouchableOpacity>
  );
}

function HomeScreen({ matches, searchText, setSearchText, activeTab, setActiveTab, onOpenMatch, onOpenAdmin }) {
  const filtered = useMemo(() => {
    const lower = searchText.trim().toLowerCase();
    return matches.filter((match) => {
      const byTab = activeTab === 'live' ? match.status === 'LIVE' : activeTab === 'upcoming' ? match.status === 'UPCOMING' : match.status === 'CORRECT' || match.status === 'WRONG';
      if (!byTab) return false;
      if (!lower) return true;
      return `${match.teamA} ${match.teamB} ${match.series}`.toLowerCase().includes(lower);
    });
  }, [matches, searchText, activeTab]);

  return (
    <ScrollView contentContainerStyle={styles.pageScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.homeHeader}>
        <View style={styles.brandMark}><Text style={styles.brandEmoji}>🏏</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.appName}>Cricket Predict</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.appSubtitle}>PREMIUM EDITION</Text>
            <View style={styles.livePillDot} />
          </View>
        </View>
        <TouchableOpacity style={styles.avatarButton} onPress={onOpenAdmin}>
          <Text style={styles.avatarText}>A</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="MATCHES" value={String(matches.length)} accent="gold" />
        <StatCard label="CORRECT" value={String(matches.filter((m) => m.status === 'CORRECT').length)} accent="green" />
        <StatCard label="ACCURACY" value="56%" accent="gold" />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput value={searchText} onChangeText={setSearchText} placeholder="Search teams or matches..." placeholderTextColor={COLORS.muted} style={styles.searchInput} />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabSwitcher}>
        {['live', 'upcoming', 'completed'].map((tab) => {
          const active = tab === activeTab;
          const count = tab === 'live' ? matches.filter((m) => m.status === 'LIVE').length : tab === 'upcoming' ? matches.filter((m) => m.status === 'UPCOMING').length : matches.filter((m) => m.status === 'CORRECT' || m.status === 'WRONG').length;
          return (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabPill, active && styles.tabPillActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab === 'live' ? 'Live' : tab === 'upcoming' ? 'Upcoming' : 'Results'}</Text>
              {count > 0 && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{count}</Text></View>}
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.map((match) => (
        <MatchCard key={match.id} match={match} onPress={() => onOpenMatch(match)} />
      ))}
    </ScrollView>
  );
}

function StatsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.statsPage} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Statistics</Text>
      <Text style={styles.sectionSub}>Performance snapshot</Text>

      <View style={styles.accuracyBanner}>
        <LinearGradient colors={['#0A0E27', '#1E1B4B', '#312E81']} style={styles.accuracyBannerInner}>
          <View style={styles.accuracyHeader}>
            <Text style={styles.accuracyLabel}>OVERALL ACCURACY</Text>
            <Text style={styles.starsText}>★★★★★</Text>
          </View>
          <Text style={styles.accuracyLarge}>56%</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: '56%' }]} /></View>
          <View style={styles.metricRow}>
            <View style={styles.metric}><Text style={styles.metricLabel}>CORRECT</Text><Text style={styles.metricValue}>162</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>WRONG</Text><Text style={styles.metricValue}>128</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>TOTAL</Text><Text style={styles.metricValue}>290</Text></View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.ratingBox}>
        <Text style={styles.ratingStars}>★★★★☆</Text>
        <Text style={styles.ratingTitle}>Excellent Predictor!</Text>
        <Text style={styles.ratingCopy}>Based on 56% accuracy</Text>
        <View style={styles.inlineBadge}><Text style={styles.inlineBadgeText}>📈 Improved by 12% this month</Text></View>
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.cardTitle}>By Format</Text>
        {['T6', 'T10', 'T20', 'ODI', 'Test'].map((format, index) => {
          const pct = [71, 64, 58, 54, 49][index];
          const correct = [24, 21, 46, 29, 20][index];
          const wrong = [10, 12, 28, 25, 18][index];
          return (
            <View key={format} style={styles.minorCard}>
              <View style={styles.cardLineRow}>
                <View style={styles.dotTitle}><View style={[styles.colorDot, { backgroundColor: formatColors[format] }]} /><Text style={styles.cardText}>{format}</Text></View>
                <Text style={styles.cardText}>{pct}%</Text>
              </View>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: formatColors[format] }]} /></View>
              <View style={styles.metaRow}><Text style={styles.metaText}>✓ {correct} Correct</Text><Text style={styles.metaText}>✗ {wrong} Wrong</Text></View>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.cardTitle}>Monthly Performance</Text>
        {['Aug', 'Sep', 'Oct'].map((month, i) => {
          const value = [41, 56, 63][i];
          return (
            <View key={month} style={styles.minorCard}>
              <View style={styles.cardLineRow}>
                <Text style={styles.cardText}>{month}</Text>
                <Text style={[styles.monthBadge, { backgroundColor: value >= 60 ? '#E7FFF7' : '#FFF7D6', color: value >= 60 ? '#0F766E' : '#B45309' }]}>{value}%</Text>
              </View>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${value}%`, backgroundColor: '#D4AF37' }]} /></View>
              <View style={styles.metaRow}><Text style={styles.metaText}>Correct {Math.round(value / 2)}</Text><Text style={styles.metaText}>Wrong {Math.round((100 - value) / 2)}</Text><Text style={styles.metaText}>Total 100</Text></View>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.cardTitle}>Top Prediction Teams</Text>
        {[
          { rank: 1, team: 'India', wins: 38, total: 47, accuracy: 81, code: 'IND' },
          { rank: 2, team: 'Australia', wins: 31, total: 41, accuracy: 76, code: 'AUS' },
          { rank: 3, team: 'England', wins: 29, total: 41, accuracy: 71, code: 'ENG' },
          { rank: 4, team: 'New Zealand', wins: 25, total: 38, accuracy: 66, code: 'NZ' },
          { rank: 5, team: 'Pakistan', wins: 22, total: 34, accuracy: 65, code: 'PAK' },
        ].map((item) => (
          <View key={item.team} style={styles.rankRowItem}>
            <View style={[styles.rankBadge, { backgroundColor: item.rank <= 3 ? '#0A0E27' : '#E5E7EB' }]}><Text style={[styles.rankBadgeText, item.rank <= 3 && styles.rankBadgeGold]}>{item.rank}</Text></View>
            <View style={styles.teamCodeMini}><Text style={styles.teamCodeText}>{item.code}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankName}>{item.team}</Text>
              <Text style={styles.rankMeta}>{item.wins}/{item.total} wins</Text>
            </View>
            <Text style={styles.rankAccuracy}>{item.accuracy}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.cardTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {[
            { name: 'First Win', unlocked: true },
            { name: '5 Correct', unlocked: true },
            { name: '10 Streak', unlocked: true },
            { name: 'Hot Streak', unlocked: true },
            { name: 'Perfectionist', unlocked: false },
            { name: 'Master', unlocked: false },
          ].map((item) => (
            <View key={item.name} style={[styles.achievementTile, !item.unlocked && styles.achievementLocked]}>
              <View style={[styles.achievementIcon, item.unlocked ? styles.achievementUnlocked : styles.achievementMuted]}>
                <Text style={styles.achievementIconText}>{item.unlocked ? '✓' : '🔒'}</Text>
              </View>
              <Text style={styles.achievementText}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function RankScreen() {
  const [selectedFormat, setSelectedFormat] = useState('T20');
  const list = rankings[selectedFormat];

  return (
    <ScrollView contentContainerStyle={styles.rankPage} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Team Standings</Text>
      <Text style={styles.labelSmall}>TEAM RANKINGS BY FORMAT</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formatTabs}> 
        {['T6', 'T10', 'T20', 'ODI', 'Test'].map((format) => (
          <TouchableOpacity key={format} onPress={() => setSelectedFormat(format)} style={[styles.formatTab, selectedFormat === format && { backgroundColor: formatColors[format], borderColor: formatColors[format] }]}>
            <Text style={[styles.formatTabText, selectedFormat === format && styles.formatTabTextActive]}>{format}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.podiumWrap}>
        <View style={styles.podiumColumn}>
          <Text style={styles.podiumPlace}>2nd</Text>
          <View style={[styles.podiumBar, { height: 82, backgroundColor: '#C7CED8' }]}><Text style={styles.podiumCode}>AUS</Text></View>
          <Text style={styles.podiumTeam}>Australia</Text>
        </View>
        <View style={styles.podiumColumn}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.podiumPlace}>1st</Text>
          <View style={[styles.podiumBar, { height: 110, backgroundColor: '#D4AF37' }]}><Text style={styles.podiumCode}>IND</Text></View>
          <Text style={styles.podiumTeam}>India</Text>
        </View>
        <View style={styles.podiumColumn}>
          <Text style={styles.podiumPlace}>3rd</Text>
          <View style={[styles.podiumBar, { height: 68, backgroundColor: '#D9A56B' }]}><Text style={styles.podiumCode}>ENG</Text></View>
          <Text style={styles.podiumTeam}>England</Text>
        </View>
      </View>

      <Text style={styles.labelSmall}>ALL TEAMS — {selectedFormat}</Text>

      <View style={styles.tableWrap}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>#</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>TEAM</Text>
          <Text style={styles.tableHeaderText}>M</Text>
          <Text style={styles.tableHeaderText}>W</Text>
          <Text style={styles.tableHeaderText}>L</Text>
          <Text style={styles.tableHeaderText}>WIN%</Text>
        </View>

        {list.map((row) => (
          <View key={row.rank} style={styles.tableRow}>
            <Text style={[styles.tableCell, row.rank <= 3 && styles.topCell]}>{row.rank}</Text>
            <View style={[styles.tableTeam, { flex: 1.5 }]}>
              <View style={styles.smallCode}><Text style={styles.smallCodeText}>{getTeamCode(row.team)}</Text></View>
              <Text style={styles.tableTeamName}>{row.team}</Text>
            </View>
            <Text style={styles.tableCell}>{row.matches}</Text>
            <Text style={[styles.tableCell, styles.winText]}>{row.wins}</Text>
            <Text style={[styles.tableCell, styles.lossText]}>{row.losses}</Text>
            <Text style={[styles.winBadge, { backgroundColor: `${row.winRate >= 65 ? '#0EA5E9' : row.winRate >= 50 ? '#F5A623' : '#EF4444'}20`, color: row.winRate >= 65 ? '#0EA5E9' : row.winRate >= 50 ? '#B45309' : '#B91C1C' }]}>{row.winRate}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>{selectedFormat} FORMAT</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}><Text style={styles.summaryText}>TEAMS</Text><Text style={styles.summaryValue}>8</Text></View>
          <View style={styles.summaryItem}><Text style={styles.summaryText}>MATCHES</Text><Text style={styles.summaryValue}>66</Text></View>
          <View style={styles.summaryItem}><Text style={styles.summaryText}>TOP TEAM</Text><Text style={styles.summaryValue}>India</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileScreen({ onOpenHelp, onOpenTerms }) {
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [darkModeOn, setDarkModeOn] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.profilePage} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeaderCard}>
        <LinearGradient colors={['#0A0E27', '#1E1B4B', '#312E81']} style={styles.profileGradient}>
          <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>YN</Text></View>
          <Text style={styles.profileName}>Your Name</Text>
          <Text style={styles.profileEmail}>player@cricket.com</Text>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>🏆 PRO PREDICTOR</Text></View>
        </LinearGradient>
      </View>

      <View style={styles.profileStatsRow}>
        <View style={styles.miniStat}><Text style={styles.miniLabel}>Predictions</Text><Text style={styles.miniValue}>287</Text></View>
        <View style={[styles.miniStat, styles.miniStatGreen]}><Text style={styles.miniLabel}>Correct</Text><Text style={[styles.miniValue, styles.greenText]}>162</Text></View>
        <View style={[styles.miniStat, styles.miniStatGold]}><Text style={styles.miniLabel}>Accuracy</Text><Text style={[styles.miniValue, styles.goldText]}>56%</Text></View>
      </View>

      <TouchableOpacity style={styles.adminButton}>
        <Text style={styles.adminText}>🎛️ Admin Panel</Text>
        <Text style={styles.adminArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.settingsPanel}>
        <TouchableOpacity style={styles.settingRow} onPress={() => setNotificationsOn((p) => !p)}>
          <Text style={styles.settingLabel}>🔔 Notifications</Text>
          <View style={[styles.toggle, notificationsOn && styles.toggleOn]}><View style={[styles.toggleThumb, notificationsOn && styles.toggleThumbOn]} /></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => setDarkModeOn((p) => !p)}>
          <Text style={styles.settingLabel}>🌙 Dark Mode</Text>
          <View style={[styles.toggle, darkModeOn && styles.toggleOn]}><View style={[styles.toggleThumb, darkModeOn && styles.toggleThumbOn]} /></View>
        </TouchableOpacity>
        <View style={styles.settingRowStatic}><Text style={styles.settingLabel}>🌐 Language</Text><Text style={styles.settingValue}>English</Text></View>
      </View>

      <View style={styles.settingsPanel}>
        <TouchableOpacity style={styles.settingRowStatic} onPress={onOpenHelp}><Text style={styles.settingLabel}>❓ Help Center</Text><Text style={styles.settingArrow}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.settingRowStatic}><Text style={styles.settingLabel}>⭐ Rate App</Text><Text style={styles.settingArrow}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.settingRowStatic}><Text style={styles.settingLabel}>📤 Share App</Text><Text style={styles.settingArrow}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.settingRowStatic} onPress={onOpenTerms}><Text style={styles.settingLabel}>📄 Terms & Privacy</Text><Text style={styles.settingArrow}>›</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}><Text style={styles.logoutText}>Log Out</Text></TouchableOpacity>
      <Text style={styles.versionText}>Cricket Predict v1.0.0</Text>
    </ScrollView>
  );
}

function TermsModal({ visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => null}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📄 Terms & Privacy</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.badgeText}>🏏 ABOUT OUR PREDICTIONS</Text>
          <Text style={styles.modalBody}>Cricket Predict is a premium entertainment platform built by a team of five analysts who review form, conditions, player impact, and matchup data before publishing picks.</Text>
          <View style={styles.infoItems}>
            {['Teams', 'Ground', 'Players', 'Each & Everything'].map((item, index) => (
              <View key={item} style={styles.infoItemRow}>
                <Text style={styles.infoIcon}>{['🏏', '📍', '👥', '🧠'][index]}</Text>
                <Text style={styles.infoItemText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={styles.warningBox}><Text style={styles.warningText}>Entertainment purposes only</Text></View>
          <Text style={styles.modalSubtitle}>Privacy</Text>
          <Text style={styles.modalBody}>We protect your data and do not sell personal match insights. Contact: team@cricketpredict.com</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}><Text style={styles.primaryButtonText}>I Understand</Text></TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function HelpModal({ visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => null}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>❓ Help Center</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.badgeText}>💡 FREQUENTLY ASKED</Text>
          {helpFaq.map((item) => (
            <View key={item.q} style={styles.faqCard}>
              <View style={styles.faqRow}><View style={styles.questionBadge}>Q</View><Text style={styles.faqQuestion}>{item.q}</Text></View>
              <View style={styles.faqRow}><View style={styles.answerBadge}>A</View><Text style={styles.faqAnswer}>{item.a}</Text></View>
            </View>
          ))}
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}><Text style={styles.primaryButtonText}>Close</Text></TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MatchDetailScreen({ match, onBack }) {
  const timer = getElapsedTime(match.matchStartTime);
  const countdown = formatCountdown(match.matchStartTime);

  return (
    <View style={styles.detailRoot}>
      <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backText}>←</Text></TouchableOpacity>
          <Text style={styles.detailTitle}>Match Details</Text>
          <View style={[styles.statusBadgeDetail, { backgroundColor: `${getStatusColor(match.status)}15`, borderColor: `${getStatusColor(match.status)}33` }]}>
            <Text style={[styles.statusTextDetail, { color: getStatusColor(match.status) }]}>{match.status}</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <LinearGradient colors={['#0A0E27', '#1E1B4B', '#312E81']} style={styles.heroCardInner}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroSeries}>{match.series}</Text>
              <View style={[styles.typePill, { backgroundColor: `${getFormatColor(match.type)}18`, borderColor: `${getFormatColor(match.type)}66` }]}>
                <Text style={[styles.typeText, { color: getFormatColor(match.type) }]}>{match.type}</Text>
              </View>
            </View>

            <View style={styles.heroTeamsRow}>
              <View style={styles.heroTeamBlock}>
                <View style={styles.heroAvatar}><Text style={styles.heroAvatarText}>{getTeamCode(match.teamA)}</Text></View>
                <Text style={styles.heroTeamName}>{match.teamA}</Text>
              </View>
              <View style={styles.heroVs}><Text style={styles.heroVsText}>VS</Text></View>
              <View style={styles.heroTeamBlock}>
                <View style={styles.heroAvatar}><Text style={styles.heroAvatarText}>{getTeamCode(match.teamB)}</Text></View>
                <Text style={styles.heroTeamName}>{match.teamB}</Text>
              </View>
            </View>

            {match.status === 'LIVE' && (
              <View style={styles.liveHeroRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.bigTimer}>{`${timer.hours}:${timer.minutes}:${timer.seconds}`}</Text>
              </View>
            )}

            {match.status === 'UPCOMING' && (
              <View style={styles.liveHeroRow}>
                {['days', 'hours', 'minutes', 'seconds'].map((key) => (
                  <View key={key} style={styles.countBoxLarge}>
                    <Text style={styles.bigCounter}>{countdown[key]}</Text>
                    <Text style={styles.counterLabel}>{key === 'days' ? 'D' : key === 'hours' ? 'H' : key === 'minutes' ? 'M' : 'S'}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}><Text style={styles.infoLabel}>📍 Venue</Text><Text style={styles.infoValue}>{match.venue}</Text></View>
              <View style={styles.infoBox}><Text style={styles.infoLabel}>📅 Date</Text><Text style={styles.infoValue}>{match.date}</Text></View>
              <View style={styles.infoBox}><Text style={styles.infoLabel}>⏰ Time</Text><Text style={styles.infoValue}>{match.time}</Text></View>
            </View>
          </LinearGradient>
        </View>

        {(match.status === 'CORRECT' || match.status === 'WRONG') && (
          <View style={[styles.resultCard, match.result === match.prediction ? styles.resultCardCorrect : styles.resultCardWrong]}>
            <Text style={styles.resultEmoji}>{match.result === match.prediction ? '🏆' : '💔'}</Text>
            <Text style={styles.resultTitle}>{match.result === match.prediction ? 'CORRECT PREDICTION' : 'WRONG PREDICTION'}</Text>
            <Text style={styles.resultMeta}>Winner: {match.result}</Text>
          </View>
        )}

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderIcon}>🎯 PREDICTION</Text>
          <View style={styles.predictionCard}>
            <View style={styles.bigTeamCode}><Text style={styles.bigTeamCodeText}>{getTeamCode(match.prediction || match.teamA)}</Text></View>
            <Text style={styles.predictionTeamName}>{match.prediction || match.teamA}</Text>
            <View style={styles.goldBadge}><Text style={styles.goldBadgeText}>WILL WIN</Text></View>
            {!match.predictionPublished && <Text style={styles.lockedText}>Locked</Text>}
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderIcon}>📝 ANALYSIS</Text>
          <View style={styles.analysisBox}><Text style={styles.analysisText}>{match.analysis}</Text></View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderIcon}>📊 HEAD TO HEAD</Text>
          <View style={styles.headRow}>
            <View style={styles.headTeam}><Text style={styles.headCode}>{getTeamCode(match.teamA)}</Text><Text style={styles.headName}>{match.teamA}</Text><Text style={styles.headWins}>{match.headToHead[match.teamA]} wins</Text></View>
            <Text style={styles.vsSmall}>VS</Text>
            <View style={styles.headTeam}><Text style={styles.headCode}>{getTeamCode(match.teamB)}</Text><Text style={styles.headName}>{match.teamB}</Text><Text style={styles.headWins}>{match.headToHead[match.teamB]} wins</Text></View>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderIcon}>📜 RECENT MATCHES</Text>
          <View style={styles.recentDetailList}>
            {match.recentMatches.map((item, index) => (
              <View key={index} style={styles.recentDetailCard}>
                <View style={styles.recentDetailHeader}><Text style={styles.recentDetailDate}>{item.date}</Text><Text style={styles.recentDetailFormat}>{item.format}</Text></View>
                <Text style={styles.recentDetailVenue}>{item.venue}</Text>
                {item.winner === match.prediction && <Text style={styles.winnerPill}>WINNER</Text>}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('live');
  const [searchText, setSearchText] = useState('');
  const [matches, setMatches] = useState(initialMatches);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prev) => prev.map((match) => {
        if (match.status === 'UPCOMING') {
          const diff = new Date(match.matchStartTime).getTime() - Date.now();
          if (diff <= 0) return { ...match, status: 'LIVE' };
        }
        if (match.status === 'LIVE') {
          const end = new Date(match.matchStartTime).getTime() + 4 * 60 * 60 * 1000;
          if (Date.now() > end) return { ...match, status: 'CORRECT', result: match.prediction || match.teamA };
        }
        return match;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('adminMatches', JSON.stringify(matches)).catch(() => null);
  }, [matches]);

  useEffect(() => {
    AsyncStorage.getItem('adminMatches').then((res) => {
      if (res) {
        const parsed = JSON.parse(res);
        if (Array.isArray(parsed) && parsed.length) setMatches(parsed);
      }
    }).catch(() => null);
  }, []);

  if (splashVisible) return <SplashScreen />;

  return (
    <SafeAreaView style={styles.appRoot}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {selectedMatch ? (
        <MatchDetailScreen match={selectedMatch} onBack={() => setSelectedMatch(null)} />
      ) : (
        <>
          {activeNav === 'home' && (
            <HomeScreen matches={matches} searchText={searchText} setSearchText={setSearchText} activeTab={activeTab} setActiveTab={setActiveTab} onOpenMatch={setSelectedMatch} onOpenAdmin={() => setShowAdmin(true)} />
          )}
          {activeNav === 'stats' && <StatsScreen />}
          {activeNav === 'rank' && <RankScreen />}
          {activeNav === 'profile' && <ProfileScreen onOpenHelp={() => setShowHelp(true)} onOpenTerms={() => setShowTerms(true)} />}
        </>
      )}

      {!selectedMatch && <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />}

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

      <Modal transparent visible={showAdmin} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdmin(false)}>
          <Pressable style={styles.adminPanel} onPress={() => null}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎛️ Admin Panel</Text>
              <TouchableOpacity onPress={() => setShowAdmin(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>Manage fixtures, automate match state changes, and keep custom entries synced in local storage.</Text>
            <View style={styles.adminList}>
              {matches.slice(0, 3).map((match) => (
                <View key={match.id} style={styles.adminRow}>
                  <Text style={styles.adminName}>{match.series}</Text>
                  <Text style={[styles.adminStatus, { color: getStatusColor(match.status) }]}>{match.status}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAdmin(false)}><Text style={styles.primaryButtonText}>Close Panel</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appRoot: { flex: 1, backgroundColor: COLORS.surface },
  fullscreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashContent: { alignItems: 'center', justifyContent: 'center' },
  logoOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 2,
    borderColor: '#F4E5B1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  logoEmoji: { fontSize: 54 },
  brandLine: { fontSize: 34, fontWeight: '800', color: '#fff', marginTop: 20 },
  goldText: { color: COLORS.gold },
  premiumLabel: { color: '#F4E5B1', fontSize: 12, letterSpacing: 3, fontWeight: '800', marginTop: 8 },
  dotsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D4AF37' },
  loadingText: { color: '#F4E5B1', fontWeight: '800', letterSpacing: 2, marginTop: 14 },
  pageScroll: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 110 },
  homeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEmoji: { fontSize: 22 },
  appName: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  appSubtitle: { color: '#0F766E', fontSize: 10, letterSpacing: 1.5, fontWeight: '800' },
  livePillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A0E27',
    borderWidth: 2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  avatarText: { color: '#fff', fontWeight: '800' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1 },
  greenSurface: { backgroundColor: '#E8FFF8', borderColor: '#B9F1D6' },
  goldSurface: { backgroundColor: '#FFFBEA', borderColor: '#F4E5B1' },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, letterSpacing: 1, fontWeight: '800' },
  greenLabel: { color: '#0F766E' },
  statValue: { marginTop: 6, color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 14, color: COLORS.textPrimary },
  clearButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  clearText: { color: COLORS.textSecondary, fontWeight: '800' },
  tabSwitcher: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 16 },
  tabPill: { flex: 1, backgroundColor: '#E8EDF5', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabPillActive: { backgroundColor: '#0A0E27' },
  tabText: { color: '#475569', fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  tabBadge: { position: 'absolute', right: 8, top: 6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  matchCard: { backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#EAEFF8', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  typePill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  typeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  seriesName: { textAlign: 'center', color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1, fontSize: 12, marginTop: 14 },
  liveLiveRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginVertical: 10 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveTimer: { fontSize: 18, letterSpacing: 1.5, fontWeight: '800', fontVariant: ['tabular-nums'], color: COLORS.textPrimary },
  countdownRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 10 },
  countBox: { width: 42, height: 52, borderRadius: 12, backgroundColor: '#F8F9FB', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  countValue: { fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'], color: COLORS.textPrimary },
  countLabel: { fontSize: 9, color: COLORS.textSecondary, letterSpacing: 1, fontWeight: '800' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 10 },
  teamBlock: { flex: 1, alignItems: 'center' },
  teamAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  teamAvatarText: { fontWeight: '800', color: COLORS.textPrimary, fontSize: 15 },
  teamName: { marginTop: 8, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  vsOrb: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'linear-gradient', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8, borderWidth: 2, borderColor: '#F4E5B1' },
  vsText: { color: '#fff', fontWeight: '800' },
  h2hBox: { marginTop: 16, backgroundColor: '#EEF6FF', borderRadius: 14, borderWidth: 1, borderColor: '#DBEAFE', padding: 12 },
  h2hTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#1E3A8A', textTransform: 'uppercase' },
  h2hRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  h2hText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  recentBox: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, marginTop: 14 },
  recentTitle: { color: COLORS.textPrimary, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 },
  recentList: { marginTop: 10, gap: 8 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotMini: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  recentText: { color: COLORS.textSecondary, fontSize: 12 },
  recentWinner: { marginLeft: 'auto', color: '#0F766E', fontWeight: '700', fontSize: 12 },
  predictionBox: { marginTop: 14, backgroundColor: '#FFF7D6', borderWidth: 1, borderColor: '#F4E5B1', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  predictionLabel: { color: '#A77800', fontWeight: '800', letterSpacing: 1, fontSize: 11 },
  predictionWinner: { marginTop: 6, color: COLORS.textPrimary, fontWeight: '800', fontSize: 16 },
  resultBox: { marginTop: 14, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  resultBoxCorrect: { backgroundColor: '#E8FFF4' },
  resultBoxWrong: { backgroundColor: '#FEE2E2' },
  correctText: { color: '#0F766E', fontWeight: '800' },
  wrongText: { color: '#B91C1C', fontWeight: '800' },
  tapHint: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 12, fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  venueText: { flex: 1, color: COLORS.textSecondary, fontWeight: '700', fontSize: 12 },
  dateText: { color: COLORS.textSecondary, fontWeight: '800', fontSize: 12 },
  statsPage: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 110 },
  sectionTitle: { fontSize: 30, fontWeight: '900', color: COLORS.textPrimary },
  sectionSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4, marginBottom: 16 },
  accuracyBanner: { borderRadius: 22, overflow: 'hidden', marginBottom: 16 },
  accuracyBannerInner: { padding: 18 },
  accuracyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accuracyLabel: { color: '#D4AF37', fontWeight: '800', fontSize: 11, letterSpacing: 1.6 },
  starsText: { color: '#F5D56A', fontSize: 16 },
  accuracyLarge: { fontSize: 56, color: '#fff', fontWeight: '900', marginTop: 8 },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: '#D4AF37' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { color: '#D1D5DB', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  metricValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 6 },
  ratingBox: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#F3E4A4', padding: 18, marginBottom: 18 },
  ratingStars: { color: '#D4AF37', fontSize: 26, letterSpacing: 2 },
  ratingTitle: { marginTop: 10, fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  ratingCopy: { color: COLORS.textSecondary, marginTop: 4 },
  inlineBadge: { alignSelf: 'flex-start', marginTop: 12, backgroundColor: '#EAFBF4', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  inlineBadgeText: { color: '#0F766E', fontWeight: '700', fontSize: 12 },
  sectionWrap: { marginBottom: 18 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  minorCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  cardLineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dotTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  cardText: { color: COLORS.textPrimary, fontWeight: '700' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  metaText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  monthBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontWeight: '800', fontSize: 11 },
  rankRowItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, marginBottom: 10 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankBadgeText: { fontSize: 12, fontWeight: '800', color: '#0A0E27' },
  rankBadgeGold: { color: '#fff' },
  teamCodeMini: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  teamCodeText: { fontWeight: '800', color: COLORS.textPrimary, fontSize: 11 },
  rankName: { color: COLORS.textPrimary, fontWeight: '700' },
  rankMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  rankAccuracy: { color: '#10B981', fontWeight: '800', fontSize: 16 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achievementTile: { width: '47%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, alignItems: 'center' },
  achievementLocked: { backgroundColor: '#F1F5F9', opacity: 0.7 },
  achievementIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  achievementUnlocked: { backgroundColor: '#DCFCE7' },
  achievementMuted: { backgroundColor: '#E5E7EB' },
  achievementIconText: { fontWeight: '800' },
  achievementText: { color: COLORS.textPrimary, fontWeight: '700', textAlign: 'center' },
  rankPage: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 110 },
  labelSmall: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: COLORS.textSecondary, marginTop: 8 },
  formatTabs: { marginTop: 14, marginBottom: 18, paddingRight: 12 },
  formatTab: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', marginRight: 10 },
  formatTabText: { color: COLORS.textPrimary, fontWeight: '700' },
  formatTabTextActive: { color: '#fff' },
  podiumWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18, marginTop: 8, height: 160 },
  podiumColumn: { flex: 1, alignItems: 'center' },
  podiumPlace: { color: COLORS.textSecondary, fontWeight: '700', marginBottom: 8 },
  podiumBar: { width: 78, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  podiumCode: { fontSize: 18, fontWeight: '800', color: '#0A0E27', marginTop: 12 },
  podiumTeam: { marginTop: 10, color: COLORS.textPrimary, fontWeight: '700', textAlign: 'center' },
  crown: { fontSize: 24, marginBottom: 6 },
  tableWrap: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', marginTop: 10 },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 10, backgroundColor: '#0A0E27' },
  tableHeaderText: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '800', fontSize: 11 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2FF' },
  tableCell: { flex: 1, textAlign: 'center', fontWeight: '700', color: COLORS.textPrimary },
  tableTeam: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallCode: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  smallCodeText: { fontSize: 9, fontWeight: '800', color: COLORS.textPrimary },
  tableTeamName: { color: COLORS.textPrimary, fontWeight: '700' },
  topCell: { color: '#D4AF37', fontWeight: '900' },
  winText: { color: '#10B981', fontWeight: '800' },
  lossText: { color: '#EF4444', fontWeight: '800' },
  winBadge: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '800', paddingVertical: 5, borderRadius: 999 },
  summaryBox: { marginTop: 18, backgroundColor: '#0A0E27', borderRadius: 18, padding: 16 },
  summaryLabel: { color: '#D4AF37', fontWeight: '800', letterSpacing: 1.2 },
  summaryGrid: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryText: { color: '#D1D5DB', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  summaryValue: { color: '#fff', fontWeight: '800', marginTop: 6 },
  profilePage: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120 },
  profileHeaderCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 18 },
  profileGradient: { padding: 20, alignItems: 'center' },
  profileAvatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#fff', borderWidth: 3, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileAvatarText: { color: '#0A0E27', fontWeight: '900', fontSize: 24 },
  profileName: { color: '#fff', fontWeight: '800', fontSize: 26 },
  profileEmail: { color: '#D1D5DB', marginTop: 4 },
  proBadge: { marginTop: 14, backgroundColor: 'rgba(212,175,55,0.18)', borderWidth: 1, borderColor: '#D4AF37', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  proBadgeText: { color: '#F4E5B1', fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  profileStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  miniStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 12 },
  miniStatGreen: { backgroundColor: '#EEFDF6', borderColor: '#B7F0D8' },
  miniStatGold: { backgroundColor: '#FFFBEA', borderColor: '#F4E5B1' },
  miniLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  miniValue: { marginTop: 8, color: COLORS.textPrimary, fontWeight: '800', fontSize: 20 },
  greenText: { color: '#0F766E' },
  goldText: { color: '#B68A00' },
  adminButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A0E27', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 18 },
  adminText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  adminArrow: { color: '#D4AF37', fontWeight: '800', fontSize: 22 },
  settingsPanel: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', marginBottom: 18 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2FF' },
  settingRowStatic: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2FF' },
  settingLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '700' },
  settingValue: { color: COLORS.textSecondary, fontWeight: '700' },
  settingArrow: { color: COLORS.textSecondary, fontSize: 24 },
  toggle: { width: 46, height: 28, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', padding: 3 },
  toggleOn: { backgroundColor: '#22C55E' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  logoutButton: { backgroundColor: '#FEE2E2', borderRadius: 16, borderWidth: 1, borderColor: '#FCA5A5', paddingVertical: 14, alignItems: 'center', marginBottom: 18 },
  logoutText: { color: '#B91C1C', fontWeight: '800' },
  versionText: { textAlign: 'center', color: COLORS.textSecondary, fontWeight: '700', fontSize: 12 },
  navWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingBottom: 12 },
  navBar: { flexDirection: 'row', borderRadius: 24, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 16 },
  navItemActive: { backgroundColor: 'rgba(212,175,55,0.18)', borderWidth: 1, borderColor: '#D4AF37' },
  navIconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navIconBoxActive: { backgroundColor: 'rgba(212,175,55,0.2)' },
  navIcon: { fontSize: 18 },
  navLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 4 },
  navLabelActive: { color: '#D4AF37' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#E5E7EB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  closeIcon: { fontSize: 20, color: COLORS.textSecondary, fontWeight: '800' },
  badgeText: { alignSelf: 'flex-start', backgroundColor: '#EEF2FF', color: '#4338CA', fontWeight: '800', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, fontSize: 10, letterSpacing: 1, marginBottom: 12 },
  modalBody: { color: COLORS.textSecondary, lineHeight: 22, fontSize: 14 },
  infoItems: { marginTop: 14, gap: 8 },
  infoItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { fontSize: 18 },
  infoItemText: { color: COLORS.textPrimary, fontWeight: '700' },
  warningBox: { marginTop: 16, backgroundColor: '#FFF7D6', borderWidth: 1, borderColor: '#F5D374', borderRadius: 12, padding: 12 },
  warningText: { color: '#9A6700', fontWeight: '800' },
  modalSubtitle: { marginTop: 16, color: COLORS.textPrimary, fontWeight: '800' },
  primaryButton: { marginTop: 18, backgroundColor: '#D4AF37', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#0A0E27', fontWeight: '800' },
  faqCard: { backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginTop: 10 },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  questionBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0A0E27', color: '#fff', textAlign: 'center', lineHeight: 24, fontWeight: '800' },
  answerBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981', color: '#fff', textAlign: 'center', lineHeight: 24, fontWeight: '800' },
  faqQuestion: { flex: 1, color: COLORS.textPrimary, fontWeight: '700' },
  faqAnswer: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  detailRoot: { flex: 1, backgroundColor: COLORS.surface },
  detailScroll: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 80 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  detailTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  statusBadgeDetail: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  statusTextDetail: { fontSize: 10, letterSpacing: 1, fontWeight: '800', textTransform: 'uppercase' },
  heroCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  heroCardInner: { padding: 18 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  heroSeries: { color: '#fff', fontWeight: '800', fontSize: 18 },
  heroTeamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTeamBlock: { flex: 1, alignItems: 'center' },
  heroAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 2, borderColor: '#F4E5B1', alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  heroTeamName: { marginTop: 10, color: '#fff', fontWeight: '700' },
  heroVs: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },
  heroVsText: { color: '#fff', fontWeight: '800' },
  liveHeroRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  bigTimer: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 2, fontVariant: ['tabular-nums'] },
  countBoxLarge: { width: 46, height: 58, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  bigCounter: { color: '#fff', fontWeight: '800', fontSize: 18, fontVariant: ['tabular-nums'] },
  counterLabel: { color: '#D1D5DB', fontSize: 9, letterSpacing: 1, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 24 },
  infoBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 },
  infoLabel: { color: '#D1D5DB', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  infoValue: { color: '#fff', fontWeight: '700', marginTop: 8, fontSize: 12 },
  resultCard: { marginTop: 18, borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1 },
  resultCardCorrect: { backgroundColor: '#E8FFF4', borderColor: '#A7F3D0' },
  resultCardWrong: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  resultEmoji: { fontSize: 32, marginBottom: 8 },
  resultTitle: { fontWeight: '800', fontSize: 16, color: COLORS.textPrimary },
  resultMeta: { marginTop: 6, color: COLORS.textSecondary, fontWeight: '700' },
  detailSection: { marginTop: 22 },
  sectionHeaderIcon: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 18, marginBottom: 12 },
  predictionCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 18, alignItems: 'center' },
  bigTeamCode: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F8F9FB', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  bigTeamCodeText: { fontWeight: '800', color: COLORS.textPrimary },
  predictionTeamName: { fontSize: 22, fontWeight: '800', marginTop: 10, color: COLORS.textPrimary },
  goldBadge: { marginTop: 12, backgroundColor: '#FFF7D6', borderWidth: 1, borderColor: '#F4E5B1', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  goldBadgeText: { color: '#8A5C00', fontWeight: '900', letterSpacing: 1.2 },
  lockedText: { marginTop: 12, color: COLORS.textSecondary, fontWeight: '700' },
  analysisBox: { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#6366F1', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  analysisText: { color: COLORS.textSecondary, lineHeight: 22 },
  headRow: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headTeam: { flex: 1, alignItems: 'center' },
  headCode: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  headName: { marginTop: 6, fontWeight: '700', color: COLORS.textPrimary },
  headWins: { marginTop: 4, color: COLORS.textSecondary, fontWeight: '600' },
  vsSmall: { color: '#D4AF37', fontWeight: '900', marginHorizontal: 10 },
  recentDetailList: { gap: 12 },
  recentDetailCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  recentDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentDetailDate: { color: COLORS.textPrimary, fontWeight: '700' },
  recentDetailFormat: { color: '#D4AF37', fontWeight: '800' },
  recentDetailVenue: { color: COLORS.textSecondary, marginTop: 8, fontWeight: '600' },
  winnerPill: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: '#DCFCE7', color: '#166534', fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 10 },
  adminPanel: { width: '88%', backgroundColor: '#fff', borderRadius: 22, padding: 18 },
  adminList: { gap: 10, marginTop: 18, marginBottom: 18 },
  adminRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  adminName: { color: COLORS.textPrimary, fontWeight: '700' },
  adminStatus: { fontWeight: '800' },
});

export { getTeamCode, getStatusColor, formatCountdown, getElapsedTime, formatColors };
