import express from 'express';
import {addBuilding, fetchClosestBuildings} from "../controller/BuildingController.js";

const buildingRouter = express.Router();

buildingRouter.post('/', fetchClosestBuildings)


export default buildingRouter;