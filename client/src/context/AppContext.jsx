// import axios from "axios"
// import React, { useEffect, useState } from 'react';
// import { createContext, useContext } from "react";
// import {  useNavigate } from "react-router-dom";
// import {useUser, useAuth} from "@clerk/clerk-react";
// import {toast} from 'react-hot-toast';

// axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// const AppContext = createContext();

// export const AppProvider = ({ children }) =>{

//     const currency = import.meta.env.VITE_CURRENCY || "$"; 
//     const navigate= useNavigate();
//     const {user} = useUser();
//     const { getToken } = useAuth()

//     const[isOwner, setIsOwner] = useState(false);
//     const[showHotelReg, setShowHotelReg] = useState(false);
//      const[searchedCities, setSearchCities] = useState([]);
     
    
//     const fetchUser = async ()=>{
         
//         try {
//             const {data} = await axios.get('/api/user', {headers: {Authorization: `Bearer ${await getToken()}`}})
//                 if(data.success){
//                     setIsOwner(data.role === "hotelOwner");
//                 }else{
//                     setTimeout(() =>{
//                     fetchUser()
//                     },5000)     
                   
//                 }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }

   

//     useEffect(()=>{
//         if(user){
//             fetchUser();
//         }
//     },[user])

//     const value={
//         currency, navigate, user, getToken, isOwner, setIsOwner, 
//         axios, showHotelReg, setShowHotelReg, searchedCities, setSearchCities
//     }

//     return (
//         <AppContext.Provider value={value}>
//             {children}
//         </AppContext.Provider>
//     )
// }

// export const useAppContext = () => {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error("useAppContext must be used within an AppProvider");
//   }
//   return context;
// };


import React, { useEffect, useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const AppContext = createContext();

const customAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchCities] = useState([]);
  const [searchParams, setSearchParams] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: ""
  });

  // Attach token to every request
  useEffect(() => {
    const requestInterceptor = customAxios.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        console.log("[FRONTEND] Clerk getToken():", token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn("[FRONTEND] No Clerk token found! User may not be logged in.");
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => {
      customAxios.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  // Fetch user info with retry logic
  const fetchUser = async (retryCount = 0) => {
    try {
      const { data } = await customAxios.get(`/api/user`);
      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
      } else if (retryCount < 3) {
        setTimeout(() => fetchUser(retryCount + 1), 5000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else if (retryCount < 3) {
        toast.error(error.message || "Something went wrong");
        setTimeout(() => fetchUser(retryCount + 1), 5000);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchUser();
    }
    // eslint-disable-next-line
  }, [user]);

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios: customAxios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchCities,
    searchParams,
    setSearchParams,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};