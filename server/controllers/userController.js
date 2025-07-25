


export const getUserData = async () =>{
    try{
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        console.log("avdkvndsklvn");
        res.json({success: true, role, recentSearchedCities})
        
    }catch(error){
        console.log("abcg");
             res.json({success: false, message: error.message})
    }
}


export const storeRecentSearchedCities = async (req, res)=>{
    try{
            const {recentSearchedCity} = req.body;
            const user= await req.user;

                    if(user.recentSearchedCities.length<3){
                        user.recentSearchedCities.push(recentSearchedCity)
                    }else{
                        user.recentSearchedCities.shift();
                        user.recentSearchedCities.push(recentSearchedCity)
                    }
                    await user.save();
                    res.json({success: true, message: "City added"})


    }catch(error){
        res.json({success: false, message: error.message})

    }
}