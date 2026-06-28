import React, { useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { axios } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    bookings: []
  });

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/bookings/hotel');
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className='p-6 md:p-10'>
        
        <Title align='left' font='outfit' title='Dashboard' subTitle='Monitor your room listings, track bookings and analyze revenue—all in one place. Stay updated with real-time insights to ensure smooth operations.' />

        <div className='flex gap-4 my-8'>
          {/* ----- ---Total Bookings-- */}
          <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
            <img src={assets.totalBookingIcon} alt='' className='max-sm:hidden h-10'/>
            <div className='flex flex-col sm:ml-4 font-medium'>
              <p className='text-blue-500 text-lg'>Total Bookings</p>
              <p className='text-neutral-400 text-base'>{dashboardData.totalBookings}</p>
            </div>
          </div>

          {/* ----- ---Total Revenue-- */}
          <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
            <img src={assets.totalRevenueIcon} alt='' className='max-sm:hidden h-10'/>
            <div className='flex flex-col sm:ml-4 font-medium'>
              <p className='text-blue-500 text-lg'>Total Revenue</p>
              <p className='text-neutral-400 text-base'> ${dashboardData.totalRevenue}</p>
            </div>
          </div>
        </div>

        {/* ------- Recent Bookings ----------- */}
        <h2 className='text-xl text-blue-950/70 font-medium mb-5'>Recent Bookings</h2>

        <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll'>
          <table className='w-full border-collapse'>
            <thead className='bg-gray-50 sticky top-0'>
              <tr>
                <th className='py-3 px-4 text-gray-800 font-medium border-b border-gray-300'>User Name</th>
                <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden border-b border-gray-300'>Room Name</th>
                <th className='py-3 px-4 text-gray-800 font-medium text-center border-b border-gray-300'>Total Amount</th>
                <th className='py-3 px-4 text-gray-800 font-medium text-center border-b border-gray-300'>Payment Status</th>
              </tr>
            </thead>
                 
            <tbody className='text-sm'>
              {dashboardData.bookings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500">No bookings yet.</td>
                </tr>
              ) : (
                dashboardData.bookings.map((item, index)=>(
                  <tr key={index} className='hover:bg-gray-50'>
                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                      {item.user?.username || "Guest"}
                    </td>
                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden'>
                      {item.room?.roomType || "Room"}
                    </td>
                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300 text-center'>
                      ${item.totalPrice}
                    </td>
                    <td className='py-3 px-4 border-t border-gray-300 text-center'>
                      <span className={`py-1 px-3 text-xs rounded-full inline-block ${
                        item.isPaid ? 'bg-green-150 text-green-600' : 'bg-amber-100 text-yellow-600'
                      }`}>
                        {item.isPaid ? 'Completed' : 'Pending'}
                      </span>
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

export default Dashboard