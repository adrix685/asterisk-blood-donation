import React,{useCallback,useEffect,useState}from"react";
import{MapContainer,Marker,Polyline,Popup,TileLayer,useMap}from"react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import L from"leaflet";
import"leaflet/dist/leaflet.css";
import"./DonorDashboard.css";

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

function MapController({location}){
  const map=useMap();

  useEffect(()=>{
    if(location)
      map.fitBounds(
        L.latLngBounds([location,hospital]),
        {padding:[50,50]}
      );
  },[map,location]);

  return null;
}

function RoadRoute({location,setInfo}){
  const[points,setPoints]=useState([]);

  useEffect(()=>{
    if(!location)return;

    const start=`${location[1]},${location[0]}`;
    const end=`${hospital[1]},${hospital[0]}`;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
    )
      .then(r=>r.ok?r.json():Promise.reject())
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
      pathOptions={{
        color:"#d71920",
        weight:5,
        opacity:.85
      }}
    />:null;
}

function DonorDashboard(){
  const{state}=useLocation();
  const navigate = useNavigate();
  const request=state?.request||{
    bloodGroup:"A+",
    hospital:"Ruby General Hospital",
    location:"Kolkata",
    units:2,
    requiredDate:"30 September 2026",
    urgency:"Urgent"
  };

  const donor=state?.donor||{
    id:1,
    name:"Rahul Sharma",
    bloodGroup:"A+",
    location:"Kolkata"
  };

  const[position,setPosition]=useState(null);
  const[status,setStatus]=useState("pending");
  const[error,setError]=useState("");
  const[message,setMessage]=useState(
    "Accept the request to start sharing your location."
  );
  const[routeInfo,setRouteInfo]=useState(null);
  const[accuracy,setAccuracy]=useState(null);

  useEffect(()=>{
    try{
      const saved=JSON.parse(
        localStorage.getItem("bloodRequest")
      );

      if(!saved)return;

      const s=saved.donorStatus||saved.status;

      setStatus(
        s==="arrived"?"arrived":
        s==="en_route"||s==="accepted"?"accepted":
        s==="declined"?"declined":"pending"
      );

      if(saved.donorLatitude!=null&&saved.donorLongitude!=null)
        setPosition([
          +saved.donorLatitude,
          +saved.donorLongitude
        ]);

      if(saved.gpsAccuracy!=null&&s!=="arrived")
        setAccuracy(+saved.gpsAccuracy);
    }catch{}
  },[]);

  useEffect(()=>{
    if(status!=="accepted")return;

    if(!navigator.geolocation){
      setError("Geolocation is not supported.");
      setMessage("Location unavailable.");
      return;
    }

    setMessage("Getting your current location...");

    const watch=navigator.geolocation.watchPosition(
      ({coords})=>{
        const{
          latitude,
          longitude,
          accuracy:a
        }=coords;

        setPosition([latitude,longitude]);
        setAccuracy(a);
        setError("");
        setMessage("Your live location is being shared.");

        let saved={};

        try{
          saved=JSON.parse(
            localStorage.getItem("bloodRequest")
          )||{};
        }catch{}

        localStorage.setItem(
          "bloodRequest",
          JSON.stringify({
            ...saved,
            ...request,
            donorName:donor.name,
            donorId:donor.id,
            donorBloodGroup:donor.bloodGroup,
            donorLocation:donor.location,
            status:"en_route",
            donorStatus:"en_route",
            donorLatitude:latitude,
            donorLongitude:longitude,
            gpsAccuracy:a,
            lastLocationUpdate:new Date().toISOString()
          })
        );
      },
      e=>{
        setError({
          1:"Location permission was denied.",
          2:"Location could not be determined.",
          3:"Location request timed out."
        }[e.code]||"Unable to get your location.");

        setMessage("Location unavailable.");
      },
      {
        enableHighAccuracy:true,
        timeout:15000,
        maximumAge:5000
      }
    );

    return()=>navigator.geolocation.clearWatch(watch);
  },[status,request,donor]);

  const saveStatus=useCallback(newStatus=>{
    let saved={};

    try{
      saved=JSON.parse(
        localStorage.getItem("bloodRequest")
      )||{};
    }catch{}

    localStorage.setItem(
      "bloodRequest",
      JSON.stringify({
        ...saved,
        ...request,
        donorName:donor.name,
        donorId:donor.id,
        donorBloodGroup:donor.bloodGroup,
        donorLocation:donor.location,
        status:newStatus,
        donorStatus:newStatus==="accepted"
          ?"en_route"
          :newStatus
      })
    );

    setStatus(newStatus);

    if(newStatus==="accepted"){
      setError("");
      setMessage("Getting your current location...");
    }else{
      setPosition(null);
      setAccuracy(null);
      setRouteInfo(null);
    }
  },[request,donor]);

  const arrived=()=>{
    let saved={};

    try{
      saved=JSON.parse(
        localStorage.getItem("bloodRequest")
      )||{};
    }catch{}

    localStorage.setItem(
      "bloodRequest",
      JSON.stringify({
        ...saved,
        ...request,
        donorName:donor.name,
        donorId:donor.id,
        donorBloodGroup:donor.bloodGroup,
        donorLocation:donor.location,
        status:"arrived",
        donorStatus:"arrived",
        arrivedAt:new Date().toISOString(),
        donorLatitude:position?.[0]??saved.donorLatitude,
        donorLongitude:position?.[1]??saved.donorLongitude
      })
    );

    setStatus("arrived");
    setAccuracy(null);
    setRouteInfo(null);
    setMessage("You have arrived at the hospital.");
  };

  const distance=routeInfo?routeInfo.distance<1?`${Math.round(routeInfo.distance*1000)} m`:`${routeInfo.distance.toFixed(1)} km`:"--";

  const eta=routeInfo?`${Math.round(routeInfo.duration)} min`:"--";

  const details=[
    ["🏥","Hospital",request.hospital],
    ["📍","Location",request.location],
    ["🩸","Blood Group",request.bloodGroup],
    ["📅","Required Date",request.requiredDate]
  ];

  return(
    <div className="donor-dashboard">
      <header className="donor-header">
        <div className="donor-logo">
          <span>LifeLink</span>
        </div>

        <nav className="donor-nav">
          <button type="button">Home</button>
          <button type="button" className="active">
            Requests
          </button>
          <button type="button" onClick={() => navigate("/donate")}> Donate</button>
          <button type="button" onClick={() => navigate("/donor-profile")}>Profile</button>
        </nav>

        <button className="notification-btn" type="button">
          🔔
        </button>
      </header>

      <main className="donor-main">
        <div className="request-container">

          <section className="request-card">
            {(status==="accepted"||status==="arrived")&&(
              <div className="en-route-header">
                <div className="en-route-dot">
                  {status==="arrived"?"✓":"🚗"}
                </div>

                <div>
                  <h1>
                    {status==="arrived"?"ARRIVED":"EN ROUTE"}
                  </h1>
                  <p>
                    {status==="arrived"
                      ?"You have arrived at the hospital."
                      :"You are on your way to donate blood."}
                  </p>
                </div>
              </div>
            )}

            {(status==="pending"||status==="declined")&&(
              <div className="request-top">
                <h1>{request.bloodGroup} Blood Needed</h1>
                <span className="critical-badge">
                  {request.urgency||"URGENT"}
                </span>
              </div>
            )}

            {status==="pending"&&(
              <p className="request-description">
                A blood donation request has been received
                near your location. Please review the details
                and respond.
              </p>
            )}

            <div className="request-info">
              {details.map(([icon,title,value])=>(
                <div className="info-row" key={title}>
                  <div className="info-icon">{icon}</div>
                  <div>
                    <h3>{title}</h3>
                    <p>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="donor-request-info">
              <strong>Donor Information</strong>
              <p>Name: {donor.name}</p>
              <p>Blood Group: {donor.bloodGroup}</p>
              <p>Location: {donor.location}</p>

              {status==="accepted"&&accuracy!=null&&(
                <p className="verified">
                  ✓ Live GPS active ({Math.round(accuracy)} m accuracy)
                </p>
              )}

              {status==="arrived"&&(
                <p className="gps-stopped">
                  ✓ Live location sharing stopped
                </p>
              )}
            </div>

            {status==="pending"&&(
              <div className="request-actions">
                <button
                  className="accept-btn"
                  onClick={()=>saveStatus("accepted")}
                  type="button"
                >
                  Accept Request
                </button>

                <button
                  className="decline-btn"
                  onClick={()=>saveStatus("declined")}
                  type="button"
                >
                  Decline
                </button>
              </div>
            )}

            {status==="declined"&&(
              <div className="status-message declined">
                <div>✕</div>
                <div>
                  <strong>Request Declined</strong>
                  <p>
                    You have declined this blood donation request.
                  </p>
                </div>
              </div>
            )}

            {status==="accepted"&&(
              <div className="status-message accepted">
                <div>✓</div>
                <div>
                  <strong>Request Accepted</strong>
                  <p>
                    Thank you for helping. Your live location
                    is being shared while you travel to the hospital.
                  </p>

                  <button
                    className="arrived-btn"
                    onClick={arrived}
                    type="button"
                  >
                    ✓ Arrived at Hospital
                  </button>
                </div>
              </div>
            )}

            {status==="arrived"&&(
              <div className="status-message arrived">
                <div>✓</div>
                <div>
                  <strong>Arrived at Hospital</strong>
                  <p>
                    You have arrived at the hospital for the
                    blood donation.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="map-card">
            {status==="arrived"?(
              <div className="location-loading">
                <strong>✓ You have arrived</strong>
                <p>Live location sharing has stopped.</p>
              </div>
            ):status!=="accepted"?(
              <div className="location-loading">
                <strong>Location sharing is off</strong>
                <p>
                  Accept the blood donation request to start
                  sharing your live location.
                </p>
              </div>
            ):position?(
              <>
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom
                  className="leaflet-map"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={position}
                    icon={icons.donor}
                  >
                    <Popup>
                      <strong>{donor.name}</strong>
                      <br />
                      Your current location
                    </Popup>
                  </Marker>

                  <Marker
                    position={hospital}
                    icon={icons.hospital}
                  >
                    <Popup>
                      <strong>{request.hospital}</strong>
                      <br />
                      Donation destination
                    </Popup>
                  </Marker>

                  <RoadRoute
                    location={position}
                    setInfo={setRouteInfo}
                  />

                  <MapController location={position} />
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
              </>
            ):(
              <div className="location-loading">
                <strong>
                  {error?"Location unavailable":"Getting your location..."}
                </strong>
                <p>{message}</p>

                {error&&(
                  <p>Please allow location permission and refresh the page.</p>
                )}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default DonorDashboard;