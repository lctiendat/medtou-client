import React from 'react';
import {
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
} from '@ionic/react';
import { searchOutline, locationOutline, refresh, chevronForwardOutline, cubeOutline } from 'ionicons/icons';
import Item from './components/Item'

export default function Ordered(params: any) {
    return (
        <IonApp>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Ordered</IonTitle>
                </IonToolbar>
            </IonHeader>

            <div className="p-4 h-screen bg-gray-100">
                <p className="text-3xl font-bold text-purple-600">Find the order</p>

                <div className=" mb-6">
                    <p className="text-sm mb-2 text-purple-600">
                        Enter your tracking number and see details about your package.
                    </p>
                    <div className="flex justify-center">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                <IonIcon size='small' icon={cubeOutline} className="align-middle text-orange-400" />

                            </div>
                            <div className="absolute inset-y-0 end-3 flex items-center ps-3.5 pointer-events-none">
                                <IonIcon size='small' icon={searchOutline} className="align-middle text-orange-400" />
                            </div>
                            <input type="text" id="email-address-icon" className="placeholder-orange-400 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-4  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Tracking number" />
                        </div>
                    </div>
                </div>
                <IonCard className="mt-4 m-0 p-0">
                    <div className="h-[50px] px-5 bg-purple-600 text-white flex justify-between items-center rounded-b-lg">
                        <IonIcon size='small' icon={refresh} className="align-middle" />
                        <p className='text-md font-bold'>Shipment History</p>
                        <IonIcon size='small' icon={chevronForwardOutline} className="align-middle" />

                    </div>
                    <div className='my-5 mx-3 h-[34rem] overflow-y-auto'>
                        {
                            // Fetching data from API or local state
                            Array.from({ length: 5 }).map((_, index) => (
                                <Item />
                            ))
                        }
                    </div>
                </IonCard>
            </div>
        </IonApp>
    );
};
