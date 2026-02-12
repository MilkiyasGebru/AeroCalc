import BuildingModel from "../models/building.js";
import {v2 as cloudinary} from "cloudinary";
import {ENV_VARS} from "../config/env_vars.js";

cloudinary.config({
    cloud_name: ENV_VARS.CLOUDINARY_CLOUD_NAME,
    api_key: ENV_VARS.CLOUDINARY_API_KEY,
    api_secret: ENV_VARS.CLOUDINARY_API_SECRET,
});

export const fetchClosestBuildings = async (req, res) => {
    console.log("body is ",req.body);
    const { width, height, depth } = req.body;

    const buildings = await BuildingModel.aggregate([
        {
            $addFields: {
                diff: {
                    $sqrt: {
                        $add: [
                            {$pow: [{$subtract: ["$width",  width]},2]},
                            {$pow: [{$subtract: ["$height", height]},2]},
                            {$pow: [{$subtract: ["$depth",  depth]},2]},
                        ]
                    }
                }
            },
        },
        {
            $sort: {diff: 1}
        },
        {
            $limit: 3
        }
    ]);
    return res.json(buildings);
}

export const addBuilding = async (req, res) => {
    const building = await BuildingModel.create({
        width: 42,
        height: 33.7,
        depth: 30,
        terrain: "Open",
        id: 1,
        frequency:0.183,
        url:"https://res.cloudinary.com/dfnxl6a1h/raw/upload/v1770908044/aero_erelcc.csv"
    });
    return res.json(building);
}