import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

type Reminder = {
  id: number;
  user: string;
  description: string;
};

const Reminders = ({ styles, url }) => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getReminders = async () => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      setData(json.data);
      console.log(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReminders();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 24 }}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text style={styles.header}>Reminders for {data[0].location}:</Text>
            <FlatList
              data={data}
              keyExtractor={({ id }) => id}
              renderItem={({ item }) => (
                <Text
                  style={styles.reminder}
                >{`\u2022 ${item.description} [${item.created_at}]`}</Text>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
};

const QRCode = ({ styles, hasCameraPermission, setUrl }) => {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    console.log(data);
    setUrl(data);
  };

  return (
    <View style={styles.container}>
      {hasCameraPermission === null ? (
        <Text>Requesting for camera permission...</Text>
      ) : hasCameraPermission === false ? (
        <Text style={{ color: "#fff" }}>Camera permission is not granted</Text>
      ) : (
        <View
          style={{
            backgroundColor: "black",
            height: Dimensions.get("window").height,
            width: Dimensions.get("window").width,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </View>
      )}

      <StatusBar hidden />
    </View>
  );
};

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      console.log(status);
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  return (
    <>
      {url === "" ? (
        <QRCode
          styles={styles}
          hasCameraPermission={hasPermission}
          setUrl={setUrl}
        />
      ) : (
        <>
          <Reminders styles={styles} url={url} />
          <Button
            title="Scan again"
            onPress={() => setUrl("")}
            color="#83b0e1"
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1d1e20",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  reminder: {
    color: "#e1ecf7",
  },
  header: {
    fontSize: 20,
    color: "#aecbeb",
  },
});
