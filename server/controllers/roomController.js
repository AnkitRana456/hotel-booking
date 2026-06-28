import { v2 as connectCloudinary } from "cloudinary";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js"

export const createRoom = async (req, res)=>{
try{
    const {roomType, pricePerNight, amenities}= req.body;
    const hotel= await Hotel.findOne({owner: req.user._id})

    if(!hotel){
        return res.json({success: false, message: "No Hotel found"});
    }

    const uploadImages= req.files.map(async (file) =>{
      const response =  await connectCloudinary.uploader.upload(file.path);
      return response.secure_url;
    })
    
    const images = await Promise.all(uploadImages)

    await Room.create({
        hotel: hotel._id, 
        roomType,
        pricePerNight: +pricePerNight,
        amenities: JSON.parse(amenities),
        images,
    })
          res.json({success: true, message: "Room created successfully" })


}catch(error){
    res.json({success: false, message: error.message })
   
}
}

export const getRooms = async (req, res)=>{
    try{
       const { city } = req.query;
       let query = { isAvailable: true };
       if (city) {
          const hotels = await Hotel.find({ city: new RegExp(city, "i") });
          const hotelIds = hotels.map(h => h._id.toString());
          query.hotel = { $in: hotelIds };
       }
       const rooms= await Room.find(query).populate({
        path: 'hotel',
        populate:{
            path: 'owner',
            select: 'image'
        }
       }).sort({createdAt: -1})
       res.json({success: true, rooms});
    }catch(error){
         res.json({success: false, message: error.message });
    }

}

export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        });
        if (!room) {
            return res.json({ success: false, message: "Room not found" });
        }
        res.json({ success: true, room });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getOwnerRooms = async (req, res)=>{
    try {
        const hotelData = await Hotel.findOne({owner: req.user._id});
        if (!hotelData) {
            return res.json({success: false, message: "No Hotel found for this owner"});
        }
        const rooms = await Room.find({hotel: hotelData._id.toString()}).populate("hotel");
        res.json({success:true, rooms});

    } catch (error) {
        res.json({success:false, message: error.message});
    }

}

export const toggleRoomAvailability = async (req, res)=>{
try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();
    res.json({success: true, message: "Room availability Updated" });

} catch (error) {
     res.json({success:false, message: error.message});
}

}