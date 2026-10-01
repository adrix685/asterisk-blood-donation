
import React,{useEffect,useState}from"react";
import{MapContainer,Marker,Polyline,TileLayer,Popup}from"react-leaflet";
import{useNavigate}from"react-router-dom";
import L from"leaflet";
import"leaflet/dist/leaflet.css";
import"./DonorDashboard.css";

const hospital=[22.5135084,88.402884];

const pin=c=>L.divIcon({
  className:c,html:"",
  iconSize:[30,42],iconAnchor:[15,42]
});

const donorIcon=pin("donor-pin");
const hospitalIcon=pin("hospital-pin");

export default function DonorDashboard(){
  const navigate=useNavigate();

  const[requests,setRequests]=useState([
    {id:1,bloodGroup:"A+",hospital:"Ruby General Hospital",location:"Kolkata",urgency:"Urgent",status:"pending"},
    {id:2,bloodGroup:"O+",hospital:"AMRI Hospital",location:"Kolkata",urgency:"Critical",status:"pending"}
  ]);

  const[active,setActive]=useState(null);
  const[pos,setPos]=useState([22.5726,88.3639]);
  const[route,setRoute]=useState([]);
  const[info,setInfo]=useState(null);
  const status=active?.status;
  const updateStatus=(id,status)=>{
    setRequests(r=>r.map(x=>x.id===id?{...x,status}:x));
  };
const accept = id => {
  const r = requests.find(x => x.id === id);
  const request = {...r,
    status:"en_route",
    donorName:"Rahul Sharma",
    donorBloodGroup:r.bloodGroup,
    donorLocation:"Kolkata",
    donorStatus:"en_route",
    donorLatitude:pos[0],
    donorLongitude:pos[1]
  };

  updateStatus(id, "en_route");
  setActive(request);
  localStorage.setItem("bloodRequest", JSON.stringify(request));
};

  const decline=id=>updateStatus(id,"declined");

 const arrived=()=> {
  const request={...active,status: "arrived",donorStatus: "arrived"};
  updateStatus(active.id, "arrived");
  setActive(request);
  localStorage.setItem("bloodRequest", JSON.stringify(request));
  setRoute([]);
  setInfo(null);
};

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
        if(r){
          setRoute(r.geometry.coordinates.map(([x,y])=>[y,x]));
          setInfo([r.distance/1000,r.duration/60]);
        }
      });
    });
    return()=>navigator.geolocation.clearWatch(id);},[status]);

  return(
    <div className="donor-dashboard">
      <header className="donor-header">
        <div className="donor-logo">LifeLink</div>
        <nav>
          <button>Home</button>
          <button className="active">Requests</button>
          <button onClick={()=>navigate("/donate")}>Donate</button>
          <button onClick={()=>navigate("/donor-profile")}>Profile</button>
        </nav>
      </header>

      <main className="donor-main">
        <h1>Blood Requests</h1>
        <p>Available blood requests near you</p>

        <section className="requests-section">
          <h2>Available Requests</h2>
          {requests.filter(r=>r.status==="pending").map(r=>(
            <div className="request-card" key={r.id}>
              <h2>{r.bloodGroup} Blood</h2>
              <p>🏥 {r.hospital}</p>
              <p>📍 {r.location}</p>
              <p>🚨 {r.urgency}</p>
              <button className="accept-btn" onClick={()=>accept(r.id)}>Accept</button>
              <button className="decline-btn" onClick={()=>decline(r.id)}>Decline</button>
            </div>
          ))}
        </section>

        <section className="requests-section">
          <h2>Requests Done</h2>

          {requests.filter(r=>r.status!=="pending").map(r=>(
            <div className="request-card" key={r.id}>
              <h2>{r.bloodGroup} Blood</h2>
              <p>🏥 {r.hospital}</p>
              <p>📍 {r.location}</p>
              <p>Status: <strong>{r.status}</strong></p>

              {r.status==="en_route"&&(
                <button
                  className="arrived-btn"onClick={()=>setActive(r)}>View Tracking</button>)}
            </div>
          ))}
        </section>

        {active?.status==="en_route"&&(
        <div className="request-layout">
            <section className="request-card">
              <h2>{active.bloodGroup} Blood</h2>
              <p>🏥 {active.hospital}</p>
              <p className="on-way">🚗 You're on your way to the hospital</p>
              <button className="arrived-btn" onClick={arrived}>Arrived at Hospital </button>
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
                  <Popup>🏥 {active.hospital}</Popup>
                </Marker>

                {route.length>0&&(
                  <Polyline
                    positions={route}
                    pathOptions={{color:"#d71920",weight:5}}
                  />
                )}
              </MapContainer>

              {info&&(
                <div className="map-distance">
                  📍 {info[0].toFixed(1)} km · 🚗 {Math.round(info[1])} min
                </div>
              )}
            </section>

          </div>
        )}

      </main>
    </div>
  );
}
