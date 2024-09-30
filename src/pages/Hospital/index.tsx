import React, { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { getDistance } from 'geolib';
import Navbar from '../../components/Navbar';
import HeathFacilityItem from './component/HeathFacilityItem';
import { IonAlert, IonContent, IonLoading, IonPage } from '@ionic/react';


const Hospital: React.FC = () => {
  const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
  const [address, setAddress] = useState<string>('');
  const [dataByPosition, setDataByPosition] = useState<Array<any>>([]);
  const [amenity, setAmenity] = useState<string>('hospital');
  const [scope, setScope] = useState<number | string>();
  const [allowLocations, setAllowLocations] = useState<boolean>(false);
  const [loading, setLoading] = useState(false); // Đã có trạng thái loading
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [error, setError] = useState<string>('');

  const mapRef = useRef(null);

  useEffect(() => {
    console.log(currentPosition);
  }, []);

  useEffect(() => {
    if (window.location.pathname == '/hospital') {
      checkPermission();
      if (mapRef.current) {
        const map = (mapRef.current as any).leafletElement;
        map.invalidateSize();
      }
    }
  }, [window.location.pathname]);

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

  const getAddressBy = async (lat: number, lon: number) => {
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
      return fullAddress;
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleSearchClick = () => {
    console.log(!!!scope);

    if (!allowLocations) {
      setError('Please enable location access to use this app.');
      setShowAlertError(true);
    }
    else if (!!!scope) {
      setError('Please select scope.');
      setShowAlertError(true);
    }
    else {
      getDataByPosition();
    }
  };

  const cache = new Map();

  const getDataByPosition = async () => {
    if (scope && currentPosition.lat !== 0 && currentPosition.lng !== 0) {
      setLoading(true); // Start loading
      try {
        let urls = [];


        urls = [
          `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=${amenity}](around:${Number(scope) * 1000},${currentPosition.lat},${currentPosition.lng});out body;`
        ]

        // Fetch all data in parallel
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const data = await Promise.all(responses.map(response => response.json()));

        // Combine data from all responses
        const combinedData = data.flatMap(d => d.elements);

        // Function to fetch address, using cache
        const fetchAddress = async (lat, lon) => {
          const key = `${lat},${lon}`;
          if (cache.has(key)) {
            return cache.get(key);
          }
          try {
            const address = await getAddressBy(lat, lon);
            cache.set(key, address);
            return address;
          } catch (error) {
            console.error('Error fetching address:', error);
            return 'Address not found';
          }
        };

        // Process each element and fetch address, but limit concurrency
        const concurrencyLimit = 10;
        let index = 0;

        const updatedData = [];
        while (index < combinedData.length) {
          const batch = combinedData.slice(index, index + concurrencyLimit);
          const batchResults = await Promise.all(batch.map(async (element) => {
            const addressTo = await fetchAddress(element.lat, element.lon);
            return {
              distance: getDistance(
                { latitude: currentPosition.lat, longitude: currentPosition.lng },
                { latitude: element.lat, longitude: element.lon }
              ),
              name: element.tags['name:en'] || (element.tags.amenity === 'pharmacy' ? 'Pharmacy' : 'Hospital'),
              lat: element.lat,
              lng: element.lon,
              tag: element.tags.amenity,
              address: addressTo,
              current: {
                lat: currentPosition.lat,
                lng: currentPosition.lng,
                address
              },
            };
          }));
          updatedData.push(...batchResults);
          index += concurrencyLimit;
        }

        console.log(updatedData);
        setDataByPosition(updatedData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false); // Stop loading when data fetching is done
      }
    }
  };


  const roundDistance = (distance: any, direction = 'up') => {
    const km = distance / 1000;
    const factor = direction === 'up' ? Math.ceil(km * 10) : Math.floor(km * 10);
    return factor / 10;
  };

  const handleFilterClick = (filter) => {
    setAmenity(filter);
  };

  return (
    <IonPage>
      <IonContent>
        <IonLoading isOpen={loading} message="Loading..." spinner="circles"
        />
        <IonAlert
          isOpen={showAlertError}
          onDidDismiss={() => setShowAlertError(false)}
          header='Error'
          message={error}
          buttons={['OK']}
        />
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Navbar title={'Cơ sở khám'} />

          {/* Search & Filters */}
          <div className="p-4 bg-red-50">
            <input
              type="text"
              placeholder="Tìm kiếm cơ sở"
              className="w-full h-[50px] p-2 mb-4 border border-red-500 rounded"
              value={address}
              disabled
            />
            <input
              type="text"
              placeholder="Phạm vi"
              className="w-full h-[50px] p-2 mb-4 border border-red-500 rounded"
              value={scope}
              min={1}
              max={10}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>

          {/* Facility List */}
          <div className="p-4 flex-grow overflow-y-auto h-2 ">
            {dataByPosition.map((facility, index) => (
              <HeathFacilityItem key={index} facility={facility} />
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="loader"></div>
            </div>
          )}

          {/* Map & Help Button */}
          <button
            className="text-white font-semibold bg-red-500 m-3 rounded-xl p-4 flex justify-center items-center fixed bottom-0 left-0 right-0"
            onClick={() => handleSearchClick()}
          >
            Tìm kiếm nhanh
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Hospital;
