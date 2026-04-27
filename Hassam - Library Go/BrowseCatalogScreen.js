import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';

const BOOKS = [
  { id:'1', title:'The Great Gatsby', author:'F. Scott Fitzgerald', genre:'Fiction', available:true },
  { id:'2', title:'A Brief History of Time', author:'Stephen Hawking', genre:'Science', available:true },
  { id:'3', title:'Clean Code', author:'Robert C. Martin', genre:'Technology', available:false },
  { id:'4', title:'Sapiens', author:'Yuval Noah Harari', genre:'History', available:true },
  { id:'5', title:'Atomic Habits', author:'James Clear', genre:'Self-Help', available:true },
  { id:'6', title:'1984', author:'George Orwell', genre:'Fiction', available:false },
];
const GENRES = ['All','Fiction','Science','Technology','History','Self-Help'];
const COLORS = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1'];

export default function BrowseCatalogScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');

  const filtered = useMemo(() => BOOKS.filter(b =>
    (genre==='All'||b.genre===genre) &&
    (b.title.toLowerCase().includes(search.toLowerCase())||b.author.toLowerCase().includes(search.toLowerCase()))
  ),[search,genre]);

  const requireLogin = () => Alert.alert('Login Required 🔐','Please login to access this feature.',[
    { text:'Cancel', style:'cancel' },
    { text:'Login', onPress:() => navigation.navigate('Login') }
  ]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>📚 Browse Catalogue</Text>
        <Text style={s.sub}>Explore our library collection</Text>
        <View style={s.searchRow}>
          <Text style={{color:'rgba(255,255,255,0.5)',marginRight:8}}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Search books or authors..." placeholderTextColor="rgba(255,255,255,0.4)" value={search} onChangeText={setSearch}/>
        </View>
      </View>
      <View style={s.genreRow}>
        {GENRES.map(g => (
          <TouchableOpacity key={g} style={[s.pill,genre===g&&s.pillActive]} onPress={() => setGenre(g)}>
            <Text style={[s.pillTxt,genre===g&&s.pillTxtActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.banner} onPress={() => navigation.navigate('Login')}>
        <Text style={s.bannerTxt}>🔐  Login to borrow books & write reviews →</Text>
      </TouchableOpacity>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        removeClippedSubviews
        contentContainerStyle={{padding:14,paddingBottom:20}}
        renderItem={({ item, index }) => (
          <View style={s.card}>
            <View style={[s.cover,{backgroundColor:COLORS[index%COLORS.length]}]}><Text style={{fontSize:26}}>📖</Text></View>
            <View style={{flex:1}}>
              <Text style={s.bookTitle}>{item.title}</Text>
              <Text style={s.bookAuthor}>{item.author}</Text>
              <View style={s.tagRow}>
                <View style={s.genreTag}><Text style={s.genreTagTxt}>{item.genre}</Text></View>
                <View style={[s.availTag,{backgroundColor:item.available?'#e8f5e9':'#ffebee'}]}>
                  <Text style={[s.availTxt,{color:item.available?'#2e7d32':'#c62828'}]}>{item.available?'✓ Available':'✗ Borrowed'}</Text>
                </View>
              </View>
              <View style={s.btnRow}>
                <TouchableOpacity style={[s.borrowBtn,!item.available&&{backgroundColor:'#ccc'}]} onPress={requireLogin}>
                  <Text style={s.borrowTxt}>🔒 Borrow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.reviewBtn} onPress={requireLogin}>
                  <Text style={s.reviewTxt}>⭐ Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f5f7fb'},
  header:{backgroundColor:'#1a1a2e',paddingTop:50,paddingHorizontal:20,paddingBottom:16},
  back:{color:'rgba(255,255,255,0.6)',fontSize:13,marginBottom:8},
  title:{color:'#fff',fontSize:20,fontWeight:'800'},
  sub:{color:'rgba(255,255,255,0.5)',fontSize:12,marginTop:3,marginBottom:12},
  searchRow:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.12)',borderRadius:12,paddingHorizontal:14,height:42},
  searchInput:{flex:1,color:'#fff',fontSize:13},
  genreRow:{flexDirection:'row',flexWrap:'wrap',gap:8,padding:12,backgroundColor:'#fff'},
  pill:{paddingVertical:5,paddingHorizontal:14,borderRadius:20,backgroundColor:'#f5f7fb',borderWidth:1,borderColor:'#e8eaf0'},
  pillActive:{backgroundColor:'#e53935',borderColor:'#e53935'},
  pillTxt:{fontSize:11,fontWeight:'700',color:'#666'},
  pillTxtActive:{color:'#fff'},
  banner:{backgroundColor:'#fff3e0',margin:12,padding:11,borderRadius:12,borderLeftWidth:4,borderLeftColor:'#e53935'},
  bannerTxt:{color:'#e65100',fontWeight:'700',fontSize:12},
  card:{flexDirection:'row',backgroundColor:'#fff',borderRadius:14,padding:12,marginBottom:10,elevation:1},
  cover:{width:58,height:82,borderRadius:10,justifyContent:'center',alignItems:'center',marginRight:12},
  bookTitle:{fontSize:13,fontWeight:'800',color:'#1a1a2e',marginBottom:2},
  bookAuthor:{fontSize:12,color:'#888',marginBottom:7},
  tagRow:{flexDirection:'row',gap:6,marginBottom:9,flexWrap:'wrap'},
  genreTag:{backgroundColor:'#e3f2fd',paddingVertical:2,paddingHorizontal:7,borderRadius:5},
  genreTagTxt:{fontSize:10,fontWeight:'700',color:'#1565c0'},
  availTag:{paddingVertical:2,paddingHorizontal:7,borderRadius:5},
  availTxt:{fontSize:10,fontWeight:'700'},
  btnRow:{flexDirection:'row',gap:7},
  borrowBtn:{backgroundColor:'#e53935',paddingVertical:5,paddingHorizontal:12,borderRadius:7},
  borrowTxt:{color:'#fff',fontSize:11,fontWeight:'700'},
  reviewBtn:{backgroundColor:'#fff8e1',borderWidth:1,borderColor:'#ffe082',paddingVertical:5,paddingHorizontal:12,borderRadius:7},
  reviewTxt:{color:'#f57f17',fontSize:11,fontWeight:'700'},
});
