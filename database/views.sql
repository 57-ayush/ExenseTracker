-- ============================================================================
-- Expense Tracker and Budget Management System
-- Database Views Definition (MySQL 8.0+)
-- Academic DBMS Mini-Project: B.Tech Computer Science & Engineering
-- ============================================================================

USE expense_tracker;

-- ============================================================================
-- VIEW 1: v_expense_transactions
-- Purpose:
--   A simple, single-table view projecting only EXPENSE records.
--   Created WITH CHECK OPTION to guarantee that:
--     1. Any row inserted through this view MUST satisfy transaction_type = 'EXPENSE'.
--     2. Any row updated through this view CANNOT change transaction_type to 'INCOME'.
-- Updatability:
--   GENUINELY UPDATABLE: Supports SELECT, INSERT, UPDATE, DELETE directly!
-- ============================================================================
CREATE OR REPLACE VIEW v_expense_transactions AS
SELECT 
    transaction_id,
    user_id,
    category_id,
    transaction_type,
    amount,
    transaction_date,
    payment_method,
    description,
    created_at
FROM transactions
WHERE transaction_type = 'EXPENSE'
WITH CHECK OPTION;

-- ============================================================================
-- VIEW 2: v_transaction_details
-- Purpose:
--   A multi-table joined view denormalizing transactions with user and category names.
-- Updatability:
--   READ-ONLY (Contains multiple base table joins).
-- ============================================================================
CREATE OR REPLACE VIEW v_transaction_details AS
SELECT 
    t.transaction_id,
    t.user_id,
    u.full_name AS user_name,
    u.email AS user_email,
    t.category_id,
    c.category_name,
    c.category_type,
    t.transaction_type,
    t.amount,
    t.transaction_date,
    t.payment_method,
    t.description,
    t.created_at
FROM transactions t
INNER JOIN users u ON t.user_id = u.user_id
INNER JOIN categories c ON t.category_id = c.category_id;

-- ============================================================================
-- VIEW 3: v_monthly_expense_summary
-- Purpose:
--   An aggregate summary view computing monthly total income, expenses,
--   net savings, and transaction counts per user using GROUP BY and CASE aggregates.
-- Updatability:
--   READ-ONLY (Contains GROUP BY and aggregate functions SUM, COUNT).
-- ============================================================================
CREATE OR REPLACE VIEW v_monthly_expense_summary AS
SELECT 
    t.user_id,
    DATE_FORMAT(t.transaction_date, '%Y-%m-01') AS month_date,
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS formatted_month,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE -t.amount END), 0) AS net_savings,
    COUNT(t.transaction_id) AS total_transactions
FROM transactions t
GROUP BY t.user_id, DATE_FORMAT(t.transaction_date, '%Y-%m-01'), DATE_FORMAT(t.transaction_date, '%Y-%m');

-- ============================================================================
-- VIEW 4: v_budget_utilization
-- Purpose:
--   An advanced analytical view comparing budgeted amounts against real actual
--   expense transactions for each category and month.
--   Computes remaining budget, percentage utilized, and real-time status.
-- Updatability:
--   READ-ONLY (Contains JOINs, LEFT JOINs, and GROUP BY aggregations).
-- ============================================================================
CREATE OR REPLACE VIEW v_budget_utilization AS
SELECT 
    b.budget_id,
    b.user_id,
    b.category_id,
    c.category_name,
    b.budget_month,
    DATE_FORMAT(b.budget_month, '%Y-%m') AS formatted_month,
    b.budget_amount,
    COALESCE(SUM(t.amount), 0) AS amount_spent,
    (b.budget_amount - COALESCE(SUM(t.amount), 0)) AS remaining_budget,
    ROUND(
        CASE 
            WHEN b.budget_amount > 0 THEN (COALESCE(SUM(t.amount), 0) / b.budget_amount) * 100
            ELSE 0 
        END, 
        2
    ) AS percentage_used,
    CASE 
        WHEN COALESCE(SUM(t.amount), 0) > b.budget_amount THEN 'Exceeded'
        WHEN COALESCE(SUM(t.amount), 0) >= (b.budget_amount * 0.85) THEN 'Near Limit'
        ELSE 'On Track'
    END AS budget_status
FROM budgets b
INNER JOIN categories c ON b.category_id = c.category_id
LEFT JOIN transactions t ON t.user_id = b.user_id 
    AND t.category_id = b.category_id 
    AND t.transaction_type = 'EXPENSE'
    AND DATE_FORMAT(t.transaction_date, '%Y-%m') = DATE_FORMAT(b.budget_month, '%Y-%m')
GROUP BY 
    b.budget_id, 
    b.user_id, 
    b.category_id, 
    c.category_name, 
    b.budget_month, 
    b.budget_amount;
