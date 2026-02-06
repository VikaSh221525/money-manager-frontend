=> category controller code
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

// Create default categories for new users
export const createDefaultCategories = async (userId) => {
    const defaultCategories = [
        // Income categories
        { name: "Salary", type: "income", icon: "💰", color: "#10B981" },
        { name: "Freelance", type: "income", icon: "💻", color: "#059669" },
        { name: "Investment", type: "income", icon: "📈", color: "#047857" },
        { name: "Business", type: "income", icon: "🏢", color: "#065F46" },
        { name: "Other Income", type: "income", icon: "💵", color: "#064E3B" },

        // Expense categories
        { name: "Food", type: "expense", icon: "🍽️", color: "#EF4444" },
        { name: "Fuel", type: "expense", icon: "⛽", color: "#DC2626" },
        { name: "Movie", type: "expense", icon: "🎬", color: "#B91C1C" },
        { name: "Medical", type: "expense", icon: "🏥", color: "#991B1B" },
        { name: "Loan", type: "expense", icon: "🏦", color: "#7F1D1D" },
        { name: "Shopping", type: "expense", icon: "🛍️", color: "#F59E0B" },
        { name: "Transport", type: "expense", icon: "🚗", color: "#D97706" },
        { name: "Utilities", type: "expense", icon: "💡", color: "#B45309" },
        { name: "Rent", type: "expense", icon: "🏠", color: "#92400E" },
        { name: "Education", type: "expense", icon: "📚", color: "#78350F" },
        { name: "Entertainment", type: "expense", icon: "🎮", color: "#8B5CF6" },
        { name: "Travel", type: "expense", icon: "✈️", color: "#7C3AED" },
        { name: "Insurance", type: "expense", icon: "🛡️", color: "#6D28D9" },
        { name: "Other Expense", type: "expense", icon: "💸", color: "#5B21B6" }
    ];

    const categories = defaultCategories.map(cat => ({
        ...cat,
        user: userId,
        isDefault: true
    }));

    await Category.insertMany(categories);
    return categories;
};

// Create new category
export const createCategory = async (req, res) => {
    try {
        const { name, type, icon = "💰", color = "#3B82F6" } = req.body;
        const userId = req.user.id;

        // Check if category already exists
        const existingCategory = await Category.findOne({
            user: userId,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            type,
            isActive: true
        });

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new Category({
            user: userId,
            name,
            type,
            icon,
            color
        });

        await category.save();

        res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all user categories
export const getCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, includeInactive = false } = req.query;

        const filter = { user: userId };
        if (type) filter.type = type;
        if (!includeInactive) filter.isActive = true;

        const categories = await Category.find(filter).sort({ name: 1 });

        // Group by type
        const groupedCategories = {
            income: categories.filter(cat => cat.type === "income"),
            expense: categories.filter(cat => cat.type === "expense")
        };

        res.json({ 
            categories: type ? categories : groupedCategories,
            total: categories.length
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const category = await Category.findOneAndUpdate(
            { _id: id, user: userId, isDefault: false }, // Don't allow updating default categories
            updates,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found or cannot be updated" });
        }

        res.json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete category (soft delete)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const category = await Category.findOne({ _id: id, user: userId });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (category.isDefault) {
            return res.status(400).json({ message: "Cannot delete default category" });
        }

        // Check if category has transactions
        const transactionCount = await Transaction.countDocuments({
            user: userId,
            category: id
        });

        if (transactionCount > 0) {
            // Soft delete - just mark as inactive
            category.isActive = false;
            await category.save();

            return res.json({
                message: "Category deactivated successfully (has transaction history)",
                category
            });
        } else {
            // Hard delete if no transactions
            await Category.findByIdAndDelete(id);
            return res.json({ message: "Category deleted successfully" });
        }
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get category summary with spending analysis
export const getCategorySummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, division } = req.query;

        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }

        const matchCriteria = {
            user: userId,
            ...dateFilter
        };

        if (division) {
            matchCriteria.division = division;
        }

        const categorySummary = await Transaction.aggregate([
            { $match: matchCriteria },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $group: {
                    _id: {
                        category: "$category",
                        type: "$type",
                        name: "$categoryInfo.name",
                        icon: "$categoryInfo.icon",
                        color: "$categoryInfo.color"
                    },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                    avgAmount: { $avg: "$amount" },
                    maxAmount: { $max: "$amount" },
                    minAmount: { $min: "$amount" }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Calculate percentages
        const totalByType = {
            income: categorySummary.filter(cat => cat._id.type === "income").reduce((sum, cat) => sum + cat.total, 0),
            expense: categorySummary.filter(cat => cat._id.type === "expense").reduce((sum, cat) => sum + cat.total, 0)
        };

        const summaryWithPercentages = categorySummary.map(cat => ({
            ...cat,
            percentage: totalByType[cat._id.type] > 0 ? 
                ((cat.total / totalByType[cat._id.type]) * 100).toFixed(2) : 0
        }));

        res.json({
            categorySummary: summaryWithPercentages,
            totals: totalByType
        });
    } catch (error) {
        console.error("Category summary error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



=> DashBoard controller code
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import mongoose from "mongoose";

// Get dashboard summary data
export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = "monthly", division, startDate, endDate } = req.query;

        let dateFilter = {};
        const now = new Date();

        // Set date range based on period
        switch (period) {
            case "daily":
                dateFilter = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                };
                break;
            case "weekly":
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                dateFilter = { $gte: weekStart, $lt: weekEnd };
                break;
            case "monthly":
                dateFilter = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                };
                break;
            case "yearly":
                dateFilter = {
                    $gte: new Date(now.getFullYear(), 0, 1),
                    $lt: new Date(now.getFullYear() + 1, 0, 1)
                };
                break;
            case "custom":
                if (startDate && endDate) {
                    dateFilter = {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    };
                }
                break;
        }

        // Build match criteria
        const matchCriteria = {
            user: new mongoose.Types.ObjectId(userId),
            date: dateFilter
        };

        if (division) {
            matchCriteria.division = division;
        }

        // Aggregate income and expense data
        const summary = await Transaction.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format summary data
        const summaryData = {
            income: { total: 0, count: 0 },
            expense: { total: 0, count: 0 },
            transfer: { total: 0, count: 0 }
        };

        summary.forEach(item => {
            if (summaryData[item._id]) {
                summaryData[item._id] = {
                    total: item.total,
                    count: item.count
                };
            }
        });

        // Calculate net income
        const netIncome = summaryData.income.total - summaryData.expense.total;

        // Get category-wise breakdown
        const categoryBreakdown = await Transaction.aggregate([
            { 
                $match: { 
                    ...matchCriteria,
                    type: { $in: ["income", "expense"] }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $group: {
                    _id: {
                        category: "$category",
                        type: "$type",
                        name: "$categoryInfo.name",
                        icon: "$categoryInfo.icon",
                        color: "$categoryInfo.color"
                    },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.json({
            period,
            dateRange: dateFilter,
            summary: {
                ...summaryData,
                netIncome
            },
            categoryBreakdown
        });
    } catch (error) {
        console.error("Dashboard summary error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get income/expense trends over time
export const getTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = "monthly", months = 12 } = req.query;

        let groupBy = {};
        let dateRange = {};

        const now = new Date();

        switch (period) {
            case "daily":
                // Last 30 days
                dateRange = {
                    $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                };
                groupBy = {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    day: { $dayOfMonth: "$date" }
                };
                break;
            case "weekly":
                // Last 12 weeks
                dateRange = {
                    $gte: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)
                };
                groupBy = {
                    year: { $year: "$date" },
                    week: { $week: "$date" }
                };
                break;
            case "monthly":
                // Last specified months
                dateRange = {
                    $gte: new Date(now.getFullYear(), now.getMonth() - parseInt(months), 1)
                };
                groupBy = {
                    year: { $year: "$date" },
                    month: { $month: "$date" }
                };
                break;
            case "yearly":
                // Last 5 years
                dateRange = {
                    $gte: new Date(now.getFullYear() - 5, 0, 1)
                };
                groupBy = {
                    year: { $year: "$date" }
                };
                break;
        }

        const trends = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    date: dateRange,
                    type: { $in: ["income", "expense"] }
                }
            },
            {
                $group: {
                    _id: {
                        ...groupBy,
                        type: "$type"
                    },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
        ]);

        res.json({ trends, period });
    } catch (error) {
        console.error("Trends error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get account balances and overview
export const getAccountsOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        const accounts = await Account.find({ user: userId, isActive: true });
        
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

        // Get recent transactions for each account
        const accountsWithTransactions = await Promise.all(
            accounts.map(async (account) => {
                const recentTransactions = await Transaction.find({
                    user: userId,
                    $or: [{ account: account._id }, { toAccount: account._id }]
                })
                .populate('category', 'name icon color')
                .sort({ date: -1 })
                .limit(5);

                return {
                    ...account.toObject(),
                    recentTransactions
                };
            })
        );

        res.json({
            accounts: accountsWithTransactions,
            totalBalance,
            accountCount: accounts.length
        });
    } catch (error) {
        console.error("Accounts overview error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


=> Transaction controller code
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

// Add new transaction
export const addTransaction = async (req, res) => {
    try {
        const { type, amount, category, account, toAccount, division, description, date, tags } = req.body;
        const userId = req.user.id;

        // Validate account exists and belongs to user
        const accountDoc = await Account.findOne({ _id: account, user: userId, isActive: true });
        if (!accountDoc) {
            return res.status(404).json({ message: "Account not found" });
        }

        // For transfers, validate destination account
        if (type === "transfer") {
            const toAccountDoc = await Account.findOne({ _id: toAccount, user: userId, isActive: true });
            if (!toAccountDoc) {
                return res.status(404).json({ message: "Destination account not found" });
            }
            if (account === toAccount) {
                return res.status(400).json({ message: "Cannot transfer to the same account" });
            }
        }

        // For income/expense, validate category
        if (type !== "transfer") {
            const categoryDoc = await Category.findOne({ _id: category, user: userId, type, isActive: true });
            if (!categoryDoc) {
                return res.status(404).json({ message: "Category not found" });
            }
        }

        const transaction = new Transaction({
            user: userId,
            type,
            amount,
            category: type !== "transfer" ? category : undefined,
            account,
            toAccount: type === "transfer" ? toAccount : undefined,
            division,
            description,
            date: date || new Date(),
            tags: tags || []
        });

        await transaction.save();

        // Update account balances
        if (type === "income") {
            await Account.findByIdAndUpdate(account, { $inc: { balance: amount } });
        } else if (type === "expense") {
            await Account.findByIdAndUpdate(account, { $inc: { balance: -amount } });
        } else if (type === "transfer") {
            await Account.findByIdAndUpdate(account, { $inc: { balance: -amount } });
            await Account.findByIdAndUpdate(toAccount, { $inc: { balance: amount } });
        }

        const populatedTransaction = await Transaction.findById(transaction._id)
            .populate('category', 'name icon color')
            .populate('account', 'name type')
            .populate('toAccount', 'name type');

        res.status(201).json({
            message: "Transaction added successfully",
            transaction: populatedTransaction
        });
    } catch (error) {
        console.error("Add transaction error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get transactions with filters
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            type,
            division,
            category,
            account,
            startDate,
            endDate,
            page = 1,
            limit = 50,
            sortBy = "date",
            sortOrder = "desc"
        } = req.query;

        // Build filter object
        const filter = { user: userId };
        
        if (type) filter.type = type;
        if (division) filter.division = division;
        if (category) filter.category = category;
        if (account) filter.account = account;
        
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

        const transactions = await Transaction.find(filter)
            .populate('category', 'name icon color')
            .populate('account', 'name type')
            .populate('toAccount', 'name type')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(filter);

        res.json({
            transactions,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update transaction (only within 12 hours)
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const transaction = await Transaction.findOne({ _id: id, user: userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Check if transaction can be edited (within 12 hours)
        if (!transaction.canEdit) {
            return res.status(403).json({ message: "Transaction can only be edited within 12 hours of creation" });
        }

        // Revert previous balance changes
        const oldAmount = transaction.amount;
        if (transaction.type === "income") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: -oldAmount } });
        } else if (transaction.type === "expense") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: oldAmount } });
        } else if (transaction.type === "transfer") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: oldAmount } });
            await Account.findByIdAndUpdate(transaction.toAccount, { $inc: { balance: -oldAmount } });
        }

        // Update transaction
        Object.assign(transaction, updates);
        await transaction.save();

        // Apply new balance changes
        const newAmount = transaction.amount;
        if (transaction.type === "income") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: newAmount } });
        } else if (transaction.type === "expense") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: -newAmount } });
        } else if (transaction.type === "transfer") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: -newAmount } });
            await Account.findByIdAndUpdate(transaction.toAccount, { $inc: { balance: newAmount } });
        }

        const updatedTransaction = await Transaction.findById(id)
            .populate('category', 'name icon color')
            .populate('account', 'name type')
            .populate('toAccount', 'name type');

        res.json({
            message: "Transaction updated successfully",
            transaction: updatedTransaction
        });
    } catch (error) {
        console.error("Update transaction error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete transaction (only within 12 hours)
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const transaction = await Transaction.findOne({ _id: id, user: userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Check if transaction can be deleted (within 12 hours)
        if (!transaction.canEdit) {
            return res.status(403).json({ message: "Transaction can only be deleted within 12 hours of creation" });
        }

        // Revert balance changes
        if (transaction.type === "income") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: -transaction.amount } });
        } else if (transaction.type === "expense") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: transaction.amount } });
        } else if (transaction.type === "transfer") {
            await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: transaction.amount } });
            await Account.findByIdAndUpdate(transaction.toAccount, { $inc: { balance: -transaction.amount } });
        }

        await Transaction.findByIdAndDelete(id);

        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Delete transaction error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


=> Account controller code
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

// Create new account
export const createAccount = async (req, res) => {
    try {
        const { name, type, balance = 0, currency = "USD" } = req.body;
        const userId = req.user.id;

        const account = new Account({
            user: userId,
            name,
            type,
            balance,
            currency
        });

        await account.save();

        res.status(201).json({
            message: "Account created successfully",
            account
        });
    } catch (error) {
        console.error("Create account error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all user accounts
export const getAccounts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { includeInactive = false } = req.query;

        const filter = { user: userId };
        if (!includeInactive) {
            filter.isActive = true;
        }

        const accounts = await Account.find(filter).sort({ createdAt: -1 });

        res.json({ accounts });
    } catch (error) {
        console.error("Get accounts error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update account
export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        // Don't allow direct balance updates through this endpoint
        delete updates.balance;

        const account = await Account.findOneAndUpdate(
            { _id: id, user: userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.json({
            message: "Account updated successfully",
            account
        });
    } catch (error) {
        console.error("Update account error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete account (soft delete)
export const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if account has transactions
        const transactionCount = await Transaction.countDocuments({
            user: userId,
            $or: [{ account: id }, { toAccount: id }]
        });

        if (transactionCount > 0) {
            // Soft delete - just mark as inactive
            const account = await Account.findOneAndUpdate(
                { _id: id, user: userId },
                { isActive: false },
                { new: true }
            );

            if (!account) {
                return res.status(404).json({ message: "Account not found" });
            }

            return res.json({
                message: "Account deactivated successfully (has transaction history)",
                account
            });
        } else {
            // Hard delete if no transactions
            const account = await Account.findOneAndDelete({ _id: id, user: userId });

            if (!account) {
                return res.status(404).json({ message: "Account not found" });
            }

            return res.json({ message: "Account deleted successfully" });
        }
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get account details with transaction history
export const getAccountDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const account = await Account.findOne({ _id: id, user: userId });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({
            user: userId,
            $or: [{ account: id }, { toAccount: id }]
        })
        .populate('category', 'name icon color')
        .populate('account', 'name type')
        .populate('toAccount', 'name type')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const totalTransactions = await Transaction.countDocuments({
            user: userId,
            $or: [{ account: id }, { toAccount: id }]
        });

        res.json({
            account,
            transactions,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(totalTransactions / limit),
                total: totalTransactions
            }
        });
    } catch (error) {
        console.error("Get account details error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
