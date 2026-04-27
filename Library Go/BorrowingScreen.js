import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1'];

export default function BorrowingScreen({ navigation, route }) {
  const book = route.params?.book || { title:'Unknown', author:'Unknown', genre:'Fiction', id:'0' };
  const [duration, setDuration] = useState(null);
  const [copy, setCopy] = useState(null);
  const [loading, setLoading] = useState(false);

  const getReturnDate = (weeks) => {
    const d = new Date();
    d.setDate(d.getDate() + weeks * 7);
    return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  };
  const today = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

  const handleConfirm = async () => {
    if (!duration) { Alert.alert('Select Duration','Choose how long to borrow.'); return; }
    if (!copy) { Alert.alert('Select Copy','Choose a copy number.'); return; }
    setLoading(true);
    try {
      const existing = await AsyncStorage.getItem('myBorrowings');
      const list = existing ? JSON.parse(existing) : [];
      const entry = {
        id: Date.now().toString(),
        title: book.title,
        author: book.author,
        genre: book.genre,
        bookId: book.id,
        copy,
        weeks: duration,
        borrowDate: today,
        returnDate: getReturnDate(duration),
        status: 'active',
      };
      await AsyncStorage.setItem('myBorrowings', JSON.stringify([entry, ...list]));
      setLoading(false);
      Alert.alert('Borrowed! 🎉',`"${book.title}" borrowed for ${duration} week(s).\nReturn by: ${getReturnDate(duration)}`,[
        { text:'View My Borrowings', onPress:() => navigation.navigate('MainTabs', { screen:'Borrowings' }) },
      ]);
    } catch(e) { setLoading(false); Alert.alert('Error','Could not complete.'); }
  };

  const colorIdx = parseInt(book.id || '0') % COLORS.length;

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>📚 Borrow Book</Text>
        <Text style={s.sub}>Complete your borrowing request</Text>
      </View>

      {/* Book Info */}
      <View style={s.bookCard}>
        <View style={[s.cover,{backgroundColor:COLORS[colorIdx]}]}><Text style={{fontSize:32}}>📖</Text></View>
        <View style={{flex:1}}>
          <Text style={s.bookTitle}>{book.title}</Text>
          <Text style={s.bookAuthor}>{book.author}</Text>
          <View style={s.tagRow}>
            <View style={s.genreTag}><Text style={s.genreTagTxt}>{book.genre}</Text></View>
            <View style={s.availTag}><Text style={s.availTxt}>✓ Available</Text></View>
          </View>
        </View>
      </View>

      <View style={s.section}>
        {/* Duration */}
        <Text style={s.sectionTitle}>BORROWING DURATION</Text>
        <View style={s.durationRow}>
          {[1,2,3,4].map(w => (
            <TouchableOpacity key={w} style={[s.durBtn, duration===w && s.durBtnActive]} onPress={() => setDuration(w)}>
              <Text style={[s.durTxt, duration===w && s.durTxtActive]}>{w} Week{w>1?'s':''}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dates */}
        <Text style={s.sectionTitle}>BORROW & RETURN DATES</Text>
        <View style={s.datesRow}>
          <View style={s.dateCard}>
            <Text style={s.dateIcon}>📅</Text>
            <Text style={s.dateLabel}>Borrow Date</Text>
            <Text style={s.dateVal}>{today}</Text>
          </View>
          <View style={s.dateCard}>
            <Text style={s.dateIcon}>⏰</Text>
            <Text style={s.dateLabel}>Return By</Text>
            <Text style={[s.dateVal,{color:'#e53935'}]}>{duration ? getReturnDate(duration) : '—'}</Text>
          </View>
        </View>

        {/* Copy */}
        <Text style={s.sectionTitle}>SELECT COPY NUMBER</Text>
        <View style={s.copyRow}>
          {['C1','C2','C3','C4','C5'].map((c, i) => {
            const unavailable = i >= 3;
            return (
              <TouchableOpacity key={c}
                style={[s.copyBtn, copy===c && s.copyBtnActive, unavailable && s.copyBtnDim]}
                onPress={() => !unavailable && setCopy(c)}
                disabled={unavailable}>
                <Text style={[s.copyTxt, copy===c && s.copyTxtActive, unavailable && {color:'#ccc'}]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={s.hint}>Grey = already borrowed</Text>

        {/* Summary */}
        {(duration || copy) && (
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Borrowing Summary</Text>
            <Text style={s.summaryVal}>{duration ? `${duration} Week${duration>1?'s':''}` : '—'} · {copy || '—'}</Text>
          </View>
        )}

        <TouchableOpacity style={[s.confirmBtn, loading&&{opacity:0.7}]} onPress={handleConfirm} disabled={loading}>
          <Text style={s.confirmTxt}>{loading ? 'Processing...' : '✓  Confirm Borrowing'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f5f7fb'},
  header:{backgroundColor:'#1a1a2e',paddingTop:50,paddingHorizontal:20,paddingBottom:20},
  back:{color:'rgba(255,255,255,0.6)',fontSize:13,marginBottom:8},
  title:{color:'#fff',fontSize:20,fontWeight:'800'},
  sub:{color:'rgba(255,255,255,0.5)',fontSize:12,marginTop:3},
  bookCard:{flexDirection:'row',backgroundColor:'#fff',margin:16,borderRadius:16,padding:16,elevation:2,gap:14},
  cover:{width:72,height:100,borderRadius:12,justifyContent:'center',alignItems:'center'},
  bookTitle:{fontSize:15,fontWeight:'800',color:'#1a1a2e',marginBottom:4},
  bookAuthor:{fontSize:12,color:'#888',marginBottom:8},
  tagRow:{flexDirection:'row',gap:8},
  genreTag:{backgroundColor:'#e3f2fd',paddingVertical:3,paddingHorizontal:10,borderRadius:6},
  genreTagTxt:{fontSize:11,fontWeight:'700',color:'#1565c0'},
  availTag:{backgroundColor:'#e8f5e9',paddingVertical:3,paddingHorizontal:10,borderRadius:6},
  availTxt:{fontSize:11,fontWeight:'700',color:'#2e7d32'},
  section:{paddingHorizontal:16,paddingBottom:30},
  sectionTitle:{fontSize:11,fontWeight:'700',color:'#888',letterSpacing:0.5,marginBottom:10,marginTop:16},
  durationRow:{flexDirection:'row',gap:10},
  durBtn:{flex:1,paddingVertical:10,borderRadius:10,borderWidth:1.5,borderColor:'#e8eaf0',alignItems:'center',backgroundColor:'#fff'},
  durBtnActive:{backgroundColor:'#e53935',borderColor:'#e53935'},
  durTxt:{fontSize:13,fontWeight:'700',color:'#666'},
  durTxtActive:{color:'#fff'},
  datesRow:{flexDirection:'row',gap:12},
  dateCard:{flex:1,backgroundColor:'#fff',borderRadius:12,padding:14,borderWidth:1,borderColor:'#e8eaf0'},
  dateIcon:{fontSize:18,marginBottom:4},
  dateLabel:{fontSize:11,color:'#aaa',marginBottom:4},
  dateVal:{fontSize:14,fontWeight:'800',color:'#1a1a2e'},
  copyRow:{flexDirection:'row',gap:10},
  copyBtn:{width:48,height:48,borderRadius:10,borderWidth:1.5,borderColor:'#e8eaf0',justifyContent:'center',alignItems:'center',backgroundColor:'#fff'},
  copyBtnActive:{backgroundColor:'#1a1a2e',borderColor:'#1a1a2e'},
  copyBtnDim:{backgroundColor:'#f5f5f5'},
  copyTxt:{fontSize:13,fontWeight:'800',color:'#1a1a2e'},
  copyTxtActive:{color:'#fff'},
  hint:{fontSize:11,color:'#aaa',marginTop:6},
  summaryRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#fff',borderRadius:12,padding:14,marginTop:16,borderWidth:1,borderColor:'#e8eaf0'},
  summaryLabel:{fontSize:13,color:'#888'},
  summaryVal:{fontSize:14,fontWeight:'800',color:'#e53935'},
  confirmBtn:{backgroundColor:'#e53935',padding:16,borderRadius:14,alignItems:'center',marginTop:16},
  confirmTxt:{color:'#fff',fontWeight:'800',fontSize:15},
});
