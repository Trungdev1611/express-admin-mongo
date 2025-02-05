import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 100
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 5,
    },
    city: String,
    state: String,
    country: String,
    occipation: String,
    phoneNumber: String,
    transaction: Array,
    role: {
        type: String,
        enum: ["user", "admin", "superadmin" ],
        default: "admin"
    }},
    {timestamps: true} //auto add timestamps
)

const UserModel = mongoose.model("User", UserSchema)  //mongo create table users that correspond with it

export default UserModel