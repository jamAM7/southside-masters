import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  Text,
  View,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./cssStyles/commonStyles";
import { Picker } from "@react-native-picker/picker";

// Define entry type
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
  const [scanResultColor, setScanResultColor] = useState("#FFFFFF");
  const [scannedItems, setScannedItems] = useState<ScanEntry[]>([]);
  const [raceCount, setRaceCount] = useState("1");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

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
    setHighlightedIndex(index);
    Alert.alert("Delete Entry", `Delete ${item.race} ${item.data}?`, [
      { text: "Cancel", style: "cancel", onPress: () => setHighlightedIndex(null) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const newItems = [...scannedItems];
          newItems.splice(index, 1);
          setScannedItems(newItems);
          setHighlightedIndex(null);
        },
      },
    ]);
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
          <Pressable onPress={handleHomePress} style={styles.backButton}>
            <Image source={require("./images/back-arrow-icon.png")} style={styles.settingsImage} />
          </Pressable>
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
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={() => null}>
        <View style={styles.container}>
          <View style={styles.titleBar}>
            <Pressable onPress={handleHomePress} style={styles.backButton}>
              <Image source={require("./images/back-arrow-icon.png")} style={styles.settingsImage} />
            </Pressable>
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

          <View style={{ flex: 1, flexDirection: "row", width: "100%", padding: 10 }}>
            <View style={{ flex: 3, backgroundColor: "#ffffff", padding: 10 }}>
              <Text style={styles.scanResultsHeader}>Scanned Items</Text>
              <FlatList
                data={scannedItems}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => handleDelete(index)}>
                    <View style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 4,
                      backgroundColor: index === highlightedIndex ? "#d0e8ff" : "transparent",
                      paddingHorizontal: 5,
                    }}>
                      <Text style={{ fontSize: 18, fontWeight: "500", flex: 1 }}>{item.race}</Text>
                      <Text style={{ fontSize: 18, flex: 2 }}>{item.data}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 10, backgroundColor: "#d0e8ff", padding: 10 }}>
              <Text style={styles.scanResultsHeader}>Race</Text>
              <Picker
                selectedValue={raceCount}
                onValueChange={(itemValue) => setRaceCount(itemValue)}
                style={{ flex: 1, minWidth: 90 }}
              >

                {Array.from({ length: 20 }, (_, i) => (
                  <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
