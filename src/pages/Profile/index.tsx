import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { logOutOutline, walletOutline, cardOutline, locationOutline, peopleOutline, helpCircleOutline, restaurantOutline, settingsOutline, bagAddOutline, bicycleOutline } from 'ionicons/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const UserProfile: React.FC = () => {
    const { user, isLogin } = useSelector((state: RootState) => state.user);

    return (
        <IonPage>
            {/* Header with orange background */}
            <IonHeader className='bg-red-500 h-40'>
                <div className="bg-red-500 h-28">
                    <div className="flex flex-col items-center mt-5">
                        {/* Avatar and User Name */}
                        <div className="flex items-center justify-center">
                            <div className="bg-green-600 w-14 h-14 rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">D</span>
                            </div>
                            <IonTitle className="text-white text-xl font-medium mt-10 text-center">{user?.name}</IonTitle>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent>
                {/* List of User Options */}
                <IonList className="mt-5">
                    <IonItem className="flex justify-between">
                        <div className="flex items-center">
                            <IonIcon icon={walletOutline} className="text-xl text-orange-500" />
                            <IonLabel className="ml-3">Ví Voucher</IonLabel>
                        </div>
                    </IonItem>

                    <IonItem className="flex justify-between">
                        <div className="flex items-center">
                            <IonIcon icon={cardOutline} className="text-xl text-yellow-500" />
                            <IonLabel className="ml-3">MedT Xu</IonLabel>
                        </div>
                    </IonItem>

                    <IonItem className="flex items-center">
                        <IonIcon icon={locationOutline} className="text-xl text-green-500" />
                        <IonLabel className="ml-3">Địa chỉ</IonLabel>
                    </IonItem>

                    <IonItem className="flex items-center">
                        <IonIcon icon={peopleOutline} className="text-xl text-blue-500" />
                        <IonLabel className="ml-3">Mời bạn bè</IonLabel>
                    </IonItem>

                    <IonItem className="flex items-center">
                        <IonIcon icon={helpCircleOutline} className="text-xl text-purple-500" />
                        <IonLabel className="ml-3">Trung tâm Trợ giúp</IonLabel>
                    </IonItem>

                    <IonItem className="flex items-center">
                        <IonIcon icon={bicycleOutline} className="text-xl text-red-500" />
                        <IonLabel className="ml-3">Ứng dụng cho tài xế</IonLabel>
                    </IonItem>

                    <IonItem className="flex items-center">
                        <IonIcon icon={settingsOutline} className="text-xl text-gray-500" />
                        <IonLabel className="ml-3">Cài đặt</IonLabel>
                    </IonItem>

                    <IonItem className="flex items-center">
                        <IonIcon icon={bagAddOutline} className="text-xl text-orange-500" />
                        <IonLabel className="ml-3">Về MedToU</IonLabel>
                    </IonItem>
                </IonList>

                {/* Logout Button */}
                <div className="flex justify-center mt-5">
                    <IonButton color="danger" className="w-64 h-6 text-md rounded text-md" onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}>
                        <IonIcon slot="start" icon={logOutOutline} />
                        Đăng xuất
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default UserProfile;
