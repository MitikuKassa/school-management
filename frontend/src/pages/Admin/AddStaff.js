import React, { useState } from "react";
import api from "../../api";

function AddStaff() {
  const [formData, setFormData] = useState({
    user: { username: "", password: "", role: "teacher" },
    profile: {
      first_name: "",
      father_name: "",
      nationality: "",
      phone_number: "",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("staff-register/", formData);
      alert("Staff registered successfully!");
    } catch (err) {
      // THIS WILL SHOW THE SPECIFIC ERROR FROM DJANGO
      console.error("Full error detail:", err.response?.data);
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register New Staff</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) =>
          setFormData({
            ...formData,
            user: { ...formData.user, username: e.target.value },
          })
        }
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setFormData({
            ...formData,
            user: { ...formData.user, password: e.target.value },
          })
        }
      />
      <select
        onChange={(e) =>
          setFormData({
            ...formData,
            user: { ...formData.user, role: e.target.value },
          })
        }
      >
        <option value="teacher">Teacher</option>
        <option value="registrar">Registrar</option>
      </select>
      <input
        type="text"
        placeholder="First Name"
        onChange={(e) =>
          setFormData({
            ...formData,
            profile: { ...formData.profile, first_name: e.target.value },
          })
        }
      />
      <button type="submit">Create Staff Account</button>
    </form>
  );
}

export default AddStaff;
