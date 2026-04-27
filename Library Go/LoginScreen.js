import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { Alert.alert('Error','Fill all fields'); return; }
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) { Alert.alert('No Account','Sign up first!', [{ text:'Sign Up', onPress:() => navigation.navigate('Signup') }]); setLoading(false); return; }
      const user = JSON.parse(stored);
      if (user.username === username.trim() && user.password === password) {
        await AsyncStorage.setItem('loggedInUser', username.trim());
        await AsyncStorage.setItem('userData', stored);
        setIsLoggedIn(true);
        navigation.reset({ index:0, routes:[{ name:'MainTabs' }] });
      } else {
        Alert.alert('Wrong Credentials','Check username and password.');
      }
    } catch(e) { Alert.alert('Error','Something went wrong'); }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <View style={s.logo}><Text style={{fontSize:38}}>📚</Text></View>
        <Text style={s.appName}>LibraryGo</Text>
        <Text style={s.tagline}>Your University Library, Digital</Text>
      </View>
      <View style={s.card}>
        <Text style={s.title}>Welcome Back 👋</Text>
        <Text style={s.label}>USERNAME</Text>
        <View style={s.row}>
          <Text style={s.icon}>👤</Text>
          <TextInput style={s.input} placeholder="Enter username" placeholderTextColor="#bbb" value={username} onChangeText={setUsername} autoCapitalize="none"/>
        </View>
        <Text style={s.label}>PASSWORD</Text>
        <View style={s.row}>
          <Text style={s.icon}>🔒</Text>
          <TextInput style={s.input} placeholder="Enter password" placeholderTextColor="#bbb" value={password} onChangeText={setPassword} secureTextEntry={!showPass}/>
          <TouchableOpacity onPress={() => setShowPass(!showPass)}><Text style={{fontSize:18}}>{showPass?'🙈':'👁️'}</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={[s.loginBtn, loading && {opacity:0.7}]} onPress={handleLogin} disabled={loading}>
          <Text style={s.loginTxt}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <View style={s.divider}><View style={s.line}/><Text style={s.orTxt}>OR</Text><View style={s.line}/></View>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={s.signupTxt}>New to LibraryGo? <Text style={{color:'#e53935',fontWeight:'700'}}>Create an Account</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container:{flexGrow:1,backgroundColor:'#1a1a2e'},
  header:{alignItems:'center',paddingTop:55,paddingBottom:26,paddingHorizontal:20},
  back:{color:'rgba(255,255,255,0.6)',fontSize:13,alignSelf:'flex-start',marginBottom:16},
  logo:{width:75,height:75,borderRadius:20,backgroundColor:'#e53935',justifyContent:'center',alignItems:'center',marginBottom:12},
  appName:{color:'#fff',fontSize:26,fontWeight:'800',marginBottom:3},
  tagline:{color:'rgba(255,255,255,0.5)',fontSize:13},
  card:{flex:1,backgroundColor:'#fff',borderTopLeftRadius:28,borderTopRightRadius:28,padding:28},
  title:{fontSize:21,fontWeight:'800',color:'#1a1a2e',marginBottom:22},
  label:{fontSize:11,fontWeight:'700',color:'#888',letterSpacing:0.5,marginBottom:7},
  row:{flexDirection:'row',alignItems:'center',backgroundColor:'#f5f7fb',borderRadius:12,paddingHorizontal:14,height:50,marginBottom:15},
  icon:{fontSize:17,marginRight:10},
  input:{flex:1,fontSize:14,color:'#1a1a2e'},
  loginBtn:{backgroundColor:'#e53935',height:50,borderRadius:13,justifyContent:'center',alignItems:'center',marginTop:6,marginBottom:18},
  loginTxt:{color:'#fff',fontSize:15,fontWeight:'800'},
  divider:{flexDirection:'row',alignItems:'center',marginBottom:18},
  line:{flex:1,height:1,backgroundColor:'#eee'},
  orTxt:{marginHorizontal:12,color:'#aaa',fontSize:12},
  signupTxt:{textAlign:'center',color:'#666',fontSize:13},
});
