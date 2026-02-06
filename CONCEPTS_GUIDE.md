# Money Manager - Key Concepts Guide

## 1. Account 💳

**What it is:** A place where your money is stored.

**Examples:**

- Bank Account (Chase Checking, Wells Fargo Savings)
- Cash (Wallet, Home Safe)
- Credit Card (Visa, Mastercard)
- Digital Wallet (PayPal, Venmo, Cash App)

**Properties:**

- `name`: "Chase Checking"
- `type`: "bank", "cash", "credit_card", "digital_wallet"
- `balance`: Current amount ($1,500.00)
- `currency`: "USD"

**When to use:**

- Every transaction MUST be linked to an account
- When you spend money, select which account it comes from
- When you receive money, select which account it goes to
- For transfers, select both "from" and "to" accounts

**Example:**

```
Transaction: Buy groceries for $50
- Type: Expense
- Account: "Cash Wallet" (money comes from here)
- Category: "Food"
- Result: Cash Wallet balance decreases by $50
```

---

## 2. Division 🏢

**What it is:** A way to separate transactions by purpose or context.

**Options:**

- **Personal**: Your personal expenses and income
- **Office**: Business/work-related transactions

**When to use:**

- If you're a freelancer or business owner, use "office" for business expenses
- Use "personal" for your day-to-day personal spending
- Helps with tax filing and expense reports
- Allows you to see separate reports for personal vs business finances

**Example:**

```
Transaction 1: Buy lunch - $15
- Division: Personal
- Category: Food

Transaction 2: Buy office supplies - $50
- Division: Office
- Category: Office Supplies
```

---

## 3. Category 📊

**What it is:** Classifies WHAT the transaction is for.

**Types:**

- **Income Categories**: Salary, Freelance, Investment, Business
- **Expense Categories**: Food, Fuel, Medical, Shopping, Rent, etc.

**Default Categories (created automatically):**

### Income:

- 💰 Salary
- 💻 Freelance
- 📈 Investment
- 🏢 Business
- 💵 Other Income

### Expense:

- 🍽️ Food
- ⛽ Fuel
- 🎬 Movie
- 🏥 Medical
- 🏦 Loan
- 🛍️ Shopping
- 🚗 Transport
- 💡 Utilities
- 🏠 Rent
- 📚 Education
- 🎮 Entertainment
- ✈️ Travel
- 🛡️ Insurance
- 💸 Other Expense

**When to use:**

- Every income/expense transaction needs a category
- Transfers don't need a category (they're just moving money between accounts)
- Categories help you analyze spending patterns

---

## 4. Transaction Types 💸

### Expense (Money Out)

- Money leaving your account
- Decreases account balance
- Requires: Account, Category, Division

**Example:**

```
Buy coffee for $5
- Type: Expense
- Account: Cash Wallet
- Category: Food
- Division: Personal
- Result: Cash Wallet: $100 → $95
```

### Income (Money In)

- Money coming into your account
- Increases account balance
- Requires: Account, Category, Division

**Example:**

```
Receive salary $3,000
- Type: Income
- Account: Bank Account
- Category: Salary
- Division: Personal
- Result: Bank Account: $500 → $3,500
```

### Transfer (Move Money)

- Moving money between your own accounts
- No category needed
- Requires: From Account, To Account, Division

**Example:**

```
Transfer $200 from Bank to Cash
- Type: Transfer
- From Account: Bank Account
- To Account: Cash Wallet
- Division: Personal
- Result:
  - Bank Account: $3,500 → $3,300
  - Cash Wallet: $95 → $295
```

---

## How They Work Together

**Complete Transaction Example:**

```
Scenario: You buy groceries with your credit card

Transaction Details:
- Type: Expense
- Title: "Grocery shopping at Walmart"
- Amount: $75.50
- Category: 🍽️ Food
- Account: Visa Credit Card
- Division: Personal
- Date: 2026-02-06
- Tags: groceries, weekly-shopping

Result:
- Visa Credit Card balance: $200 → $275.50 (debt increased)
- You can now see this in your "Food" category spending
- It's counted in your "Personal" division
```

---

## Quick Reference

| Field          | Required For     | Purpose              |
| -------------- | ---------------- | -------------------- |
| **Account**    | All transactions | Where the money is   |
| **Category**   | Income & Expense | What it's for        |
| **Division**   | All transactions | Personal vs Business |
| **To Account** | Transfers only   | Destination account  |

---

## Tips

1. **Create accounts first** before adding transactions
2. **Use divisions** if you mix personal and business finances
3. **Categories are auto-created** when you sign up
4. **Transfers** don't need categories - they're just moving money
5. **Check your account balances** to ensure transactions are correct
