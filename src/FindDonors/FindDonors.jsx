import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./FindDonors.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const hospitalLocation = [22.5135084, 88.402884];
const requiredBloodGroup = "A+";

const donors = [
  { id: 1, name: "Rahul Sharma", bloodGroup: "O+", location: "Kolkata", availability: "Available" },
  { id: 2, name: "Amit Das", bloodGroup: "A+", location: "Howrah", availability: "Available" },
  { id: 3, name: "Sourav Roy", bloodGroup: "B+", location: "Salt Lake", availability: "Available" },
  { id: 4, name: "Arjun Singh", bloodGroup: "A+", location: "New Town", availability: "Available" },
  { id: 5, name: "Priya Das", bloodGroup: "AB+", location: "Kolkata", availability: "Unavailable" },
];

function FindDonors() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [hasRequest, setHasRequest] = useState(false);

  useEffect(() => {
    const checkRequest = () =>
      setHasRequest(Boolean(localStorage.getItem("bloodRequest")));

    checkRequest();
    window.addEventListener("storage", checkRequest);
    return () => window.removeEventListener("storage", checkRequest);
  }, []);

  const availableDonors = donors.filter(
    d =>
      d.bloodGroup === requiredBloodGroup &&
      d.availability === "Available" &&
      d.location.toLowerCase().includes(location.toLowerCase())
  );

  const handleRequest = donor => {
    const request = {
      bloodGroup: requiredBloodGroup,
      hospital: "Ruby General Hospital",
      location: "Kolkata",
      units: 2,
      requiredDate: "30 September 2026",
      urgency: "Urgent",
      donorId: donor.id,
      donorName: donor.name,
      donorBloodGroup: donor.bloodGroup,
      donorLocation: donor.location,
      status: "pending",
      donorStatus: "pending",
    };

    localStorage.setItem("bloodRequest", JSON.stringify(request));
    setHasRequest(true);
    navigate("/donor-dashboard", { state: { request, donor } });
  };

  return (
    <div className="find-donors-page">
      <div className="find-donors-container">

        <h1>Find Blood Donors</h1>

        <p className="subtitle">
          Available donors for blood group{" "}
          <strong>{requiredBloodGroup}</strong>
        </p>

        <div className="filters">
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Enter city or area"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
        </div>

        {hasRequest && (
          <div className="tracking-section">
            <button className="track-button" onClick={() => navigate("/donor-status")} type="button"
            >
              📍 Track Donor
            </button>
          </div>
        )}

        <div className="map-section">
          <h2>Hospital Location</h2>

          <div className="map-container">
            <MapContainer
              center={hospitalLocation}
              zoom={13}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={hospitalLocation}>
                <Popup>
                  <strong>Ruby General Hospital</strong>
                  <p>Kolkata</p>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="donor-section">
          <div className="donor-heading">
            <h2>Available {requiredBloodGroup} Donors</h2>
            <span>{availableDonors.length} donor(s) found</span>
          </div>

          {!availableDonors.length ? (
            <div className="no-donors">
              <h3>No available donors found</h3>
              <p>There are currently no available {requiredBloodGroup} donors. </p>
            </div>
          ) : (
            <div className="donor-grid">
              {availableDonors.map(donor => (
                <div className="donor-card" key={donor.id}>

                  <div className="blood-circle">
                    {donor.bloodGroup}
                  </div>

                  <div className="donor-info">
                    <h3>{donor.name}</h3>
                    <p>📍 {donor.location}</p>
                    <p> Blood Group: <strong>{donor.bloodGroup}</strong></p>
                    <p className="available">● Available</p>
                  </div>

                  <div className="donor-buttons">
                    <button className="request-button"onClick={() => handleRequest(donor)} type="button"
                    >
                      Request Donor
                    </button>

                    <button
                      className="call-button"onClick={() => alert("Calling...")} type="button"
                    >
                      Call
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default FindDonors;