import React, { useState, useRef, useEffect } from "react";
import * as tomtom from "@tomtom-international/web-sdk-maps";
import * as services from '@tomtom-international/web-sdk-services';
import data from './data.json';
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import './App.css';
const App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({});
  const [lng, setLng] = useState(-0.112869);
  const [ltd, setLtd] = useState(51.504);
  const [firstLocationLng, setFirstLocationLng] = useState('');
  const [firstLocationLat, setFirstLocationLat] = useState('');
  const [secondLocationLng, setSecondLocationLng] = useState('');
  const [secondLocationLat, setSecondLocationLat] = useState('');
  const [searchFirstLocation, setSearchFirstLocation] = useState('');
  const [searchSecondLocation, setSearchSecondLocation] = useState('');
  const [firstDestinationChanged, setFirstDestinationChanged] = useState(false);
  const [secondDestinationChanged, setSecondDestinationChanged] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);
  const [calculate, setCalculate] = useState(false);
  const [info, setInfo] = useState('');

  const handleFirstChange = (e) => {
    setSearchFirstLocation(e.target.value);

  }
  const handleSecondChange = (e) => {
    setSearchSecondLocation(e.target.value);
  }

  const handleFirstLocationClick = (lng, lat) => {
    setFirstLocationLng(lng);
    setFirstLocationLat(lat);
  }
  const handleSecondLocationClick = (lng, lat) => {
    setSecondLocationLng(lng);
    setSecondLocationLat(lat);
  }

  const drawRoute = (geoJson, map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route')
      map.removeSource('route')
    }
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson
      },
      paint: {
        'line-color': '#4a90e2',
        'line-width': 6

      }
    })
  }

  const handleCalculate = () => {
    setCalculate(!calculate);
  }

  useEffect(() => {
    let map = tomtom.map({
      key: "QBftCcz5sM6G5RK1GCBXilcMmc8g8ONA",
      container: mapElement.current,
      zoom: mapZoom,
      center: [lng, ltd],
    });

    const addFirstMarker = () => {
      const firstElement = document.createElement('div');
      firstElement.className = "marker1";
      new tomtom.Marker({
        draggable: false,
        element: firstElement,
      })
        .setLngLat([firstLocationLng, firstLocationLat])
        .addTo(map);
    }
    const addSecondMarker = () => {
      const secondElement = document.createElement('div');
      secondElement.className = "marker2";
      new tomtom.Marker({
        draggable: false,
        element: secondElement,
      })
        .setLngLat([secondLocationLng, secondLocationLat])
        .addTo(map);
    }

    if (firstLocationLng !== '' && firstLocationLat !== '') {
      addFirstMarker();
      setLng(firstLocationLng);
      setLtd(firstLocationLat);
    }
    if (secondLocationLng !== '' && secondLocationLat !== '') {
      addSecondMarker();
      setLng(secondLocationLng);
      setLtd(secondLocationLat);
    }

    const recalculateRoutes = () => {
      services.services
        .calculateRoute({
          key: "QBftCcz5sM6G5RK1GCBXilcMmc8g8ONA",
          locations: [
            { lat: firstLocationLat, lng: firstLocationLng },
            { lat: secondLocationLat, lng: secondLocationLng }]
        })
        .then((routeData) => {
          const geoJson = routeData.toGeoJson();
          console.log(geoJson);
          setInfo(geoJson);
          drawRoute(geoJson, map)
        })
    }

    if (calculate) {
      recalculateRoutes();
    }

    setMap(map);
    return () => map.remove();
  }, [ltd, lng, firstLocationLng, firstLocationLat, secondLocationLng, secondLocationLat, calculate, mapZoom]);

  return (
    <>
      <div className="app">
        <p>Hello Map</p>
        <div className="map" ref={mapElement} />
        <div className="location-container">
          <div className="first-destination">
            <input type="text" aria-label="firstLocation" placeholder="give me some" value={searchFirstLocation} onChange={handleFirstChange} />
            <div className="destination-list">
              {searchFirstLocation !== '' && data.map(item => {
                if (item.date_created.includes(searchFirstLocation)) {
                  return (<div onClick={() => handleFirstLocationClick(item.lng, item.lat)} className="data-list-div"><p>{item.date_created}</p> <p>{item.lng} {item.lat}</p></div>)
                }
                return null;
              })}
            </div>
          </div>
          <div>
            <button onClick={handleCalculate}>Calculate</button>
            {info && (<div>
              <p>Distance in Meters : {info.features[0].properties.summary.lengthInMeters} Meters</p>
              <p>Traffic Delay in Seconds {info.features[0].properties.summary.trafficDelayInSeconds}</p>
              <p>Traffic Length in Meters {info.features[0].properties.summary.trafficLengthInMeters}</p>
              <p>Travel Time in Seconds {info.features[0].properties.summary.travelTimeInSeconds}</p>
            </div>)}
          </div>
          <div className="second-destination">
            <input type="text" aria-label="secondLocation" placeholder="give me some" value={searchSecondLocation} onChange={handleSecondChange} />
            <div className="destination-list">
              {searchSecondLocation !== '' && data.map(item => {
                if (item.date_created.includes(searchSecondLocation)) {
                  return (<div onClick={() => handleSecondLocationClick(item.lng, item.lat)} className="data-list-div"><p>{item.date_created}</p> <p>{item.lng} {item.lat}</p></div>)
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;