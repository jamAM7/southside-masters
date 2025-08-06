import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, Pressable, Text, View, Alert } from "react-native";
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from "./cssStyles/commonStyles";

let hasShownAirplaneAlert = false; // Track alert only per app session

export default function home() {
  const router = useRouter();

  useEffect(() => {
    if (!hasShownAirplaneAlert) {
      Alert.alert(
        "Turn On Airplane Mode",
        "Please enable Airplane Mode to prevent interruptions during scanning."
      );
      hasShownAirplaneAlert = true;
    }
  }, []);

  const handleSettingsPress = () => {
    router.push("/settings");
  };
  const handleScanEventsPress = () => {
    router.push("/scanevents");
  };
  const handleScanRunnersPress = () => {
    router.push("/scanrunners");
  };
  const handleTimingPress = () => {
    router.push("/timing");
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>South Side Masters</Text>
        {/* <Pressable onPress={handleSettingsPress} style={styles.settingsButton}>
          <Image  source={require('./images/Windows_Settings_app_icon.png')} style={styles.settingsImage}/>
        </Pressable> */}
      </View>

      <Pressable onPress={handleScanEventsPress} style={styles.scanEventsTab}>
        <Text style={styles.pagesContainerText}>Scan Events</Text>
      </Pressable>

      <Pressable onPress={handleScanRunnersPress} style={styles.scanningTab}>
        <Text style={styles.pagesContainerText}>Scan Runners</Text>
      </Pressable>

      <Pressable onPress={handleTimingPress} style={styles.timingTab}>
        <Text style={styles.pagesContainerText}>Timing</Text>
      </Pressable>
    </View>
  );
}