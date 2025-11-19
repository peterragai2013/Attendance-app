import React, {useState, useEffect} from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import AttendanceScreen from './src/screens/AttendanceScreen';
import AttendanceTable from './src/components/AttendanceTable';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [records, setRecords] = useState([]);

  useEffect(()=>{ (async ()=>{
    const recs = JSON.parse(await AsyncStorage.getItem('attendance_records') || '[]');
    setRecords(recs);
  })(); },[]);

  function onRecorded(newRec) {
    setRecords(prev => {
      const filtered = prev.filter(r=>r.date !== newRec.date);
      return [newRec, ...filtered];
    });
  }

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView contentContainerStyle={{padding:12}}>
        <AttendanceScreen onRecorded={onRecorded} />
        <View style={{height:12}} />
        <Text style={{fontSize:18,fontWeight:'700',marginBottom:8}}>سجل الحضور</Text>
        <AttendanceTable records={records} workStartIso={new Date().toISOString().slice(0,10)+'T08:00:00'} monthlyOvertimeAlready={0} />
      </ScrollView>
    </SafeAreaView>
  );
}
