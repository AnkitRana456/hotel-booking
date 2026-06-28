


export const getUserData = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const role = user.role;
        const recentSearchedCities = user.recentSearchedCities || [];
        res.json({ success: true, role, recentSearchedCities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!user.recentSearchedCities) {
            user.recentSearchedCities = [];
        }
        if (user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCity);
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        await user.save();
        res.json({ success: true, message: "City added" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};