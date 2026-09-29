import React,{useEffect,useState}from"react";
import{MapContainer,TileLayer,Marker,Popup,Polyline,useMap}from"react-leaflet";
import{useNavigate}from"react-router-dom";
import L from"leaflet";
import"leaflet/dist/leaflet.css";
import"./DonorStatus.css";

const hospital=[22.5135084,88.402884];

const icons={
  donor:L.divIcon({
    className:"custom-map-icon",
    html:`<div class="donor-marker">🩸</div>`,
    iconSize:[42,42],iconAnchor:[21,42]
  }),
  hospital:L.divIcon({
    className:"custom-map-icon",
    html:`<div class="hospital-marker">+</div>`,
    iconSize:[46,46],iconAnchor:[23,46]
  })
};

function Follow({location}){
  const map=useMap();

  useEffect(()=>{
    if(location)map.setView(location,map.getZoom(),{animate:true});
  },[location,map]);

  return null;
}

function Route({location,setInfo}){
  const[points,setPoints]=useState([]);

  useEffect(()=>{
    if(!location)return;

    const start=`${location[1]},${location[0]}`;
    const end=`${hospital[1]},${hospital[0]}`;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
    )
      .then(r=>{
        if(!r.ok)throw Error();
        return r.json();
      })
      .then(data=>{
        const route=data.routes?.[0];

        if(!route){
          setPoints([]);
          setInfo(null);
          return;
        }

        setPoints(
          route.geometry.coordinates.map(([lng,lat])=>[lat,lng])
        );

        setInfo({
          distance:route.distance/1000,
          duration:route.duration/60
        });
      })
      .catch(()=>{
        setPoints([]);
        setInfo(null);
      });
  },[location,setInfo]);

  return points.length?
    <Polyline
      positions={points}
      pathOptions={{color:"#d71920",weight:5,opacity:.85}}
    />:null;
}

function DonorStatus(){
  const navigate=useNavigate();
  const[request,setRequest]=useState(null);
  const[location,setLocation]=useState(null);
  const[status,setStatus]=useState("pending");
  const[route,setRoute]=useState(null);

  useEffect(()=>{
    const load=()=>{
      try{
        const data=localStorage.getItem("bloodRequest");

        if(!data){
          setRequest(null);
          setStatus("pending");
          setLocation(null);
          return;
        }

        const saved=JSON.parse(data);
        const s=saved.donorStatus||saved.status||"pending";

        setRequest(saved);
        setStatus(
          s==="arrived"?"arrived":
          ["en_route","accepted"].includes(s)?"en_route":
          s==="declined"?"declined":"pending"
        );

        setLocation(
          saved.donorLatitude!=null&&saved.donorLongitude!=null
            ?[+saved.donorLatitude,+saved.donorLongitude]
            :null
        );

        if(s==="arrived")setRoute(null);
      }catch(error){
        console.error("Error loading blood request:",error);
        setStatus("pending");
      }
    };

    load();
    const timer=setInterval(load,500);
    return()=>clearInterval(timer);
  },[]);

  if(!request){
    return(
      <div className="donor-status-page">
        <header className="donor-status-header">
          <div className="logo">LifeLink</div>
        </header>

        <main className="donor-status-container">
          <div className="page-heading">
            <h1>No Blood Request Found</h1>
            <p>There is currently no active blood request.</p>
          </div>

          <button
            className="back-button"
            onClick={()=>navigate("/find-donors")}
            type="button"
          >
            ← Find Donors
          </button>
        </main>
      </div>
    );
  }

  const donor=request.donorName||"Selected Donor";
  const bloodGroup=request.donorBloodGroup||request.bloodGroup||"--";

  const statuses={
    pending:"⏳ PENDING",
    en_route:"🚗 EN ROUTE",
    declined:"✕ DECLINED",
    arrived:"✓ ARRIVED"
  };

  const details=[
    ["🏥","Hospital",request.hospital||"Ruby General Hospital"],
    ["📍","Location",request.location||"Kolkata"],
    ["🩸","Blood Group",request.bloodGroup||"--"],
    ["📅","Required Date",request.requiredDate||"30 September 2026"]
  ];

  const distance=route
    ?route.distance<1
      ?`${Math.round(route.distance*1000)} m`
      :`${route.distance.toFixed(1)} km`
    :"--";

  const eta=route?`${Math.round(route.duration)} min`:"--";

  return(
    <div className="donor-status-page">
      <header className="donor-status-header">
        <div className="logo">LifeLink</div>

        <nav>
          <button onClick={()=>navigate("/find-donors")}>Home</button>
          <button className="active">Requests</button>
          <button>Donate</button>
          <button>Profile</button>
        </nav>
      </header>

      <main className="donor-status-container">
        <button
          className="back-button"
          onClick={()=>navigate("/find-donors")}
          type="button"
        >
          ← Find Donors
        </button>

        <div className="page-heading">
          <h1>Donor Status</h1>
          <p>Track your blood donation request.</p>
        </div>

        <section className="request-summary">
          <div className="summary-top">
            <div>
              <span className="summary-label">BLOOD REQUEST</span>
              <h2>{request.bloodGroup} Blood Needed</h2>
            </div>

            <span className="urgency-badge">
              {request.urgency||"URGENT"}
            </span>
          </div>

          <div className="request-details">
            {details.map(([icon,title,value])=>(
              <div className="detail-item" key={title}>
                <div className="detail-icon">{icon}</div>
                <div>
                  <strong>{title}</strong>
                  <span>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="responses-section">
          <div className="section-heading">
            <h2>Donor Response</h2>
          </div>

          <div className="donor-list">
            <div className="donor-card">
              <div className="donor-info">
                <div className="donor-avatar">🩸</div>

                <div className="donor-details">
                  <h3>{donor}</h3>
                  <p>Blood Group: <strong>{bloodGroup}</strong></p>
                  <p>
                    📍 {request.donorLocation||request.location||"Kolkata"}
                  </p>
                </div>
              </div>

              <div className="donor-action">
                <span className={`status-badge ${status}`}>
                  {statuses[status]}
                </span>
              </div>
            </div>
          </div>
        </section>

        {status==="pending"&&(
          <div className="waiting-text">
            ⏳ Waiting for <strong>{donor}</strong> to respond...
          </div>
        )}

        {status==="declined"&&(
          <div className="declined-text">
            ✕ <strong>{donor}</strong> declined this request.
          </div>
        )}

        {status==="en_route"&&(
          <>
            <div className="en-route-status">🚗 EN ROUTE</div>

            <p className="route-text">
              <strong>{donor}</strong> has accepted your request and is
              travelling to the hospital.
            </p>

            {location?(
              <div className="live-tracking">
                <h3>📍 Donor Live Location</h3>

                <MapContainer
                  center={location}
                  zoom={14}
                  scrollWheelZoom
                  className="status-map"
                >
                  <Follow location={location}/>

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={location} icon={icons.donor}>
                    <Popup>
                      <strong>{donor}</strong>
                      <br/> Donor's live location
                    </Popup>
                  </Marker>

                  <Marker position={hospital} icon={icons.hospital}>
                    <Popup>
                      <strong>{request.hospital}</strong>
                      <br/>Donation destination
                    </Popup>
                  </Marker>

                  <Route location={location} setInfo={setRoute}/>
                </MapContainer>

                <div className="map-distance">
                  <span>🚗</span>
                  <div>
                    <strong>{distance}</strong>
                    <small>{eta} estimated travel</small>
                  </div>
                </div>

                <div className="destination-label">
                  <strong>DESTINATION</strong>
                  <small>{request.hospital}</small>
                </div>
              </div>
            ):(
              <div className="waiting-text">📍 Waiting for <strong>{donor}</strong> to share live location...</div>
            )}
          </>
        )}

        {status==="arrived"&&(
          <>
            <div className="en-route-status arrived-status"> ✓ ARRIVED </div>

            <p className="route-text">
              <strong>{donor}</strong> has arrived at{" "}
              <strong>{request.hospital}</strong>.
            </p>

            <div className="arrival-message">
              <div className="arrival-icon">✓</div>
              <div>
                <strong>Donor has arrived</strong>
                <p>{donor} has reached the hospital for the blood donation.</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default DonorStatus;