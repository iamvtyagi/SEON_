import { Router } from 'express';
import { body } from 'express-validator';
import { query } from 'express-validator';
import * as projectController from '../controllers/project.controller.js'
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create',
    authMiddleware.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
)

router.get('/all', //get all project of particular user
    authMiddleware.authUser,
    projectController.getAllProjects
)

router.put('/add-user', // add user to a project
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be a non-empty array')
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'), // multiple users can be added to a project at once 
    projectController.addUserToProject
)

router.get('/get-project/:projectId', //details of a particular project 
    authMiddleware.authUser,
    projectController.getAllProjectById
)

router.put('/update-file-tree', // update file tree of a project
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
)

router.delete('/delete-file',
    authMiddleware.authUser,
    query('projectId').isString().withMessage('Project ID is required'),
    query('file').isString().withMessage('file is required'),
    projectController.deleteFile
)

export default router;