import pool from "../connect.js"
import * as ServiceUser from "./user.service.js"


export const getUserController = async (req, res, next) => {

    try {

        const response = await ServiceUser.getUser()
        res.status(200).send(response);

    } catch (error) {
        // console.log("err",error);
        // next({ result: false, code: '401', Message: '', errorMessage: 'ERROR CATCH' })
        res.status(500).send({ error: 'An error occurred while fetching users' });
    }

}


export const AddUserController = async (req, res, next) => {

    try {
        console.log(req);

        const response = await ServiceUser.registerUser(req.body)
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'An error' });
    }

}

export const LoginController = async (req, res, next) => {

    try {
        // console.log(req);

        const response = await ServiceUser.login(req.body)

        if(response.code == 200){
            res.status(200).send(response);
        }else{
            res.status(201).send(response);
        }

        // console.log();
        
        // res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'An error' });
    }

}

export const updateUserController = async (req, res, next) => {
  
    const userID =  await req.params.id
    
    const response = await ServiceUser.userUpdateProfile(req.body,userID);
 
    return res.status(response.code).send(response.message)

}
export const getUserByID = async (req, res, next) => {
    const userID =  await req.params.id
    
    const response = await ServiceUser.getUserByID(userID);
    

    return res.status(response.code).send(response.message)
}