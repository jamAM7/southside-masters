import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from "./cssStyles/commonStyles";



export default function home() {
  const router = useRouter();

  const handleSettingsPress = () => {
    router.push("/settings"); // Navigates to the Settings page
  };
  const handleScanEventsPress = () => {
    router.push("/scanevents"); // Navigates to the Settings page
  };
  const handleScanRunnersPress = () => {
    router.push("/scanrunners"); // Navigates to the Settings page
  };
  const handleTimingPress = () => {
    router.push("/timing"); // Navigates to the Settings page
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
