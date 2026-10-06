import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

export type OpenStreetMapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
};

type OpenStreetMapViewProps = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  userLocation?: { latitude: number; longitude: number };
  selectedLocation?: { latitude: number; longitude: number };
  points?: OpenStreetMapPoint[];
  onPointPress?: (id: string) => void;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
};

export default function OpenStreetMapView({
  latitude,
  longitude,
  latitudeDelta,
  longitudeDelta,
  userLocation,
  selectedLocation,
  points = [],
  onPointPress,
  onMapPress,
}: OpenStreetMapViewProps) {
  const [mapReady, setMapReady] = useState(false);
  const region: Region = {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        mapType="standard"
        onMapReady={() => setMapReady(true)}
        onPress={(event) => onMapPress?.(event.nativeEvent.coordinate)}
        showsCompass
        showsScale
        toolbarEnabled={false}
        loadingEnabled
        loadingBackgroundColor="#dfe9e5"
        showsUserLocation={Boolean(userLocation)}
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.title}
            description={point.description}
            pinColor="#176b58"
            onPress={() => onPointPress?.(point.id)}
          />
        ))}

        {userLocation ? (
          <Marker
            coordinate={userLocation}
            title="Your current location"
            pinColor="#2d8cff"
          />
        ) : null}

        {selectedLocation ? (
          <Marker
            coordinate={selectedLocation}
            title="Selected location"
            pinColor="#f4b740"
          />
        ) : null}
      </MapView>
      {!mapReady ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingDot} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, backgroundColor: '#dfe9e5' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  loadingCard: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#17332c', shadowOpacity: 0.16, shadowRadius: 8, elevation: 4 },
  loadingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#176b58' },
});
