import express from 'express';
import cors from 'cors';
import {connectToDB} from "./config/db.js";
import buildingRouter from "./router/BuildingRouter.js";

const app = express();
app.use(express.json())
app.use(cors())

app.use(buildingRouter)

connectToDB().then(()=>{

    app.listen(8080, ()=>{
        console.log("Server running on port 8080");
    });

})

// https://res.cloudinary.com/dfnxl6a1h/raw/upload/v1770908044/aero_erelcc.csv