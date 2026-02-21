const { atlasConn  } = require("../config/db");
const GroupSchema=require("../Schema/GroupSchema")

const Group = atlasConn.model("Group", GroupSchema);

module.exports = Group;