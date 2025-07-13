import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  console.log('App started');
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Hello World</Text>
    </View>
  );
}
