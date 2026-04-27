import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', studentId:'', username:'', password:'' });
  const [loading, setLoading] = useState(false);
  const update = (k,v) => setForm(p => ({...p,[k]:v}));

  const handleSignup = async () => {
    const { firstName, lastName, email, phone, studentId, username, password } = form;
    if (!firstName||!lastName||!email||!phone||!studentId||!username||!password) { Alert.alert('Error','Fill all fields'); return; }
    setLoading(true);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(form));
      Alert.alert('Account Created! 🎉','Now login with your credentials.', [{ text:'Login Now', onPress:() => navigation.navigate('Login') }]);
    } catch(e) { Alert.alert('Error','Could not create account'); }
    setLoading(false);
  };

  const fields = [
    {k:'firstName',l:'FIRST NAME',p:'Enter first name',i:'👤'},
    {k:'lastName',l:'LAST NAME',p:'Enter last name',i:'👤'},
    {k:'email',l:'EMAIL',p:'Enter email address',i:'📧'},
    {k:'phone',l:'PHONE',p:'Enter phone number',i:'📱'},
    {k:'studentId',l:'STUDENT ID',p:'Enter student ID',i:'🎓'},
    {k:'username',l:'USERNAME',p:'Choose a username',i:'👤'},
    {k:'password',l:'PASSWORD',p:'Create a password',i:'🔒',sec:true},
  ];

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <View style={s.logo}><Text style={{fontSize:34}}>📚</Text></View>
        <Text style={s.appName}>LibraryGo</Text>
      </View>
      <View style={s.card}>
        <Text style={s.title}>Create Account 🎉</Text>
        <Text style={s.sub}>Join your university library today</Text>
        {fields.map(f => (
          <View key={f.k}>
            <Text style={s.label}>{f.l}</Text>
            <View style={s.row}>
              <Text style={s.icon}>{f.i}</Text>
              <TextInput style={s.input} placeholder={f.p} placeholderTextColor="#bbb" value={form[f.k]} onChangeText={v => update(f.k,v)} secureTextEntry={!!f.sec} autoCapitalize="none"/>
            </View>
          </View>
        ))}
        <TouchableOpacity style={[s.btn,loading&&{opacity:0.7}]} onPress={handleSignup} disabled={loading}>
          <Text style={s.btnTxt}>{loading?'Creating...':'Sign Up'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.loginTxt}>Already have an account? <Text style={{color:'#e53935',fontWeight:'700'}}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container:{flexGrow:1,backgroundColor:'#1a1a2e'},
  header:{alignItems:'center',paddingTop:52,paddingBottom:20,paddingHorizontal:20},
  back:{color:'rgba(255,255,255,0.6)',fontSize:13,alignSelf:'flex-start',marginBottom:14},
  logo:{width:68,height:68,borderRadius:18,backgroundColor:'#e53935',justifyContent:'center',alignItems:'center',marginBottom:10},
  appName:{color:'#fff',fontSize:22,fontWeight:'800'},
  card:{backgroundColor:'#fff',borderTopLeftRadius:28,borderTopRightRadius:28,padding:26},
  title:{fontSize:20,fontWeight:'800',color:'#1a1a2e',marginBottom:3},
  sub:{fontSize:12,color:'#888',marginBottom:18},
  label:{fontSize:11,fontWeight:'700',color:'#888',letterSpacing:0.5,marginBottom:6},
  row:{flexDirection:'row',alignItems:'center',backgroundColor:'#f5f7fb',borderRadius:12,paddingHorizontal:14,height:48,marginBottom:12},
  icon:{fontSize:15,marginRight:10},
  input:{flex:1,fontSize:13,color:'#1a1a2e'},
  btn:{backgroundColor:'#e53935',height:50,borderRadius:13,justifyContent:'center',alignItems:'center',marginTop:8,marginBottom:16},
  btnTxt:{color:'#fff',fontSize:15,fontWeight:'800'},
  loginTxt:{textAlign:'center',color:'#666',fontSize:13},
});
