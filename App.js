import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
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
  bg: '#F8F9FB',
  border: '#EEF1F7',
  textPrimary: '#0A0E27',
  textSecondary: '#64748B',
  muted: '#94A3B8',
  grey: '#CBD5E1',
  greenAlt: '#34D399',
};

const formatColors = {
  T6: '#8B5CF6',
  T10: '#F59E0B',
  T20: '#3B82F6',
  ODI: '#10B981',
  Test: '#F97316',
};

const teamFlags = {
  India: '🇮🇳',
  Australia: '🇦🇺',
  Pakistan: '🇵🇰',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿',
  'Sri Lanka': '🇱🇰',
  Bangladesh: '🇧🇩',
  Afghanistan: '🇦🇫',
  Ireland: '🇮🇪',
  Nepal: '🇳🇵',
  'West Indies': '🇼🇸',
  'United Arab Emirates': '🇦🇪',
};

const medalColors = ['#C0C0C0', '#D4AF37', '#CD7F32'];

const getTeamInitial = (team) => team.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();

const formatNumber = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString());

const formatCountdown = (targetDate) => {
  const now = new Date();
  const distance = new Date(targetDate).getTime() - now.getTime();
  if (distance <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const getElapsedTime = (startDate) => {
  const diff = Date.now() - new Date(startDate).getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const getStatusColor = (status) => {
  switch (status) {
    case 'LIVE':
      return '#EF4444';
    case 'CORRECT':
      return '#10B981';
    case 'WRONG':
      return '#F87171';
    case 'UPCOMING':
      return '#D4AF37';
    default:
      return '#6366F1';
  }
};

const getMatchTypeColor = (type) => formatColors[type] || '#6366F1';

const getProgressLevel = (percentage) => (percentage >= 70 ? '#10B981' : percentage >= 45 ? '#F5A623' : '#EF4444');

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
    teamAFlag: '🇮🇳',
    teamBFlag: '🇦🇺',
    prediction: 'India',
    published: true,
    result: null,
    analysis: 'India are batting with intent against the pace attack, and the surface looks ideal for powerplay acceleration with short square boundaries.',
    headToHead: { India: 14, Australia: 11 },
    recentMatches: [
      { date: 'Sep 18', format: 'T20', winner: 'India', venue: 'Mumbai' },
      { date: 'Sep 12', format: 'T20', winner: 'Australia', venue: 'Sydney' },
      { date: 'Sep 05', format: 'T20', winner: 'India', venue: 'Dubai' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 25,
    correct: true,
    liveElapsed: '01:42:10',
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
    teamAFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    teamBFlag: '🇳🇿',
    prediction: 'England',
    published: true,
    result: null,
    analysis: 'The seamers will dominate the first spell, but the middle overs are where New Zealand can squeeze England with leg-spin variation.',
    headToHead: { England: 17, 'New Zealand': 13 },
    recentMatches: [
      { date: 'Sep 23', format: 'ODI', winner: 'England', venue: 'Birmingham' },
      { date: 'Sep 18', format: 'ODI', winner: 'New Zealand', venue: 'Auckland' },
      { date: 'Sep 11', format: 'ODI', winner: 'England', venue: 'Manchester' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 30,
    correct: null,
    liveElapsed: null,
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
    teamAFlag: '🇦🇺',
    teamBFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    prediction: 'Australia',
    published: true,
    result: 'Australia',
    analysis: 'Australia controlled the third session through disciplined seam movement and a patient lower-order fightback. That made the wicket difficult for England late.',
    headToHead: { Australia: 32, England: 28 },
    recentMatches: [
      { date: 'Sep 05', format: 'Test', winner: 'Australia', venue: 'Melbourne' },
      { date: 'Aug 28', format: 'Test', winner: 'England', venue: 'Lords' },
      { date: 'Aug 15', format: 'Test', winner: 'Australia', venue: 'Adelaide' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 60,
    correct: true,
    liveElapsed: '03:25:15',
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
    teamAFlag: '🇵🇰',
    teamBFlag: '🇱🇰',
    prediction: 'Pakistan',
    published: true,
    result: 'Sri Lanka',
    analysis: 'The dew made powerplay bowling difficult, and Sri Lanka managed to keep the scoreboard moving under pressure with better boundary options.',
    headToHead: { Pakistan: 8, 'Sri Lanka': 6 },
    recentMatches: [
      { date: 'Sep 18', format: 'T10', winner: 'Sri Lanka', venue: 'Dubai' },
      { date: 'Sep 12', format: 'T10', winner: 'Pakistan', venue: 'Karachi' },
      { date: 'Sep 06', format: 'T10', winner: 'Pakistan', venue: 'Lahore' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 14,
    correct: false,
    liveElapsed: null,
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
    teamAFlag: '🇮🇳',
    teamBFlag: '🇵🇰',
    prediction: 'India',
    published: false,
    result: null,
    analysis: 'A high-pressure contest with spin likely to decide the middle overs. Both teams have fireworks at the top, but conditions favour control.',
    headToHead: { India: 12, Pakistan: 9 },
    recentMatches: [
      { date: 'Oct 02', format: 'T20', winner: 'India', venue: 'Kolkata' },
      { date: 'Sep 24', format: 'T20', winner: 'Pakistan', venue: 'Lahore' },
      { date: 'Sep 16', format: 'T20', winner: 'India', venue: 'Dubai' },
    ],
    predictionBadge: 'PREDICTION COMING SOON',
    h2hTotal: 21,
    correct: null,
    liveElapsed: null,
  },
  {
    id: 6,
    status: 'LIVE',
    type: 'T20',
    series: 'South Africa Tour',
    venue: 'Newlands, Cape Town',
    date: '2026-10-05',
    time: '17:45',
    matchStartTime: '2026-10-05T17:45:00+02:00',
    teamA: 'South Africa',
    teamB: 'Bangladesh',
    teamAFlag: '🇿🇦',
    teamBFlag: '🇧🇩',
    prediction: 'South Africa',
    published: true,
    result: null,
    analysis: 'South Africa’s new-ball pair has extracted enough seam movement early to strip Bangladesh of momentum.',
    headToHead: { 'South Africa': 10, Bangladesh: 5 },
    recentMatches: [
      { date: 'Sep 20', format: 'T20', winner: 'South Africa', venue: 'Johannesburg' },
      { date: 'Sep 15', format: 'T20', winner: 'Bangladesh', venue: 'Dhaka' },
      { date: 'Sep 04', format: 'T20', winner: 'South Africa', venue: 'Centurion' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 15,
    correct: null,
    liveElapsed: '00:48:21',
  },
  {
    id: 7,
    status: 'CORRECT',
    type: 'T6',
    series: 'League Night',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: '2026-09-27',
    time: '20:15',
    matchStartTime: '2026-09-27T20:15:00+05:30',
    teamA: 'Sri Lanka',
    teamB: 'Afghanistan',
    teamAFlag: '🇱🇰',
    teamBFlag: '🇦🇫',
    prediction: 'Afghanistan',
    published: true,
    result: 'Afghanistan',
    analysis: 'Afghanistan’s leg-spin pair was unusually ruthless, and the powerplay approach kept pressure on Sri Lanka’s deep batters.',
    headToHead: { 'Sri Lanka': 4, Afghanistan: 6 },
    recentMatches: [
      { date: 'Sep 25', format: 'T6', winner: 'Afghanistan', venue: 'Bengaluru' },
      { date: 'Sep 09', format: 'T6', winner: 'Sri Lanka', venue: 'Colombo' },
      { date: 'Aug 30', format: 'T6', winner: 'Afghanistan', venue: 'Sharjah' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 10,
    correct: true,
    liveElapsed: null,
  },
  {
    id: 8,
    status: 'WRONG',
    type: 'ODI',
    series: 'City Series',
    venue: 'The Oval, London',
    date: '2026-09-18',
    time: '13:30',
    matchStartTime: '2026-09-18T13:30:00+01:00',
    teamA: 'England',
    teamB: 'India',
    teamAFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    teamBFlag: '🇮🇳',
    prediction: 'England',
    published: true,
    result: 'India',
    analysis: 'India’s middle overs were built around controlled acceleration and quick singles that prevented England from building pressure.',
    headToHead: { England: 28, India: 24 },
    recentMatches: [
      { date: 'Sep 14', format: 'ODI', winner: 'India', venue: 'London' },
      { date: 'Sep 05', format: 'ODI', winner: 'England', venue: 'Manchester' },
      { date: 'Aug 27', format: 'ODI', winner: 'India', venue: 'Delhi' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 52,
    correct: false,
    liveElapsed: null,
  },
  {
    id: 9,
    status: 'UPCOMING',
    type: 'T20',
    series: 'Pacific Clash',
    venue: 'McLean Park, Napier',
    date: '2026-10-14',
    time: '18:00',
    matchStartTime: '2026-10-14T18:00:00+12:00',
    teamA: 'New Zealand',
    teamB: 'Australia',
    teamAFlag: '🇳🇿',
    teamBFlag: '🇦🇺',
    prediction: 'New Zealand',
    published: false,
    result: null,
    analysis: 'New Zealand’s bowling unit is likely to thrive under overcast conditions and allow their pacers to attack the stumps.',
    headToHead: { 'New Zealand': 11, Australia: 15 },
    recentMatches: [
      { date: 'Oct 04', format: 'T20', winner: 'Australia', venue: 'Auckland' },
      { date: 'Sep 28', format: 'T20', winner: 'New Zealand', venue: 'Wellington' },
      { date: 'Sep 18', format: 'T20', winner: 'Australia', venue: 'Sydney' },
    ],
    predictionBadge: 'PREDICTION COMING SOON',
    h2hTotal: 26,
    correct: null,
    liveElapsed: null,
  },
  {
    id: 10,
    status: 'LIVE',
    type: 'T10',
    series: 'Rapid Rumble',
    venue: 'Sharjah Cricket Stadium',
    date: '2026-10-05',
    time: '21:00',
    matchStartTime: '2026-10-05T21:00:00+04:00',
    teamA: 'United Arab Emirates',
    teamB: 'Nepal',
    teamAFlag: '🇦🇪',
    teamBFlag: '🇳🇵',
    prediction: 'Nepal',
    published: true,
    result: null,
    analysis: 'Nepal’s batting is slight stronger under pressure, and spin could turn quickly in the middle overs as fielding lengths compress.',
    headToHead: { 'United Arab Emirates': 4, Nepal: 3 },
    recentMatches: [
      { date: 'Sep 26', format: 'T10', winner: 'Nepal', venue: 'Sharjah' },
      { date: 'Sep 20', format: 'T10', winner: 'United Arab Emirates', venue: 'Abu Dhabi' },
      { date: 'Sep 11', format: 'T10', winner: 'Nepal', venue: 'Kathmandu' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 7,
    correct: null,
    liveElapsed: '00:20:15',
  },
  {
    id: 11,
    status: 'CORRECT',
    type: 'Test',
    series: 'Border-Gavaskar',
    venue: 'Gaddafi Stadium, Lahore',
    date: '2026-09-24',
    time: '09:30',
    matchStartTime: '2026-09-24T09:30:00+05:00',
    teamA: 'India',
    teamB: 'Pakistan',
    teamAFlag: '🇮🇳',
    teamBFlag: '🇵🇰',
    prediction: 'India',
    published: true,
    result: 'India',
    analysis: 'India’s spin attack seized control once the second new ball lost hardness, and the tail offered invaluable support to extend the lead.',
    headToHead: { India: 17, Pakistan: 18 },
    recentMatches: [
      { date: 'Sep 15', format: 'Test', winner: 'India', venue: 'Lahore' },
      { date: 'Sep 08', format: 'Test', winner: 'Pakistan', venue: 'Karachi' },
      { date: 'Aug 29', format: 'Test', winner: 'India', venue: 'Dubai' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 35,
    correct: true,
    liveElapsed: null,
  },
  {
    id: 12,
    status: 'WRONG',
    type: 'T20',
    series: 'Bangladesh Cup',
    venue: 'Sher-e-Bangla Stadium',
    date: '2026-09-17',
    time: '18:30',
    matchStartTime: '2026-09-17T18:30:00+06:00',
    teamA: 'Bangladesh',
    teamB: 'Ireland',
    teamAFlag: '🇧🇩',
    teamBFlag: '🇮🇪',
    prediction: 'Bangladesh',
    published: true,
    result: 'Ireland',
    analysis: 'Bangladesh’s slower bowlers lost the crucial battle in the middle overs, and Ireland used spin-friendly angles to accelerate.',
    headToHead: { Bangladesh: 5, Ireland: 3 },
    recentMatches: [
      { date: 'Sep 12', format: 'T20', winner: 'Ireland', venue: 'Dhaka' },
      { date: 'Sep 06', format: 'T20', winner: 'Bangladesh', venue: 'Chattogram' },
      { date: 'Aug 30', format: 'T20', winner: 'Bangladesh', venue: 'Sylhet' },
    ],
    predictionBadge: 'WILL WIN',
    h2hTotal: 8,
    correct: false,
    liveElapsed: null,
  },
];

const formatRankingData = {
  T6: [
    { rank: 1, team: 'India', wins: 17, losses: 5, winRate: 77, matches: 22 },
    { rank: 2, team: 'Australia', wins: 16, losses: 6, winRate: 73, matches: 22 },
    { rank: 3, team: 'England', wins: 15, losses: 7, winRate: 68, matches: 22 },
    { rank: 4, team: 'Pakistan', wins: 14, losses: 8, winRate: 64, matches: 22 },
    { rank: 5, team: 'South Africa', wins: 13, losses: 9, winRate: 59, matches: 22 },
    { rank: 6, team: 'Bangladesh', wins: 12, losses: 10, winRate: 55, matches: 22 },
    { rank: 7, team: 'New Zealand', wins: 11, losses: 11, winRate: 50, matches: 22 },
    { rank: 8, team: 'Sri Lanka', wins: 9, losses: 13, winRate: 41, matches: 22 },
  ],
  T10: [
    { rank: 1, team: 'Australia', wins: 18, losses: 5, winRate: 78, matches: 23 },
    { rank: 2, team: 'Pakistan', wins: 17, losses: 6, winRate: 74, matches: 23 },
    { rank: 3, team: 'India', wins: 16, losses: 7, winRate: 70, matches: 23 },
    { rank: 4, team: 'England', wins: 14, losses: 9, winRate: 61, matches: 23 },
    { rank: 5, team: 'South Africa', wins: 13, losses: 10, winRate: 57, matches: 23 },
    { rank: 6, team: 'New Zealand', wins: 12, losses: 11, winRate: 52, matches: 23 },
    { rank: 7, team: 'Bangladesh', wins: 10, losses: 13, winRate: 43, matches: 23 },
    { rank: 8, team: 'Sri Lanka', wins: 8, losses: 15, winRate: 35, matches: 23 },
  ],
  T20: [
    { rank: 1, team: 'India', wins: 48, losses: 19, winRate: 72, matches: 67 },
    { rank: 2, team: 'Australia', wins: 46, losses: 22, winRate: 68, matches: 68 },
    { rank: 3, team: 'England', wins: 43, losses: 25, winRate: 63, matches: 68 },
    { rank: 4, team: 'Pakistan', wins: 39, losses: 28, winRate: 58, matches: 67 },
    { rank: 5, team: 'South Africa', wins: 37, losses: 30, winRate: 55, matches: 67 },
    { rank: 6, team: 'New Zealand', wins: 35, losses: 31, winRate: 53, matches: 66 },
    { rank: 7, team: 'Bangladesh', wins: 31, losses: 35, winRate: 47, matches: 66 },
    { rank: 8, team: 'Sri Lanka', wins: 28, losses: 38, winRate: 42, matches: 66 },
  ],
  ODI: [
    { rank: 1, team: 'India', wins: 31, losses: 13, winRate: 70, matches: 44 },
    { rank: 2, team: 'Australia', wins: 29, losses: 17, winRate: 63, matches: 46 },
    { rank: 3, team: 'England', wins: 27, losses: 18, winRate: 60, matches: 45 },
    { rank: 4, team: 'New Zealand', wins: 24, losses: 20, winRate: 55, matches: 44 },
    { rank: 5, team: 'Pakistan', wins: 23, losses: 21, winRate: 52, matches: 44 },
    { rank: 6, team: 'South Africa', wins: 22, losses: 22, winRate: 50, matches: 44 },
    { rank: 7, team: 'Sri Lanka', wins: 20, losses: 25, winRate: 44, matches: 45 },
    { rank: 8, team: 'Bangladesh', wins: 18, losses: 28, winRate: 39, matches: 46 },
  ],
  Test: [
    { rank: 1, team: 'India', wins: 29, losses: 14, winRate: 67, matches: 43 },
    { rank: 2, team: 'Australia', wins: 25, losses: 16, winRate: 61, matches: 41 },
    { rank: 3, team: 'England', wins: 23, losses: 20, winRate: 53, matches: 43 },
    { rank: 4, team: 'South Africa', wins: 22, losses: 21, winRate: 51, matches: 43 },
    { rank: 5, team: 'New Zealand', wins: 19, losses: 22, winRate: 46, matches: 41 },
    { rank: 6, team: 'Pakistan', wins: 18, losses: 23, winRate: 43, matches: 41 },
    { rank: 7, team: 'Sri Lanka', wins: 16, losses: 27, winRate: 37, matches: 43 },
    { rank: 8, team: 'Bangladesh', wins: 9, losses: 31, winRate: 22, matches: 40 },
  ],
};

const topPredictionTeams = [
  { rank: 1, name: 'India', wins: 38, total: 47, accuracy: 81, flag: '🇮🇳' },
  { rank: 2, name: 'Australia', wins: 31, total: 41, accuracy: 76, flag: '🇦🇺' },
  { rank: 3, name: 'England', wins: 29, total: 41, accuracy: 71, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { rank: 4, name: 'New Zealand', wins: 25, total: 38, accuracy: 66, flag: '🇳🇿' },
  { rank: 5, name: 'Pakistan', wins: 22, total: 34, accuracy: 65, flag: '🇵🇰' },
];

const achievementData = [
  { name: 'First Win', unlocked: true },
  { name: '5 Correct', unlocked: true },
  { name: '10 Streak', unlocked: true },
  { name: 'Hot Streak', unlocked: true },
  { name: 'Perfectionist', unlocked: false },
  { name: 'Master', unlocked: false },
];

const labelColors = {
  game: '#40C4FF',
  venue: '#A78BFA',
  time: '#F4E5B1',
};

const getNavTitle = (nav) => {
  switch (nav) {
    case 'home':
      return 'Home';
    case 'stats':
      return 'Statistics';
    case 'rank':
      return 'Rank';
    case 'profile':
      return 'Profile';
    default:
      return 'Home';
  }
};

const updateMatchState = (match, newDate) => {
  if (match.status === 'UPCOMING') {
    const target = new Date(match.matchStartTime).getTime();
    const diff = target - newDate.getTime();
    if (diff <= 0) {
      return { ...match, status: 'LIVE' };
    }
  }
  if (match.status === 'LIVE') {
    const target = new Date(match.matchStartTime).getTime() + 4 * 60 * 60 * 1000;
    if (newDate.getTime() > target) {
      return { ...match, status: 'CORRECT', result: match.prediction };
    }
  }
  return match;
};

const assistiveHelp = [
  { q: 'How do predictions work?', a: 'Our analysts combine form, conditions, matchups, and venue insights to publish clear picks before the toss.' },
  { q: 'When are predictions published?', a: 'Most picks are published 2–6 hours before the toss, while some are kept locked until we confirm the final team sheets.' },
  { q: 'Can I trust the accuracy rate?', a: 'Yes. We calculate accuracy over all published predictions and update it automatically as outcomes are added.' },
  { q: 'Is the app available in multiple languages?', a: 'The app supports English by default, with additional language packs planned for future updates.' },
];

const termsText = 'Cricket Predict is an entertainment platform built for fans, analysts and enthusiasts. Our predictions are based on careful stats review, venue analysis, player form, and tactical matchups. They do not guarantee outcomes and are intended for engaging gameplay and discussion only.';

const getStars = (rating) => {
  const filled = Math.round(rating);
  return Array.from({ length: 5 }).map((_, index) => (index < filled ? '★' : '☆')).join(' ');
};

type MatchCardProps = {
  match: any;
  currentTime: Date;
  onPress: () => void;
};

function SplashScreen() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <LinearGradient colors={['#0A0E27', '#1E1B4B', '#312E81']} style={styles.fullscreen}>
      <View style={styles.splashContent}>
        <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.logoEmoji}>🏏</Text>
        </Animated.View>
        <Text style={styles.titleText}>
          Cricket <Text style={styles.titleGold}>Predict</Text>
        </Text>
        <Text style={styles.premiumText}>PREMIUM EDITION</Text>
        <View style={styles.dotRow}>
          {[0, 1, 2].map((dot) => (
            <Animated.View key={dot} style={[styles.loadingDot, { opacity: 0.4 + dot * 0.25 }]} />
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
          const active = item.key === activeNav;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => setActiveNav(item.key)}
              activeOpacity={0.9}
            >
              <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                <Text style={styles.navIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

function HomeScreen({ matches, searchText, setSearchText, activeTab, setActiveTab, currentTime, onOpenMatch, onOpenAdmin, onOpenTerms, onOpenHelp }) {
  const filteredMatches = useMemo(() => {
    const lower = searchText.trim().toLowerCase();
    return matches.filter((match) => {
      const matchesTab = activeTab === 'live' ? match.status === 'LIVE' : activeTab === 'upcoming' ? match.status === 'UPCOMING' : match.status === 'CORRECT' || match.status === 'WRONG';
      if (!matchesTab) return false;
      if (!lower) return true;
      return `${match.teamA} ${match.teamB} ${match.series}`.toLowerCase().includes(lower);
    });
  }, [matches, searchText, activeTab]);

  return (
    <ScrollView contentContainerStyle={styles.screenScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.homeHeader}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoMini}>🏏</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle}>Cricket Predict</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitleText}>PREMIUM EDITION</Text>
            <View style={styles.greenDot} />
          </View>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={onOpenAdmin}>
          <Text style={styles.avatarText}>A</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="MATCHES" value={matches.length.toString()} accent="gold" />
        <StatCard label="CORRECT" value={matches.filter((m) => m.status === 'CORRECT').length.toString()} accent="green" />
        <StatCard label="ACCURACY" value={`${Math.round((matches.filter((m) => m.status === 'CORRECT').length / Math.max(1, matches.length)) * 100)}%`} accent="gold" />
      </View>

      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search teams or matches..."
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabRow}>
        {['live', 'upcoming', 'completed'].map((tab) => {
          const active = activeTab === tab;
          const badgeCount = tab === 'live' ? matches.filter((m) => m.status === 'LIVE').length : tab === 'upcoming' ? matches.filter((m) => m.status === 'UPCOMING').length : matches.filter((m) => m.status === 'CORRECT' || m.status === 'WRONG').length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, active && styles.filterTabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{tab === 'live' ? 'Live' : tab === 'upcoming' ? 'Upcoming' : 'Results'}</Text>
              {badgeCount > 0 && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{badgeCount}</Text></View>}
              {tab === 'live' && active && <View style={styles.liveBadgeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredMatches.map((match) => (
        <MatchCard key={match.id} match={match} currentTime={currentTime} onPress={() => onOpenMatch(match)} />
      ))}

      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

function StatCard({ label, value, accent }) {
  const isGreen = accent === 'green';
  return (
    <View style={[styles.statCard, isGreen ? styles.statCardGreen : styles.statCardGold]}>
      <Text style={[styles.statLabel, isGreen && styles.greenText]}>{label}</Text>
      <Text style={[styles.statValue, isGreen && styles.greenText]}>{value}</Text>
    </View>
  );
}

function MatchCard({ match, currentTime, onPress }) {
  const isLive = match.status === 'LIVE';
  const isUpcoming = match.status === 'UPCOMING';
  const isCompleted = match.status === 'CORRECT' || match.status === 'WRONG';
  const timer = isLive ? getElapsedTime(match.matchStartTime) : formatCountdown(match.matchStartTime);
  const isPredictionReady = match.published && match.prediction;

  const statusColors = {
    LIVE: '#EF4444',
    CORRECT: '#10B981',
    WRONG: '#F87171',
    UPCOMING: '#D4AF37',
  };

  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress} activeOpacity={0.95}>
      <LinearGradient colors={['rgba(212,175,55,0.18)', 'rgba(10,14,39,0.05)']} style={styles.cardGlow} />
      <View style={styles.cardTopRow}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColors[match.status]}22`, borderColor: `${statusColors[match.status]}99` }]}>
          <Text style={[styles.statusText, { color: statusColors[match.status] }]}>{match.status}</Text>
        </View>
        <View style={[styles.formatBadge, { backgroundColor: `${getMatchTypeColor(match.type)}20`, borderColor: `${getMatchTypeColor(match.type)}80` }]}>
          <Text style={[styles.formatText, { color: getMatchTypeColor(match.type) }]}>{match.type}</Text>
        </View>
      </View>

      <Text style={styles.seriesName}>{match.series}</Text>

      {isLive && (
        <View style={styles.liveTimerWrap}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveTimer}>{`${timer.hours}:${timer.minutes}:${timer.seconds}`}</Text>
        </View>
      )}

      {isUpcoming && (
        <View style={styles.countdownRow}>
          {['days', 'hours', 'minutes', 'seconds'].map((field) => (
            <View key={field} style={styles.countBox}>
              <Text style={styles.countValue}>{timer[field]}</Text>
              <Text style={styles.countLabel}>{field === 'days' ? 'D' : field === 'hours' ? 'H' : field === 'minutes' ? 'M' : 'S'}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.teamsRow}>
        <View style={styles.teamBlock}>
          <View style={styles.flagCircle}><Text style={styles.flagText}>{match.teamAFlag}</Text></View>
          <Text style={styles.teamName}>{match.teamA}</Text>
        </View>
        <View style={styles.vsOrb}><Text style={styles.vsText}>VS</Text></View>
        <View style={styles.teamBlock}>
          <View style={styles.flagCircle}><Text style={styles.flagText}>{match.teamBFlag}</Text></View>
          <Text style={styles.teamName}>{match.teamB}</Text>
        </View>
      </View>

      <View style={styles.h2hBox}>
        <Text style={styles.h2hTitle}>Head-to-Head</Text>
        <View style={styles.h2hRow}>
          <Text style={styles.h2hWin}>{match.teamA}: {match.headToHead[match.teamA]}</Text>
          <Text style={styles.h2hWin}>{match.teamB}: {match.headToHead[match.teamB]}</Text>
        </View>
      </View>

      <View style={styles.recentMatchesBox}>
        <Text style={styles.recentTitle}>Last Matches</Text>
        <View style={styles.recentRow}>
          {match.recentMatches.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.recentItem}>
              <View style={styles.recentDot} />
              <Text style={styles.recentText}>{item.date}</Text>
              <Text style={styles.recentWinner}>{item.winner}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.predictionPanel}>
        {isPredictionReady ? (
          <>
            <Text style={styles.predictionText}>{match.predictionBadge}</Text>
            <Text style={styles.predictionTeam}>{match.prediction}</Text>
          </>
        ) : (
          <Text style={styles.predictionText}>PREDICTION COMING SOON</Text>
        )}
      </View>

      {isCompleted && (
        <View style={[styles.resultPanel, { backgroundColor: match.result === match.prediction ? '#E8FFF4' : '#FEE2E2' }]}>
          <Text style={{ color: match.result === match.prediction ? '#0F766E' : '#B91C1C', fontWeight: '800' }}>
            {match.result === match.prediction ? '✅ CORRECT' : '❌ WRONG'}
          </Text>
        </View>
      )}

      <Text style={styles.tapHint}>👆 Tap to view full details</Text>
      <View style={styles.footerRow}>
        <Text style={styles.venueText}>📍 {match.venue}</Text>
        <Text style={styles.dateText}>{match.date}</Text>
      </View>
    </TouchableOpacity>
  );
}

function StatsScreen({}) {
  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.statsPage}>
      <Text style={styles.pageTitle}>Statistics</Text>
      <Text style={styles.pageSubtitle}>Performance.snapshot</Text>

      <View style={styles.accuracyCard}>
        <LinearGradient colors={['#0A0E27', '#1E1B4B', '#312E81']} style={styles.accuracyCardGrad}>
          <View style={styles.accuracyHeaderRow}>
            <Text style={styles.sectionLabel}>OVERALL ACCURACY</Text>
            <Text style={styles.starRating}>★★★★★</Text>
          </View>
          <Text style={styles.accuracyBig}>56%</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '56%' }]} />
          </View>
          <View style={styles.accuracySummaryRow}>
            <View style={styles.summaryBlock}><Text style={styles.summaryLabel}>CORRECT</Text><Text style={styles.summaryValue}>162</Text></View>
            <View style={styles.summaryBlock}><Text style={styles.summaryLabel}>WRONG</Text><Text style={styles.summaryValue}>128</Text></View>
            <View style={styles.summaryBlock}><Text style={styles.summaryLabel}>TOTAL</Text><Text style={styles.summaryValue}>290</Text></View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.ratingCard}>
        <View style={styles.starsRow}><Text style={styles.bigStar}>★</Text><Text style={styles.bigStar}>★</Text><Text style={styles.bigStar}>★</Text><Text style={styles.bigStar}>★</Text><Text style={styles.bigStarMuted}>★</Text></View>
        <Text style={styles.ratingTitle}>Excellent Predictor!</Text>
        <Text style={styles.ratingText}>Based on 56% accuracy</Text>
        <View style={styles.badgeInline}><Text style={styles.badgeText}>📈 Improved by 12% this month</Text></View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>By Format</Text>
        <View style={styles.formatList}>
          {['T6', 'T10', 'T20', 'ODI', 'Test'].map((format, index) => {
            const percentage = [71, 64, 58, 54, 49][index];
            const correct = [24, 21, 46, 29, 20][index];
            const wrong = [10, 12, 28, 25, 18][index];
            return (
              <View key={format} style={styles.formatCard}>
                <View style={styles.formatHeaderRow}>
                  <View style={styles.formatDotWrap}>
                    <View style={[styles.formatDot, { backgroundColor: formatColors[format] }]} />
                    <Text style={styles.formatName}>{format}</Text>
                  </View>
                  <Text style={styles.formatPercent}>{percentage}%</Text>
                </View>
                <View style={styles.progressBarTrackSmall}>
                  <View style={[styles.progressBarFillSmall, { width: `${percentage}%`, backgroundColor: formatColors[format] }]} />
                </View>
                <View style={styles.formatMeta}>
                  <Text style={styles.metaText}>✓ {correct} Correct</Text>
                  <Text style={styles.metaText}>✗ {wrong} Wrong</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>Monthly Performance</Text>
        <View style={styles.monthList}>
          {['Aug', 'Sep', 'Oct'].map((month, index) => {
            const values = [41, 56, 63];
            return (
              <View key={month} style={styles.monthCard}>
                <View style={styles.monthHeaderRow}>
                  <Text style={styles.monthName}>{month}</Text>
                  <Text style={[styles.monthBadge, { backgroundColor: values[index] >= 60 ? '#E7FFF7' : '#FFF7D6', color: values[index] >= 60 ? '#0F766E' : '#B45309' }]}>{values[index]}%</Text>
                </View>
                <View style={styles.progressBarTrackSmall}>
                  <View style={[styles.progressBarFillSmall, { width: `${values[index]}%`, backgroundColor: '#D4AF37' }]} />
                </View>
                <View style={styles.monthMetricsRow}>
                  <Text style={styles.metaText}>Correct {Math.round(values[index] / 2)}</Text>
                  <Text style={styles.metaText}>Wrong {Math.round((100 - values[index]) / 2)}</Text>
                  <Text style={styles.metaText}>Total 100</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>Top Prediction Teams</Text>
        {topPredictionTeams.map((team) => (
          <View key={team.name} style={styles.teamRowCard}>
            <View style={styles.rankBadge}>{team.rank}</View>
            <Text style={styles.flagBig}>{team.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamNameStat}>{team.name}</Text>
              <Text style={styles.teamMetric}>{team.wins}/{team.total} wins</Text>
            </View>
            <Text style={styles.teamAccuracy}>{team.accuracy}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>Achievements</Text>
        <View style={styles.achievementGrid}>
          {achievementData.map((item) => (
            <View key={item.name} style={[styles.achievementItem, !item.unlocked && styles.achievementLocked]}>
              <View style={[styles.unlockBadge, item.unlocked ? styles.unlockBadgeUnlocked : styles.unlockBadgeLocked]}>
                <Text style={styles.unlockText}>{item.unlocked ? '✓' : '🔒'}</Text>
              </View>
              <Text style={styles.achievementName}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function RankScreen({}) {
  const [selectedFormat, setSelectedFormat] = useState('T20');
  const ranking = formatRankingData[selectedFormat];

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.rankPage}>
      <Text style={styles.pageTitle}>Team Standings</Text>
      <Text style={styles.sectionLabel}>TEAM RANKINGS BY FORMAT</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formatTabsRow}>
        {['T6', 'T10', 'T20', 'ODI', 'Test'].map((format) => (
          <TouchableOpacity
            key={format}
            style={[styles.formatTabButton, selectedFormat === format && { backgroundColor: formatColors[format], borderColor: formatColors[format] }]}
            onPress={() => setSelectedFormat(format)}
          >
            <Text style={[styles.formatTabText, selectedFormat === format && { color: '#fff' }]}>{format}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.podium}>
        <View style={styles.podiumBlockLeft}>
          <Text style={styles.podiumText}>2nd</Text>
          <View style={[styles.podiumBar, { height: 70, backgroundColor: '#C0C0C0' }]}>
            <Text style={styles.podiumFlag}>🇦🇺</Text>
          </View>
          <Text style={styles.podiumTeam}>Australia</Text>
        </View>
        <View style={styles.podiumBlockCenter}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.podiumText}>1st</Text>
          <View style={[styles.podiumBar, { height: 100, backgroundColor: '#D4AF37' }]}>
            <Text style={styles.podiumFlag}>🇮🇳</Text>
          </View>
          <Text style={styles.podiumTeam}>India</Text>
        </View>
        <View style={styles.podiumBlockRight}>
          <Text style={styles.podiumText}>3rd</Text>
          <View style={[styles.podiumBar, { height: 55, backgroundColor: '#CD7F32' }]}>
            <Text style={styles.podiumFlag}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</Text>
          </View>
          <Text style={styles.podiumTeam}>England</Text>
        </View>
      </View>

      <Text style={styles.tableLabel}>ALL TEAMS — {selectedFormat}</Text>
      <View style={styles.rankTableWrap}>
        <View style={styles.rankTableHeader}>
          <Text style={styles.rankHeaderCell}>#</Text>
          <Text style={styles.rankHeaderCell}>TEAM</Text>
          <Text style={styles.rankHeaderCell}>M</Text>
          <Text style={styles.rankHeaderCell}>W</Text>
          <Text style={styles.rankHeaderCell}>L</Text>
          <Text style={styles.rankHeaderCell}>WIN%</Text>
        </View>
        {ranking.map((entry) => (
          <View key={entry.rank} style={styles.rankRow}>
            <Text style={[styles.rankCell, entry.rank <= 3 && styles.rankTopThree]}>{entry.rank}</Text>
            <View style={styles.teamCellWrap}>
              <Text style={styles.rankTeamFlag}>{teamFlags[entry.team] || '🏏'}</Text>
              <Text style={styles.rankTeamName}>{entry.team}</Text>
            </View>
            <Text style={styles.rankCell}>{entry.matches}</Text>
            <Text style={[styles.rankCell, { color: '#10B981' }]}>{entry.wins}</Text>
            <Text style={[styles.rankCell, { color: '#EF4444' }]}>{entry.losses}</Text>
            <Text style={[styles.winBadge, { backgroundColor: getProgressLevel(entry.winRate) + '22', color: getProgressLevel(entry.winRate) }]}>{entry.winRate}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{selectedFormat} FORMAT</Text>
        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryStat}><Text style={styles.summaryStatLabel}>TEAMS</Text><Text style={styles.summaryStatValue}>8</Text></View>
          <View style={styles.summaryStat}><Text style={styles.summaryStatLabel}>MATCHES</Text><Text style={styles.summaryStatValue}>66</Text></View>
          <View style={styles.summaryStat}><Text style={styles.summaryStatLabel}>TOP TEAM</Text><Text style={styles.summaryStatValue}>India</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileScreen({ onOpenTerms, onOpenHelp, showToast }) {
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [darkModeOn, setDarkModeOn] = useState(true);

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.profilePage}>
      <View style={styles.profileHeader}>
        <LinearGradient colors={['#0A0E27', '#1E1B4B', '#312E81']} style={styles.profileHeaderGrad}>
          <View style={styles.profileAvatarWrap}>
            <Text style={styles.profileAvatar}>YN</Text>
          </View>
          <Text style={styles.profileName}>Your Name</Text>
          <Text style={styles.profileEmail}>player@cricket.com</Text>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>🏆 PRO PREDICTOR</Text></View>
        </LinearGradient>
      </View>

      <View style={styles.profileStatsRow}>
        <StatsMiniCard label="Predictions" value="287" />
        <StatsMiniCard label="Correct" value="162" accent="green" />
        <StatsMiniCard label="Accuracy" value="56%" accent="gold" />
      </View>

      <TouchableOpacity style={styles.adminButton} onPress={() => showToast('Admin Panel ready')}>
        <Text style={styles.adminButtonText}>🎛️ Admin Panel</Text>
        <Text style={styles.adminArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.settingGroup}>
        <TouchableOpacity style={styles.settingRow} onPress={() => setNotificationsOn((prev) => !prev)}>
          <Text style={styles.settingLabel}>🔔 Notifications</Text>
          <View style={[styles.toggle, notificationsOn && styles.toggleOn]}>
            <View style={[styles.toggleThumb, notificationsOn && styles.toggleThumbOn]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => setDarkModeOn((prev) => !prev)}>
          <Text style={styles.settingLabel}>🌙 Dark Mode</Text>
          <View style={[styles.toggle, darkModeOn && styles.toggleOn]}>
            <View style={[styles.toggleThumb, darkModeOn && styles.toggleThumbOn]} />
          </View>
        </TouchableOpacity>

        <View style={styles.settingRowStatic}>
          <Text style={styles.settingLabel}>🌐 Language</Text>
          <Text style={styles.settingValue}>English</Text>
        </View>
      </View>

      <View style={styles.settingGroup}>
        <TouchableOpacity style={styles.settingRowStatic} onPress={onOpenHelp}>
          <Text style={styles.settingLabel}>❓ Help Center</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRowStatic}>
          <Text style={styles.settingLabel}>⭐ Rate App</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRowStatic}>
          <Text style={styles.settingLabel}>📤 Share App</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRowStatic} onPress={onOpenTerms}>
          <Text style={styles.settingLabel}>📄 Terms & Privacy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Cricket Predict v1.0.0</Text>
    </ScrollView>
  );
}

function StatsMiniCard({ label, value, accent = 'default' }) {
  return (
    <View style={[styles.miniCard, accent === 'green' && styles.miniCardGreen, accent === 'gold' && styles.miniCardGold]}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={[styles.miniValue, accent === 'green' && styles.greenText, accent === 'gold' && styles.goldText]}>{value}</Text>
    </View>
  );
}

function MatchDetailScreen({ match, onBack, currentTime }) {
  const timer = getElapsedTime(match.matchStartTime);
  const upcoming = formatCountdown(match.matchStartTime);
  const resultWin = match.result === match.prediction;

  return (
    <View style={styles.detailWrap}>
      <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Match Details</Text>
          <View style={[styles.detailStatusBadge, { backgroundColor: `${getStatusColor(match.status)}22` }]}>
            <Text style={[styles.detailStatusText, { color: getStatusColor(match.status) }]}>{match.status}</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <LinearGradient colors={['rgba(10,14,39,0.85)', 'rgba(30,27,75,0.9)', 'rgba(49,46,129,0.9)']} style={styles.heroGlow}>
            <View style={styles.heroTop}>
              <Text style={styles.cardSeries}>{match.series}</Text>
              <View style={[styles.formatBadge, { backgroundColor: `${getMatchTypeColor(match.type)}20`, borderColor: `${getMatchTypeColor(match.type)}80` }]}>
                <Text style={[styles.formatText, { color: getMatchTypeColor(match.type) }]}>{match.type}</Text>
              </View>
            </View>
            <View style={styles.detailTeamsRow}>
              <View style={styles.teamDetailBlock}>
                <View style={styles.flagLarge}><Text style={styles.flagLargeText}>{match.teamAFlag}</Text></View>
                <Text style={styles.teamDetailName}>{match.teamA}</Text>
              </View>
              <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
              <View style={styles.teamDetailBlock}>
                <View style={styles.flagLarge}><Text style={styles.flagLargeText}>{match.teamBFlag}</Text></View>
                <Text style={styles.teamDetailName}>{match.teamB}</Text>
              </View>
            </View>

            {match.status === 'LIVE' && (
              <View style={styles.liveDetailRow}>
                <View style={styles.pulseDotLarge} />
                <Text style={styles.bigTimer}>{`${timer.hours}:${timer.minutes}:${timer.seconds}`}</Text>
              </View>
            )}

            {match.status === 'UPCOMING' && (
              <View style={styles.detailCountdownRow}>
                {['days', 'hours', 'minutes', 'seconds'].map((field) => (
                  <View key={field} style={styles.detailCountBox}>
                    <Text style={styles.detailCountValue}>{upcoming[field]}</Text>
                    <Text style={styles.detailCountLabel}>{field === 'days' ? 'D' : field === 'hours' ? 'H' : field === 'minutes' ? 'M' : 'S'}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}><Text style={styles.infoItemLabel}>📍 Venue</Text><Text style={styles.infoItemText}>{match.venue}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoItemLabel}>📅 Date</Text><Text style={styles.infoItemText}>{match.date}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoItemLabel}>⏰ Time</Text><Text style={styles.infoItemText}>{match.time}</Text></View>
            </View>
          </LinearGradient>
        </View>

        {(match.status === 'CORRECT' || match.status === 'WRONG') && (
          <View style={[styles.resultCard, resultWin ? styles.resultCardCorrect : styles.resultCardWrong]}>
            <Text style={styles.resultEmoji}>{resultWin ? '🏆' : '💔'}</Text>
            <Text style={styles.resultTitle}>{resultWin ? 'CORRECT PREDICTION' : 'WRONG PREDICTION'}</Text>
            <Text style={styles.resultWinner}>Winner: {match.result}</Text>
          </View>
        )}

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderWithIcon}>🎯 PREDICTION</Text>
          <View style={styles.predictionDetailCard}>
            <View style={styles.predictionFlagWrap}><Text style={styles.predictionFlag}>{match.prediction === match.teamA ? match.teamAFlag : match.teamBFlag}</Text></View>
            <Text style={styles.predictionDetailName}>{match.prediction}</Text>
            <View style={styles.predictionGoldBadge}><Text style={styles.predictionGoldText}>WILL WIN</Text></View>
            {!match.published && <Text style={styles.lockText}>Locked</Text>}
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderWithIcon}>📝 ANALYSIS</Text>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>{match.analysis}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderWithIcon}>📊 HEAD TO HEAD</Text>
          <View style={styles.headToHeadDetailCard}>
            <View style={styles.h2hTeamBox}>
              <Text style={styles.h2hTeamFlag}>{match.teamAFlag}</Text>
              <Text style={styles.h2hTeamName}>{match.teamA}</Text>
              <Text style={styles.h2hWinValue}>{match.headToHead[match.teamA]} wins</Text>
            </View>
            <Text style={styles.vsMiddle}>VS</Text>
            <View style={styles.h2hTeamBox}>
              <Text style={styles.h2hTeamFlag}>{match.teamBFlag}</Text>
              <Text style={styles.h2hTeamName}>{match.teamB}</Text>
              <Text style={styles.h2hWinValue}>{match.headToHead[match.teamB]} wins</Text>
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(match.headToHead[match.teamA] / (match.h2hTotal || 1)) * 100}%`, backgroundColor: '#D4AF37' }]} /></View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(match.headToHead[match.teamB] / (match.h2hTotal || 1)) * 100}%`, backgroundColor: '#8B5CF6' }]} /></View>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionHeaderWithIcon}>📜 RECENT MATCHES</Text>
          <View style={styles.recentList}>{match.recentMatches.map((item, index) => (
            <View key={index} style={[styles.recentDetailCard, item.winner === match.prediction && styles.recentWinnerCard]}>
              <View style={styles.recentHeaderRow}>
                <Text style={styles.recentDate}>{item.date}</Text>
                <Text style={styles.recentFormat}>{item.format}</Text>
              </View>
              <Text style={styles.recentVenue}>{item.venue}</Text>
              {item.winner === match.prediction && <Text style={styles.winningBadge}>WINNER</Text>}
            </View>
          ))}</View>
        </View>
      </ScrollView>
    </View>
  );
}

function TermsModal({ visible, onClose }) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📄 Terms & Privacy</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.badgePill}>🏏 ABOUT OUR PREDICTIONS</Text>
          <Text style={styles.modalParagraph}>{termsText}</Text>
          <View style={styles.bulletList}>
            {['Teams', 'Ground', 'Players', 'Each & Everything'].map((item, index) => (
              <View key={item} style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>{['🏏', '📍', '👥', '🧠'][index]}</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={styles.warningBox}><Text style={styles.warningText}>Warning: Entertainment purposes only</Text></View>
          <Text style={styles.privacyHeader}>Privacy</Text>
          <Text style={styles.modalParagraph}>We protect your data, limit retention, and never sell personal match insights. Contact us at team@cricketpredict.com</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}><Text style={styles.primaryButtonText}>I Understand</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function HelpModal({ visible, onClose }) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>❓ Help Center</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.badgePill}>💡 FREQUENTLY ASKED</Text>
          <View style={styles.helpList}>
            {assistiveHelp.map((item, idx) => (
              <View key={item.q} style={styles.helpCard}>
                <View style={styles.qAHeader}><View style={styles.helpQ}>Q</View><Text style={styles.helpQuestion}>{item.q}</Text></View>
                <View style={styles.qAHeader}><View style={styles.helpA}>A</View><Text style={styles.helpAnswer}>{item.a}</Text></View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}><Text style={styles.primaryButtonText}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toastText, setToastText] = useState('');

  useEffect(() => {
    const splashTimer = setTimeout(() => setSplashVisible(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prev) => prev.map((match) => updateMatchState(match, new Date())));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem('adminMatches', JSON.stringify(matches));
      } catch (error) {
        console.log('storage error', error);
      }
    };
    save();
  }, [matches]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('adminMatches');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.length > 0) setMatches(parsed);
        }
      } catch (error) {
        console.log('load error', error);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!toastText) return;
    const timeout = setTimeout(() => setToastText(''), 2200);
    return () => clearTimeout(timeout);
  }, [toastText]);

  const renderScreen = () => {
    if (selectedMatch) {
      return <MatchDetailScreen match={selectedMatch} onBack={() => setSelectedMatch(null)} currentTime={currentTime} />;
    }

    switch (activeNav) {
      case 'home':
        return (
          <HomeScreen
            matches={matches}
            searchText={searchText}
            setSearchText={setSearchText}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentTime={currentTime}
            onOpenMatch={(match) => setSelectedMatch(match)}
            onOpenAdmin={() => setShowAdmin(true)}
            onOpenTerms={() => setShowTerms(true)}
            onOpenHelp={() => setShowHelp(true)}
          />
        );
      case 'stats':
        return <StatsScreen />;
      case 'rank':
        return <RankScreen />;
      case 'profile':
        return <ProfileScreen onOpenTerms={() => setShowTerms(true)} onOpenHelp={() => setShowHelp(true)} showToast={(text) => setToastText(text)} />;
      default:
        return <HomeScreen matches={matches} searchText={searchText} setSearchText={setSearchText} activeTab={activeTab} setActiveTab={setActiveTab} currentTime={currentTime} onOpenMatch={(match) => setSelectedMatch(match)} onOpenAdmin={() => setShowAdmin(true)} onOpenTerms={() => setShowTerms(true)} onOpenHelp={() => setShowHelp(true)} />;
    }
  };

  if (splashVisible) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.appRoot}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      {renderScreen()}
      {!selectedMatch && <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />}
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
      <Modal transparent animationType="fade" visible={showAdmin}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdmin(false)}>
          <Pressable style={styles.adminPanel} onPress={() => null}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎛️ Admin Panel</Text>
              <TouchableOpacity onPress={() => setShowAdmin(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.adminText}>Manage fixtures, auto-update status every 5 seconds, and keep custom match records in local storage.</Text>
            <View style={styles.adminInfoWrap}>
              {matches.slice(0, 3).map((match) => (
                <View key={match.id} style={styles.adminInfoRow}>
                  <Text style={styles.adminInfoText}>{match.series}</Text>
                  <Text style={[styles.adminInfoStatus, { color: getStatusColor(match.status) }]}>{match.status}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAdmin(false)}>
              <Text style={styles.primaryButtonText}>Close Panel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      {toastText ? (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>{toastText}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 2,
    borderColor: '#F4E5B1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  logoEmoji: {
    fontSize: 52,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  titleGold: {
    color: COLORS.gold,
  },
  premiumText: {
    color: COLORS.lightGold,
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: '700',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.lightGold,
    fontWeight: '700',
    letterSpacing: 2,
  },
  screenScroll: {
    flexGrow: 1,
    backgroundColor: '#F8F9FB',
    paddingBottom: 120,
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#F8F9FB',
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'linear-gradient',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  logoMini: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  subtitleText: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0A0E27',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  statCardGold: {
    backgroundColor: '#FFFBEA',
    borderColor: '#F4E5B1',
  },
  statCardGreen: {
    backgroundColor: '#E9FFF8',
    borderColor: '#B7F0D8',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statValue: {
    marginTop: 8,
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  greenText: {
    color: '#0F766E',
  },
  goldText: {
    color: '#B68A00',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: '#0A0E27',
  },
  filterTabText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  filterBadge: {
    position: 'absolute',
    right: 8,
    top: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  liveBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    left: 12,
    top: 12,
  },
  matchCard: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  formatBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  formatText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  seriesName: {
    textAlign: 'center',
    fontSize: 13,
    letterSpacing: 1.1,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginBottom: 10,
  },
  liveTimerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveTimer: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#0A0E27',
    fontVariant: ['tabular-nums'],
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  countBox: {
    width: 42,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  countLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  flagCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8F9FB',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 24,
  },
  teamName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  vsOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'linear-gradient',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F4E5B1',
    marginHorizontal: 8,
  },
  vsText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  h2hBox: {
    marginTop: 16,
    marginHorizontal: 18,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  h2hTitle: {
    fontWeight: '700',
    color: '#1E3A8A',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  h2hRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  h2hWin: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  recentMatchesBox: {
    marginTop: 14,
    marginHorizontal: 18,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  recentRow: {
    marginTop: 10,
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  recentText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  recentWinner: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  predictionPanel: {
    margin: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF7DB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F8D66A',
    alignItems: 'center',
  },
  predictionText: {
    color: '#AE8400',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  predictionTeam: {
    fontWeight: '800',
    color: '#0A0E27',
    fontSize: 16,
    marginTop: 6,
  },
  resultPanel: {
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapHint: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  venueText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    flex: 1,
  },
  dateText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  footerSpace: {
    height: 16,
  },
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#D4AF37',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    color: '#4338CA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 12,
  },
  modalParagraph: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bulletList: {
    marginTop: 12,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletIcon: {
    fontSize: 18,
  },
  bulletText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF7D6',
    borderWidth: 1,
    borderColor: '#F5D374',
  },
  warningText: {
    color: '#9A6700',
    fontWeight: '700',
  },
  privacyHeader: {
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#0A0E27',
    fontWeight: '800',
    fontSize: 15,
  },
  helpList: {
    gap: 12,
    marginBottom: 8,
  },
  helpCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
  },
  qAHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  helpQ: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A0E27',
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 24,
  },
  helpA: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 24,
  },
  helpQuestion: {
    flex: 1,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  helpAnswer: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  statsPage: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
    backgroundColor: '#F8F9FB',
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  pageSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  accuracyCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
  },
  accuracyCardGrad: {
    padding: 18,
    borderRadius: 22,
  },
  accuracyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    color: '#D4AF37',
    letterSpacing: 1.6,
    fontWeight: '800',
  },
  starRating: {
    color: '#F5D56A',
    fontSize: 16,
  },
  accuracyBig: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    marginTop: 6,
  },
  progressBarTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 999,
  },
  accuracySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  summaryBlock: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#D1D5DB',
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginTop: 4,
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3E4A4',
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  bigStar: {
    color: '#D4AF37',
    fontSize: 24,
  },
  bigStarMuted: {
    color: '#D1D5DB',
    fontSize: 24,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  ratingText: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: 14,
  },
  badgeInline: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#EAFBF4',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#0F766E',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeader: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  formatList: {
    gap: 10,
  },
  formatCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  formatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatDotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  formatName: {
    fontWeight: '700',
    fontSize: 14,
  },
  formatPercent: {
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  progressBarTrackSmall: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBarFillSmall: {
    height: '100%',
    borderRadius: 999,
  },
  formatMeta: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  monthList: {
    gap: 10,
  },
  monthCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthName: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  monthBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '800',
  },
  monthMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  teamRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A0E27',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '800',
    marginRight: 12,
  },
  flagBig: {
    fontSize: 22,
    marginRight: 8,
  },
  teamNameStat: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  teamMetric: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  teamAccuracy: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 16,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    alignItems: 'center',
  },
  achievementLocked: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  unlockBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  unlockBadgeUnlocked: {
    backgroundColor: '#DCFCE7',
  },
  unlockBadgeLocked: {
    backgroundColor: '#E5E7EB',
  },
  unlockText: {
    fontWeight: '800',
  },
  achievementName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  rankPage: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
    backgroundColor: '#F8F9FB',
  },
  formatTabsRow: {
    marginTop: 12,
    marginBottom: 16,
  },
  formatTabButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  formatTabText: {
    fontWeight: '700',
    color: '#0A0E27',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
    marginTop: 8,
    height: 160,
  },
  podiumBlockLeft: {
    flex: 1,
    alignItems: 'center',
  },
  podiumBlockCenter: {
    flex: 1,
    alignItems: 'center',
  },
  podiumBlockRight: {
    flex: 1,
    alignItems: 'center',
  },
  podiumText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginBottom: 8,
  },
  podiumBar: {
    width: 80,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  podiumFlag: {
    fontSize: 28,
    marginTop: 10,
  },
  crown: {
    fontSize: 24,
    marginBottom: 6,
  },
  podiumTeam: {
    marginTop: 8,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  tableLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  rankTableWrap: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rankTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0A0E27',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  rankHeaderCell: {
    flex: 1,
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    textAlign: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  rankCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rankTopThree: {
    fontWeight: '800',
    color: '#D4AF37',
  },
  teamCellWrap: {
    flex: 1.7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankTeamFlag: {
    fontSize: 18,
  },
  rankTeamName: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  winBadge: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: '#0A0E27',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E1B4B',
  },
  summaryLabel: {
    color: '#D4AF37',
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  summaryStatLabel: {
    color: '#D1D5DB',
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  summaryStatValue: {
    color: '#fff',
    marginTop: 6,
    fontSize: 14,
    fontWeight: '800',
  },
  profilePage: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
    backgroundColor: '#F8F9FB',
  },
  profileHeader: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
  },
  profileHeaderGrad: {
    padding: 20,
    alignItems: 'center',
  },
  profileAvatarWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileAvatar: {
    color: '#0A0E27',
    fontWeight: '900',
    fontSize: 24,
  },
  profileName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
  },
  profileEmail: {
    color: '#D1D5DB',
    marginTop: 4,
    fontSize: 14,
  },
  proBadge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 999,
  },
  proBadgeText: {
    color: '#F4E5B1',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  miniCardGreen: {
    borderColor: '#B7F0D8',
    backgroundColor: '#EEFFF8',
  },
  miniCardGold: {
    borderColor: '#F4E5B1',
    backgroundColor: '#FFFBEA',
  },
  miniLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  miniValue: {
    marginTop: 6,
    fontWeight: '800',
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0A0E27',
    borderRadius: 16,
    marginBottom: 18,
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  adminArrow: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '800',
  },
  settingGroup: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  settingRowStatic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  settingLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  settingValue: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  settingArrow: {
    color: COLORS.textSecondary,
    fontSize: 24,
  },
  toggle: {
    width: 46,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#22C55E',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    color: '#B91C1C',
    fontWeight: '800',
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  detailWrap: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  detailScroll: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  detailStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailStatusText: {
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroGlow: {
    padding: 18,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardSeries: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  detailTeamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamDetailBlock: {
    flex: 1,
    alignItems: 'center',
  },
  flagLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: '#F4E5B1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagLargeText: {
    fontSize: 36,
  },
  teamDetailName: {
    marginTop: 10,
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  vsCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  liveDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 10,
  },
  pulseDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  bigTimer: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  detailCountdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  detailCountBox: {
    width: 46,
    height: 58,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  detailCountValue: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  detailCountLabel: {
    color: '#D1D5DB',
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '700',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 10,
  },
  infoItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoItemLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoItemText: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 8,
    fontSize: 12,
  },
  resultCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  resultCardCorrect: {
    backgroundColor: '#E8FFF4',
    borderColor: '#A7F3D0',
  },
  resultCardWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  resultEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  resultTitle: {
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  resultWinner: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  detailSection: {
    marginTop: 22,
  },
  sectionHeaderWithIcon: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 12,
  },
  predictionDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    alignItems: 'center',
  },
  predictionFlagWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F9FB',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictionFlag: {
    fontSize: 28,
  },
  predictionDetailName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 10,
    color: COLORS.textPrimary,
  },
  predictionGoldBadge: {
    marginTop: 12,
    backgroundColor: '#FFF7D6',
    borderWidth: 1,
    borderColor: '#F4E5B1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  predictionGoldText: {
    color: '#8A5C00',
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  lockText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analysisText: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  headToHeadDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h2hTeamBox: {
    flex: 1,
    alignItems: 'center',
  },
  h2hTeamFlag: {
    fontSize: 30,
  },
  h2hTeamName: {
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  h2hWinValue: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  vsMiddle: {
    fontWeight: '800',
    color: COLORS.gold,
    marginHorizontal: 10,
  },
  progressRow: {
    marginTop: 12,
    gap: 10,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  recentList: {
    gap: 12,
  },
  recentDetailCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
  },
  recentWinnerCard: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDate: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  recentFormat: {
    color: COLORS.gold,
    fontWeight: '800',
  },
  recentVenue: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  winningBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
  },
  adminPanel: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  adminText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  adminInfoWrap: {
    gap: 10,
    marginBottom: 18,
  },
  adminInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  adminInfoText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  adminInfoStatus: {
    fontWeight: '800',
  },
  toastWrap: {
    position: 'absolute',
    left: 30,
    right: 30,
    bottom: 100,
    backgroundColor: '#0A0E27',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export { getElapsedTime, formatCountdown, getStatusColor, formatColors };

