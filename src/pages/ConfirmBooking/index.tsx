import { IonButton, IonContent, IonInput, IonModal, IonPage, IonText, IonLoading, IonAlert, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonIcon } from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import marker images directly
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Link, useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Circle, GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { callOutline, chatbubbleOutline, chatbubblesOutline, star, starOutline, navigate, pin } from 'ionicons/icons';
import { createBooking } from '../../redux/slice/bookingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import env from '../../env';
import { RootState } from '../../redux/store';

// Assign marker images to Default Icon options
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

interface LocationState {
    type?: number; // Use '?' if the property is optional
}

interface Idriver {
    name: string;
    phone: string;
    vehicle: {
        plate: string
        model: string
    },
    rating: number,
}


const ConfirmBooking: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation<LocationState | any>();
    const [mapContainerStyle, setMapContainerStyle] = useState({
        height: '420px',
        width: screen.width
    });


    const {
        address,
        lat,
        lng,
        current,
        distance,
        name } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showAlertError, setShowAlertError] = useState(false);
    const [error, setError] = useState<string>('');
    const [showMsg, setShowMsg] = useState<boolean>(false)
    const [msg, setMsg] = useState('')
    const [driver, setDriver] = useState<Idriver>({} as Idriver)

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmBooking, setConfirmBooking] = useState(false);
    const [showDriverArrived, setShowDriverArrived] = useState(false);

    const [showDriverCompleted, setShowDriverCompleted] = useState(false);


    const roundDistance = (distance: any, direction = 'up') => {
        const km = distance / 1000;
        const factor = direction === 'up' ? Math.ceil(km * 10) : Math.floor(km * 10);
        return factor / 10;
    };
    const { user, isLogin } = useSelector((state: RootState) => state.user);

    const [selectedService, setSelectedService] = useState('MediBike');
    const [selectedPayment, setSelectedPayment] = useState('Tiền mặt');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false)
    const history = useHistory();

    const services = [
        { name: 'MediBike', price: '20.000đ', icon: "motorcycle" },
        { name: 'MediCar - 4 chỗ', price: '572.000đ', icon: "car-booking" }
    ];
    const paymentMethods = ['Tiền mặt', 'MoMo', 'Zalo Pay'];

    const handleConfirm = async () => {

        const data = {
            fromAddress: current?.address,
            toAddress: address,
            fromLat: current.lat,
            fromLng: current.lng,
            toLat: lat,
            toLng: lng,
            cost: selectedService === 'MediBike' ? 20000 : 572000,
            distance,
            type: 'driver',
        }

        const rsp = await dispatch(createBooking({ ...data }))


        if (rsp?.payload?.status) {
            // Bước 1: Bắt đầu bằng việc hiển thị loading
            setLoading(true);

            // Bước 2: Hiển thị thông báo từ backend (sau 1 giây)
            setTimeout(() => {
                setLoading(false); // Tắt loading
                setMsg(rsp.payload.message); // Hiển thị thông báo từ backend
                setShowMsg(true); // Hiển thị message

                // Bước 3: Sau khi hiển thị thông báo backend, đợi 3 giây rồi tiếp tục
                setTimeout(() => {
                    setShowMsg(false); // Tắt thông báo backend
                    setLoading(true); // Bật lại loading

                    // Cập nhật thông tin tài xế
                    setDriver({
                        name: rsp.payload.data.driver.name,
                        phone: rsp.payload.data.driver.phoneNumber,
                        vehicle: {
                            plate: rsp.payload.data.driver.plate,
                            model: rsp.payload.data.driver.carModel,
                        },
                        rating: rsp.payload.data.driver.rating,
                    });

                    // Bước 4: Hiển thị thông báo "Đang tìm tài xế"
                    setMsg("Đang tìm tài xế");
                    setShowMsg(true);

                    // Bước 5: Sau 3 giây, tắt loading và thông báo "Đang tìm tài xế", rồi xác nhận tài xế
                    setTimeout(() => {
                        setMapContainerStyle({
                            ...mapContainerStyle,
                            height: '470px',
                        })
                        setLoading(false); // Tắt loading
                        setShowMsg(false); // Tắt thông báo "Đang tìm tài xế"
                        setIsConfirmed(true); // Xác nhận tài xế đã tìm thấy
                    }, 3000);
                }, 3000);
            }, 1000);
        }

        else {
            console.error("Booking failed:", rsp.payload.message);
            setError(rsp.payload.message)
            setShowAlertError(true);
        }
    }

    const [status, setStatus] = useState(2); // 0: Finding, 1: Found, 2: On the way

    useEffect(() => {

        // Kết nối đến server
        const socket = io(env.API_URL);

        // Lắng nghe sự kiện từ server
        socket.on('driverArrived', (data: any) => {
            if (user.id === data.userID.id) {
                setShowDriverArrived(true);
            }

        });

        socket.on('completionEvent', () => {
            setLoading(false);
            setShowMsg(false);
            setShowDriverArrived(false);
            setShowDriverCompleted(true);
            setTimeout(() => {
                history.push('/'); // Navigate to home after 3 seconds
            }, 2000);
        });
        return () => {
            socket.disconnect();
        };
    }, []);


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

                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header='Location Access'
                    message={'Please enable location access to use this app.'}
                    buttons={['OK']}
                />
                <IonAlert
                    isOpen={showMsg}
                    onDidDismiss={() => setShowAlert(false)}
                    header='Thành công'
                    message={msg}
                    buttons={['OK']}
                />
                <IonAlert
                    isOpen={showDriverArrived}
                    message={'Tài xế đã đến điểm đón rồi nhé :)'}
                />
                <IonAlert
                    isOpen={showDriverCompleted}
                    message={'Đã hoàn thành, về trang chủ sau 3s :)'}
                />
                <div className="flex flex-col h-full">
                    <div className="ion-padding">
                        <div className='flex items-center'>
                            <span className='mr-3'><IonIcon icon={navigate} /> </span><input className='p-3 rounded-lg flex items-center justify-between border w-full' value={current?.address ? current?.address : 'Unknown destination'} />
                        </div>
                        <div className='flex items-center mt-3'>
                            <span className='mr-3'><IonIcon icon={pin} /></span><input className='p-3 rounded-lg flex items-center justify-between border w-full' value={address ? address : 'Unknown destination'} />
                        </div>
                    </div>
                    <div className='flex-grow'>
                        <LoadScript googleMapsApiKey={import.meta.env.VITE_GG_KEY}>
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
                                zoom={15}
                            >
                                <Marker position={{ lat: parseFloat(lat), lng: parseFloat(lng) }} />
                                <Circle
                                    center={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
                                    radius={5000}
                                    options={{
                                        fillColor: "red",
                                        fillOpacity: 0.1,
                                        strokeColor: "red",
                                        strokeOpacity: 0.5,
                                        strokeWeight: 2,
                                    }}
                                />
                            </GoogleMap>
                        </LoadScript>
                    </div>
                    <div className="max-w p-3 bg-white border border-gray-200 rounded-b-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        {!!!isConfirmed && <div className="p-4 bg-white shadow-md rounded-lg max-w-md mx-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Gợi ý dịch vụ</h2>
                            </div>
                            <div className="space-y-4">
                                {services.map((service, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg flex items-center justify-between border ${selectedService === service.name ? 'border-red-500 bg-green-50' : 'border-gray-300'
                                            } cursor-pointer`}
                                        onClick={() => setSelectedService(service.name)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <div className="h-6 flex justify-center items-center">
                                                <img src={`src/assets/image/icon/${service.icon}.png`} alt="Mua hàng" className="h-10 mb-2" />
                                            </div>
                                            <span>{service.name}</span>
                                        </div>
                                        <span>{service.price}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Method */}
                            <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center space-x-2">
                                    <i className="fas fa-money-bill-wave"></i>
                                    <span>{selectedPayment}</span>
                                </div>
                                <IonButton fill="clear" className='text-sm' onClick={() => setIsModalOpen(true)}>Thay đổi</IonButton>
                            </div>


                            {/* Action Buttons */}
                            <div className="mt-1 flex space-x-2">
                                <button className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold h-[50px]" onClick={handleConfirm}>Xác nhận đặt xe</button>
                            </div>
                            {/* Payment Method Modal */}
                            <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
                                <IonHeader>
                                    <IonToolbar>
                                        <IonTitle>Chọn phương thức thanh toán</IonTitle>
                                    </IonToolbar>
                                </IonHeader>
                                <IonContent>
                                    <IonList>
                                        {paymentMethods.map((method, index) => (
                                            <IonItem
                                                button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedPayment(method);
                                                    setIsModalOpen(false);
                                                }}
                                            >
                                                {method}
                                            </IonItem>
                                        ))}
                                    </IonList>
                                </IonContent>
                            </IonModal>
                        </div>}
                        {isConfirmed && <div className="p-4 bg-white shadow-md rounded-lg max-w-md mx-auto">


                            {/* Driver Info */}
                            <div className="text-center mb-4">
                                <h2 className="text-lg font-semibold text-green-600">Đặt xe</h2>
                                <p className="text-gray-600">Tài xế đang trên đường đến đón bạn</p>
                                <p className="text-gray-500">{driver.vehicle.plate} &middot; {driver.vehicle.model}</p>
                            </div>

                            {/* Driver Details */}
                            <div className="flex items-center mb-4 justify-between">
                                <div className="flex items-center">
                                    <img
                                        src="https://via.placeholder.com/40"
                                        alt="Driver"
                                        className="w-10 h-10 rounded-full mr-4"
                                    />
                                    <div>
                                        <p className="font-semibold">{driver.name} - {driver.phone}</p>
                                        <div className="flex">
                                            {[...Array(driver.rating)].map((_, index) => (
                                                <IonIcon icon={star} className='text-yellow-500' />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center'>
                                    <IonIcon icon={callOutline} className="text-gray-600 px-2 h-5 w-5" />
                                    <IonIcon icon={chatbubblesOutline} className="text-gray-600 px-2 h-5 w-5" />
                                </div>
                            </div>
                            {/* <div className="mt-5 flex space-x-2">
                                <button className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold h-[50px]" disabled onClick={handleConfirm}>Hoàn thành</button>
                            </div> */}
                        </div>}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ConfirmBooking;