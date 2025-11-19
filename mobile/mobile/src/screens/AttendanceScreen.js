import React, {useState, useEffect} from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { computeDay } from '../utils/calc';

export default function AttendanceScreen({onRecorded}) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [checkin, setCheckin] = useState(null);

  useEffect(()=>{ (async ()=>{
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = has && await LocalAuthentication.isEnrolledAsync();
    setIsAvailable(enrolled);
    const last = await AsyncStorage.getItem('lastCheckin');
    if(last) setCheckin(last);
  })(); },[]);

  async function doBiometric(prompt) {
    if(!isAvailable) return false;
    const res = await LocalAuthentication.authenticateAsync({promptMessage: prompt, cancelLabel: 'إلغاء'});
    return res.success;
  }

  async function handleCheckIn() {
    const ok = await doBiometric('سجل حضورك باستخدام البصمة');
    if(!ok) return Alert.alert('فشل التحقق');
    const now = new Date().toISOString();
    setCheckin(now);
    await AsyncStorage.setItem('lastCheckin', now);
    Alert.alert('تم تسجيل الدخول', dayjs(now).format('YYYY-MM-DD HH:mm'));
  }

  async function handleCheckOut() {
    const ok = await doBiometric('سجل انصرافك باستخدام البصمة');
    if(!ok) return Alert.alert('فشل التحقق');
    const now = new Date().toISOString();
    const calc = computeDay(checkin, now);
    Alert.alert('ملخص اليوم', `ساعات في الموقع: ${calc.totalOnSite.toFixed(2)}\nساعات مدفوعة: ${calc.paidHours.toFixed(2)}\nأوفر تايم: ${calc.dailyOvertime.toFixed(2)}h`);
    const record = { date: dayjs(now).format('YYYY-MM-DD'), checkin, checkout: now };
    const existing = JSON.parse(await AsyncStorage.getItem('attendance_records') || '[]');
    const filtered = existing.filter(r=>r.date !== record.date);
    filtered.unshift(record);
    await AsyncStorage.setItem('attendance_records', JSON.stringify(filtered));
    if(onRecorded) onRecorded(record);
  }

  return (
    <View style={{padding:16}}>
      <Text>البصمة متاحة: {isAvailable ? 'نعم' : 'لا'}</Text>
      <View style={{height:10}} />
      <Button title="تسجيل حضور (بصمة)" onPress={handleCheckIn} />
      <View style={{height:8}} />
      <Button title="تسجيل انصراف (بصمة)" onPress={handleCheckOut} />
      <View style={{height:16}} />
      <Text>آخر حضور: {checkin ? dayjs(checkin).format('YYYY-MM-DD HH:mm') : '-'}</Text>
    </View>
  );
  }
