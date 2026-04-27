import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [borrowCount, setBorrowCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const u = await AsyncStorage.getItem('loggedInUser');
      const ud = await AsyncStorage.getItem('userData');
      const bw = await AsyncStorage.getItem('myBorrowings');
      const rv = await AsyncStorage.getItem('reviews');
      const rl = await AsyncStorage.getItem('readingList');
      if(u) setUsername(u);
      if(ud) setUserData(JSON.parse(ud));
      setBorrowCount(bw ? JSON.parse(bw).length : 0);
      setReviewCount(rv ? JSON.parse(rv).length : 0);
      setSavedCount(rl ? JSON.parse(rl).length : 0);
    };
    load();
  }, []));

  const handleLogout = () => {
    Alert.alert('Logout','Are you sure you want to logout?',[
      { text:'Cancel', style:'cancel' },
      { text:'Logout', style:'destructive', onPress: async () => {
        await AsyncStorage.removeItem('loggedInUser');
        navigation.reset({ index:0, routes:[{ name:'Splash' }] });
      }}
    ]);
  };

  const initials = userData ? `${userData.firstName?.charAt(0)||''}${userData.lastName?.charAt(0)||''}` : username.substring(0,2).toUpperCase();
  const fullName = userData ? `${userData.firstName} ${userData.lastName}` : username;

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{initials}</Text></View>
        <Text style={s.name}>{fullName}</Text>
        <Text style={s.handle}>@{username} · Student Member</Text>
      </View>

      <View style={s.statsRow}>
        {[['Active', borrowCount],['Borrowed', borrowCount],['Reviews', reviewCount],['Saved', savedCount]].map(([l,v]) => (
          <View key={l} style={s.stat}><Text style={s.statNum}>{v}</Text><Text style={s.statLbl}>{l}</Text></View>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>ACCOUNT</Text>
        {[
          { icon:'👤', title:'Personal Info', sub: userData ? `${username} · ${userData.email}` : username },
          { icon:'📋', title:'Borrowing History', sub:`${borrowCount} books total` },
          { icon:'⭐', title:'My Reviews', sub:`${reviewCount} reviews written` },
        ].map(item => (
          <View key={item.title} style={s.menuItem}>
            <View style={s.menuIcon}><Text style={{fontSize:18}}>{item.icon}</Text></View>
            <View style={{flex:1}}>
              <Text style={s.menuTitle}>{item.title}</Text>
              <Text style={s.menuSub}>{item.sub}</Text>
            </View>
            <Text style={{color:'#ccc',fontSize:20}}>›</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={{fontSize:18}}>🚪</Text>
        <Text style={s.logoutTxt}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f5f7fb'},
  header:{backgroundColor:'#1a1a2e',paddingTop:52,paddingBottom:30,alignItems:'center',paddingHorizontal:20},
  avatar:{width:80,height:80,borderRadius:40,backgroundColor:'#e53935',justifyContent:'center',alignItems:'center',marginBottom:12,borderWidth:3,borderColor:'rgba(255,255,255,0.2)'},
  avatarTxt:{color:'#fff',fontSize:28,fontWeight:'800'},
  name:{color:'#fff',fontSize:20,fontWeight:'800',marginBottom:4},
  handle:{color:'rgba(255,255,255,0.5)',fontSize:13},
  statsRow:{flexDirection:'row',gap:10,paddingHorizontal:14,marginTop:14,marginBottom:4},
  stat:{flex:1,backgroundColor:'#fff',borderRadius:14,padding:12,alignItems:'center',elevation:1},
  statNum:{fontSize:18,fontWeight:'800',color:'#e53935'},
  statLbl:{fontSize:10,color:'#888',marginTop:2},
  section:{paddingHorizontal:16,marginTop:16,marginBottom:8},
  sectionTitle:{fontSize:11,fontWeight:'700',color:'#888',letterSpacing:0.5,marginBottom:10},
  menuItem:{backgroundColor:'#fff',borderRadius:14,padding:14,marginBottom:8,flexDirection:'row',alignItems:'center',elevation:1},
  menuIcon:{width:38,height:38,borderRadius:10,backgroundColor:'#e3f2fd',justifyContent:'center',alignItems:'center',marginRight:12},
  menuTitle:{fontSize:14,fontWeight:'700',color:'#1a1a2e'},
  menuSub:{fontSize:12,color:'#aaa',marginTop:2},
  logoutBtn:{marginHorizontal:16,marginBottom:30,padding:14,backgroundColor:'#fff5f5',borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',borderWidth:1.5,borderColor:'#ffcdd2',gap:8},
  logoutTxt:{color:'#e53935',fontSize:15,fontWeight:'700'},
});
