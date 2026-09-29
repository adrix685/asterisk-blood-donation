import React, { useState } from "react";
import "./blood_request.css";
function App(){
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const [bloodGroup, setBloodGroup] = useState("O-");
    const [urgency, setUrgency] = useState("Critical");
    const [units, setUnits] = useState(3);
    const [hospital, setHospital] = useState("");
    const increaseUnits = () => setUnits(units + 1);
    const decreaseUnits = () => {
        if(units > 1) setUnits(units - 1);
    };

    const handleSubmit = () => {
        if(!hospital.trim()) {
            alert("Please enter hospital name:");
            return;
        }

        alert(`Blood request posted!\nBlood Group: ${bloodGroup}\nUrgency: ${urgency}\nUnits: ${units}\nHospital: ${hospital}`
        );
    };

return (
    <div className="page">
        <header className="header">
            <span className="back-arrow">←</span>
            <span>Emergency Request</span>
        </header>
        <main className="container">
            <section className="intro">
                <h1>Need Blood Urgently ?</h1>
                <p>
                    Fill out the details below to identify donors in your area immediately.
                </p>
            </section>

            <section className="card blood-card">
                <label>BLOOD GROUP NEEDED</label>

                <div className="blood-grid">
                    {bloodGroups.map((group) => (
                        <button key={group}
                            className={`blood-btn ${
                                bloodGroup === group ? "selected" : ""
                            }`}
                            onClick={() => setBloodGroup(group)}>{group}</button>
                    ))}
                </div>
            </section>
            <div className="middle-row">
                <section className="card urgency-card">
                    <label>URGENCY LEVEL</label>

                    <div className={`urgency-option ${
                        urgency === "Critical" ? "active" : ""
                    }`}
                    onClick={() => setUrgency("Critical")}>

                        <span className="radio">
                            {urgency === "Critical" && "●"}
                        </span>
                        <span>Critical</span>
                        <span className="dot critical"></span>
                    </div>
                    <div className={`urgency-option ${
                        urgency === "High" ? "active" : ""
                    }`}
                    onClick={() => setUrgency("High")}>
                        <span className="radio">
                            {urgency === "High" && "●"}
                        </span>
                        <span>high</span>
                        <span className="dot High"></span>
                    </div>

                    <div className={`urgency-option ${
                        urgency === "Normal" ? "active" : ""
                    }`}
                    onClick={() => setUrgency("Normal")}>
                        <span className="radio">
                            {urgency === "Normal" && "●"}
                        </span>
                        <span>normal</span>
                        <span className="dot Normal"></span>
                    </div>
                </section>

                <section className="card units-card">
                    <label>UNITS NEEDED (PINTS)</label>

                    <div className="units-control">
                        <button onClick={decreaseUnits}>-</button>

                        <span>{units}</span>
                        <button onClick={increaseUnits}>+</button>
                    </div>
                </section>
            </div>


            <section className="card hospital-card">
                <label>HOSPITAL NAME</label>

                <input type="text"
                    placeholder="e.g. Ruby General Hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}/>

                <label className="location-label">LOCATION</label>

                <div className="map">
                    <div className="map-content">
                        <div className="map-pin">📍</div>
                        <div className="map-hospital">
                            Ruby General Hospital
                        </div>
                    </div>

                    <div className="map-bottom">
                        <span>📍</span>
                        <span>Tap to adjust location pin</span>
                    </div>
                </div>
            </section>

            <button className="post-btn" onClick={handleSubmit}>
                <span>📢</span>
                Post Request
            </button>
            <p className="notice">
                ⓘ Your request will be visible to donors within a 10-mile radius.
            </p>
        </main>
    </div>
);
}
export default App;