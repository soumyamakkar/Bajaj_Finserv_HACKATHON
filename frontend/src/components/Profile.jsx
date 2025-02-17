// components/Profile.js
import React from 'react';

const Profile = ({ user }) => {
  return (
    <div className="profile-section">
      <div className="profile-picture">
        <img src={user.pfp} alt="Profile" />
      </div>
      <div className="profile-details">
        <h2>{user.name}</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Gender:</strong> {user.gender}</p>
      </div>
    </div>
  );
};

export default Profile;