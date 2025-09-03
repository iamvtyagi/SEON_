import mongoose from "mongoose";
import ProjectModel from "../models/project.model.js";

export const createProject = async ({ name, userId }) => {

    if (!name) {
        throw new Error("Name is required")
    }
    if (!userId) {
        throw new Error("UserID is required")
    }

    const project = await ProjectModel.create({
        name,
        users: [userId]
    })

    return project;
}

export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error("User is required")
    }

    const allUserProjects = ProjectModel.find({ users: userId });

    return allUserProjects;
}

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("Project ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) { // check if the project id is a valid ObjectId
        throw new Error("Project ID is invalid")
    }

    if (!users) {
        throw new Error("Users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) { // check if the users array is an array of valid ObjectIds
        throw new Error("UserId(s) are invalid in users array")
    }

    if (!userId) {
        throw new Error("User ID(owner) is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("User ID(owner) is invalid")
    }

    const project = await ProjectModel.findOne({ // check if the user who is adding other users in that project is himself a part of that project or not ?
        _id: projectId,
        users: userId
    })

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await ProjectModel.findOneAndUpdate( //(filter, update, options)
        { _id: projectId },  
        {
            $addToSet: {
                users: { $each: users }
            }
        },  
            { new: true }  
    );

    return updatedProject;
    
};

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("Project ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Project ID is invalid")
    }

    const project = await ProjectModel.findOne({ _id: projectId }).populate('users');

    return project;
}

export const updateFileTree = async({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("Project ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Project ID is invalid")
    }

    if (!fileTree) {
        throw new Error("File tree is required")
    }

    const project = await ProjectModel.findOneAndUpdate(
        { _id: projectId },
        { fileTree },
        { new: true }
    )

    return project;
}

export const deleteFile = async ({ projectId, file }) => {
    if (!projectId) {
        throw new Error("Project ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Project ID is invalid")
    }

    if (!file) {
        throw new Error("File is required")
    }

    
     const project = await ProjectModel.findOne({ _id: projectId });
     if (!project) {
         throw new Error("Project not found");
     }
     console.log(project.fileTree); 
     
     const fileTree = { ...project.fileTree }; // Modify the fileTree object
     delete fileTree[file];
     
     project.fileTree = fileTree; // Update the project fileTree
     await project.save();
     return project;
 };