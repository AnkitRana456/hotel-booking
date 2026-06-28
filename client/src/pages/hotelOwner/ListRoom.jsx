import React, { useState, useEffect } from 'react'
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListRoom = () => {
  const { axios } = useAppContext();
  const [rooms, setRooms] = useState([]);

  const fetchOwnerRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms/owner');
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch owner rooms");
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post('/api/rooms/toggle-availability', { roomId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to toggle availability");
    }
  };

  useEffect(() => {
    fetchOwnerRooms();
  }, []);

  return (
    <div className='p-6 md:p-10'>

      <Title align='left' font='outfit' title='Room Listings' subTitle='View, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users.' />

      <p className='text-gray-500 mt-8'>All Rooms</p>

      <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3 shadow-sm'>
        <table className='w-full border-collapse'>
          <thead className='bg-gray-50 sticky top-0'>
            <tr>
              <th className='py-3 px-4 text-gray-800 font-medium border-b border-gray-300'>Name</th>
              <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden border-b border-gray-300'>Facility</th>
              <th className='py-3 px-4 text-gray-800 font-medium border-b border-gray-300'>Price / night</th>
              <th className='py-3 px-4 text-gray-800 font-medium text-center border-b border-gray-300'>Actions</th>
            </tr>
          </thead>
       
          <tbody className='text-sm'>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">No rooms listed yet.</td>
              </tr>
            ) : (
              rooms.map((item, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                    {item.roomType}
                  </td>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden'>
                    {item.amenities.join(', ')}
                  </td>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                    ${item.pricePerNight}
                  </td>
                  <td className='py-3 px-4 border-t border-gray-300 text-center'>
                    <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                      <input
                        type="checkbox"
                        className='sr-only peer'
                        checked={item.isAvailable}
                        onChange={() => toggleAvailability(item._id)}
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default ListRoom