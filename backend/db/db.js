import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

function connect() {
    mongoose.connect (process.env.MONGODB_URI)
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch(err => {
        console.log(err);
    })
}

export default connect;