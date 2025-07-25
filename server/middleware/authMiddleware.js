// import User from "../models/User.js";

// export const protect = async (req, res, next)=>{
//     const{ userId } =req.auth();
//     if(!userId){
//         res.json( {success: false, message: "not authenticated"})
//     }else{
//         const user= await User.findById(userId);
//         req.user = user;
//         next()
//     }
// }


import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Ensure req.auth is an object, not a function, unless you're certain!
    const userId = req.auth?.userId || (typeof req.auth === 'function' ? req.auth().userId : undefined);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    // Server error handling
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
