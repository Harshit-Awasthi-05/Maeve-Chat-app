import User from "../models/user.model.js";

export async function getUsersForSidebar(req, res) {
    try {
        const loggedInUserId = req.user._id;
        const searchQuery = req.query.search;

        if (!searchQuery) {
            return res.status(200).json({
                message: "No search query provided",
                data: []
            });
        }

        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId },
            username: { $regex: searchQuery, $options: "i" }
        })
        .select("-password")
        .limit(10);

        res.status(200).json({
            message: "Users fetched successfully",
            data: filteredUsers
        });

    } catch (error) {
        console.log("Error in getUsersForSidebar controller: ", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}