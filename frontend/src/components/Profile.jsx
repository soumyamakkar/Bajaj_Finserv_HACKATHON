// components/Profile.jsx
import React from 'react';

const Profile = () => {
    const user = {
        pfp: "https://via.placeholder.com/150",
        name: "John Doe",
        email: "john.doe@example.com",
        username: "johndoe",
        gender: "Male",
        location: "New York",
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel purus at sapien ultrices tincidunt. Vivamus ac nisi nec libero tincidunt aliquet."
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-6xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-green-600">
                <div className="flex flex-col md:flex-row">
                    {/* Left Section - Profile Picture */}
                    <div className="md:w-1/3 bg-gray-800 p-8 flex items-center justify-center">
                        <img
                            src={user.pfp}
                            alt="Profile"
                            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-green-600"
                        />
                    </div>

                    {/* Right Section - Profile Details */}
                    <div className="md:w-2/3 p-8">
                        <h2 className="text-4xl font-bold text-green-400 mb-4">{user.name}</h2>
                        <div className="space-y-4">
                            <p className="text-green-200">
                                <span className="font-semibold text-green-400">Email:</span> {user.email}
                            </p>
                            <p className="text-green-200">
                                <span className="font-semibold text-green-400">Username:</span> {user.username}
                            </p>
                            <p className="text-green-200">
                                <span className="font-semibold text-green-400">Gender:</span> {user.gender}
                            </p>
                            <p className="text-green-200">
                                <span className="font-semibold text-green-400">Location:</span> {user.location}
                            </p>
                            <p className="text-green-200">
                                <span className="font-semibold text-green-400">Bio:</span> {user.bio}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;