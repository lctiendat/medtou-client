// src/App.js
import { IonAlert, IonContent, IonIcon, IonLoading, IonPage } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { callOutline, chatbubblesOutline, imageOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router';
import { useUser } from '../../hook/useUser';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { createBooking } from '../../redux/slice/bookingSlice';
import { io } from 'socket.io-client';
import env from '../../env';

interface LocationState {
    type?: number; // Use '?' if the property is optional
}
function App() {
    const [medicines, setMedicines] = useState([{ name: '', quantity: 1, image: null, imageUrl: null }]);
    const [showModal, setShowModal] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    // const [shippingFee, setShippingFee] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [shippingFee, setShippingFee] = useState(13000); // Phí giao hàng (VNĐ)
    const [appliedFee, setAppliedFee] = useState(6000); // Phí áp dụng (VNĐ)
    const [total, setTotal] = useState(shippingFee + appliedFee); // Tổng cộng (VNĐ)
    const location = useLocation<LocationState | any>();
    const { user, isLogin } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const [findingDriver, setFindingDriver] = useState(false); // New state for finding driver
    const [driverFound, setDriverFound] = useState(false); // Trạng thái kiểm tra khi tìm được tài xế
    const [driver, setDriver] = useState(null); // Để lưu thông tin tài xế
    const [deliveryStep, setDeliveryStep] = useState(1); // Trạng thái giao hàng
    const history = useHistory();


    const {
        address,
        lat,
        lng,
        current,
        distance,
        name } = location.state || {};

    // Thêm thuốc (giới hạn 5 loại)
    const handleAddMedicine = () => {
        if (medicines.length < 5) {
            setMedicines([...medicines, { name: '', quantity: 1, image: null, imageUrl: null }]);
        } else {
            setErrorMessage('Bạn chỉ có thể thêm tối đa 5 loại thuốc.');
            setShowErrorAlert(true);
        }
    };

    // Xóa thuốc
    const handleRemoveMedicine = (index) => {
        const updatedMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(updatedMedicines);
    };

    // Xử lý thay đổi tên, số lượng, ảnh
    const handleInputChange = (index, field, value) => {
        const updatedMedicines = medicines.map((medicine, i) =>
            i === index ? { ...medicine, [field]: value } : medicine
        );
        setMedicines(updatedMedicines);
    };

    // Xử lý upload ảnh
    const handleImageUpload = (index, file) => {
        const imageUrl = URL.createObjectURL(file);
        const updatedMedicines = medicines.map((medicine, i) =>
            i === index ? { ...medicine, image: file, imageUrl } : medicine
        );
        setMedicines(updatedMedicines);
    };

    // Validate Form
    const validateForm = () => {
        for (let i = 0; i < medicines.length; i++) {
            const medicine = medicines[i];

            // Kiểm tra tên thuốc
            if (!medicine.name.trim()) {
                setErrorMessage(`Tên thuốc ở hàng ${i + 1} không được để trống.`);
                setShowErrorAlert(true);
                return false;
            }

            // Kiểm tra số lượng
            if (!medicine.quantity || medicine.quantity <= 0) {
                setErrorMessage(`Số lượng thuốc ở hàng ${i + 1} phải lớn hơn 0.`);
                setShowErrorAlert(true);
                return false;
            }
        }
        return true;
    };

    useEffect(() => {

        // Kết nối đến server
        const socket = io(env.API_URL);

        // Lắng nghe sự kiện từ server
        socket.on('pickupEvent', (data: any) => {
            if (user?.id === data.userID.id) {
                setDeliveryStep(2);
            }
        });
        socket.on('deliveryEvent', (data: any) => {
            if (user?.id === data.userID.id) {
                setDeliveryStep(3);
            }
        });

        socket.on('completionEvent', () => {
            setDeliveryStep(4);
            setTimeout(() => {
                window.location.href = '/'; // Navigate to home after 3 seconds
            }, 2000);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    // Submit Form
    const handleOrderSubmit = () => {
        if (validateForm()) {
            setLoading(true); // Hiển thị loading
            setTimeout(() => {
                setLoading(false); // Tắt loading sau 2 giây (mô phỏng)
                setShowModal(true); // Hiển thị modal sau khi loading hoàn thành
            }, 2000);
        }
    };

    // Xác nhận đơn hàng, hiển thị timeline
    const handleConfirmOrder = async () => {
        console.log(medicines);

        // Đóng modal xác nhận và hiển thị modal tìm tài xế
        setShowModal(false);
        setFindingDriver(true);

        // Simulate finding driver (3 giây)
        setTimeout(async () => {
            setFindingDriver(false); // Đóng modal tìm tài xế
            // Hiển thị timeline hoặc tiếp tục xử lý

            // Gửi dữ liệu đặt hàng
            const data = {
                fromAddress: current.address,
                toAddress: address,
                fromLat: current.lat,
                fromLng: current.lng,
                toLat: lat,
                toLng: lng,
                cost: total,
                distance,
                type: 'delivery',
                products: medicines,
            };

            const rsp = await dispatch(createBooking({ ...data }));
            if (rsp?.payload?.status) {
                setDriver(rsp?.payload?.data?.driver);
                setShowTimeline(true);
                setDriverFound(true);
            }
            else {
                setErrorMessage(rsp?.payload?.message);
                setShowErrorAlert(true);
                setDriverFound(false);
            }

        }, 3000);
    };

    const handleNextStep = () => {
        setDeliveryStep((prev) => Math.min(prev + 1, 3)); // Chuyển step theo thứ tự
    };

    return (
        <IonPage>
            <IonContent>
                {/* Loading */}
                <IonLoading isOpen={loading} message={'Đang xử lý...'} />

                {/* Alert Error */}
                <IonAlert
                    isOpen={showErrorAlert}
                    onDidDismiss={() => setShowErrorAlert(false)}
                    header={'Lỗi'}
                    message={errorMessage}
                    buttons={['OK']}
                />
                <IonLoading
                    isOpen={findingDriver}
                    message={'Đang tìm kiếm tài xế...'}
                    spinner="circles"
                />
                <div className="flex items-center justify-center">
                    <div className="bg-white w-full max-w-lg">
                        <div className="p-2">
                            <div className="flex items-center mb-4 border-b-gray-300 h-[40px]  ">
                                <button className="text-orange-500 mr-4">
                                    ←
                                </button>
                                <h1 className="text-xl font-semibold">Mua hàng</h1>
                            </div>

                            <div className='h-[1px] w-full bg-gray-200'></div>

                            <div className="bg-white p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-red-500 text-xl mr-2">📍</span>
                                    <span className="text-lg font-semibold">Địa chỉ giao hàng</span>
                                </div>
                                <p className="text-gray-600 mb-2">{user?.name} | {user?.phoneNumber}</p>
                                <p className="text-gray-600">
                                    {current?.address}
                                </p>
                            </div>
                            <div className='h-[1px] w-full bg-gray-200 my-3'></div>

                        </div>


                        <p className='font-bold px-5 pb-2'>{name} - {address} </p>
                        {/* Container cuộn cho danh sách thuốc */}
                        <div className="h-[30vh] overflow-y-auto mb-4 px-5">
                            <form>
                                {medicines.map((medicine, index) => (
                                    <div key={index} className="mb-6">
                                        {/* Row chứa tên thuốc, số lượng và ảnh */}
                                        <div className="flex items-center mb-4">
                                            {/* Icon máy ảnh hoặc ảnh */}
                                            <label className="cursor-pointer mr-4">
                                                {!medicine.imageUrl ? (
                                                    <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-md">
                                                        <IonIcon icon={imageOutline} size="small" className="text-gray-500" />
                                                        {/* <FaCamera className="text-gray-500" size={20} /> */}
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={medicine.imageUrl}
                                                        alt="Medicine"
                                                        className="w-12 h-12 object-cover rounded-md"
                                                    />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                                />
                                            </label>

                                            {/* Tên thuốc */}
                                            <input
                                                type="text"
                                                placeholder="Tên thuốc"
                                                className="w-full p-2 border border-gray-300 rounded-md mr-4"
                                                value={medicine.name}
                                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                                required
                                            />

                                            {/* Số lượng thuốc */}
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Số lượng"
                                                className="w-20 p-2 border border-gray-300 rounded-md mr-4"
                                                value={medicine.quantity}
                                                onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                                                required
                                            />

                                            {/* Nút xóa */}
                                            {medicines.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="text-red-500 font-bold"
                                                    onClick={() => handleRemoveMedicine(index)}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </form>


                        </div>

                        <div className='fixed bottom-40 px-5 w-full'>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-gray-600">Phí giao hàng (1.9 km)</p>
                                <p className="text-gray-600">{shippingFee.toLocaleString()}đ</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <p className="text-gray-600">Phí áp dụng</p>
                                    <span className="ml-1 text-gray-400 cursor-pointer">ⓘ</span>
                                </div>
                                <p className="text-gray-600">{appliedFee.toLocaleString()}đ</p>
                            </div>

                            {/* Tổng cộng */}
                            <div className="flex justify-between items-center mt-4 border-t pt-2">
                                <p className="text-lg font-bold">Tổng cộng</p>
                                <p className="text-lg font-bold text-red-500">
                                    {total.toLocaleString()}đ
                                </p>
                            </div>

                            {/* Đã bao gồm thuế */}
                            <p className="text-gray-400 mt-1 text-sm">Đã bao gồm thuế</p>
                        </div>

                        {/* Phần nút cố định ở dưới */}
                        <div className="mt-4 fixed bottom-0 w-full grid grid-cols-1 justify-center bg-white p-4">
                            <button
                                type="button"
                                className="w-full h-[50px] bg-blue-500 text-white py-2 rounded-md mb-4"
                                onClick={handleAddMedicine}
                            >
                                Thêm thuốc
                            </button>

                            <button
                                type="button"
                                className="w-full h-[50px] bg-red-500 text-white py-2 rounded-md"
                                onClick={handleOrderSubmit}
                            >
                                Đặt hàng
                            </button>
                        </div>
                    </div>

                    {/* Modal xác nhận */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                                <h2 className="text-xl font-bold mb-4">Xác nhận đơn hàng</h2>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {medicines.map((medicine, index) => (
                                        <div key={index} className="mb-4 flex items-center">
                                            <img
                                                src={medicine.imageUrl}
                                                alt={medicine.name}
                                                className="w-16 h-16 object-cover rounded-md mr-4"
                                            />
                                            <div>
                                                <p><strong>{medicine.name}</strong></p>
                                                <p>Số lượng: {medicine.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="mt-4">
                                        <div className='flex items-center'>
                                            <div className='w-2 h-2 bg-red-500 rounded'></div>
                                            <p className='ml-2 text-sm text-gray-500'>Mua hàng từ: </p>
                                        </div>
                                        <p className='text-sm'>{address}</p>
                                        <div className='h-[1px] bg-gray-200 w-full mt-3 mb-3'></div>
                                        <div className='flex items-center'>
                                            <div className='w-2 h-2 bg-green-500 rounded'></div>
                                            <p className='ml-2 text-sm text-gray-500'>Giao tại: </p>
                                        </div>
                                        <p className='text-sm'>{current?.address}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-gray-600">Phí giao hàng (1.9 km)</p>
                                        <p className="text-gray-600">{shippingFee.toLocaleString()}đ</p>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                            <p className="text-gray-600">Phí áp dụng</p>
                                            <span className="ml-1 text-gray-400 cursor-pointer">ⓘ</span>
                                        </div>
                                        <p className="text-gray-600">{appliedFee.toLocaleString()}đ</p>
                                    </div>

                                    {/* Tổng cộng */}
                                    <div className="flex justify-between items-center mt-4 border-t pt-2">
                                        <p className="text-lg font-bold">Tổng cộng</p>
                                        <p className="text-lg font-bold text-red-500">
                                            {total.toLocaleString()}đ
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="bg-gray-300 text-black py-2 px-4 rounded-md mr-4"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="bg-green-500 text-white py-2 px-4 rounded-md"
                                        onClick={handleConfirmOrder}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {driverFound && driver && showTimeline && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-4 w-full max-w-lg rounded-lg">
                                <h2 className="text-lg font-bold mb-4">Thông tin tài xế</h2>
                                <div className="flex items-center mb-4">
                                    <img
                                        src={driver.image || 'https://via.placeholder.com/150'}
                                        alt="Driver"
                                        className="w-16 h-16 object-cover rounded-full mr-4"
                                    />
                                    <div>
                                        <p className="font-bold">{driver.name}</p>
                                        <p className="text-gray-600">Số điện thoại: {driver.phoneNumber}</p>
                                    </div>
                                </div>

                                {/* Buttons liên hệ */}
                                <div className="flex space-x-4 mb-4">
                                    <button className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg">
                                        <IonIcon icon={callOutline} className="mr-2" />
                                        Gọi
                                    </button>
                                    <button className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg">
                                        <IonIcon icon={chatbubblesOutline} className="mr-2" />
                                        Nhắn tin
                                    </button>
                                </div>

                                {/* Timeline trạng thái */}
                                <h2 className="text-lg font-bold mb-4">Trạng thái giao hàng</h2>
                                <div className="flex items-center justify-between">
                                    <div className={`w-20 h-1 ${deliveryStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                    <div className={`w-20 h-1 ${deliveryStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                    <div className={`w-20 h-1 ${deliveryStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                    <div className={`w-20 h-1 ${deliveryStep >= 4 ? 'bg-blue-500' : 'bg-gray-300'}`} />

                                </div>
                                <div className="flex justify-between mt-2 text-sm">
                                    <span className={deliveryStep >= 1 ? 'text-blue-500' : 'text-gray-400'}>Tìm thấy tài xế</span>
                                    <span className={deliveryStep >= 2 ? 'text-blue-500' : 'text-gray-400'}>Đã lấy hàng</span>
                                    <span className={deliveryStep >= 3 ? 'text-blue-500' : 'text-gray-400'}>Đang giao hàng</span>
                                    <span className={deliveryStep >= 4 ? 'text-blue-500' : 'text-gray-400'}>Hoàn thành</span>
                                </div>

                                {/* <div className="flex justify-end mt-4">
                                    {deliveryStep < 3 && (
                                        <button
                                            onClick={handleNextStep}
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                        >
                                            Tiếp tục
                                        </button>
                                    )}
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>

    );
}

export default App;
