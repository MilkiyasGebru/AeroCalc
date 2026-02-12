import mongoose from 'mongoose'
import {ENV_VARS} from "./env_vars.js";
export const connectToDB =  ()=>{
    return mongoose.connect(ENV_VARS.MONGODB_URI)
}