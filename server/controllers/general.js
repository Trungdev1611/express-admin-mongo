import UserModel from "../models/User.js"; 

export const getUser = async (req, res) => {
    try {
        const {id} = req.params
        const user = await UserModel.findById(id)
        return res.status(200).json(user)
    } catch (error) {
        return res.status(404).json({message: error.message})
    }
}