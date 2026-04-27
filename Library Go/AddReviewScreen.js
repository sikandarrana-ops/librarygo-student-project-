/**
 * AddReviewScreen – the "Add Content Form" screen that satisfies the
 * three-screen requirement.  Fields: book title (chip picker + manual),
 * reviewer name (auto-filled from AsyncStorage), star rating, date
 * (auto), comment textarea.  Saves to AsyncStorage on submit.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS = [
  'The Great Gatsby',
  'A Brief History of Time',
  'Clean Code',
  'Sapiens',
  'Atomic Habits',
  '1984',
];

const RATING_LABELS = ['','Poor ☹','Fair 😐','Good 🙂','Very Good 😊','Excellent! 🤩'];

export default function AddReviewScreen({ navigation }) {
  const [bookTitle,  setBookTitle]  = useState('');
  const [customBook, setCustomBook] = useState('');
  const [rating,     setRating]     = useState(0);
  const [comment,    setComment]    = useState('');
  const [reviewer,   setReviewer]   = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  // Auto-fill reviewer from login state; restore any saved draft
  useEffect(() => {
    const restore = async () => {
      const [u, draft] = await Promise.all([
        AsyncStorage.getItem('loggedInUser'),
        AsyncStorage.getItem('reviewDraft'),
      ]);
      if (u && !reviewer) setReviewer(u);
      if (draft) {
        const d = JSON.parse(draft);
        setBookTitle(d.bookTitle   || '');
        setCustomBook(d.customBook || '');
        setRating(d.rating         || 0);
        setComment(d.comment       || '');
        setDraftSaved(true);
      }
    };
    restore();
  }, []);

  // Auto-save draft whenever fields change
  useEffect(() => {
    const save = async () => {
      await AsyncStorage.setItem('reviewDraft',
        JSON.stringify({ bookTitle, customBook, rating, comment }));
    };
    save();
  }, [bookTitle, customBook, rating, comment]);

  const clearDraft = () => AsyncStorage.removeItem('reviewDraft');

  const handleSubmit = async () => {
    const finalBook = bookTitle || customBook.trim();
    if (!finalBook)       { Alert.alert('Missing Info','Please select or enter a book title.'); return; }
    if (rating === 0)     { Alert.alert('Missing Info','Please select a star rating.');         return; }
    if (!comment.trim())  { Alert.alert('Missing Info','Please write a comment.');             return; }
    if (!reviewer.trim()) { Alert.alert('Missing Info','Please enter your name.');             return; }

    const newReview = {
      id: Date.now().toString(),
      bookTitle: finalBook,
      reviewer:  reviewer.trim(),
      rating,
      comment:   comment.trim(),
      date: new Date().toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric' }),
    };

    try {
      const existing = await AsyncStorage.getItem('reviews');
      const list = existing ? JSON.parse(existing) : [];
      await AsyncStorage.setItem('reviews', JSON.stringify([newReview, ...list]));
      await clearDraft();
      setSubmitted(true);
    } catch {
      Alert.alert('Error','Could not save review. Please try again.');
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successContainer}>
          <Text style={{ fontSize:72, marginBottom:16 }}>🎉</Text>
          <Text style={s.successTitle}>Review Submitted!</Text>
          <Text style={s.successSub}>
            Thank you, {reviewer}!{'\n'}Your review has been saved successfully.
          </Text>
          <TouchableOpacity style={s.successBtn} onPress={() => navigation.navigate('Reviews')}>
            <Text style={s.successBtnTxt}>⭐  View All Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.successBtn2}
            onPress={() => {
              setSubmitted(false);
              setBookTitle(''); setCustomBook(''); setRating(0); setComment('');
            }}
          >
            <Text style={s.successBtn2Txt}>✏️  Write Another Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop:16 }} onPress={() => navigation.goBack()}>
            <Text style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Form screen ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.container}
        contentContainerStyle={{ paddingBottom:48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>✏️  Write a Review</Text>
          <Text style={s.sub}>Share your reading experience with others</Text>
          {draftSaved && (
            <View style={s.draftBanner}>
              <Text style={s.draftTxt}>📝 Draft restored — continue where you left off</Text>
            </View>
          )}
        </View>

        <View style={s.form}>

          {/* ① Reviewer Name */}
          <Text style={s.label}>① YOUR NAME</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>👤</Text>
            <TextInput
              style={s.input}
              placeholder="Enter your name or username"
              placeholderTextColor="#bbb"
              value={reviewer}
              onChangeText={setReviewer}
            />
          </View>

          {/* ② Book Title */}
          <Text style={s.label}>② SELECT BOOK</Text>
          <View style={s.bookGrid}>
            {BOOKS.map(b => (
              <TouchableOpacity
                key={b}
                style={[s.bookChip, bookTitle === b && s.bookChipActive]}
                onPress={() => { setBookTitle(b); setCustomBook(''); }}
                activeOpacity={0.8}
              >
                <Text
                  style={[s.bookChipTxt, bookTitle === b && s.bookChipTxtActive]}
                  numberOfLines={2}
                >{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.orTxt}>— or type a different title —</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>📖</Text>
            <TextInput
              style={s.input}
              placeholder="Enter book title manually"
              placeholderTextColor="#bbb"
              value={customBook}
              onChangeText={v => { setCustomBook(v); setBookTitle(''); }}
            />
          </View>

          {/* ③ Star Rating */}
          <Text style={s.label}>③ YOUR RATING</Text>
          <View style={s.starsRow}>
            {[1,2,3,4,5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Text style={[s.star, star <= rating && s.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <View style={s.ratingBadge}>
              <Text style={s.ratingLabel}>{RATING_LABELS[rating]}  ({rating}/5)</Text>
            </View>
          )}

          {/* ④ Date (auto) */}
          <Text style={s.label}>④ DATE</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>📅</Text>
            <Text style={s.dateText}>
              {new Date().toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric' })}
            </Text>
            <Text style={s.autoTag}>Auto</Text>
          </View>

          {/* ⑤ Comment */}
          <Text style={s.label}>
            ⑤ YOUR REVIEW{' '}
            <Text style={{ color: comment.length > 450 ? '#e53935' : '#aaa' }}>
              ({comment.length}/500)
            </Text>
          </Text>
          <TextInput
            style={s.textarea}
            placeholder="Write your thoughts about this book..."
            placeholderTextColor="#bbb"
            value={comment}
            onChangeText={v => v.length <= 500 && setComment(v)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={s.submitTxt}>Submit Review  ⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={s.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#1a1a2e' },
  container:{ flex:1, backgroundColor:'#f5f7fb' },
  header:{ backgroundColor:'#1a1a2e', paddingTop:14, paddingHorizontal:20, paddingBottom:22 },
  back:{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:10 },
  title:{ color:'#fff', fontSize:22, fontWeight:'800' },
  sub:{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:4 },
  draftBanner:{ marginTop:12, backgroundColor:'rgba(255,255,255,0.1)', borderRadius:8, padding:9 },
  draftTxt:{ color:'rgba(255,255,255,0.7)', fontSize:12 },
  form:{ padding:20 },
  label:{ fontSize:11, fontWeight:'800', color:'#888', letterSpacing:0.5, marginBottom:8, marginTop:20 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:12, paddingHorizontal:14, height:50, borderWidth:1, borderColor:'#e8eaf0', elevation:1 },
  inputIcon:{ fontSize:16, marginRight:10 },
  input:{ flex:1, fontSize:14, color:'#1a1a2e' },
  dateText:{ flex:1, fontSize:14, color:'#555', fontWeight:'600' },
  autoTag:{ fontSize:10, color:'#4caf50', fontWeight:'800', backgroundColor:'#e8f5e9', paddingHorizontal:7, paddingVertical:2, borderRadius:5 },
  bookGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  bookChip:{ paddingVertical:9, paddingHorizontal:12, borderRadius:10, backgroundColor:'#fff', borderWidth:1.5, borderColor:'#e8eaf0', width:'47%', elevation:1 },
  bookChipActive:{ backgroundColor:'#e53935', borderColor:'#e53935' },
  bookChipTxt:{ fontSize:12, fontWeight:'600', color:'#444' },
  bookChipTxtActive:{ color:'#fff' },
  orTxt:{ textAlign:'center', color:'#bbb', fontSize:12, marginTop:14, marginBottom:6 },
  starsRow:{ flexDirection:'row', gap:8, marginBottom:8 },
  star:{ fontSize:44, color:'#ddd' },
  starActive:{ color:'#FFD700' },
  ratingBadge:{ backgroundColor:'#fff8e1', paddingVertical:6, paddingHorizontal:14, borderRadius:8, alignSelf:'flex-start', marginBottom:4 },
  ratingLabel:{ fontSize:13, fontWeight:'700', color:'#f57f17' },
  textarea:{ backgroundColor:'#fff', borderRadius:12, padding:14, fontSize:14, color:'#1a1a2e', minHeight:130, borderWidth:1, borderColor:'#e8eaf0', marginTop:4, elevation:1 },
  submitBtn:{ backgroundColor:'#e53935', padding:16, borderRadius:14, alignItems:'center', marginTop:24, elevation:3 },
  submitTxt:{ color:'#fff', fontWeight:'800', fontSize:16 },
  cancelBtn:{ padding:14, borderRadius:14, alignItems:'center', marginTop:10, borderWidth:1.5, borderColor:'#e8eaf0' },
  cancelTxt:{ color:'#888', fontWeight:'700', fontSize:14 },
  successContainer:{ flex:1, backgroundColor:'#1a1a2e', justifyContent:'center', alignItems:'center', padding:30 },
  successTitle:{ color:'#fff', fontSize:26, fontWeight:'800', marginBottom:10 },
  successSub:{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:40, textAlign:'center', lineHeight:22 },
  successBtn:{ backgroundColor:'#e53935', paddingVertical:14, paddingHorizontal:30, borderRadius:14, width:'100%', alignItems:'center', marginBottom:12 },
  successBtnTxt:{ color:'#fff', fontWeight:'800', fontSize:15 },
  successBtn2:{ backgroundColor:'rgba(255,255,255,0.1)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.2)', paddingVertical:14, paddingHorizontal:30, borderRadius:14, width:'100%', alignItems:'center' },
  successBtn2Txt:{ color:'#fff', fontWeight:'700', fontSize:15 },
});
