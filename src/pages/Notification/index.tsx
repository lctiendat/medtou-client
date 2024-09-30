import React from 'react';
import { IonIcon, IonPage, IonContent } from '@ionic/react';
import { arrowBack, settingsOutline, calendarOutline, notificationsOutline } from 'ionicons/icons';
import { useIonViewWillEnter } from '@ionic/react';

const notifications = [
    {
        id: '1',
        icon: settingsOutline,
        title: 'We know that—for children AND adults—learning is most effective when it is',
        date: 'Aug 12, 2020 at 12:08 PM',
        unread: true
    },
    {
        id: '2',
        icon: calendarOutline,
        title: 'The future of professional learning is immersive, communal experiences for',
        date: 'Aug 12, 2020 at 12:08 PM',
        unread: false
    },
    {
        id: '3',
        icon: notificationsOutline,
        title: 'With this in mind, Global Online Academy created the Blended Learning Design',
        date: 'Aug 12, 2020 at 12:08 PM',
        unread: false
    },
    {
        id: '4',
        icon: notificationsOutline,
        title: 'Technology should serve, not drive, pedagogy. Schools often discuss',
        date: 'Aug 12, 2020 at 12:08 PM',
        unread: false
    },
    {
        id: '5',
        icon: notificationsOutline,
        title: 'Peer learning works. By building robust personal learning communities both',
        date: 'Aug 12, 2020 at 12:08 PM',
        unread: false
    }
];

function Notifications() {
    const renderNotification = (item: any) => (
        <div className="flex items-center p-4 border border-gray-300 rounded-lg mb-4">
            <IonIcon icon={item.icon} size="small" className="text-gray-500" />
            <div className="flex-1 ml-4">
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.date}</p>
            </div>
            {item.unread && <div className="w-3 h-3 bg-red-500 rounded-full" />}
        </div>
    );

    return (
        <IonPage>
            <IonContent>
                <div className="p-5 bg-white h-full">
                    <div className="flex items-center justify-between mb-4">
                        <IonIcon icon={arrowBack} size="small" />
                        <h1 className="text-md font-bold">Notification</h1>
                        <button className="text-blue-500 font-bold">Clear all</button>
                    </div>

                    <div>
                        {notifications.map(notification => (
                            <div key={notification.id}>
                                {renderNotification(notification)}
                            </div>
                        ))}
                    </div>
                </div>
            </IonContent>
        </IonPage>

    );
}

export default Notifications;
