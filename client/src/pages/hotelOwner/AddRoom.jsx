import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddRoom = () => {
  const { axios, navigate } = useAppContext();

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null
  })

  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: '',
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    }
  })

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!inputs.roomType) {
      toast.error("Please select a room type");
      return;
    }
    if (!inputs.pricePerNight || +inputs.pricePerNight <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const hasImage = Object.values(images).some(img => img !== null);
    if (!hasImage) {
      toast.error("Please upload at least one image");
      return;
    }

    const toastId = toast.loading("Adding room...");
    try {
      const formData = new FormData();
      formData.append('roomType', inputs.roomType);
      formData.append('pricePerNight', inputs.pricePerNight);
      
      const activeAmenities = Object.keys(inputs.amenities).filter(key => inputs.amenities[key]);
      formData.append('amenities', JSON.stringify(activeAmenities));

      // Append selected files
      Object.keys(images).forEach(key => {
        if (images[key]) {
          formData.append('images', images[key]);
        }
      });

      const { data } = await axios.post('/api/rooms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success(data.message, { id: toastId });
        navigate('/owner/list-room');
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (error) {
      toast.error(error.message || "Failed to add room", { id: toastId });
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='p-6 md:p-10'>
      <Title 
        align='left' 
        font='outfit' 
        title='Add Room' 
        subTitle='Fill in the details carefully and accurate room details, pricing, and amenities, to enhance the user booking experience.' 
      />

      {/* Upload Area For Images */}
      <p className='text-gray-800 mt-10'>Images</p>
      <div className='grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap'>
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key}>
            <img 
              className='max-h-13 cursor-pointer opacity-80 border rounded p-1 hover:bg-gray-50' 
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea} 
              alt='' 
            />
            <input 
              type='file' 
              accept='image/*' 
              id={`roomImage${key}`} 
              hidden 
              onChange={e => setImages({ ...images, [key]: e.target.files[0] })} 
            />
          </label>
        ))}
      </div>

      <div className='w-full flex max-sm:flex-col sm:gap-4 mt-4'>
        <div className='flex-1 max-w-48'>
          <p className='text-gray-800 mt-4'>Room Type</p>
          <select
            value={inputs.roomType}
            onChange={e =>
              setInputs({
                ...inputs,
                roomType: e.target.value
              })
            }
            className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full outline-indigo-500'
            required
          >
            <option value=''>Select Room Type</option>
            <option value='Single Bed'>Single Bed</option>
            <option value='Double Bed'>Double Bed</option>
            <option value='Luxury Room'>Luxury Room</option>
            <option value='Family Suite'>Family Suite</option>
          </select>
        </div>

        <div>
          <p className="mt-4 text-gray-800">
            Price <span className="text-xs">/night</span>
          </p>

          <input
            type="number"
            placeholder="0"
            className="border border-gray-300 mt-1 rounded p-2 w-24 outline-indigo-500"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: e.target.value })
            }
            required
          />
        </div>
      </div>

      <p className='text-gray-800 mt-4'>Amenities</p>
      <div className='flex flex-col gap-2 mt-2 text-gray-600 max-w-sm'>
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index} className='flex items-center gap-2'>
            <input
              type="checkbox"
              id={`amenities${index + 1}`}
              checked={inputs.amenities[amenity]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: {
                    ...inputs.amenities,
                    [amenity]: !inputs.amenities[amenity],
                  },
                })
              }
              className='cursor-pointer'
            />
            <label htmlFor={`amenities${index + 1}`} className='cursor-pointer select-none'>  {amenity}</label>
          </div>
        ))}
      </div>

      <button type="submit" className='bg-primary hover:bg-primary-dull transition-all text-white px-8 py-2.5 rounded mt-8 cursor-pointer active:scale-95'>
        Add Room
      </button>
    </form>
  )
}

export default AddRoom