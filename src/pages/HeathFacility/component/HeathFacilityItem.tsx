import { useHistory } from 'react-router-dom';


export default function HeathFacilityItem({ facility }) {
    const history = useHistory();

    const { address, lat, lng, current, distance, name, tag } = facility

    return (<div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-gray-800 font-semibold">{name}</h3>
        <p className="text-gray-600">{address}</p>
        <div className="flex justify-between mt-4">
            <button className="text-red-500 font-semibold"><a href={`https://www.google.com/maps/@${lat},${lng}`} target="_blank">Chỉ đường</a></button>
            {/* <button onClick={() => {
                history.push(tag === 'pharmacy' ? 'confirm-order' : 'confirm-booking', {
                    address,
                    lat,
                    lng,
                    current,
                    distance,
                    name

                })
            }} className="bg-red-500 text-white py-2 px-4 rounded-lg">{tag === 'pharmacy' ? 'Mua thuốc' : "Đặt xe"}</button> */}
        </div>
    </div>)
}; 
