import mongoose, { mongo } from 'mongoose';

export const connectDB = () => {
    const isConnected = mongoose.connect(process.env.MONGO_URI, {
        dbName: 'FlagZilla',

    })
        .then(() => console.log("Database connected successfully"))
        .catch(err => console.log("Error in databse connection:", err))

    if (isConnected) {
        console.log("Database connected successfully")
    }
}