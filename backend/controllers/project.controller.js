import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.services.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';

export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try{

        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email});
        const userId = loggedInUser._id;
        
        const newProject = await projectService.createProject({
            name,
            userId
        })
        
        res.status(201).json(newProject);
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const getAllProjects = async (req, res) => {
    try{

        const loggedInUser = await userModel.findOne( {email: req.user.email});
        const userId = loggedInUser._id;

        const allUserProjects = await projectService.getAllProjectByUserId( {userId} )

        return res.status(200).json({  //to client
            projects: allUserProjects
        })

    } catch (err) {
        console.log(err);
        res.status(400).json( {error: err.message })
    }
}

export const addUserToProject = async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
         
        const { projectId, users } = req.body;

        const loggedInUser = await userModel.findOne({ email: req.user.email});

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json(project);

    } catch (err) {
        console.log(err);
        res.status(400).json( { error: err.message } )
    }
}

export const getAllProjectById = async(req, res) => {

    const { projectId } = req.params;

    try{
        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json({
            project
        })
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: err.message })
    }

}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json(project);

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message })
    }
}

export const deleteFile = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { projectId, file } = req.query;
        console.log("reached ");

        const project = await projectService.deleteFile({
            projectId,
            file
        })

        return res.status(200).json({
            success: true,
            project
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message })
    }

}