const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Expense = require("../models/ExpenseModel");


// ======================================================
// CREATE EXPENSE
// ======================================================
router.post("/add-expense", async (req, res) => {

  try {

    const {
      groupId,
      paidBy,
      title,
      amount,
      splitBetween,
      contributions
    } = req.body;

    // ================= VALIDATIONS =================

    if (
      !groupId ||
      !paidBy ||
      !title ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!Array.isArray(splitBetween)) {
      return res.status(400).json({
        success: false,
        message: "splitBetween must be an array"
      });
    }

    // ================= CREATE =================

    const expense = new Expense({
      groupId,
      paidBy,
      title,
      amount: Number(amount),
      splitBetween,
      contributions
    });

    await expense.save();

    // populate before sending response
    await expense.populate("paidBy", "firstName lastName");
    await expense.populate(
      "splitBetween.user",
      "firstName lastName"
    );
    await expense.populate(
      "contributions.user",
      "firstName lastName"
    );

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense
    });

  } catch (err) {

    console.log("ADD EXPENSE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ======================================================
// GET ALL GROUP EXPENSES
// ======================================================
router.get("/group-expenses/:groupId", async (req, res) => {

  try {

    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {

      return res.status(400).json({
        success: false,
        message: "Invalid Group ID"
      });
    }

    const expenses = await Expense.find({
      groupId
    })
      .populate(
        "paidBy",
        "firstName lastName email"
      )
      .populate(
        "splitBetween.user",
        "firstName lastName email"
      )
      .populate(
        "contributions.user",
        "firstName lastName email"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (err) {

    console.log("GET GROUP EXPENSES ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ======================================================
// GET SINGLE EXPENSE
// ======================================================
router.get("/single-expense/:expenseId", async (req, res) => {

  try {

    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {

      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID"
      });
    }

    const expense = await Expense.findById(expenseId)
      .populate(
        "paidBy",
        "firstName lastName email"
      )
      .populate(
        "splitBetween.user",
        "firstName lastName email"
      )
      .populate(
        "contributions.user",
        "firstName lastName email"
      );

    if (!expense) {

      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.status(200).json({
      success: true,
      expense
    });

  } catch (err) {

    console.log("GET SINGLE EXPENSE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ======================================================
// UPDATE EXPENSE
// ======================================================
router.put("/update-expense/:expenseId", async (req, res) => {

  try {

    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {

      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID"
      });
    }

    const {
      groupId,
      paidBy,
      title,
      amount,
      splitBetween,
      contributions
    } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        groupId,
        paidBy,
        title,
        amount: Number(amount),
        splitBetween,
        contributions
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate(
        "paidBy",
        "firstName lastName email"
      )
      .populate(
        "splitBetween.user",
        "firstName lastName email"
      )
      .populate(
        "contributions.user",
        "firstName lastName email"
      );

    if (!updatedExpense) {

      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      updatedExpense
    });

  } catch (err) {

    console.log("UPDATE EXPENSE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ======================================================
// DELETE EXPENSE
// ======================================================
router.delete("/delete-expense/:expenseId", async (req, res) => {

  try {

    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {

      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID"
      });
    }

    const deletedExpense =
      await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {

      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully"
    });

  } catch (err) {

    console.log("DELETE EXPENSE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ======================================================
// GROUP BALANCE / SETTLEMENT
// ======================================================
router.get(
  "/group-balance/:groupId/:userId",
  async (req, res) => {

    try {

      const { groupId, userId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(groupId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {

        return res.status(400).json({
          success: false,
          message: "Invalid ID"
        });
      }

      const expenses = await Expense.find({
        groupId
      })
        .populate(
          "paidBy",
          "firstName lastName email"
        )
        .populate(
          "splitBetween.user",
          "firstName lastName email"
        )
        .populate(
          "contributions.user",
          "firstName lastName email"
        );

      let totalOwe = 0;

      let totalReceive = 0;

      const owes = [];

      const owedBy = [];

      const memberContributionMap = {};

      expenses.forEach((expense) => {

        const payerId =
          expense.paidBy._id.toString();

        // ====================================
        // MEMBER CONTRIBUTIONS
        // ====================================

        expense.contributions.forEach((c) => {

          const contributionUserId =
            c.user._id.toString();

          if (!memberContributionMap[contributionUserId]) {

            memberContributionMap[
              contributionUserId
            ] = {
              user: c.user,
              totalPaid: 0
            };
          }

          memberContributionMap[
            contributionUserId
          ].totalPaid += c.amount;
        });

        // ====================================
        // SPLIT LOGIC
        // ====================================

        expense.splitBetween.forEach((split) => {

          const splitUserId =
            split.user._id.toString();

          // USER OWES SOMEONE
          if (
            splitUserId === userId &&
            payerId !== userId
          ) {

            totalOwe += split.amount;

            owes.push({
              expenseId: expense._id,
              title: expense.title,
              amount: split.amount,
              to: expense.paidBy
            });
          }

          // USER SHOULD RECEIVE
          if (
            payerId === userId &&
            splitUserId !== userId
          ) {

            totalReceive += split.amount;

            owedBy.push({
              expenseId: expense._id,
              title: expense.title,
              amount: split.amount,
              from: split.user
            });
          }

        });

      });

      // ====================================
      // MEMBER CONTRIBUTIONS ARRAY
      // ====================================

      const memberContributions =
        Object.values(memberContributionMap);

      // ====================================
      // FINAL RESPONSE
      // ====================================

      res.status(200).json({
        success: true,

        summary: {
          totalOwe,
          totalReceive,
          netBalance:
            totalReceive - totalOwe
        },

        owes,

        owedBy,

        memberContributions
      });

    } catch (err) {

      console.log(
        "GROUP BALANCE ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

module.exports = router;