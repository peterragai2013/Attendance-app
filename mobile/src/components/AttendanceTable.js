import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { computeDay } from '../utils/calc';
import dayjs from 'dayjs';

export default function AttendanceTable({records, workStartIso, monthlyOvertimeAlready}) {
  let monthlyAccum = monthlyOvertimeAlready || 0;

  const renderItem = ({item}) => {
    const { totalOnSite, paidHours, dailyOvertime } = computeDay(item.checkin, item.checkout);
    const lateMinutes = item.checkin ? Math.max(0, Math.round((new Date(item.checkin) - new Date(workStartIso)) / 60000)) : 0;
    const available = Math.max(0, 60 - monthlyAccum);
    const counted = Math.min(available, dailyOvertime);
    const notCounted = Math.max(0, dailyOvertime - counted);
    monthlyAccum += counted;

    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{dayjs(item.date).format('ddd')}</Text>
        <Text style={styles.cell}>{item.date}</Text>
        <Text style={styles.cell}>{item.checkin ? dayjs(item.checkin).format('HH:mm') : '-'}</Text>
        <Text style={styles.cell}>{item.checkout ? dayjs(item.checkout).format('HH:mm') : '-'}</Text>
        <Text style={styles.cell}>{lateMinutes}m</Text>
        <Text style={styles.cell}>{dailyOvertime.toFixed(2)}h</Text>
        <Text style={styles.cell}>{counted.toFixed(2)}h</Text>
        <Text style={styles.cell}>{notCounted.toFixed(2)}h</Text>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.header}>
        {['اليوم','التاريخ','دخول','خروج','تأخير','أوفر تايم','محسوب','غير محسوب'].map(h=>(
          <Text key={h} style={styles.headerCell}>{h}</Text>
        ))}
      </View>
      <FlatList data={records} keyExtractor={i=>i.date} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  header:{flexDirection:'row', padding:6, backgroundColor:'#eee'},
  headerCell:{flex:1, fontWeight:'700', fontSize:12, textAlign:'center'},
  row:{flexDirection:'row', padding:8, borderBottomWidth:1, borderColor:'#f0f0f0'},
  cell:{flex:1, textAlign:'center'}
});
