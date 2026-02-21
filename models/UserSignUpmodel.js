const { atlasConn  } = require("../config/db");
const SignUpDetailSchema = require("../Schema/UserSignUp");

const SignUpDetail = atlasConn.model(
  "SignUpDetail",
  SignUpDetailSchema
);

module.exports = SignUpDetail;
