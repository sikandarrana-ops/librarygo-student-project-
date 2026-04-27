import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1'];

export default function MyBorrowingsScreen({ navigation }) {
  const [borrowings, setBorrowings] = useState([]);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('myBorrowings').then(d => setBorrowings(d ? JSON.parse(d) : []));
  }, []));

  const getDaysLeft = (returnDate) => {
    const parts = returnDate.split(' ');
    const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    const ret = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
    return Math.ceil((ret - new Date()) / 86400000);
  };

  const cancelBorrowing = (id) => {
    Alert.alert('Cancel Borrowing','Are you sure?',[
      { text:'No', style:'cancel' },
      { text:'Yes', style:'destructive', onPress: async () => {
        const updated = borrowings.filter(b => b.id !== id);
        setBorrowings(updated);
        await AsyncStorage.setItem('myBorrowings', JSON.stringify(updated));
      }}
    ]);
  };

  const active = borrowings.filter(b => b.status !== 'returned');

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>My Borrowings 📋</Text>
        <Text style={s.sub}>Track your active and past loans</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[['Active', active.length],['Total', borrowings.length],['Returned', borrowings.length - active.length]].map(([l,v]) => (
          <View key={l} style={s.stat}><Text style={s.statNum}>{v}</Text><Text style={s.statLbl}>{l}</Text></View>
        ))}
      </View>

      {borrowings.length === 0 ? (
        <View style={s.empty}>
          <Text style={{fontSize:50,marginBottom:16}}>📚</Text>
          <Text style={s.emptyTxt}>No borrowings yet</Text>
          <Text style={s.emptySub}>Browse the catalogue and borrow a book!</Text>
        </View>
      ) : (
        <>
          <Text style={s.sectionTitle}>Active Borrowings</Text>
          <FlatList
            data={active}
            keyExtractor={i => i.id}
            contentContainerStyle={{padding:16,paddingBottom:20}}
            renderItem={({ item, index }) => {
              const days = getDaysLeft(item.returnDate);
              const progress = Math.max(0, Math.min(1, (item.weeks*7 - days) / (item.weeks*7)));
              return (
                <View style={s.card}>
                  <View style={s.cardTop}>
                    <View style={[s.cover,{backgroundColor:COLORS[index%COLORS.length]}]}>
                      <Text style={{fontSize:22}}>📖</Text>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={s.bookTitle}>{item.title}</Text>
                      <Text style={s.bookAuthor}>{item.author}</Text>
                      <View style={s.dateRow}>
                        <View style={s.dateChip}><Text style={s.dateChipTxt}>📅 {item.borrowDate}</Text></View>
                        <View style={[s.dateChip,{backgroundColor:'#fff3e0'}]}><Text style={[s.dateChipTxt,{color:'#e65100'}]}>⏰ {item.returnDate}</Text></View>
                      </View>
                    </View>
                  </View>
                  <View style={s.progressRow}>
                    <View style={{flex:1,marginRight:12}}>
                      <Text style={s.daysLeft}>{days > 0 ? `${days} days remaining` : 'Overdue!'}</Text>
                      <View style={s.progBar}>
                        <View style={[s.progFill,{width:`${progress*100}%`,backgroundColor:days<=3?'#e53935':'#e53935'}]}/>
                      </View>
                    </View>
                    <TouchableOpacity style={s.cancelBtn} onPress={() => cancelBorrowing(item.id)}>
                      <Text style={s.cancelTxt}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f5f7fb'},
  header:{backgroundColor:'#1a1a2e',paddingTop:50,paddingHorizontal:20,paddingBottom:20},
  title:{color:'#fff',fontSize:22,fontWeight:'800'},
  sub:{color:'rgba(255,255,255,0.5)',fontSize:13,marginTop:4},
  statsRow:{flexDirection:'row',gap:12,paddingHorizontal:16,marginTop:14,marginBottom:4},
  stat:{flex:1,backgroundColor:'#fff',borderRadius:14,padding:14,alignItems:'center',elevation:1},
  statNum:{fontSize:22,fontWeight:'800',color:'#e53935'},
  statLbl:{fontSize:11,color:'#888',marginTop:2},
  sectionTitle:{fontSize:14,fontWeight:'800',color:'#1a1a2e',paddingHorizontal:16,marginTop:8,marginBottom:4},
  empty:{flex:1,justifyContent:'center',alignItems:'center',padding:40},
  emptyTxt:{fontSize:18,fontWeight:'800',color:'#1a1a2e',marginBottom:8},
  emptySub:{fontSize:13,color:'#888',textAlign:'center'},
  card:{backgroundColor:'#fff',borderRadius:14,padding:14,marginBottom:12,elevation:1},
  cardTop:{flexDirection:'row',gap:12,marginBottom:12},
  cover:{width:52,height:72,borderRadius:10,justifyContent:'center',alignItems:'center'},
  bookTitle:{fontSize:13,fontWeight:'800',color:'#1a1a2e',marginBottom:3},
  bookAuthor:{fontSize:12,color:'#888',marginBottom:8},
  dateRow:{flexDirection:'row',gap:6,flexWrap:'wrap'},
  dateChip:{backgroundColor:'#e3f2fd',paddingVertical:3,paddingHorizontal:9,borderRadius:6},
  dateChipTxt:{fontSize:11,fontWeight:'600',color:'#1565c0'},
  progressRow:{flexDirection:'row',alignItems:'center'},
  daysLeft:{fontSize:11,color:'#aaa',marginBottom:5},
  progBar:{height:6,backgroundColor:'#f0f0f0',borderRadius:3,overflow:'hidden'},
  progFill:{height:'100%',borderRadius:3},
  cancelBtn:{backgroundColor:'#fff5f5',borderWidth:1,borderColor:'#ffcdd2',paddingVertical:7,paddingHorizontal:14,borderRadius:8},
  cancelTxt:{color:'#e53935',fontSize:12,fontWeight:'700'},
});
