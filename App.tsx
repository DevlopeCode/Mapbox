/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-shadow */

import {Button, Dimensions, Platform, StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import MapboxGL, {Camera, MapView, UserLocation} from '@rnmapbox/maps';
import RouteSimulator from './lines';
import {point} from '@turf/helpers';
import {directionsClient} from './mapboxclient';
// export const SF_OFFICE_COORDINATE = [39.7430519, 90.9085355];
import {lineString as makeLineString} from '@turf/helpers';
import PulseCircleLayer from './pulscirclelayer';
import Mapbox from '@rnmapbox/maps';
MapboxGL.setAccessToken(
  'pk.eyJ1IjoicGNob3VkaGFyeTI5IiwiYSI6ImNsaXJkZDFuYzF4M2ozaXBjOTVqN2x3M3YifQ.cKBaND7z-DbrvSAudv_9pw',
);
MapboxGL.setConnected(true);
MapboxGL.setWellKnownTileServer('Mapbox');
const SF_OFFICE_COORDINATE = [75.9085323, 22.7430525];
const SF_ZOO_COORDINATE = [75.8755103, 22.7019989];
const App = () => {
  const lineRef = useRef<any>(null);

  const [active, setActive] = useState<any>(false);
  const [route, setRoute] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [routeSimulator, setRouteSimulator] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [currentCordinate, setCurrentCordinate] = useState<number[]>([]);
  const locationRef = useRef(null);
  async function fetchRoute() {
    const reqOptions = {
      waypoints: [
        {coordinates: SF_OFFICE_COORDINATE},
        {coordinates: SF_ZOO_COORDINATE},
      ],
      profile: 'walking',
      geometries: 'geojson',
    };

    const res = await directionsClient.getDirections(reqOptions).send();

    setRoute(makeLineString(res.body.routes[0].geometry.coordinates));
  }
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS == 'android') {
          const isGranted = await Mapbox.requestAndroidLocationPermissions();
          // setUserLocation(true);
          console.log(isGranted);
        }
      } catch (err) {
        console.warn('Error requesting location permission:', err);
      }
    };
    requestLocationPermission();
  }, []);
  const camera = useRef<Camera>(null);

  useEffect(() => {
    camera.current?.setCamera({
      centerCoordinate: locationRef.current?.state,
    });
  }, [locationRef.current?.state]);

  console.log(locationRef.current);

  const MapLocation = useCallback(() => {
    return (
      <>
        <Camera
          ref={camera}
          zoomLevel={13}
          followUserLocation
          followZoomLevel={15}
          centerCoordinate={locationRef.current?.state}
        />
        <UserLocation
          minDisplacement={5}
          showsUserHeadingIndicator
          visible
          requestsAlwaysUse={true}
        />
      </>
    );
  }, []);

  const onStart = () => {
    fetchRoute();

    const routeSimulator = new RouteSimulator(route);

    if (!active) {
      routeSimulator.addListener((it: React.SetStateAction<null>) => {
        setCurrentPoint(it);
      });
      routeSimulator.start();

      setRouteSimulator(routeSimulator);
      setActive(!active);
    } else {
      routeSimulator.reset();
      routeSimulator.stop();
      setActive(!active);
    }
  };

  const renderActions = () => {
    return (
      <View style={styles.buttonCnt}>
        <Button title={!active ? 'Start' : 'Stop'} onPress={() => onStart()} />
      </View>
    );
  };
  const renderOrigin = () => {
    let backgroundColor = 'red';

    if (currentPoint) {
      backgroundColor = '#314ccd';
    }

    const style = [layerStyles.origin, {circleColor: backgroundColor}];

    return (
      <MapboxGL.ShapeSource id="origin" shape={point(SF_OFFICE_COORDINATE)}>
        <MapboxGL.Animated.CircleLayer id="originInnerCircle" style={style} />
      </MapboxGL.ShapeSource>
    );
  };

  const renderRoute = () => {
    if (!route) {
      return null;
    }

    return (
      <MapboxGL.ShapeSource id="routeSource" shape={route}>
        <MapboxGL.LineLayer
          id="routeFill"
          style={layerStyles.route}
          belowLayerID="originInnerCircle"
        />
      </MapboxGL.ShapeSource>
    );
  };

  const renderCurrentPoint = () => {
    if (!currentPoint) {
      return null;
    }

    return (
      <PulseCircleLayer
        shape={currentPoint}
        aboveLayerID="destinationInnerCircle"
      />
    );
  };

  const renderProgressLine = () => {
    if (!currentPoint) {
      return null;
    }

    const {nearestIndex} = currentPoint.properties;
    const coords = route.geometry.coordinates.filter(
      (c: any, i: number) => i <= nearestIndex,
    );

    // coords.push(currentPoint.geometry.coordinates);
    // console.log(currentPoint);

    if (coords.length < 2) {
      return null;
    }
    const lineString = makeLineString(coords);
console.log(lineRef.current);

    return (
      <MapboxGL.Animated.ShapeSource
        ref={lineRef}
        id="progressSource"
        shape={lineString}>
        <MapboxGL.Animated.LineLayer
          id="progressFill"
          style={layerStyles.progress}
          aboveLayerID="routeFill"
        />
        {/* <UserLocation /> */}
      </MapboxGL.Animated.ShapeSource>
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView
          style={{flex: 1}}
          projection="globe"
          compassEnabled={true}
          logoEnabled={false}>
          {renderOrigin()}
          {renderRoute()}
          {renderCurrentPoint()}
          {renderProgressLine()}
          <MapLocation />
        </MapView>
      </View>
      {/* <View>{}</View> */}
      {renderActions()}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  button: {
    // backgroundColor: 'blue',
    // borderRadius: 3,
  },
  buttonCnt: {
    backgroundColor: 'transparent',
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: Dimensions.get('window').height,
    width: '100%',
  },
  map: {
    flex: 1,
  },
});

const layerStyles = {
  origin: {
    circleRadius: 5,
    circleColor: 'white',
  },
  destination: {
    circleRadius: 5,
    circleColor: 'white',
  },
  route: {
    lineColor: 'white',
    lineCap: MapboxGL.LineJoin.Round,
    lineWidth: 3,
    lineOpacity: 0.84,
  },
  progress: {
    lineColor: '#314ccd',
    lineWidth: 3,
  },
};
