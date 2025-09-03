import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: [true, "Name is required"],
        trim: true, // removes whitespace
        unique: [true, "Name must be unique"],
    },

    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    fileTree: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

})

const Project = mongoose.model('Project', projectSchema);

export default Project;