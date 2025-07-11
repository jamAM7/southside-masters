import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const SETTINGS_IMAGE_SIZE = width * 0.08;
const SETTINGS_IMAGE_MARGIN = width * 0.02;

const commonStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },

  // Top header bar
  titleBar: {
    width: '100%',
    height: '5%',
    backgroundColor: '#1dbae2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  titleText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },

  settingsButton: {
    position: 'absolute',
    margin: SETTINGS_IMAGE_MARGIN,
    right: SETTINGS_IMAGE_MARGIN,
    width: SETTINGS_IMAGE_SIZE,
    height: SETTINGS_IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingsImage: {
    width: SETTINGS_IMAGE_SIZE,
    height: SETTINGS_IMAGE_SIZE,
    resizeMode: 'contain',
  },

  // Navigation Tabs
  scanEventsTab: {
    height: '27.5%',
    width: '100%',
    backgroundColor: '#1926e6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  scanningTab: {
    height: '27.5%',
    width: '100%',
    backgroundColor: '#2ac915',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  timingTab: {
    height: '40%',
    width: '100%',
    backgroundColor: '#ed12ae',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  pagesContainerText: {
    fontSize: width * 0.1,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  backTab: {
    height: '10%',
    width: '100%',
    backgroundColor: '#1dbae2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  backTabText: {
    fontSize: width * 0.05,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // Camera permission message
  message: {
    textAlign: "center",
    marginTop: 20,
  },

  // Camera view styling
  camera: {
    width: '90%',
    height: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 16,
  },

  // Scanner camera wrapper
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scanArea: {
    width: '80%',
    height: '80%',
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
  },

  // Animated wrapper around camera
  scannerWrapper: {
    alignSelf: "center",
    marginTop: 12,
    borderRadius: 12,
    padding: 8,
  },

  // Results table
  scanResultsTable: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 12,
    //marginHorizontal: 16,
    padding: 12,
    //borderRadius: 8,
    width: '100%',
  },

  scanResultsHeader: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },

  // Reused styles
  button: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
  },

  scanEventsContainer: {
    flex: 1,
    height: '80%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },



//   clearDataButton: {
//     position: 'absolute',
//     right: SETTINGS_IMAGE_MARGIN,
//     justifyContent: 'center',
//     height: '100%',
//     width: '100%',
//     alignItems: 'center',
//   },

//     clearDataText: {
//     fontSize: width * 0.04,
//     color: '#000',
//     fontWeight: 'bold',
//   },

});

export default commonStyles;
