const { atlasConn } = require("../config/db");

const ExpenseSchema = require("../Schema/ExpenseSchema");

const Expense = atlasConn.model(
  "Expense",
  ExpenseSchema
);

module.exports = Expense;