# Debugging Guide - Categories and Accounts Not Loading

## Step 1: Check Console Logs

Open your browser console (F12) and look for these messages:

### For Categories:

```
Categories API response: {...}
Parsed categories array: [...]
```

### For Accounts:

```
Accounts API response: {...}
Parsed accounts array: [...]
```

## Step 2: Possible Issues

### Issue 1: No Accounts Created

**Symptom:** "Parsed accounts array: []" (empty array)

**Solution:**

1. Click the "Create Account" button on the Dashboard
2. Create your first account (e.g., "Cash Wallet" or "Bank Account")
3. Refresh the page
4. Try adding a transaction again

### Issue 2: No Categories Created

**Symptom:** "Parsed categories array: []" (empty array)

**Possible Causes:**

- Backend didn't auto-create default categories on signup
- Categories API endpoint is not working

**Solution:**
Check if your backend has a signup function that calls `createDefaultCategories(userId)`.

If not, you need to manually create categories through your backend or add a "Create Category" feature.

### Issue 3: Wrong API Response Format

**Symptom:** Console shows errors like "Cannot read property 'categories' of undefined"

**Check:**

1. Open Network tab in browser DevTools (F12)
2. Look for requests to `/categories` and `/accounts`
3. Check the response format

**Expected Response Formats:**

**Categories:**

```json
{
  "categories": {
    "income": [
      { "_id": "...", "name": "Salary", "type": "income", "icon": "💰", "color": "#10B981", "isActive": true },
      ...
    ],
    "expense": [
      { "_id": "...", "name": "Food", "type": "expense", "icon": "🍽️", "color": "#EF4444", "isActive": true },
      ...
    ]
  },
  "total": 19
}
```

**Accounts:**

```json
{
  "accounts": [
    { "_id": "...", "name": "Cash Wallet", "type": "cash", "balance": 100, "isActive": true },
    ...
  ]
}
```

### Issue 4: Authentication Problem

**Symptom:** 401 Unauthorized errors in console

**Solution:**

- Make sure you're logged in
- Check if the token is being sent with requests
- Try logging out and logging back in

## Step 3: Quick Test

Run this in your browser console to check the stores:

```javascript
// Check categories
const categoryStore = window.__ZUSTAND_STORES__?.categoryStore || {};
console.log("Categories in store:", categoryStore.categories);

// Check accounts
const accountStore = window.__ZUSTAND_STORES__?.accountStore || {};
console.log("Accounts in store:", accountStore.accounts);
```

## Step 4: Create Your First Account

1. Click "Create Account" button on Dashboard
2. Fill in:
   - **Name**: "Cash Wallet" or "Bank Account"
   - **Type**: Select appropriate type
   - **Initial Balance**: Enter your current balance (e.g., 100)
3. Click "Create Account"
4. Refresh the page
5. Try "Add Transaction" again - accounts should now appear!

## Step 5: Check Backend

If categories are still not loading, check your backend:

1. Make sure the `/auth/signup` endpoint calls `createDefaultCategories(userId)`
2. Or manually call the category creation endpoint
3. Verify the database has categories for your user

## Common Solutions

### Solution A: Create Account First

Most likely issue - you need at least one account to make transactions!

### Solution B: Check Backend Logs

Look at your backend console for any errors when fetching categories/accounts

### Solution C: Verify API Endpoints

Make sure these endpoints work:

- `GET /categories` - Returns user's categories
- `GET /accounts` - Returns user's accounts

### Solution D: Database Check

Check if your database has:

- Categories collection with your userId
- Accounts collection with your userId
