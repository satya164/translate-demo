import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Text,
  TranslationProvider,
  TranslationContext,
} from './components/Translation';

function Progress() {
  const { loading } = React.useContext(TranslationContext);

  return (
    <SafeAreaView style={styles.loading}>
      {loading && <ActivityIndicator />}
    </SafeAreaView>
  );
}

export default function App() {
  const [language, setLanguage] = React.useState<'en' | 'es'>('en');
  const nextLanguage = language === 'en' ? 'es' : 'en';

  return (
    <TranslationProvider language={language}>
      <View style={styles.container}>
        <Progress />
        <Text style={styles.text}>
          Open up App.tsx to start working on your app!
        </Text>
        <Text style={styles.text}>Some other text</Text>
        <Button
          onPress={() => setLanguage(nextLanguage)}
          title={`Switch to ${nextLanguage}`}
        />
        <StatusBar style="auto" />
      </View>
    </TranslationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  loading: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
