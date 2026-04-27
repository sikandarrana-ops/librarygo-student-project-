import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1'];

export default function ReadingListScreen({ navigation }) {
  const [list, setList] = useState([]);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('readingList').then(d => setList(d ? JSON.parse(d) : []));
  }, []));

  const remove = async (id) => {
    const updated = list.filter(b => b.id !== id);
    setList(updated);
    await AsyncStorage.setItem('readingList', JSON.stringify(updated));
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Reading List 🔖</Text>
        <Text style={s.sub}>{list.length} book{list.length!==1?'s':''} saved for later</Text>
      </View>

      {list.length === 0 ? (
        <View style={s.empty}>
          <Text style={{fontSize:50,marginBottom:16}}>🔖</Text>
          <Text style={s.emptyTxt}>Your reading list is empty</Text>
          <Text style={s.emptySub}>Tap 🔖 on any book to save it here</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={i => i.id}
          contentContainerStyle={{padding:16,paddingBottom:20}}
          renderItem={({ item, index }) => (
            <View style={s.card}>
              <View style={[s.cover,{backgroundColor:COLORS[index%COLORS.length]}]}>
                <Text style={{fontSize:26}}>📖</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={s.bookTitle}>{item.title}</Text>
                <Text style={s.bookAuthor}>{item.author}</Text>
                <View style={s.genreTag}><Text style={s.genreTagTxt}>{item.genre}</Text></View>
                <View style={s.btnRow}>
                  <TouchableOpacity style={s.bookBtn} onPress={() => navigation.navigate('Borrowing', { book: item })}>
                    <Text style={s.bookTxt}>Book Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.removeBtn} onPress={() => remove(item.id)}>
                    <Text style={s.removeTxt}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f5f7fb'},
  header:{backgroundColor:'#1a1a2e',paddingTop:50,paddingHorizontal:20,paddingBottom:20},
  title:{color:'#fff',fontSize:22,fontWeight:'800'},
  sub:{color:'rgba(255,255,255,0.5)',fontSize:13,marginTop:4},
  empty:{flex:1,justifyContent:'center',alignItems:'center',padding:40},
  emptyTxt:{fontSize:18,fontWeight:'800',color:'#1a1a2e',marginBottom:8},
  emptySub:{fontSize:13,color:'#888',textAlign:'center'},
  card:{flexDirection:'row',backgroundColor:'#fff',borderRadius:14,padding:14,marginBottom:12,elevation:1,gap:12},
  cover:{width:62,height:86,borderRadius:10,justifyContent:'center',alignItems:'center'},
  bookTitle:{fontSize:13,fontWeight:'800',color:'#1a1a2e',marginBottom:3},
  bookAuthor:{fontSize:12,color:'#888',marginBottom:8},
  genreTag:{backgroundColor:'#e3f2fd',paddingVertical:3,paddingHorizontal:10,borderRadius:6,alignSelf:'flex-start',marginBottom:10},
  genreTagTxt:{fontSize:11,fontWeight:'700',color:'#1565c0'},
  btnRow:{flexDirection:'row',gap:8},
  bookBtn:{backgroundColor:'#e53935',paddingVertical:7,paddingHorizontal:16,borderRadius:8},
  bookTxt:{color:'#fff',fontSize:12,fontWeight:'700'},
  removeBtn:{backgroundColor:'#fff5f5',borderWidth:1,borderColor:'#ffcdd2',paddingVertical:7,paddingHorizontal:16,borderRadius:8},
  removeTxt:{color:'#e53935',fontSize:12,fontWeight:'700'},
});
