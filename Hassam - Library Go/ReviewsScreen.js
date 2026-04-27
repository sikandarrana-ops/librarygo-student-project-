import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const DEFAULT_REVIEWS = [
  { id:'d1', bookTitle:'The Great Gatsby',       reviewer:'ahmed_uni', rating:5, comment:'Absolutely brilliant! A must-read classic. The writing is poetic and timeless.', date:'12 Mar 2026' },
  { id:'d2', bookTitle:'Atomic Habits',           reviewer:'sara_k',    rating:5, comment:'Life changing! Changed the way I think about habits and productivity.',          date:'10 Mar 2026' },
  { id:'d3', bookTitle:'Sapiens',                 reviewer:'bilal_92',  rating:4, comment:'Very informative and thought-provoking. Makes you rethink human history.',       date:'08 Mar 2026' },
];
const COLORS = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1'];

export default function ReviewsScreen({ navigation }) {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);

  // Reload every time this screen gains focus (so new review shows up immediately)
  useFocusEffect(useCallback(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem('reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        // merge user reviews at top, then defaults (avoid duplicates by id)
        const ids = new Set(parsed.map(r => r.id));
        setReviews([...parsed, ...DEFAULT_REVIEWS.filter(r => !ids.has(r.id))]);
      } else {
        setReviews(DEFAULT_REVIEWS);
      }
    };
    load();
  }, []));

  const stars = (n) =>
    [1,2,3,4,5].map(i => (
      <Text key={i} style={{ color: i<=n?'#FFD700':'#ddd', fontSize:14 }}>★</Text>
    ));

  const avg = reviews.length
    ? (reviews.reduce((a,r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '–';

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>⭐ Student Reviews</Text>
          <Text style={s.sub}>See what other readers are saying</Text>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            ['Reviews',  reviews.length],
            ['Avg Rating', avg],
            ['Books',    new Set(reviews.map(r => r.bookTitle)).size],
          ].map(([l, v]) => (
            <View key={l} style={s.stat}>
              <Text style={s.statNum}>{v}</Text>
              <Text style={s.statLbl}>{l}</Text>
            </View>
          ))}
        </View>

        {/* CTA — takes user to the form screen */}
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddReview')}>
          <Text style={s.addBtnTxt}>✏️  Write a Review</Text>
        </TouchableOpacity>

        <FlatList
          data={reviews}
          keyExtractor={i => i.id}
          removeClippedSubviews
          contentContainerStyle={{ padding:16, paddingBottom:24 }}
          renderItem={({ item, index }) => (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={[s.avatar,{ backgroundColor: COLORS[index%COLORS.length] }]}>
                  <Text style={s.avatarTxt}>{item.reviewer.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.reviewer}>{item.reviewer}</Text>
                  <Text style={s.date}>{item.date}</Text>
                </View>
                <View style={s.badge}>
                  <Text style={s.badgeNum}>{item.rating}.0</Text>
                  <Text style={{ color:'#FFD700', fontSize:12 }}>★</Text>
                </View>
              </View>
              <View style={s.bookBox}>
                <Text style={s.bookTitle}>📖  {item.bookTitle}</Text>
              </View>
              <View style={{ flexDirection:'row', marginBottom:8 }}>{stars(item.rating)}</View>
              <Text style={s.comment}>"{item.comment}"</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#1a1a2e' },
  container:{ flex:1, backgroundColor:'#f5f7fb' },
  header:{ backgroundColor:'#1a1a2e', paddingTop:14, paddingHorizontal:20, paddingBottom:18 },
  back:{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:8 },
  title:{ color:'#fff', fontSize:20, fontWeight:'800' },
  sub:{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:3 },
  statsRow:{ flexDirection:'row', gap:10, paddingHorizontal:16, marginTop:14, marginBottom:4 },
  stat:{ flex:1, backgroundColor:'#fff', borderRadius:14, padding:12, alignItems:'center', elevation:1 },
  statNum:{ fontSize:20, fontWeight:'800', color:'#e53935' },
  statLbl:{ fontSize:10, color:'#888', marginTop:2 },
  addBtn:{ backgroundColor:'#e53935', margin:14, marginTop:10, padding:14, borderRadius:14, alignItems:'center', elevation:2 },
  addBtnTxt:{ color:'#fff', fontWeight:'800', fontSize:15 },
  card:{ backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:1 },
  cardTop:{ flexDirection:'row', alignItems:'center', marginBottom:10, gap:10 },
  avatar:{ width:38, height:38, borderRadius:19, justifyContent:'center', alignItems:'center' },
  avatarTxt:{ color:'#fff', fontWeight:'800', fontSize:15 },
  reviewer:{ fontSize:13, fontWeight:'800', color:'#1a1a2e' },
  date:{ fontSize:11, color:'#aaa', marginTop:1 },
  badge:{ flexDirection:'row', alignItems:'center', backgroundColor:'#fff8e1', paddingVertical:3, paddingHorizontal:9, borderRadius:8, gap:2 },
  badgeNum:{ fontSize:13, fontWeight:'800', color:'#f57f17' },
  bookBox:{ backgroundColor:'#f5f7fb', borderRadius:9, padding:9, marginBottom:9 },
  bookTitle:{ fontSize:12, fontWeight:'800', color:'#1a1a2e' },
  comment:{ fontSize:12, color:'#555', lineHeight:19, fontStyle:'italic' },
});
