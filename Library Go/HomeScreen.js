import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TouchableNativeFeedback,
  StyleSheet, TextInput, ScrollView, Alert, RefreshControl,
  Animated, PanResponder, SafeAreaView, Modal, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS = [
  { id:'1', title:'The Great Gatsby',       author:'F. Scott Fitzgerald', genre:'Fiction',    available:true  },
  { id:'2', title:'A Brief History of Time',author:'Stephen Hawking',     genre:'Science',    available:true  },
  { id:'3', title:'Clean Code',             author:'Robert C. Martin',    genre:'Technology', available:false },
  { id:'4', title:'Sapiens',                author:'Yuval Noah Harari',   genre:'History',    available:true  },
  { id:'5', title:'Atomic Habits',          author:'James Clear',         genre:'Self-Help',  available:true  },
  { id:'6', title:'1984',                   author:'George Orwell',       genre:'Fiction',    available:false },
];
const GENRES = ['All','Fiction','Science','Technology','History','Self-Help'];
const COLORS = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1'];
const STORAGE_GENRE_KEY = 'selectedGenre';

// ── Swipeable Book Card ──────────────────────────────────────────────────────
function SwipeableCard({ item, index, onBorrow, onSave, onReview, onLongPress }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(null); // 'left' | 'right' | null

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        // limit drag to ±110
        const clamped = Math.max(-110, Math.min(110, g.dx));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -60) {
          // swipe left → Save
          Animated.spring(translateX, { toValue: -110, useNativeDriver: true }).start();
          setSwiped('left');
        } else if (g.dx > 60) {
          // swipe right → Borrow
          Animated.spring(translateX, { toValue: 110, useNativeDriver: true }).start();
          setSwiped('right');
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          setSwiped(null);
        }
      },
    })
  ).current;

  const resetCard = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    setSwiped(null);
  };

  const handleSwipeAction = () => {
    if (swiped === 'left') { onSave(item); resetCard(); }
    if (swiped === 'right') { onBorrow(item); resetCard(); }
  };

  return (
    <View style={sw.wrapper}>
      {/* Left reveal (Borrow) */}
      <View style={[sw.reveal, sw.revealRight]}>
        <Text style={sw.revealIcon}>📚</Text>
        <Text style={sw.revealLabel}>Borrow</Text>
      </View>
      {/* Right reveal (Save) */}
      <View style={[sw.reveal, sw.revealLeft]}>
        <Text style={sw.revealIcon}>🔖</Text>
        <Text style={sw.revealLabel}>Save</Text>
      </View>

      <Animated.View
        style={[sw.card, { transform:[{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onLongPress={() => onLongPress(item)}
          onPress={swiped ? handleSwipeAction : undefined}
          delayLongPress={450}
        >
          <View style={s.cardInner}>
            <View style={[s.cover,{ backgroundColor: COLORS[index % COLORS.length] }]}>
              <Text style={{ fontSize:26 }}>📖</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={s.bookTitle}>{item.title}</Text>
              <Text style={s.bookAuthor}>{item.author}</Text>
              <View style={s.tagRow}>
                <View style={s.genreTag}>
                  <Text style={s.genreTagTxt}>{item.genre}</Text>
                </View>
                <View style={[s.availTag,{ backgroundColor: item.available?'#e8f5e9':'#ffebee' }]}>
                  <Text style={[s.availTxt,{ color: item.available?'#2e7d32':'#c62828' }]}>
                    {item.available ? '✓ Available' : '✗ Borrowed'}
                  </Text>
                </View>
              </View>
              <View style={s.btnRow}>
                <TouchableOpacity
                  style={[s.borrowBtn, !item.available&&{ backgroundColor:'#ccc' }]}
                  onPress={() => onBorrow(item)}
                  disabled={!item.available}
                >
                  <Text style={s.borrowTxt}>📚 Borrow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={() => onSave(item)}>
                  <Text style={s.saveTxt}>🔖</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.reviewBtn} onPress={onReview}>
                  <Text style={s.reviewTxt}>⭐</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Quick Details Modal ──────────────────────────────────────────────────────
function QuickDetailsModal({ book, onClose, onBorrow, onSave }) {
  if (!book) return null;
  const idx = BOOKS.findIndex(b => b.id === book.id);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={qd.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={qd.sheet}>
          <View style={qd.handle} />
          <View style={[qd.cover,{ backgroundColor: COLORS[idx%COLORS.length] }]}>
            <Text style={{ fontSize:48 }}>📖</Text>
          </View>
          <Text style={qd.title}>{book.title}</Text>
          <Text style={qd.author}>by {book.author}</Text>
          <View style={qd.tags}>
            <View style={s.genreTag}><Text style={s.genreTagTxt}>{book.genre}</Text></View>
            <View style={[s.availTag,{ backgroundColor: book.available?'#e8f5e9':'#ffebee' }]}>
              <Text style={[s.availTxt,{ color: book.available?'#2e7d32':'#c62828' }]}>
                {book.available ? '✓ Available' : '✗ Borrowed'}
              </Text>
            </View>
          </View>
          <View style={qd.row}>
            <TouchableOpacity
              style={[qd.btn,{ backgroundColor:'#e53935' }, !book.available&&{ backgroundColor:'#ccc' }]}
              onPress={() => { onBorrow(book); onClose(); }}
              disabled={!book.available}
            >
              <Text style={qd.btnTxt}>📚  Borrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[qd.btn,{ backgroundColor:'#f5f7fb', borderWidth:1.5, borderColor:'#e8eaf0' }]}
              onPress={() => { onSave(book); onClose(); }}
            >
              <Text style={[qd.btnTxt,{ color:'#333' }]}>🔖  Save</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={qd.closeBtn} onPress={onClose}>
            <Text style={qd.closeTxt}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [search, setSearch]     = useState('');
  const [genre, setGenre]       = useState('All');
  const [username, setUsername] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [quickBook, setQuickBook]   = useState(null);

  // Load persisted genre + username on mount
  useEffect(() => {
    const load = async () => {
      const [u, g] = await Promise.all([
        AsyncStorage.getItem('loggedInUser'),
        AsyncStorage.getItem(STORAGE_GENRE_KEY),
      ]);
      if (u) setUsername(u);
      if (g) setGenre(g);
    };
    load();
  }, []);

  // Persist genre whenever it changes
  const handleGenreChange = async (g) => {
    setGenre(g);
    await AsyncStorage.setItem(STORAGE_GENRE_KEY, g);
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const filtered = useMemo(() => BOOKS.filter(b =>
    (genre === 'All' || b.genre === genre) &&
    (b.title.toLowerCase().includes(search.toLowerCase()) ||
     b.author.toLowerCase().includes(search.toLowerCase()))
  ), [search, genre]);

  const addToReadingList = async (book) => {
    const wl = await AsyncStorage.getItem('readingList');
    const list = wl ? JSON.parse(wl) : [];
    if (list.find(b => b.id === book.id)) {
      Alert.alert('Already Saved','This book is already in your reading list.');
      return;
    }
    await AsyncStorage.setItem('readingList', JSON.stringify([...list, book]));
    Alert.alert('Saved! 🔖', `"${book.title}" added to your Reading List.`);
  };

  const handleBorrow = (book) => {
    if (!book.available) { Alert.alert('Not Available','This book is currently borrowed.'); return; }
    navigation.navigate('Borrowing', { book });
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>{getGreeting()}</Text>
              <Text style={s.username}>{username || 'Reader'} 👋</Text>
            </View>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{(username || 'R').charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search books..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 &&
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:16, marginLeft:8 }}>✕</Text>
              </TouchableOpacity>
            }
          </View>
        </View>

        {/* Genre Pills – persisted */}
        <View style={s.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScroll}
          >
            {GENRES.map(g => (
              <TouchableOpacity
                key={g}
                style={[s.pill, genre === g && s.pillActive]}
                onPress={() => handleGenreChange(g)}
                activeOpacity={0.75}
              >
                <Text style={[s.pillTxt, genre === g && s.pillTxtActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={s.hint}>💡 Swipe card to borrow/save  •  Long-press for details</Text>
        <Text style={s.resultCount}>{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</Text>

        {/* Book list with pull-to-refresh */}
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          removeClippedSubviews
          contentContainerStyle={{ paddingHorizontal:14, paddingBottom:24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#e53935']}
              tintColor="#e53935"
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize:48 }}>📭</Text>
              <Text style={s.emptyTxt}>No books found</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <SwipeableCard
              item={item}
              index={index}
              onBorrow={handleBorrow}
              onSave={addToReadingList}
              onReview={() => navigation.navigate('Reviews')}
              onLongPress={setQuickBook}
            />
          )}
        />

        {/* Quick Details Modal (tap-and-hold) */}
        <QuickDetailsModal
          book={quickBook}
          onClose={() => setQuickBook(null)}
          onBorrow={handleBorrow}
          onSave={addToReadingList}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#1a1a2e' },
  container:{ flex:1, backgroundColor:'#f5f7fb' },
  header:{ backgroundColor:'#1a1a2e', paddingTop:14, paddingHorizontal:18, paddingBottom:16 },
  headerTop:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  greeting:{ color:'rgba(255,255,255,0.5)', fontSize:12 },
  username:{ color:'#fff', fontSize:20, fontWeight:'800' },
  avatar:{ width:40, height:40, borderRadius:20, backgroundColor:'#e53935', justifyContent:'center', alignItems:'center' },
  avatarTxt:{ color:'#fff', fontWeight:'800', fontSize:17 },
  searchBar:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:12, paddingHorizontal:14, height:44 },
  searchIcon:{ fontSize:15, marginRight:10, color:'rgba(255,255,255,0.5)' },
  searchInput:{ flex:1, color:'#fff', fontSize:14 },
  filterSection:{ backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#f0f0f0', height:56, justifyContent:'center' },
  filterScroll:{ paddingHorizontal:14, gap:8, alignItems:'center' },
  pill:{ height:34, paddingHorizontal:16, borderRadius:17, backgroundColor:'#f5f7fb', borderWidth:1.5, borderColor:'#e8eaf0', justifyContent:'center', alignItems:'center' },
  pillActive:{ backgroundColor:'#e53935', borderColor:'#e53935' },
  pillTxt:{ fontSize:12, fontWeight:'700', color:'#666' },
  pillTxtActive:{ color:'#fff' },
  hint:{ fontSize:10, color:'#bbb', textAlign:'center', paddingTop:8, paddingBottom:2, fontStyle:'italic' },
  resultCount:{ fontSize:11, color:'#999', fontWeight:'600', paddingHorizontal:16, paddingTop:4, paddingBottom:6 },
  cardInner:{ flexDirection:'row', padding:12 },
  cover:{ width:60, height:84, borderRadius:10, justifyContent:'center', alignItems:'center', marginRight:12 },
  bookTitle:{ fontSize:13, fontWeight:'800', color:'#1a1a2e', marginBottom:2 },
  bookAuthor:{ fontSize:12, color:'#888', marginBottom:7 },
  tagRow:{ flexDirection:'row', gap:6, marginBottom:9, flexWrap:'wrap' },
  genreTag:{ backgroundColor:'#e3f2fd', paddingVertical:2, paddingHorizontal:7, borderRadius:5 },
  genreTagTxt:{ fontSize:10, fontWeight:'700', color:'#1565c0' },
  availTag:{ paddingVertical:2, paddingHorizontal:7, borderRadius:5 },
  availTxt:{ fontSize:10, fontWeight:'700' },
  btnRow:{ flexDirection:'row', gap:6 },
  borrowBtn:{ backgroundColor:'#e53935', paddingVertical:6, paddingHorizontal:12, borderRadius:8 },
  borrowTxt:{ color:'#fff', fontSize:11, fontWeight:'700' },
  saveBtn:{ backgroundColor:'#f5f7fb', borderWidth:1, borderColor:'#e8eaf0', paddingVertical:6, paddingHorizontal:10, borderRadius:8 },
  saveTxt:{ fontSize:14 },
  reviewBtn:{ backgroundColor:'#fff8e1', borderWidth:1, borderColor:'#ffe082', paddingVertical:6, paddingHorizontal:10, borderRadius:8 },
  reviewTxt:{ fontSize:14 },
  empty:{ alignItems:'center', marginTop:60 },
  emptyTxt:{ color:'#aaa', fontSize:14, marginTop:10, fontWeight:'600' },
});

const sw = StyleSheet.create({
  wrapper:{ marginBottom:10, position:'relative' },
  card:{ backgroundColor:'#fff', borderRadius:14, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, shadowOffset:{width:0,height:2} },
  reveal:{ position:'absolute', top:0, bottom:0, width:110, borderRadius:14, justifyContent:'center', alignItems:'center' },
  revealLeft:{ right:0, backgroundColor:'#43e97b' },
  revealRight:{ left:0, backgroundColor:'#e53935' },
  revealIcon:{ fontSize:26, marginBottom:4 },
  revealLabel:{ fontSize:11, fontWeight:'800', color:'#fff' },
});

const qd = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, padding:24, alignItems:'center', paddingBottom:36 },
  handle:{ width:40, height:4, backgroundColor:'#ddd', borderRadius:2, marginBottom:20 },
  cover:{ width:80, height:110, borderRadius:14, justifyContent:'center', alignItems:'center', marginBottom:14 },
  title:{ fontSize:18, fontWeight:'800', color:'#1a1a2e', textAlign:'center', marginBottom:4 },
  author:{ fontSize:13, color:'#888', marginBottom:14 },
  tags:{ flexDirection:'row', gap:8, marginBottom:24 },
  row:{ flexDirection:'row', gap:12, width:'100%', marginBottom:14 },
  btn:{ flex:1, paddingVertical:13, borderRadius:12, alignItems:'center' },
  btnTxt:{ color:'#fff', fontWeight:'800', fontSize:14 },
  closeBtn:{ paddingVertical:10 },
  closeTxt:{ color:'#aaa', fontSize:13, fontWeight:'600' },
});
