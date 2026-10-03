import React,{useState}from"react";
import{useNavigate}from"react-router-dom";
import"./DonorProfile.css";

export default function DonorProfile(){
  const navigate=useNavigate();

  const[profile,setProfile]=useState({
    name:"Arjun Singh",email:"arjun@example.com",
    phone:"+91 9876543210",bloodGroup:"A+",
    location:"New Town, Kolkata",age:"24",
    gender:"Male",availability:true
  });

  const[editing,setEditing]=useState(false);
  const[message,setMessage]=useState("");

  const change=e=>
    setProfile({...profile,[e.target.name]:e.target.value});

  const save=()=>{
    localStorage.setItem("donorProfile",JSON.stringify(profile));
    setEditing(false);
    setMessage("Profile updated successfully.");
    setTimeout(()=>setMessage(""),2500);
  };

  const toggle=()=>{
    const p={...profile,availability:!profile.availability};
    setProfile(p);
    localStorage.setItem("donorProfile",JSON.stringify(p));
  };

  const fields=[
    ["name","Full Name"],["email","Email"],["phone","Phone Number"],
    ["bloodGroup","Blood Group"],["age","Age"],
    ["gender","Gender"],["location","Location"]
  ];

  const options={
    bloodGroup:["A+","A-","B+","B-","AB+","AB-","O+","O-"],
    gender:["Male","Female","Other"]
  };

  return(
    <div className="donor-profile-page">

      <header className="donor-profile-header">
        <div className="profile-logo">LifeLink</div>

        <nav>
          <button>Home</button>
          <button onClick={()=>navigate("/donor-dashboard")}>Requests</button>
          <button onClick={()=>navigate("/donate")}>Donate</button>
          <button className="active">Profile</button>
        </nav>
      </header>

      <main className="donor-profile-container">

        <div className="profile-heading">
          <div>
            <h1>Donor Profile</h1>
            <p>Manage your donor information and availability.</p>
          </div>

          {!editing&&
            <button className="edit-button" onClick={()=>setEditing(true)}>
              Edit Profile
            </button>
          }
        </div>

        {message&&
          <div className="success-message">✓ {message}</div>
        }

        <section className="profile-card">
          <div className="profile-top">

            <div className="profile-avatar">
              {profile.name[0].toUpperCase()}
            </div>

            <div className="profile-name">
              <h2>{profile.name}</h2>
              <span className="blood-badge">{profile.bloodGroup}</span>
              <p>📍 {profile.location}</p>
            </div>

            <div className="availability-box">
              <span className={
                profile.availability?"available-dot":"unavailable-dot"
              }>●</span>

              <div>
                <strong>
                  {profile.availability?"Available":"Unavailable"}
                </strong>
                <small>
                  {profile.availability
                    ?"Available for blood requests"
                    :"Not accepting requests"}
                </small>
              </div>

              <button
                className="availability-button"
                onClick={toggle}
              >
                {profile.availability
                  ?"Set Unavailable":"Set Available"}
              </button>
            </div>

          </div>
        </section>

        <section className="details-card">
          <h2>Personal Information</h2>

          <div className="profile-grid">
            {fields.map(([name,label])=>(
              <div
                className={`input-group ${name==="location"?"full-width":""}`}
                key={name}
              >
                <label>{label}</label>

                {editing ? (options[name] ? (
                    <select
                      name={name}
                      value={profile[name]}
                      onChange={change}
                    >
                      {options[name].map(x=>
                        <option key={x}>{x}</option>
                      )}
                    </select>
                  ) : (
                    <input
                      name={name}
                      type={
                        name==="email"?"email":
                        name==="age"?"number":"text"
                      }
                      value={profile[name]}
                      onChange={change}
                    />
                  )
                ) : (
                  <p>{profile[name]}{name==="age"&&" years"} </p>
                )}
              </div>
            ))}
          </div>

          {editing&&
            <div className="profile-actions">
              <button
                className="cancel-button"
                onClick={()=>setEditing(false)}
              >
                Cancel
              </button>

              <button className="save-button" onClick={save}>
                Save Changes
              </button>
            </div>
          }
        </section>

        <section className="donation-card">
          <h2>Donation Information</h2>

          <div className="donation-grid">
            <div>
              <span>Blood Group</span>
              <strong>{profile.bloodGroup}</strong>
            </div>

            <div>
              <span>Donor Status</span>
              <strong>{profile.availability?"Available":"Unavailable"}</strong>
            </div>

            <div>
              <span>Last Donation</span>
              <strong>Not recorded</strong>
            </div>

            <div>
              <span>Total Donations</span>
              <strong>0</strong>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}