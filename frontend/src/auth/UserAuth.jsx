import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/user.context.jsx'
import axios from '../config/axios.jsx'

const UserAuth = ({ children }) => {
    const { user, setUser } = useUser();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch user profile
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchUserProfile();
    }, []); // Run once on component mount
    


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-white text-xl font-semibold tracking-wider">
                    <span className="animate-pulse">Please wait</span>
                    <span className="animate-bounce inline-block ml-1">.</span>
                    <span className="animate-bounce inline-block ml-1 delay-100">.</span>
                    <span className="animate-bounce inline-block ml-1 delay-200">.</span>
                </div>
            </div>
        );
    }
    

    return <>{children}</>;
};

export default UserAuth;