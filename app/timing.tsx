import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  Text,
  View,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./cssStyles/commonStyles";

export default function Timing() {
  const router = useRouter();
  const [timingData, setTimingData] = useState<{ place: number; time: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  const [displayTime, setDisplayTime] = useState("0.00");
  const [realElapsedTime, setRealElapsedTime] = useState(0);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const STORAGE_KEY = "timingData";
  const TIMER_KEY = "timerState";

  // const formatTime = (ms: number) => {
  //   const seconds = ms / 1000;
  //   return seconds.toFixed(2);
  // };
  const formatTime = (ms: number) => {
    const totalMilliseconds = ms;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = totalMilliseconds % 1000;

    const pad = (n: number, size = 2) => n.toString().padStart(size, "0");
    const padMs = (n: number) => n.toString().padStart(3, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${padMs(milliseconds)}`;
  };


  useEffect(() => {
    const loadData = async () => {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const storedTimer = await AsyncStorage.getItem(TIMER_KEY);

      if (storedData) setTimingData(JSON.parse(storedData));

      if (storedTimer) {
        const parsed = JSON.parse(storedTimer);
        const now = Date.now();

        console.log("Loaded TIMER_KEY:", parsed); // Debug logging

        if (parsed.isRunning && parsed.startTime) {
          const elapsed = now - parsed.startTime;
          setStartTime(parsed.startTime);
          setElapsedBeforePause(0);
          setRealElapsedTime(elapsed);
          setDisplayTime(formatTime(elapsed));
          setIsRunning(true);
        } else if (!parsed.isRunning && parsed.elapsedBeforePause != null) {
          const paused = parsed.elapsedBeforePause;
          setStartTime(null);
          setElapsedBeforePause(paused);
          setRealElapsedTime(paused);
          setDisplayTime(formatTime(paused));
          setIsRunning(false);
        } else {
          setStartTime(null);
          setElapsedBeforePause(0);
          setRealElapsedTime(0);
          setDisplayTime("0.00");
          setIsRunning(false);
        }
      } else {
        setStartTime(null);
        setElapsedBeforePause(0);
        setRealElapsedTime(0);
        setDisplayTime("0.00");
        setIsRunning(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timingData));
  }, [timingData]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = startTime ? now - startTime : 0;
      setRealElapsedTime(elapsed);
      setDisplayTime(formatTime(elapsed));

      // Save timer state during each tick
      if (startTime != null) {
        AsyncStorage.setItem(TIMER_KEY, JSON.stringify({
          isRunning: true,
          startTime,
          elapsedBeforePause: 0,
        }));
      }
    };

    if (isRunning && startTime != null) {
      timerInterval.current = setInterval(updateTimer, 50);
    } else {
      if (timerInterval.current !== null) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      AsyncStorage.setItem(TIMER_KEY, JSON.stringify({
        isRunning: false,
        startTime: null,
        elapsedBeforePause,
      }));
    }

    return () => {
      if (timerInterval.current !== null) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, [isRunning, startTime]);

  const resetStopwatch = async () => {
    setTimingData([]);
    setDisplayTime("0.00");
    setStartTime(null);
    setElapsedBeforePause(0);
    setRealElapsedTime(0);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.setItem(TIMER_KEY, JSON.stringify({
      isRunning: false,
      startTime: null,
      elapsedBeforePause: 0,
    }));
  };

  const handleSettingsPress = () => {
    if (isRunning) {
      setIsRunning(false);
      setElapsedBeforePause(realElapsedTime);
    } else {
      Alert.alert("Clear All Data", "Are you sure you want to delete all results?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => resetStopwatch(),
        },
      ]);
    }
  };

  const handleHomePress = () => {
    router.push("/");
  };

  const handleStopwatchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();

    if (!isRunning) {
      const newStartTime = Date.now() - elapsedBeforePause;
      setStartTime(newStartTime);
      setIsRunning(true);

      // Save immediately
      AsyncStorage.setItem(TIMER_KEY, JSON.stringify({
        isRunning: true,
        startTime: newStartTime,
        elapsedBeforePause: 0,
      }));
    } else {
      const now = Date.now();
      const totalElapsed = now - (startTime ?? now);
      setElapsedBeforePause(totalElapsed);
      setTimingData((prev) => [
        ...prev,
        { place: prev.length + 1, time: formatTime(totalElapsed) },
      ]);
    }
  };

  const exportToCSV = async () => {
    if (timingData.length === 0) {
      Alert.alert("No data", "There are no timing results to export.");
      return;
    }

    const header = "Place,Time\n";
    const rows = timingData.map((item) => `${item.place},${item.time}`).join("\n");
    const csv = header + rows;

    const fileUri = FileSystem.documentDirectory + "timing_results.csv";
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    try {
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert("Error", "Could not share the file.");
    }
  };

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["orange", "#00FF00"],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>Timing Page</Text>
            <Pressable onPress={handleSettingsPress} style={styles.settingsButton}>
              <Image
                source={isRunning ? require("./images/black_circle.png") : require("./images/trash-can-icon-3.png")}
                style={styles.settingsImage}
              />
            </Pressable>
          </View>

          {/* Scrollable Table */}

          {/* Version 1 */}
          <View style={[styles.scanResultsTable, { height: '35%' }]}>
            <Text style={styles.scanResultsHeader}>Timing Results</Text>
            <FlatList
              data={[...timingData].reverse()}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <Text>{`${item.place} ${item.time}`}</Text>
              )}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
            />
          </View>


          {/* Export Button */}
          <Pressable onPress={exportToCSV} style={styles.button}>
            <Text style={styles.buttonText}>Export as CSV</Text>
          </Pressable>

          {/* Stopwatch Button */}
          <Pressable onPress={handleStopwatchPress} style={{ flex: 1, width: '100%' }}>
            <Animated.View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.buttonText, { fontSize: 32 }]}>{displayTime}</Text>
            </Animated.View>
          </Pressable>

          <Pressable onPress={handleHomePress} style={styles.backTab}>
            <Text style={styles.backTabText}>Back</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
