import { IonButton, IonContent, IonInput, IonModal, IonPage, IonText, IonLoading, IonAlert } from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import { useEffect, useState, useRef } from 'react';
import { getDistance } from 'geolib';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import marker images directly
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;

// Assign marker images to Default Icon options
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const Home: React.FC = () => {

  const [currentPosition, setCurrentPosition] = useState({
    lat: 0,
    lng: 0,
  });
  const [address, setAddress] = useState<string>('');
  const [dataByPosition, setDataByPosition] = useState<Array<any>>([]);
  const [amenity, setAmenity] = useState<string>('pharmacy');
  const [scope, setScope] = useState<number | string>();
  const [allowLocations, setAllowLocations] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [error, setError] = useState<string>('');

  const mapRef = useRef(null);

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      const map = (mapRef.current as any).leafletElement;
      map.invalidateSize();
    }
  }, []);

  const checkPermission = async () => {
    try {
      const { location, coarseLocation } = await Geolocation.checkPermissions();
      if (location === 'granted' && coarseLocation === 'granted') {
        setAllowLocations(true);
        getCurrentPosition();
      } else {
        setAllowLocations(false);
        setShowAlert(true); // Hiển thị cảnh báo nếu không cấp quyền
      }
    } catch (error) {
      console.error('Error requesting permission', error);
    }
  };

  const getCurrentPosition = async () => {
    try {
      setLoading(true);
      const coordinates = await Geolocation.getCurrentPosition();
      setCurrentPosition({
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      });
      getAddressByLatLon(coordinates.coords.latitude, coordinates.coords.longitude);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location', error);
      setLoading(false);
    }
  };

  const getAddressByLatLon = async (lat: number, lon: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const address = data.address;
      const houseNumber = address.house_number || '';
      const road = address.road || 'N/A';
      const city = address.city || address.town || 'N/A';
      const state = address.state || 'N/A';
      const country = address.country || 'N/A';
      const fullAddress = `${houseNumber} ${road}, ${city}, ${state}, ${country}`;
      setAddress(fullAddress);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const validateInputs = () => {
    if (!scope || Number(scope) <= 0) {
      setError('Please enter a valid scope.');
      return false;
    }
    if (!amenity) {
      setError('Please select an amenity.');
      return false;
    }
    return true;
  };

  const handleSearchClick = () => {
    if (!allowLocations) {
      setError('Please enable location access to use this app.');
      setShowAlert(true);
    } else if (!validateInputs()) {
      setShowAlertError(true);
    } else {
      getDataByPosition();
    }
  };

  const getDataByPosition = async () => {
    if (amenity && scope && currentPosition.lat !== 0 && currentPosition.lng !== 0) {
      setLoading(true);
      setShowModal(true);
      const url = `https://overpass-api.de/api/interpreter?data=[out:json];(node[amenity=${amenity}](around:${Number(scope) * 1000},${currentPosition.lat},${currentPosition.lng}););out body;`;
      try {
        const response = await fetch(url);
        const data = await response.json();

        const updatedData = data.elements.map((element: any) => ({
          distance: getDistance(
            { latitude: currentPosition.lat, longitude: currentPosition.lng },
            { latitude: element.lat, longitude: element.lon }
          ),
          name: element.tags['name:en'] || (amenity === 'pharmacy' ? 'Pharmacy' : 'Hospital'),
          lat: element.lat,
          lng: element.lon
        }));

        setDataByPosition(updatedData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error:', error);
      }
    }
  };

  const roundDistance = (distance: any, direction = 'up') => {
    const km = distance / 1000;
    const factor = direction === 'up' ? Math.ceil(km * 10) : Math.floor(km * 10);
    return factor / 10;
  };

  const closeModal = () => {
    setShowModal(false);
    setDataByPosition([]);
  };

  return (
    <IonPage>
      <IonContent>
        <IonLoading isOpen={loading} message="Loading..." />

        <IonAlert
          isOpen={showAlertError}
          onDidDismiss={() => setShowAlertError(false)}
          header='Error'
          message={error}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header='Location Access'
          message={'Please enable location access to use this app.'}
          buttons={['OK']}
        />

        {!allowLocations && !loading && (
          <div className="flex items-center justify-center h-full">
            <IonText>Please enable location access to use this app.</IonText>
          </div>
        )}

        {allowLocations && !loading && (
          <div className="flex flex-col h-full">
            <div className="max-w p-6 bg-white border border-gray-200 rounded-b-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <div className="relative mb-6">
                <input disabled value={address} type="text" id="currentPosition" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-[50px]" placeholder="Your location" />
              </div>
              <div className="relative mb-6">
                <input required type="number" id="scope" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-[50px]" placeholder="Scope" onChange={e => setScope(e.target.value)} />
              </div>
              <div className='my-5'></div>
              <div className="flex items-center max-w-sm mx-auto">
                <div className="relative w-full">
                  <select id="type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-[50px]" onChange={e => setAmenity(e.target.value)}>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="hospital">Hospital</option>
                  </select>
                </div>
                <IonButton className="p-2.5 ms-2 text-sm font-medium text-white  rounded-lg  hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleSearchClick}>
                  <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                  <span className="sr-only">Search</span>
                </IonButton>
              </div>
            </div>

            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="max-h-full">
              <div className="max-w p-6">
                <IonButton className="absolute top-0 end-0 m-4 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={closeModal}>
                  Close
                </IonButton>
                <div className="overflow-y-auto overflow-x-auto max-h-[100vh]">
                  {dataByPosition.map((item, index) => (
                    <div key={index} className="flex justify-between items-center max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4 p-4">
                      <div>
                        <h6 className="mb-2 font-medium text-gray-700 dark:text-gray-400">{item.name}</h6>
                        <p className="text-gray-500 dark:text-gray-400">{roundDistance(item.distance, 'up')} km away</p>
                      </div>
                      <Link to={`/detail/lat/${item.lat}/lng/${item.lng}`} onClick={() => setShowModal(false)}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </IonModal>

            <div className='flex-grow'>
              <MapContainer center={[currentPosition.lat, currentPosition.lng]} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[currentPosition.lat, currentPosition.lng]}>
                  <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                  </Popup>
                </Marker>
                {currentPosition.lat !== 0 && currentPosition.lng !== 0 && (
                  <CircleMarker
                    center={[currentPosition.lat, currentPosition.lng]}
                    radius={50} // 5km in meters
                    pathOptions={{ color: 'red' }}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
