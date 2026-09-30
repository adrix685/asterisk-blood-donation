import React,{useEffect,useState}from"react";
import{MapContainer,TileLayer,Marker,Popup,Polyline,useMap}from"react-leaflet";
import{useNavigate}from"react-router-dom";
import L from"leaflet";
import"leaflet/dist/leaflet.css";
import"./DonorStatus.css";

const hospital=[22.5135084,88.402884];

const icons={
 donor:L.divIcon({className:"donor-marker",html:"🩸",iconSize:[42,42]}),
 hospital:L.divIcon({className:"hospital-marker",html:"+",iconSize:[42,42]})
};

function Follow({pos}){
 const map=useMap();
 useEffect(()=>{if(pos)map.setView(pos,map.getZoom())},[pos,map]);
 return null;
}

function Route({pos,setInfo}){
 const[lines,setLines]=useState([]);

 useEffect(()=>{
  if(!pos)return;

  fetch(`https://router.project-osrm.org/route/v1/driving/${pos[1]},${pos[0]};${hospital[1]},${hospital[0]}?overview=full&geometries=geojson`)
   .then(r=>r.json()).then(d=>{
    const r=d.routes?.[0];
    if(!r)return setLines([]);

    setLines(r.geometry.coordinates.map(([x,y])=>[y,x]));
    setInfo({d:r.distance/1000,t:r.duration/60});
   }).catch(()=>setLines([]));
 },[pos,setInfo]);

 return lines.length?<Polyline positions={lines} pathOptions={{color:"#d71920",weight:5}}/>:null;
}

export default function DonorStatus(){
 const navigate=useNavigate();
 const[req,setReq]=useState(null);
 const[pos,setPos]=useState(null);
 const[status,setStatus]=useState("pending");
 const[info,setInfo]=useState(null);

 useEffect(()=>{
  const load=()=>{
   const data=localStorage.getItem("bloodRequest");
   if(!data)return setReq(null);

   const r=JSON.parse(data),s=r.donorStatus||r.status||"pending";

   setReq(r);
   setStatus(
    s==="arrived"?"arrived":
    ["accepted","en_route"].includes(s)?"en_route":
    s==="declined"?"declined":"pending"
   );

   setPos(
    r.donorLatitude!=null
     ?[+r.donorLatitude,+r.donorLongitude]
     :null
   );
  };

  load();
  const id=setInterval(load,500);
  return()=>clearInterval(id);
 },[]);

 if(!req)
  return(
   <main className="donor-status-container">
    <h1>No Blood Request Found</h1>
    <p>No active blood request.</p>
    <button onClick={()=>navigate("/find-donors")}>← Find Donors</button>
   </main>
  );

 const donor=req.donorName||"Selected Donor";
 const blood=req.donorBloodGroup||req.bloodGroup||"--";

 const labels={
  pending:"⏳ PENDING",
  en_route:"🚗 EN ROUTE",
  declined:"✕ DECLINED",
  arrived:"✓ ARRIVED"
 };

 return(
  <div className="donor-status-page">

   <header className="donor-status-header">
    <div className="logo">LifeLink</div>
    <nav>
     <button onClick={()=>navigate("/find-donors")}>Home</button>
     <button className="active">Requests</button>
     <button onClick={()=>navigate("/donate")}>Donate</button>
     <button onClick={()=>navigate("/donor-profile")}>Profile</button>
    </nav>
   </header>

   <main className="donor-status-container">

    <button className="back-button"
      onClick={()=>navigate("/find-donors")}>
      ← Find Donors
    </button>

    <h1>Donor Status</h1>
    <p>Track your blood donation request.</p>

    <section className="request-summary">
     <span>BLOOD REQUEST</span>
     <h2>{req.bloodGroup} Blood Needed</h2>
     <p>🏥 {req.hospital||"Ruby General Hospital"}</p>
     <p>📍 {req.location||"Kolkata"}</p>
     <p>🩸 {req.bloodGroup}</p>
    </section>

    <section className="responses-section">
     <h2>Donor Response</h2>

     <div className="donor-card">
      <div className="donor-avatar">🩸</div>
      <div>
       <h3>{donor}</h3>
       <p>Blood Group: <strong>{blood}</strong></p>
       <p>📍 {req.donorLocation||req.location||"Kolkata"}</p>
      </div>

      <span className={`status-badge ${status}`}>
       {labels[status]}
      </span>
     </div>
    </section>

    {status==="pending"&&
     <div className="waiting-text">
      ⏳ Waiting for <strong>{donor}</strong> to respond...
     </div>
    }

    {status==="declined"&&
     <div className="declined-text">
      ✕ <strong>{donor}</strong> declined this request.
     </div>
    }

    {status==="en_route"&&(
     <>
      <div className="en-route-status">🚗 EN ROUTE</div>

      {pos?(
       <div className="live-tracking">
        <h3>📍 Donor Live Location</h3>

        <MapContainer
         center={pos}
         zoom={14}
         className="status-map"
        >
         <Follow pos={pos}/>

         <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />

         <Marker position={pos} icon={icons.donor}>
          <Popup>{donor}</Popup>
         </Marker>

         <Marker position={hospital} icon={icons.hospital}>
          <Popup>{req.hospital}</Popup>
         </Marker>

         <Route pos={pos} setInfo={setInfo}/>
        </MapContainer>

        {info&&
         <div className="map-distance">
          🚗 {info.d.toFixed(1)} km · {Math.round(info.t)} min
         </div>
        }
       </div>
      ):(
       <div className="waiting-text">
        📍 Waiting for {donor} to share location...
       </div>
      )}
     </>
    )}

    {status==="arrived"&&
     <div className="arrival-message">
      ✓ <strong>{donor} has arrived</strong> at {req.hospital}.
     </div>
    }

   </main>
  </div>
 );
}