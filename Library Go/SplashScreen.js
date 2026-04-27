import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <View style={s.container}>
      <View style={s.iconWrap}><Text style={s.icon}>📚</Text></View>
      <Text style={s.title}>LibraryGo</Text>
      <Text style={s.tagline}>Your University Library, Digital</Text>
      <Text style={s.desc}>Discover, Borrow & Review books from your university library — anytime, anywhere.</Text>
      <TouchableOpacity style={s.btn1} onPress={() => navigation.navigate('BrowseCatalog')}>
        <Text style={s.btn1Txt}>🔍  Browse Catalogue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btn2} onPress={() => navigation.navigate('Reviews')}>
        <Text style={s.btn2Txt}>⭐  Student Reviews</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btn3} onPress={() => navigation.navigate('Login')}>
        <Text style={s.btn3Txt}>👤  Login / Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#1a1a2e',justifyContent:'center',alignItems:'center',padding:30},
  iconWrap:{width:100,height:100,borderRadius:24,backgroundColor:'#e53935',justifyContent:'center',alignItems:'center',marginBottom:24},
  icon:{fontSize:48},
  title:{fontSize:30,fontWeight:'800',color:'#fff',marginBottom:4},
  tagline:{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:16},
  desc:{fontSize:14,color:'rgba(255,255,255,0.5)',textAlign:'center',lineHeight:22,marginBottom:44},
  btn1:{backgroundColor:'#e53935',paddingVertical:14,borderRadius:14,width:'100%',alignItems:'center',marginBottom:10},
  btn1Txt:{color:'#fff',fontSize:15,fontWeight:'700'},
  btn2:{backgroundColor:'#fff8e1',borderWidth:1.5,borderColor:'#FFD700',paddingVertical:14,borderRadius:14,width:'100%',alignItems:'center',marginBottom:10},
  btn2Txt:{color:'#f57f17',fontSize:15,fontWeight:'700'},
  btn3:{backgroundColor:'rgba(255,255,255,0.1)',borderWidth:1.5,borderColor:'rgba(255,255,255,0.2)',paddingVertical:14,borderRadius:14,width:'100%',alignItems:'center'},
  btn3Txt:{color:'#fff',fontSize:15,fontWeight:'700'},
});
