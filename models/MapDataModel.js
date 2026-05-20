const { atlasConn } = require("../config/db");
const MapDataSchema = require("../Schema/MapDataSchema");

const MapData = atlasConn.model("MapData", MapDataSchema);

module.exports = MapData;