import {
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';

import {LineChart} from 'react-native-chart-kit';

const Homepage = () => {
  const [data, setData] = useState({0: 0});
  const [loading, setLoading] = useState(true);
  const {width} = useWindowDimensions();
  let unsubscribe;
  useEffect(() => {
    unsubscribe = database()
      .ref('gas_ppm')
      .limitToLast(10)
      .on('child_added', snapshot => {
        const child = snapshot.val();
        if (child.created_at !== undefined && child.value !== undefined) {
          setData(prev => ({...prev, [child.created_at]: child.value}));
        }
      });
    return () => {};
  }, []);

  const putData = () => {
    try {
      firebase
        .database()
        .ref('gas_ppm')
        .push({
          value: Math.floor(Math.random() * 1000),
          created_at: new Date().getTime(),
        });
    } catch (error) {}
  };

  const Chart = () => {
    return (
      <View style={[styles.chartContainer, styles.shadow]}>
        <Text style={styles.containerTitle}>Yanıcı Gaz Ölçüm Tablosu</Text>
        <LineChart
          data={{
            labels: Object.keys(data).slice(-10),
            datasets: [
              {
                data: Object.values(data).slice(-10),
              },
            ],
          }}
          width={width - 48 - 20}
          height={200}
          verticalLabelRotation={30}
          bezier
          formatXLabel={value => {
            return new Date(parseInt(value)).toLocaleTimeString();
          }}
          chartConfig={{
            backgroundColor: 'white',
            backgroundGradientFrom: 'white',
            backgroundGradientTo: 'white',
            decimalPlaces: 2,
            color: (opacity = 1) => '#145674',
            labelColor: (opacity = 1) => `rgba(0, 0, 0, 1)`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#145674',
            },
            propsForLabels: {
              fontSize: '10',
              fill: 'rgba(10, 10, 10, 1)',
              fontWeight: 500,
            },
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[StyleSheet.absoluteFill, styles.page]}>
      <TouchableOpacity onPress={putData} style={styles.header}>
        {/* <Text style={styles.headerText}>Smoke Guard - Duman Dedektörü</Text> */}
        <Text style={styles.headerText}>
          Merhaba, <Text style={styles.name}>Talha</Text>!
        </Text>
      </TouchableOpacity>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.statusEmoji}>😁</Text>
        </View>
        <Chart />
        <View style={styles.rowContainers}>
          <View style={[styles.littleContainer, styles.shadow]}>
            <Text style={styles.containerTitle}>Son Ölçüm</Text>
            <Text style={styles.littleData}>
              {data[Math.max(...Object.keys(data))]}{' '}
              <Text style={styles.unit}>ppm</Text>
            </Text>
            <Text>Normal</Text>
          </View>
          <View style={[styles.littleContainer, styles.shadow]}>
            <Text style={styles.containerTitle}>Sıcaklık</Text>
            <Text style={styles.littleData}>
              33 <Text style={styles.unit}>°C</Text>
            </Text>
            <Text>Normal</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f0f3f4',
  },
  header: {
    marginVertical: 10,
    backgroundColor: '#145674',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
    color: 'white',
  },
  name: {
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
  },
  statusEmoji: {
    fontSize: 100,
    color: 'black',
    textAlign: 'center',
    margin: 10,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 24,
    marginVertical: 10,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  containerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  rowContainers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 19,
    marginVertical: 10,
  },
  littleContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 10,
  },
  littleData: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  unit: {
    fontSize: 20,
    color: 'gray',
  },
});

export default Homepage;
