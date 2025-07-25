import axios from "axios"
import React, { useEffect, useState } from 'react';
import { createContext, useContext } from "react";
import {  useNavigate } from "react-router-dom";
import {useUser, useAuth} from "@clerk/clerk-react";
import {toast} from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) =>{

    const currency = import.meta.env.VITE_CURRENCY || "$"; 
    const navigate= useNavigate();
    const {user} = useUser();
    const { getToken } = useAuth()

    const[isOwner, setIsOwner] = useState(false);
    const[showHotelReg, setShowHotelReg] = useState(false);
     const[searchedCities, setSearchCities] = useState([]);
     
    
    const fetchUser = async ()=>{
         
        try {
            const {data} = await axios.get('/api/user', {headers: {Authorization: `Bearer ${await getToken()}`}})
                if(data.success){
                    setIsOwner(data.role === "hotelOwner");
                }else{
                    setTimeout(() =>{
                    fetchUser()
                    },5000)     
                   
                }
        } catch (error) {
            toast.error(error.message)
        }
    }

   

    useEffect(()=>{
        if(user){
            fetchUser();
        }
    },[user])

    const value={
        currency, navigate, user, getToken, isOwner, setIsOwner, 
        axios, showHotelReg, setShowHotelReg, searchedCities, setSearchCities
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};