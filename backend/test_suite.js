const http = require('http');

function apiCall(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING FULL-STACK DBMS PROJECT VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  console.log('[Test 1] Backend Health Check');
  const health = await apiCall('GET', '/api/health');
  assert(health.status === 200 && health.data.status === 'healthy', 'Health check returns 200 healthy');

  // 2. Authentication: Login
  console.log('\n[Test 2] Authentication with Pre-seeded Demo Credentials');
  const login = await apiCall('POST', '/api/auth/login', {
    email: 'rahul.sharma@example.com',
    password: 'Password123!'
  });
  assert(login.status === 200 && login.data.success, 'Login successful for Rahul Sharma');
  const token = login.data.data.token;
  assert(token && token.length > 50, 'JWT session token issued');

  // 3. User Profile
  console.log('\n[Test 3] User Profile and Account Stats');
  const me = await apiCall('GET', '/api/auth/me', null, token);
  assert(me.status === 200 && me.data.data.user.email === 'rahul.sharma@example.com', 'Current user retrieved');
  assert(me.data.data.user.stats.totalTransactions >= 20, `Transactions count: ${me.data.data.user.stats.totalTransactions}`);

  // 4. Dashboard Summary Metrics
  console.log('\n[Test 4] Dashboard Calculations (Real MySQL Queries)');
  const dash = await apiCall('GET', '/api/dashboard/summary', null, token);
  assert(dash.status === 200, 'Dashboard summary endpoint returns 200');
  assert(dash.data.data.totalIncome > 0, `Total Income calculated: ₹${dash.data.data.totalIncome}`);
  assert(dash.data.data.totalExpenses > 0, `Total Expenses calculated: ₹${dash.data.data.totalExpenses}`);
  assert(dash.data.data.netSavings !== undefined, `Net Savings: ₹${dash.data.data.netSavings}`);

  // 5. Monthly Trends & Category Breakdown
  console.log('\n[Test 5] Dashboard Charts Data Sources');
  const trends = await apiCall('GET', '/api/dashboard/monthly-trends', null, token);
  assert(trends.status === 200 && Array.isArray(trends.data.data), 'Monthly trends aggregate returned');
  const catBreakdown = await apiCall('GET', '/api/dashboard/category-breakdown', null, token);
  assert(catBreakdown.status === 200 && catBreakdown.data.data.categories.length > 0, 'Category breakdown distribution returned');

  // 6. Transactions CRUD & Pagination
  console.log('\n[Test 6] Transactions Module CRUD');
  // Create
  const newTx = await apiCall('POST', '/api/transactions', {
    categoryId: 6, // Food
    transactionType: 'EXPENSE',
    amount: 420.50,
    transactionDate: '2026-11-19',
    paymentMethod: 'UPI',
    description: 'Unit Test Expense Entry'
  }, token);
  assert(newTx.status === 201 && newTx.data.success, 'Transaction created successfully');
  const createdTxId = newTx.data.data.transaction_id;

  // Update
  const updateTx = await apiCall('PUT', `/api/transactions/${createdTxId}`, {
    categoryId: 6,
    transactionType: 'EXPENSE',
    amount: 500.00,
    transactionDate: '2026-11-19',
    paymentMethod: 'CARD',
    description: 'Updated Unit Test Expense Entry'
  }, token);
  assert(updateTx.status === 200 && updateTx.data.data.amount === 500, 'Transaction updated');

  // Delete
  const delTx = await apiCall('DELETE', `/api/transactions/${createdTxId}`, null, token);
  assert(delTx.status === 200, 'Transaction deleted successfully');

  // 7. Categories & Referential Integrity
  console.log('\n[Test 7] Category Management & Foreign Key Protection');
  const cats = await apiCall('GET', '/api/categories', null, token);
  assert(cats.status === 200 && cats.data.data.all.length >= 14, `Categories count: ${cats.data.data.all.length}`);

  // Attempt to delete category 6 (Food) which has existing transactions
  const delBlockedCat = await apiCall('DELETE', '/api/categories/6', null, token);
  assert(delBlockedCat.status === 400 && delBlockedCat.data.message.includes('referenced by'), 'Referential integrity correctly blocked category deletion');

  // 8. Budgets & Live Utilization
  console.log('\n[Test 8] Monthly Budget Utilization Evaluation');
  const budgets = await apiCall('GET', '/api/budgets?month=2026-11', null, token);
  assert(budgets.status === 200 && budgets.data.data.length > 0, `Budgets count for Nov 2026: ${budgets.data.data.length}`);
  const firstBudget = budgets.data.data[0];
  assert(firstBudget.amount_spent !== undefined, `Budget utilization calculated for '${firstBudget.category_name}': Spent ₹${firstBudget.amount_spent} of ₹${firstBudget.budget_amount} (${firstBudget.percentage_used}%)`);

  // 9. Database Views: Inspection of 4 Views
  console.log('\n[Test 9] Database Views - Metadata and Queries');
  const viewList = await apiCall('GET', '/api/views', null, token);
  assert(viewList.status === 200 && viewList.data.data.length === 4, 'All 4 required views listed with metadata');

  // SELECT from v_expense_transactions
  const v1 = await apiCall('GET', '/api/views/v_expense_transactions/data', null, token);
  assert(v1.status === 200 && v1.data.data.rows.length > 0, `View 1 (v_expense_transactions) rows fetched: ${v1.data.data.rowCount}`);

  // SELECT from v_transaction_details
  const v2 = await apiCall('GET', '/api/views/v_transaction_details/data', null, token);
  assert(v2.status === 200 && v2.data.data.rows.length > 0, `View 2 (v_transaction_details) joined rows: ${v2.data.data.rowCount}`);

  // SELECT from v_monthly_expense_summary
  const v3 = await apiCall('GET', '/api/views/v_monthly_expense_summary/data', null, token);
  assert(v3.status === 200 && v3.data.data.rows.length > 0, `View 3 (v_monthly_expense_summary) aggregate rows: ${v3.data.data.rowCount}`);

  // SELECT from v_budget_utilization
  const v4 = await apiCall('GET', '/api/views/v_budget_utilization/data', null, token);
  assert(v4.status === 200 && v4.data.data.rows.length > 0, `View 4 (v_budget_utilization) analytical rows: ${v4.data.data.rowCount}`);

  // 10. Updatable View DML Operations (INSERT, UPDATE, DELETE on v_expense_transactions)
  console.log('\n[Test 10] Direct DML Operations through Updatable View');
  // INSERT through view
  const vInsert = await apiCall('POST', '/api/views/expense-transactions', {
    categoryId: 6,
    amount: 199.99,
    transactionDate: '2026-11-19',
    paymentMethod: 'UPI',
    description: 'Direct View DML Test'
  }, token);
  assert(vInsert.status === 201 && vInsert.data.success, 'Direct INSERT through v_expense_transactions succeeded');
  const viewTxId = vInsert.data.data.mysqlResult.insertId;

  // UPDATE through view
  const vUpdate = await apiCall('PUT', `/api/views/expense-transactions/${viewTxId}`, {
    amount: 250.00,
    paymentMethod: 'CARD',
    description: 'Updated through v_expense_transactions'
  }, token);
  assert(vUpdate.status === 200 && vUpdate.data.data.mysqlResult.affectedRows === 1, 'Direct UPDATE through v_expense_transactions succeeded');

  // DELETE through view
  const vDelete = await apiCall('DELETE', `/api/views/expense-transactions/${viewTxId}`, null, token);
  assert(vDelete.status === 200 && vDelete.data.data.mysqlResult.affectedRows === 1, 'Direct DELETE through v_expense_transactions succeeded');

  // 11. WITH CHECK OPTION Enforcement Demonstration
  console.log('\n[Test 11] WITH CHECK OPTION Constraint Enforcement (MySQL Error 1369)');
  const checkOptUpdate = await apiCall('POST', '/api/views/demonstrate-check-option', { action: 'UPDATE' }, token);
  assert(checkOptUpdate.status === 200 && checkOptUpdate.data.data.demonstrationSuccess, 'CHECK OPTION intercepted illegal UPDATE');
  assert(checkOptUpdate.data.data.mysqlError.errno === 1369, 'MySQL raised Error 1369 (CHECK OPTION failed)');

  const checkOptInsert = await apiCall('POST', '/api/views/demonstrate-check-option', { action: 'INSERT' }, token);
  assert(checkOptInsert.status === 200 && checkOptInsert.data.data.demonstrationSuccess, 'CHECK OPTION intercepted illegal INSERT');
  assert(checkOptInsert.data.data.mysqlError.errno === 1369, 'MySQL raised Error 1369 on attempted illegal INSERT');

  // 12. Safe DROP VIEW Demonstration
  console.log('\n[Test 12] DROP VIEW Demonstration with Auto Re-creation');
  const dropBlocked = await apiCall('POST', '/api/views/demonstrate-drop-view', { enableAdminMode: false }, token);
  assert(dropBlocked.status === 403, 'DROP VIEW without admin mode is safely blocked');

  const dropAllowed = await apiCall('POST', '/api/views/demonstrate-drop-view', { enableAdminMode: true, viewName: 'v_expense_transactions' }, token);
  assert(dropAllowed.status === 200 && dropAllowed.data.success, 'DROP VIEW executed and safely auto-recreated');

  // Summary
  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
  if (failed === 0) {
    console.log('🎉 ALL PROJECT SPECIFICATIONS AND DATABASE FEATURES FULLY VERIFIED!\n');
  }
}

runComprehensiveTests();
