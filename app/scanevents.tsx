import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  Text,
  View,
  Alert,
  Animated,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./cssStyles/commonStyles";

// Define entry type for list rendering
type ScanEntry = {
  type: "athlete";
  data: string;
  race: string;
};

export default function ScanEvents() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  const [scanResultColor, setScanResultColor] = useState<string>("#FFFFFF");
  const [scannedItems, setScannedItems] = useState<ScanEntry[]>([]);
  const [raceCount, setRaceCount] = useState<string>("1");

  useEffect(() => {
    const loadData = async () => {
      const stored = await AsyncStorage.getItem("scannedItems_scanEvents");
      if (stored) setScannedItems(JSON.parse(stored));
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("scannedItems_scanEvents", JSON.stringify(scannedItems));
  }, [scannedItems]);

  const interpolatedColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", scanResultColor],
  });

  const handleSettingsPress = () => {
    Alert.alert("Clear All Data", "Are you sure you want to clear all scanned data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setScannedItems([]);
          await AsyncStorage.removeItem("scannedItems_scanEvents");
        },
      },
    ]);
  };

  const handleHomePress = () => {
    router.push("/");
  };

  const exportToCSV = async () => {
    if (scannedItems.length === 0) {
      Alert.alert("No data", "There are no scanned items to export.");
      return;
    }

    const header = "Race,Type,Data\n";
    const rows = scannedItems.map((item) => `${item.race},${item.type},${item.data}`).join("\n");
    const csv = header + rows;

    const fileUri = FileSystem.documentDirectory + "scan_results.csv";
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    try {
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert("Error", "Could not share the file.");
    }
  };

  const handleDelete = (index: number) => {
    const item = scannedItems[index];
    Alert.alert(
      "Delete Entry",
      `Are you sure you want to delete ${item.race} ${item.data}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const newItems = [...scannedItems];
            newItems.splice(index, 1);
            setScannedItems(newItems);
          },
        },
      ]
    );
  };

  const handleScan = ({ data }: { data: string }) => {
    if (hasScannedRef.current) return;

    let isValid = false;
    let type: "athlete" | null = null;

    if ((data.startsWith("A") || data.startsWith("R")) && !scannedItems.some(item => item.race === raceCount && item.data === data)) {
      type = "athlete";
      isValid = true;
    }

    hasScannedRef.current = true;

    if (isValid && type) {
      setScanResultColor("#00FF00");
      Animated.timing(backgroundColorAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Alert.alert("Scanned Data", data, [
        {
          text: "OK",
          onPress: () => {
            setScannedItems((prev) => [...prev, { type, data, race: raceCount }]);

            setTimeout(() => {
              Animated.timing(backgroundColorAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }).start(() => {
                setScanResultColor("#FFFFFF");
                hasScannedRef.current = false;
              });
            }, 2000);
          },
        },
      ]);
    } else {
      setScanResultColor("#FF3B30");
      Animated.timing(backgroundColorAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Alert.alert("Invalid Scan", "Only unique athlete barcodes starting with A or R are accepted per race.", [
        {
          text: "OK",
          onPress: () => {
            setTimeout(() => {
              Animated.timing(backgroundColorAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }).start(() => {
                setScanResultColor("#FFFFFF");
                hasScannedRef.current = false;
              });
            }, 2000);
          },
        },
      ]);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>Scan Events Page</Text>
          <Pressable onPress={handleSettingsPress} style={styles.settingsButton}>
            <Image source={require("./images/trash-can-icon-3.png")} style={styles.settingsImage} />
          </Pressable>
        </View>

        <View style={styles.scanEventsContainer}>
          <Text style={styles.message}>We need your permission to access the camera</Text>
          <Pressable onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleHomePress} style={styles.backTab}>
          <Text style={styles.backTabText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>Scan Events Page</Text>
            <Pressable onPress={handleSettingsPress} style={styles.settingsButton}>
              <Image source={require("./images/trash-can-icon-3.png")} style={styles.settingsImage} />
            </Pressable>
          </View>

          <Animated.View style={[styles.cameraContainer, { backgroundColor: interpolatedColor }]}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code39", "code128"],
              }}
              onBarcodeScanned={handleScan}
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea} />
              </View>
            </CameraView>
          </Animated.View>

          <Pressable onPress={exportToCSV} style={styles.button}>
            <Text style={styles.buttonText}>Export as CSV</Text>
          </Pressable>

          <View style={{ flexDirection: "row", width: "100%", padding: 10 }}>
            <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 10 }}>
              <Text style={styles.scanResultsHeader}>Scanned Items</Text>
              <FlatList
                data={scannedItems}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => handleDelete(index)}>
                    <View style={{ flexDirection: "row", marginBottom: 4 }}>
                      <Text style={{ color: "darkblue", width: 40 }}>{item.race}</Text>
                      <Text style={{ color: "darkblue" }}>{item.data}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={{ width: 120, marginLeft: 10, backgroundColor: "#d0e8ff", padding: 10 }}>
              <Text style={styles.scanResultsHeader}>Race</Text>
              <TextInput
                style={{
                  backgroundColor: "#fff",
                  borderColor: "#ccc",
                  borderWidth: 1,
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 4,
                }}
                keyboardType="numeric"
                value={raceCount}
                onChangeText={(text) => setRaceCount(text.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>

          <Pressable onPress={handleHomePress} style={styles.backTab}>
            <Text style={styles.backTabText}>Back</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
