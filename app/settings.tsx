import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from "./cssStyles/commonStyles";



export default function settings() {
  const router = useRouter();

  const handleSettingsPress = () => {
    router.push("/settings"); // Navigates to the Settings page
  };
  const handleHomePress = () => {
    router.push("/"); // Navigates to the Settings page
  };
  
  return (

    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Settings Page</Text>

        <Pressable onPress={handleSettingsPress} style={styles.settingsButton}>
          <Image  source={require('./images/Windows_Settings_app_icon.png')} style={styles.settingsImage}/>
        </Pressable>
      </View>


    <View style={styles.scanEventsContainer}>

    </View>

    <Pressable onPress={handleHomePress} style={styles.backTab}>
        <Text style={styles.backTabText} >Back</Text>
    </Pressable>


    </View>
    
    
  );
}
