import React, { useState, useEffect } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const CheckBox= ({label,selected=false , onChange= () => {}}) =>{
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="checkbox" checked={selected} onChange={(e) =>
            onChange(e.target.checked ,label)} />
            <span className='font-light select-none'> {label}</span>
        </label>
    )
}

const RadioButton= ({label,selected=false , onChange= () => {}}) =>{
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="radio" name='sortOption' checked={selected} onChange={() =>
            onChange(label)} />
            <span className='font-light select-none'> {label}</span>
        </label>
    )
}


const AllRooms = () => {
  const navigate = useNavigate();
  const { axios, searchParams, setSearchParams } = useAppContext();
  
  const [openFilters, setOpenFilters] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedSort, setSelectedSort] = useState("");

  const roomTypes = [
    "Single Bed",
    "Double Bed",
    "Luxury Room",
    "Family Suite",
  ];

  const priceRanges = [
    "0 to 500",
    "500 to 1000",
    "1000 to 2000",
    "2000 to 5000",
  ];

  const sortOptions = [
    " Price Low to High",
    " Price High to Low",
    "Newest First"
  ];

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      const url = searchParams.city ? `/api/rooms?city=${encodeURIComponent(searchParams.city)}` : '/api/rooms';
      const { data } = await axios.get(url);
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch rooms");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchParams.city]);

  const handleRoomTypeChange = (checked, label) => {
    if (checked) {
      setSelectedRoomTypes(prev => [...prev, label]);
    } else {
      setSelectedRoomTypes(prev => prev.filter(item => item !== label));
    }
  };

  const handlePriceRangeChange = (checked, label) => {
    const cleanLabel = label.replace('$ ', '');
    if (checked) {
      setSelectedPriceRanges(prev => [...prev, cleanLabel]);
    } else {
      setSelectedPriceRanges(prev => prev.filter(item => item !== cleanLabel));
    }
  };

  const handleClearFilters = () => {
    setSelectedRoomTypes([]);
    setSelectedPriceRanges([]);
    setSelectedSort("");
    setSearchParams({ city: "", checkIn: "", checkOut: "", guests: "" });
  };

  // Filtering Logic
  let displayRooms = [...rooms];

  // Filter by Room Types
  if (selectedRoomTypes.length > 0) {
    displayRooms = displayRooms.filter(room => selectedRoomTypes.includes(room.roomType));
  }

  // Filter by Price Ranges
  if (selectedPriceRanges.length > 0) {
    displayRooms = displayRooms.filter(room => {
      return selectedPriceRanges.some(range => {
        const [min, max] = range.split(' to ').map(Number);
        return room.pricePerNight >= min && room.pricePerNight <= max;
      });
    });
  }

  // Sort
  if (selectedSort === " Price Low to High") {
    displayRooms.sort((a, b) => a.pricePerNight - b.pricePerNight);
  } else if (selectedSort === " Price High to Low") {
    displayRooms.sort((a, b) => b.pricePerNight - a.pricePerNight);
  } else if (selectedSort === "Newest First") {
    displayRooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start 
    justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        
        <div className="flex-1 w-full lg:pr-8">
            <div className='flex flex-col items-start text-left'>
                <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.</p>
            </div>

          {displayRooms.length === 0 ? (
             <p className='text-gray-500 mt-10 text-lg'>No rooms found matching the criteria.</p>
          ) : (
            displayRooms.map((room) => (
             <div className='flex flex-col md:flex-row items-start gap-6 
             py-10 border-b border-gray-300 last:pb-30 last:border-0' key={room._id}   >
                <img onClick ={() => {navigate(`/rooms/${room._id}`); scrollTo(0,0)}}
                  src={room.images[0]} alt="hotel-img" title='View Room Details'
                  className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer' />
                  
                 <div className='md:w-1/2 flex flex-col gap-2'>
                    <p className='text-gray-500'>{room.hotel.city}</p>

                     <p onClick ={() => {navigate(`/rooms/${room._id}`); scrollTo(0,0)}}
                     className='text-gray-800 text-3xl font-playfair cursor-pointer hover:text-blue-600 transition-colors'>
                     {room.hotel.name}</p>
                     <div className='flex items-center'>
                        <StarRating />
                        <p className='text-xs text-gray-500 ml-2'>200+ reviews</p>
                     </div>
                     <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                        <img src={assets.locationIcon} alt="location-icon" />
                        <span> {room.hotel.address}</span>
                     </div>

                     {/* Room Amenities */}
                     <div className='flex flex-wrap  items-center mb-6 gap-4 mt-3'>
                     {room.amenities.map((item, index) => (
                             <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg
                             bg-[#F5F5FF]/70'  >
                                {facilityIcons[item] && (
                                   <img src={facilityIcons[item]} alt={item} className='w-5 h-5 ' />
                                )}
                                <p className='text-xs'>{item}</p> 
                             </div>
                      ))}
                     </div>

                     <div>
                        <p className='text-xl font-medium text-gray-800'>
                         ${room.pricePerNight} /night </p>
                     </div>
                     
                 </div>
             </div>
            ))
          )}

        </div>
        {/* Filters */}
        <div className='bg-white w-full lg:w-80 border border-gray-300
         text-gray-600 max-lg:mb-8 min-lg:mt-16 rounded-xl overflow-hidden shadow-sm'>
              <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilters ? "border-b" : ""}`}>
                <p className='text-base font-medium text-gray-800'>FILTERS</p>
                <div className='text-xs cursor-pointer'>
                  <span onClick={() => setOpenFilters(!openFilters)} 
                    className='lg:hidden'>{openFilters ? 'HIDE' : 'SHOW'}</span>
                  <span onClick={handleClearFilters} className='hidden lg:block hover:text-red-500 transition-colors'>CLEAR</span>
                </div>
              </div>

              <div className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'}
               overflow-hidden transition-all duration-700`}>

               <div className='px-5 pt-5'>
                <p className='font-medium text-gray-800 pb-2'>Popular filters</p>
                {roomTypes.map((room, index) =>(
                    <CheckBox 
                      key={index} 
                      label={room} 
                      selected={selectedRoomTypes.includes(room)}
                      onChange={handleRoomTypeChange}
                    />
                ))}
               </div>

                <div className='px-5 pt-5'>
                <p className='font-medium text-gray-800 pb-2'>Price Range</p>
                {priceRanges.map((range, index) =>(
                    <CheckBox 
                      key={index} 
                      label={`$ ${range}`} 
                      selected={selectedPriceRanges.includes(range)}
                      onChange={handlePriceRangeChange}
                    />
                ))}
               </div>

               <div className='px-5 pt-5 pb-5'>
                <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                {sortOptions.map((option, index) =>(
                    <RadioButton 
                      key={index} 
                      label={option} 
                      selected={selectedSort === option}
                      onChange={setSelectedSort}
                    />
                ))}
               </div>
        
              </div>

        </div>
        
    </div>
  )
}

export default AllRooms