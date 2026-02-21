const { atlasConn  } = require("../config/db");
const UserLocationSchema=require("../Schema/UserLocationSchema")

const UserLocation = atlasConn.model("UserLocation", UserLocationSchema);

module.exports=UserLocation