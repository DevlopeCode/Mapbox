import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';
const clientOptions = {
  accessToken:
    'pk.eyJ1IjoicGNob3VkaGFyeTI5IiwiYSI6ImNsaXJkZDFuYzF4M2ozaXBjOTVqN2x3M3YifQ.cKBaND7z-DbrvSAudv_9pw',
};
const directionsClient = MapboxDirectionsFactory(clientOptions);

export {directionsClient};
