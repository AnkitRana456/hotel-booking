// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom';
// import { assets, roomsDummyData } from '../assets/assets'
// import StarRating from '../components/StarRating';

 




// const RoomDetails = () => {
//  const{id}= useParams()
//  const[room, setRoom] =useState(null)
//  const[mainImage, setMainImage]= useState(null)

//  useEffect(() =>{
//     const room= roomsDummyData.find(room => room._id === id)
//     room && setRoom(room)
//     room && setMainImage(room.images[0]) 
//  },[id])

 
//   return (
//     room &&
//     <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
//     {/* Room Details */}
          
//           <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
//             <h1 className='text-3xl md:text-4xl font-playfair'>{room.hotel.name}
//             <span className='font-inter text-sm'>({room.roomType})</span></h1>
//             <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>
//             20% OFF</p>
//           </div>

//           {/* Room Rating */}
       
//   <div className='flex items-center gap-1 mt-2'>
//     <StarRating />
//     <p className='ml-2'> 200+ reviews</p>
//   </div>

//   {/* Room ADdresss */}

//   <div className='flex items-center gap-1 text-gray-500 mt-2'>
//   <img src={assets.locationIcon} alt="location-icon" />
// <span>{room.hotel.address}</span>
//   </div>
  
// {/* Room Images */}
// <div className='flex flex-col lg:flex-row mt-6 gap-6'>
//   <div className='lg:w-1/2 w-full'>
//     <img src={mainImage} alt="RoomImage"
//     className='w-full rounded-xl shadow-lg object-cover' />
//   </div>

//   <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
//     {room ? room.images.length>1 && room.images.map((image, index) => (
//       <img onClick={() => setMainImage(image)} 
//       key={index} src={image} alt="Room Image"
//       className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && 
//       'outline-3 outline-orange-500'}`} />

//     ))}

//   </div>

// </div>


// </div>


   
//   )
  
// )  ;
//  };


// export default RoomDetails




import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, searchParams, user } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const [checkIn, setCheckIn] = useState(searchParams.checkIn || "");
  const [checkOut, setCheckOut] = useState(searchParams.checkOut || "");
  const [guests, setGuests] = useState(searchParams.guests || 1);
  const [isAvailable, setIsAvailable] = useState(null);
  const [checking, setChecking] = useState(false);

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);
      if (data.success) {
        setRoom(data.room);
        setMainImage(data.room.images[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch room details");
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to book a room");
      return;
    }
    if (!checkIn || !checkOut || !guests) {
      toast.error("Please fill in check-in, check-out dates and guests");
      return;
    }
    setChecking(true);
    try {
      const { data } = await axios.post('/api/bookings/check-availability', {
        room: id,
        checkInDate: checkIn,
        checkOutDate: checkOut
      });
      if (data.success) {
        setIsAvailable(data.isAvailable);
        if (data.isAvailable) {
          toast.success("Room is available! You can proceed to book.");
        } else {
          toast.error("Room is not available for the selected dates.");
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Error checking availability");
    } finally {
      setChecking(false);
    }
  };

  const handleBookRoom = async () => {
    if (!user) {
      toast.error("Please log in to book a room");
      return;
    }
    try {
      const { data } = await axios.post('/api/bookings/book', {
        room: id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests
      });
      if (data.success) {
        toast.success("Room booked successfully!");
        navigate('/my-bookings');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Error booking room");
    }
  };

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Room Details */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-playfair">
            {room.hotel.name}
            <span className="font-inter text-sm"> ({room.roomType})</span>
          </h1>
          <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
            20% OFF
          </p>
        </div>

        {/* Room Rating */}
        <div className="flex items-center gap-1 mt-2">
          <StarRating />
          <p className="ml-2">200+ reviews</p>
        </div>

        {/* Room Address */}
        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <img src={assets.locationIcon} alt="location-icon" />
          <span>{room.hotel.address}</span>
        </div>

        {/* Room Images */}
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-1/2 w-full">
            <img
              src={mainImage}
              alt="RoomImage"
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room.images.length > 1 &&
              room.images.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  key={index}
                  src={image}
                  alt="Room Image"
                  className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                    mainImage === image ? 'outline-3 outline-orange-500' : ''
                  }`}
                />
              ))}
          </div>
        </div>

        {/* Room HighLights */}
        <div className='flex flex-col md:flex-row md:justify-between items-start md:items-center mt-10 relative'>
          <div className='flex flex-col'>
            <h1 className='text-3xl md:text-4xl font-playfair'>Experience Luxury Like Never Before</h1>
            <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
              {room.amenities.map((item, index) => (
                <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                  {facilityIcons[item] && (
                    <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                  )}
                  <p className='text-xs'>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Room Price */}
          <p className='text-2xl font-medium md:mr-10 mt-4 md:mt-0'>${room.pricePerNight}/night</p>
        </div>


        {/* CheckIn CheckOut Form */}
        <form onSubmit={handleCheckAvailability} className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl w-full'>

          <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500 w-full md:w-auto'>
            <div className='flex flex-col'>
              <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
              <input 
                type="date" 
                id='checkInDate' 
                value={checkIn}
                onChange={(e) => { setCheckIn(e.target.value); setIsAvailable(null); }}
                className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                required
              />
            </div>

            <div className='w-px h-15 bg-gray-300/70 max-md:hidden '></div>
                     
            <div className='flex flex-col'>
              <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
              <input 
                type="date" 
                id='checkOutDate' 
                value={checkOut}
                onChange={(e) => { setCheckOut(e.target.value); setIsAvailable(null); }}
                className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                required
              />
            </div>

            <div className='w-px h-15 bg-gray-300/70 max-md:hidden '></div>

            <div className='flex flex-col'>
              <label htmlFor="guests" className='font-medium'>Guests</label>
              <input 
                type="number" 
                min={1}
                max={4}
                id='guests' 
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder='0'
                className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none font-medium' 
                required
              />
            </div>
          </div>

          {isAvailable === true ? (
            <button 
              type='button' 
              onClick={handleBookRoom} 
              className='bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-4 text-base cursor-pointer'
            >
              Book Now
            </button>
          ) : (
            <button 
              type='submit' 
              disabled={checking}
              className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-4 text-base cursor-pointer disabled:opacity-50'
            >
              {checking ? "Checking..." : "Check Availability"}
            </button>
          )}
        </form>


        {/* Common Specifications */}
        <div className='mt-25 space-y-4'>
          {roomCommonData.map((spec, index) => (
            <div key={index} className='flex items-start gap-2'>
              <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5' />
              <div>
                <p className='text-base'>{spec.title}</p>
                <p className='text-gray-500'>{spec.description}</p>
              </div>
            </div>
          ))}
        </div>
                    
        <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
          <p>
            Guests will be allocated on the ground floor according to availability.
            You get a comfortable Two bedroom apartment has a true city feeling. The
            price quoted is for two guest, at the guest slot please mark the number of
            guests to get the exact price for groups. The Guests will be allocated
            ground floor according to availability. You get the comfortable two bedroom
            apartment that has a true city feeling.
          </p>
        </div>
                  
        {/* Hosted by */}
        <div className='flex flex-col items-start gap-4'>
          <div className='flex gap-4'>
            {room.hotel.owner?.image && (
              <img
                src={room.hotel.owner.image}
                alt="Host"
                className='h-14 w-14 md:h-18 md:w-18 rounded-full'
              />
            )}
            <div>
              <p className='text-lg md:text-xl'>Hosted by {room.hotel.name}</p>
              <div className='flex items-center mt-1'>
                <StarRating />
                <p className='ml-2 text-xs text-gray-500'>200+ reviews</p>
              </div>
            </div>
          </div>
          <button className='px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer'>
            Contact Now
          </button>
        </div>

      </div>
    )
  );
};

export default RoomDetails;

