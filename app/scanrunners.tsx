// ScanRunners.tsx

import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  Text,
  View,
  Alert,
  Animated,
  FlatList,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./cssStyles/commonStyles";

// Define entry type
type ScanEntry = {
  type: "place" | "athlete";
  data: string;
};

export default function ScanRunners() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  const [scanResultColor, setScanResultColor] = useState("#FFFFFF");
  const [scannedItems, setScannedItems] = useState<ScanEntry[]>([]);
  const lastScanTypeRef = useRef<"place" | "athlete" | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const stored = await AsyncStorage.getItem("scannedItems_scanRunners");
      if (stored) setScannedItems(JSON.parse(stored));
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("scannedItems_scanRunners", JSON.stringify(scannedItems));
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
          lastScanTypeRef.current = null;
          await AsyncStorage.removeItem("scannedItems_scanRunners");
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

    const header = "Type,Data\n";
    const rows = scannedItems.map((item) => `${item.type},${item.data}`).join("\n");
    const csv = header + rows;

    const fileUri = FileSystem.documentDirectory + "scan_results_runners.csv";
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    try {
      await Sharing.shareAsync(fileUri);
    } catch {
      Alert.alert("Error", "Could not share the file.");
    }
  };

  const handleScan = ({ data }: { data: string }) => {
    if (hasScannedRef.current) return;

    let isValid = false;
    let type: "place" | "athlete" | null = null;

    if (data.startsWith("P")) {
      const alreadyScanned = scannedItems.some((item) => item.type === "place" && item.data === data);
      if (alreadyScanned) {
        setScanResultColor("#FF3B30");
        hasScannedRef.current = true;

        Animated.timing(backgroundColorAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();

        Alert.alert("Duplicate Place", "This place has already been scanned.", [
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
        return;
      }

      if (!lastScanTypeRef.current || lastScanTypeRef.current === "athlete") {
        type = "place";
        isValid = true;
      }
    } else if (data.startsWith("A") || data.startsWith("R")) {
      if (lastScanTypeRef.current === "place") {
        type = "athlete";
        isValid = true;
      }
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
            setScannedItems((prev) => [...prev, { type, data }]);
            lastScanTypeRef.current = type;

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

      Alert.alert("Invalid Scan", "Scan order incorrect or barcode type unrecognized", [
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
          <Text style={styles.titleText}>Scan Runners Page</Text>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Scan Runners Page</Text>
        <Pressable onPress={handleSettingsPress} style={styles.settingsButton}>
          <Image source={require("./images/trash-can-icon-3.png")} style={styles.settingsImage} />
        </Pressable>
      </View>

      {/* Camera View */}
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

      {/* Export Button */}
      <Pressable onPress={exportToCSV} style={styles.button}>
        <Text style={styles.buttonText}>Export as CSV</Text>
      </Pressable>

      {/* Results Table */}
      <View style={styles.scanResultsTable}>
        <Text style={styles.scanResultsHeader}>Scanned Items</Text>
        <FlatList
          data={[...scannedItems].reverse()}
          keyExtractor={(item, index) => `${item.type}-${item.data}-${index}`}
          renderItem={({ item }) => (
            <Text>
              <Text style={{ color: item.type === "place" ? "darkgreen" : "darkblue" }}>{item.type}</Text>: {item.data}
            </Text>
          )}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
        />

      </View>

      {/* Back button */}
      <Pressable onPress={handleHomePress} style={styles.backTab}>
        <Text style={styles.backTabText}>Back</Text>
      </Pressable>
    </View>
  );
}
