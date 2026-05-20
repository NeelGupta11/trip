const express = require("express");
const router = express.Router();

const Expense = require("../models/ExpenseModel");
const Settlement = require("../models/Settlement");

// ✅ GET GROUP BALANCE ROUTE
router.get("/group-balance/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ groupId })
      .populate("paidBy")
      .populate("splitBetween.user");

    const balanceMap = {};

    const addBalance = (id, amount) => {
      if (!balanceMap[id]) balanceMap[id] = 0;
      balanceMap[id] += amount;
    };

    expenses.forEach((expense) => {
      const paidById = expense.paidBy._id.toString();

      addBalance(paidById, expense.amount);

      expense.splitBetween.forEach((split) => {
        addBalance(split.user._id.toString(), -split.amount);
      });
    });

    const memberSummary = Object.entries(balanceMap).map(([id, amount]) => {
      const user = expenses
        .flatMap((e) => [e.paidBy, ...e.splitBetween.map((s) => s.user)])
        .find((u) => u._id.toString() === id);

      return {
        user,
        totalPaid: amount > 0 ? amount : 0,
        totalShare: amount < 0 ? Math.abs(amount) : 0,
        netBalance: amount,
      };
    });

    const creditors = [];
    const debtors = [];

    memberSummary.forEach((m) => {
      if (m.netBalance > 0) {
        creditors.push({ user: m.user, amount: m.netBalance });
      } else if (m.netBalance < 0) {
        debtors.push({ user: m.user, amount: Math.abs(m.netBalance) });
      }
    });

    const debts = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount);

      debts.push({
        ower: debtors[i].user,
        creditor: creditors[j].user,
        amount,
      });

      debtors[i].amount -= amount;
      creditors[j].amount -= amount;

      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    res.json({
      success: true,
      summary: {
        totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
        totalSettled: 0,
        expenseCount: expenses.length,
        settlementCount: 0,
      },
      debts,
      memberSummary,
      recentSettlements: [],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;