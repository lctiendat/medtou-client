import { IonIcon } from "@ionic/react";
import { locationOutline } from "ionicons/icons";

export default function index(params: any): any {
    return (
        <div>
            <div className='flex justify-between items-center my-2'>
                <p className="text-sm font-semibold">Tracking Number</p>
                <span className='text-xs text-gray-500 text-right font-semibold'>Status</span>
            </div>
            <div className="flex justify-between items-center my-2">
                <div>
                    <p className="text-purple-700 font-bold text-base">#012857843456</p>
                </div>
                <div className='grid'>
                    <span className="bg-yellow-500 text-white px-1 py-0.5 rounded-full text-xs">
                        Waiting Pickup
                    </span>
                </div>

            </div>
            <div className='flex justify-between items-center my-2'>
                <p className='text-xs font-semibold text-gray-400'>
                    <IonIcon icon={locationOutline} className="align-middle" />{' '}
                    Amsterdam, Netherlands
                </p>
                <p className='text-xs font-semibold text-gray-400'>
                    May 6, 18:23
                </p>
            </div>
            <div className='flex justify-between items-center mt-2'>
                <p className='text-xs font-semibold text-gray-400'>
                    <IonIcon icon={locationOutline} className="align-middle" />{' '}
                    London, UK
                </p>
                <p className='text-xs font-semibold text-gray-400'>
                    May 12, 09:41
                </p>
            </div>
            <hr className='my-5' />
        </div>
    )
};
