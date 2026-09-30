import React,{useEffect,useState}from"react";
import{MapContainer,Marker,Polyline,TileLayer,Popup}from"react-leaflet";
import{useNavigate}from"react-router-dom";
import L from"leaflet";
import"leaflet/dist/leaflet.css";
import"./DonorDashboard.css";

const hospital=[22.5135084,88.402884];

const pin=c=>L.divIcon({
  className:c,html:"",iconSize:[30,42],iconAnchor:[15,42]
});

const donorIcon=pin("donor-pin");
const hospitalIcon=pin("hospital-pin");

export default function DonorDashboard(){
  const navigate=useNavigate();
  const[status,setStatus]=useState("pending");
  const[pos,setPos]=useState([22.5726,88.3639]);
  const[route,setRoute]=useState([]);
  const[info,setInfo]=useState(null);

  useEffect(()=>{
    if(status!=="accepted")return;

    const id=navigator.geolocation.watchPosition(({coords})=>{
      const p=[coords.latitude,coords.longitude];
      setPos(p);

      fetch(
        `https://router.project-osrm.org/route/v1/driving/`+
        `${p[1]},${p[0]};${hospital[1]},${hospital[0]}`+
        `?overview=full&geometries=geojson`
      )
      .then(r=>r.json())
      .then(d=>{
        const r=d.routes?.[0];
        if(!r)return;
        setRoute(r.geometry.coordinates.map(([x,y])=>[y,x]));
        setInfo([r.distance/1000,r.duration/60]);
      });
    });

    return()=>navigator.geolocation.clearWatch(id);
  },[status]);

  const arrived=()=>{
    setStatus("arrived");
    setRoute([]);
    setInfo(null);
  };

  return(
    <div className="donor-dashboard">

      <header className="donor-header">
  <div className="donor-logo">LifeLink</div>

  <nav>
    <button>Home</button>

    <button className="active">Requests</button>

    <button onClick={() => navigate("/donate")}>Donate</button>

    <button onClick={() => navigate("/donor-profile")}>Profile</button>
  </nav>
</header>

      <main className="donor-main">
        <h1>New Blood Request</h1>
        <p>A+ blood needed at Ruby General Hospital</p>

        <div className="request-layout">

          <section className="request-card">
            <h2>A+ Blood</h2>
            <p>🏥 Ruby General Hospital</p>

            {status==="pending"&&<>
              <button className="accept-btn"
                onClick={()=>setStatus("accepted")}>
                Accept
              </button>

              <button className="decline-btn"
                onClick={()=>setStatus("declined")}>
                Decline
              </button>
            </>}

            {status==="accepted"&&<>
              <p className="on-way">🚗 You're on your way to the hospital</p>
              <button className="arrived-btn" onClick={arrived}>Arrived at Hospital</button>
            </>}

            {status==="declined"&&<p>❌ Request Declined</p>}
            {status==="arrived"&&<p>✅ Arrived — GPS stopped</p>}
          </section>

          <section className="map-card">
            <MapContainer center={pos} zoom={12} className="leaflet-map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              <Marker position={pos} icon={donorIcon}>
                <Popup>🩸 Donor</Popup>
              </Marker>

              <Marker position={hospital} icon={hospitalIcon}>
                <Popup>🏥 Ruby General Hospital</Popup>
              </Marker>

              {route.length>0&&
                <Polyline positions={route}
                  pathOptions={{color:"#d71920",weight:5}}/>
              }
            </MapContainer>

            {info&&status==="accepted"&&
              <div className="map-distance">
                📍 {info[0].toFixed(1)} km · 🚗 {Math.round(info[1])} min
              </div>
            }
          </section>

        </div>
      </main>
    </div>
  );
}