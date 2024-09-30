import { IonContent, IonPage, useIonViewWillEnter } from "@ionic/react";
import { Link } from "react-router-dom";
import { useUser } from "../../hook/useUser";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Blog from "./component/Blog";
import { IUser } from "../../redux/slice/userSlice";





export default function Home() {
    const [loadUserData, setLoadUserData] = useState<any>();
    const dispatch = useDispatch();
    const { loadUser } = useUser()
    const user = useSelector((state: any) => state.user.user)

    useEffect(() => {
        if (!loadUserData && user != loadUserData) {
            setLoadUserData(user);
        }
    }, [user, loadUserData]);

    useEffect(() => {
        loadUser();
    }, [dispatch])

    return (
        <IonPage>
            <IonContent>
                <div className="min-h-screen bg-gray-100 p-4">
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <header className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <img src="src/assets/image/icon/mask.png" alt="Logo" className="h-8 w-8 rounded-full mr-2" />
                                <div>
                                    <p className="text-gray-700">Xin chào</p>
                                    <p className="text-red-500 font-semibold">{loadUserData?.name}</p>
                                </div>
                            </div>
                            <button className="text-gray-500">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </header>

                        <div className="bg-red-500 text-white rounded-lg p-4 mb-4">
                            <p className="font-semibold">Tìm kiếm cơ sở y tế</p>
                            <h2 className="text-2xl font-bold">Nhanh chóng</h2>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4 shadow">
                            <p className="text-red-500 font-semibold">Lợi ích khi dùng ứng dụng MedToU</p>
                            <div className="flex items-center mt-2">
                                <img src="src/assets/image/icon/relief.png" alt="Illustration" className="h-16 w-16" />
                                <div className="ml-4">
                                    <p className="text-gray-700">Các lợi ích của ứng dụng sẽ được hiển thị ở đây.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to={'/healthfacilitylist'}>  <div className="bg-pink-500 text-white rounded-lg p-4 flex flex-col items-center">
                                <img src="src/assets/image/icon/public-health.png" alt="Cơ sở y tế" className="h-12 w-12 mb-2" />
                                <p>Cơ sở y tế</p>
                            </div>
                            </Link>
                            <Link to={'/hospital'}>  <div className="bg-green-500 text-white rounded-lg p-4 flex flex-col items-center">
                                <img src="src/assets/image/icon/car.png" alt="Đặt xe" className="h-12 w-12 mb-2" />
                                <p>Đặt xe</p>
                            </div></Link>
                            <Link to={'/pharmacy'}>   <div className="bg-yellow-500 text-white rounded-lg p-4 flex flex-col items-center">
                                <img src="src/assets/image/icon/online-pharmacy.png" alt="Mua hàng" className="h-12 w-12 mb-2" />
                                <p>Mua hàng</p>
                            </div></Link>
                            <div className="bg-blue-500 text-white rounded-lg p-4 flex flex-col items-center">
                                <img src="src/assets/image/icon/article.png" alt="Gợi ý sức khoẻ" className="h-12 w-12 mb-2" />
                                <p>Gợi ý sức khoẻ</p>
                            </div>
                        </div>
                        <div className="py-2 mt-5">
                            <h2 className="text-gray-700 font-semibold mb-4 text-md">Tin mới nhất</h2>
                            <div className="overflow-x-auto">
                                <Blog />
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>


    )
};
