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
import { Link, useParams } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;

// Assign marker images to Default Icon options
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

const Detail: React.FC = () => {
    const { lat, lng } = useParams<{ lat: string, lng: string }>();

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

    const roundDistance = (distance: any, direction = 'up') => {
        const km = distance / 1000;
        const factor = direction === 'up' ? Math.ceil(km * 10) : Math.floor(km * 10);
        return factor / 10;
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
                        <div className='flex-grow'>
                            <MapContainer center={[Number(lat), Number(lng)]} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[Number(lat), Number(lng)]}>
                                    <Popup>
                                        A pretty CSS3 popup. <br /> Easily customizable.
                                    </Popup>
                                </Marker>
                                {currentPosition.lat !== 0 && currentPosition.lng !== 0 && (
                                    <CircleMarker
                                        center={[Number(lat), Number(lng)]}
                                        radius={50} // 5km in meters
                                        pathOptions={{ color: 'red' }}
                                    />
                                )}
                            </MapContainer>
                        </div>
                        <div className="w-full p-6 py-5 bg-white border border-gray-200 rounded-t-xl shadow dark:bg-gray-800 dark:border-gray-700">
                            <h6 className='text-xl'>Bệnh viện trung ương Huế <span className='text-gray-400 text-sm'>( 3.2 km)</span></h6>
                            <p className='text my-3'>Từ : <span className='text-gray-400 text-sm'>1234 Lý Thư��ng Kiệt, Huế, Việt Nam</span></p>
                            <p className='text my-3'>Đến : <span className='text-gray-400 text-sm'>1234 Lý Thư��ng Kiệt, Huế, Việt Nam</span></p>
                            <div className='flex justify-between my-5'>
                                <button type="button" className="flex justify-between items-center text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-base px-7 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <span>Chỉ đường</span>  <svg className="w-5 h-5 ml-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 9H8a5 5 0 0 0 0 10h9m4-10-4-4m4 4-4 4" />
                                    </svg>

                                </button>
                                <button type="button" className="flex justify-between items-center text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-base px-7 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <span> Đặt dịch vụ </span>
                                    <svg className="w-5 h-5 text-white ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5" />
                                    </svg>

                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Detail;
