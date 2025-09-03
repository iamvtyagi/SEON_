import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength : [6, 'Email must be at least 6 characters long'],
        maxLength : [50, 'Email must be at most 50 characters long']
    },

    password: {
        type: String,
        select: false, // password will not be returned in response
    }
})


userSchema.statics.hashPassword = async function (password) { // static method scope = Applies to the entire class or collection
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function (password) { // instance method scope = Applies to a single instance(doc) of collection
    return await bcrypt.compare(password, this.password); 
}

userSchema.methods.generateJWT = function () {
    return jwt.sign(
        {email: this.email},
        process.env.JWT_SECRET,
        { expiresIn: '24h' })
}

const user = mongoose.model('user', userSchema);

export default user;