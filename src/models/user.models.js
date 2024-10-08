import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true  // useful for search in  database optimise
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            unique: false,
            required: true,
            lowercase: true,
            trim: true,

        },
        avatar: {
            type: String,     //cloudinary url to get image url
            required: true
        },
        coverImage: {
            type: String,     //cloudinary url to get image url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Pssword is required"]
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
)
// .pre is a hook provided by mongoose schema to execute som taske before some action 
// here before saving the passord we are hashing it using bcrypt
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// to design custom method

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    }, process.env.ACCESS_TOKEN_SECRET,
        {
            //default algo HS256
            // algorithm: 'RS256',
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE
        })

}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        })
}

export const User = mongoose.model('User', userSchema)