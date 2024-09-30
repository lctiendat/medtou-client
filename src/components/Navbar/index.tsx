import { IonIcon } from "@ionic/react"
import { chevronBackOutline, homeOutline } from "ionicons/icons"
import { Link, useLocation } from "react-router-dom"

export default function Navbar({ title, backLink = "" }) {
    const location = useLocation();

    console.log(location.pathname);
    

    return (
        <div className="bg-red-500 text-white p-3 flex items-center justify-between">
            <Link to={location.pathname} >
                <button className="text-white">
                    <IonIcon icon={chevronBackOutline} size="small" />
                </button>
            </Link>
            <h1 className="text-lg font-semibold">{title}</h1>
            <Link to={'/home'} > <button className="text-white">
                <IonIcon icon={homeOutline} size="small" />
            </button>
            </Link>
        </div>
    )
};
