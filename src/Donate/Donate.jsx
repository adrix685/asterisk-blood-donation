import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Donate.css";

const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const donationTypes = ["Blood","Plasma","Platelets"];

function Donate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bloodGroup:"A+",
    donationType:"Blood",
    date:"",
    location:"",
    notes:""
  });

  const [submitted,setSubmitted] = useState(false);

  const change = e =>
    setForm({...form,[e.target.name]:e.target.value});

  const submit = e => {
    e.preventDefault();
    localStorage.setItem(
      "donationAppointment",
      JSON.stringify({...form,status:"scheduled"})
    );
    setSubmitted(true);
  };

  const go = path => navigate(path);

  return (
    <div className="donate-page">
      <header className="donate-header">
        <div className="donate-logo">LifeLink</div>

        <nav className="donate-nav">
          <button onClick={() => go("/find-donors")}>Home</button>
          <button onClick={() => go("/donor-dashboard")}>Requests</button>
          <button className="active">Donate</button>
          <button onClick={() => go("/donor-profile")}>Profile</button>
        </nav>
      </header>

      <main className="donate-container">
        <div className="donate-heading">
          <h1>Donate Blood</h1>
          <p>Your donation can help save someone's life.</p>
        </div>

        {submitted ? (
          <section className="success-card">
            <div className="success-icon">✓</div>
            <h2>Donation Scheduled</h2>
            <p>Your blood donation appointment has been saved successfully.</p>

            <div className="appointment-details">
              {[
                ["Blood Group",form.bloodGroup],
                ["Donation Type",form.donationType],
                ["Date",form.date || "Not specified"],
                ["Location",form.location || "Not specified"]
              ].map(([label,value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="success-actions">
              <button
                className="primary-button"
                onClick={()=>setSubmitted(false)}
              >
                Schedule Another
              </button>
              <button
                className="secondary-button"
                onClick={()=>go("/donor-dashboard")}
              >
                Back to Requests
              </button>
            </div>
          </section>
        ) : (
          <div className="donate-content">
            <section className="donation-info-card">
              <div className="blood-icon">🩸</div>
              <h2>Why Donate Blood?</h2>
              <p>
                A single blood donation can help people who need blood during
                emergencies, surgeries, and medical treatments.
              </p>

              <div className="benefits">
                {[
                  ["Save Lives","Help patients who urgently need blood."],
                  ["Simple Process","Blood donation is a safe and straightforward process."],
                  ["Make a Difference","Your donation can support your local community."]
                ].map(([title,text]) => (
                  <div className="benefit" key={title}>
                    <span>✓</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="donation-form-card">
              <h2>Schedule Donation</h2>
              <p className="form-description">
                Enter your preferred donation details.
              </p>

              <form onSubmit={submit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={change}>
                      {bloodGroups.map(x=><option key={x}>{x}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Donation Type</label>
                    <select name="donationType" value={form.donationType} onChange={change}>
                      {donationTypes.map(x=><option key={x}>{x}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preferred Date</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={change}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Donation Location</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={change}
                      placeholder="Enter hospital or blood bank"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={change}
                      placeholder="Any additional information..."
                      rows="4"
                    />
                  </div>
                </div>

                <button className="schedule-button">Schedule Donation</button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Donate;