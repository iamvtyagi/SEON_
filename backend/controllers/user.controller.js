import userModel from '../models/user.model.js';
import * as userService from '../services/user.services.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js'

export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();

        delete user._doc.password; //Deletes the password from the user object so that it will not go in client side

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }
}


export const loginUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            });
        }

        const isValid = await user.isValidPassword(password);

        if (!isValid) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const token = await user.generateJWT();

        delete user._doc.password;

        return res.status(201).json({ user, token });
    } catch (err) {
        res.status(400).send(err.message);
    }
}


export const profileController = async (req, res) => {
     
    const user = await userModel.findOne({ email: req.user.email });

    res.status(200).json(user);
}


export const logoutController = async (req, res) => {
    try {
        
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24); //Saves the token in Redis with the value 'logout'. The EX -> expiration time for the token in Redis is 24 hr The token will remain blacklisted for 24 hours (1 day).

        res.status(200).send('User logged out successfully');

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const getAllUsersController = async(req, res) => {
    try{

        const loggedInUser = await userModel.findOne({ email: req.user.email}); //get all user in option expect the logged one

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        res.status(200).json({
            users: allUsers
        })

    } catch (err){
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}