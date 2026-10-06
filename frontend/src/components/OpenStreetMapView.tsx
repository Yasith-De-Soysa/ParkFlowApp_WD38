import React, { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

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

function buildMapHtml(props: OpenStreetMapViewProps) {
  const data = JSON.stringify({
    center: [props.latitude, props.longitude],
    zoom: Math.max(11, Math.min(17, Math.round(Math.log2(360 / props.latitudeDelta)))),
    userLocation: props.userLocation ?? null,
    selectedLocation: props.selectedLocation ?? null,
    points: props.points ?? [],
  });

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
      .leaflet-control-attribution { font-size: 9px; }
      .facility-pin { background: #176b58; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(23, 51, 44, .35); height: 22px; width: 22px; }
      .user-pin { background: #2d8cff; border: 4px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(23, 51, 44, .35); height: 20px; width: 20px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${data};
      const map = L.map('map', { zoomControl: false }).setView(data.center, data.zoom);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const send = (message) => window.ReactNativeWebView.postMessage(JSON.stringify(message));
      const facilityIcon = L.divIcon({ className: '', html: '<div class="facility-pin"></div>', iconSize: [28, 28], iconAnchor: [14, 14] });
      const userIcon = L.divIcon({ className: '', html: '<div class="user-pin"></div>', iconSize: [28, 28], iconAnchor: [14, 14] });
      const selectedIcon = L.divIcon({ className: '', html: '<div class="facility-pin" style="background:#f4b740"></div>', iconSize: [28, 28], iconAnchor: [14, 14] });

      data.points.forEach((point) => {
        const marker = L.marker([point.latitude, point.longitude], { icon: facilityIcon }).addTo(map);
        marker.bindPopup('<strong>' + escapeHtml(point.title) + '</strong><br />' + escapeHtml(point.description || ''));
        marker.on('click', () => send({ type: 'point', id: point.id }));
      });

      if (data.userLocation) {
        L.marker([data.userLocation.latitude, data.userLocation.longitude], { icon: userIcon }).addTo(map).bindPopup('Your current location');
      }

      if (data.selectedLocation) {
        L.marker([data.selectedLocation.latitude, data.selectedLocation.longitude], { icon: selectedIcon }).addTo(map).bindPopup('Selected location');
      }

      map.on('click', (event) => send({ type: 'map', latitude: event.latlng.lat, longitude: event.latlng.lng }));
      function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
      }
    </script>
  </body>
</html>`;
}

export default function OpenStreetMapView(props: OpenStreetMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const html = useMemo(() => buildMapHtml(props), [props]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type: 'point' | 'map';
        id?: string;
        latitude?: number;
        longitude?: number;
      };
      if (message.type === 'point' && message.id) {
        props.onPointPress?.(message.id);
      } else if (message.type === 'map' && typeof message.latitude === 'number' && typeof message.longitude === 'number') {
        props.onMapPress?.({ latitude: message.latitude, longitude: message.longitude });
      }
    } catch (error) {
      console.error('Unable to read map interaction:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: 'https://www.openstreetmap.org/' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        startInLoadingState
        onMessage={handleMessage}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webView: { flex: 1, backgroundColor: '#dfe9e5' },
});
