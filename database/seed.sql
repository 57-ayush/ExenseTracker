-- ============================================================================
-- Expense Tracker and Budget Management System
-- Seed Data Script (Repeatable)
-- Academic DBMS Mini-Project: B.Tech Computer Science & Engineering
-- ============================================================================

USE expense_tracker;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS (Password for both demo users is: Password123!)
-- Hash: $2a$10$BLldM0uU76rHV2gPz3rJCOxx6Zd2ar2RdFkZO/i5C8ByA6NFpikDK
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, full_name, email, password_hash, created_at)
VALUES 
(1, 'Rahul Sharma', 'rahul.sharma@example.com', '$2a$10$BLldM0uU76rHV2gPz3rJCOxx6Zd2ar2RdFkZO/i5C8ByA6NFpikDK', '2026-08-01 10:00:00'),
(2, 'Priya Patel', 'priya.patel@example.com', '$2a$10$BLldM0uU76rHV2gPz3rJCOxx6Zd2ar2RdFkZO/i5C8ByA6NFpikDK', '2026-08-15 11:30:00')
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    password_hash = VALUES(password_hash);

-- ----------------------------------------------------------------------------
-- 2. SEED DEFAULT CATEGORIES
-- Income & Expense categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (category_id, category_name, category_type)
VALUES
-- Income Categories
(1, 'Salary', 'INCOME'),
(2, 'Freelance', 'INCOME'),
(3, 'Business', 'INCOME'),
(4, 'Investments', 'INCOME'),
(5, 'Other Income', 'INCOME'),
-- Expense Categories
(6, 'Food', 'EXPENSE'),
(7, 'Transport', 'EXPENSE'),
(8, 'Education', 'EXPENSE'),
(9, 'Entertainment', 'EXPENSE'),
(10, 'Rent', 'EXPENSE'),
(11, 'Shopping', 'EXPENSE'),
(12, 'Healthcare', 'EXPENSE'),
(13, 'Utilities', 'EXPENSE'),
(14, 'Other Expenses', 'EXPENSE')
ON DUPLICATE KEY UPDATE 
    category_name = VALUES(category_name),
    category_type = VALUES(category_type);

-- ----------------------------------------------------------------------------
-- 3. SEED MONTHLY BUDGETS
-- Configured for Rahul Sharma (user_id = 1) and Priya Patel (user_id = 2)
-- Months: 2026-10-01 and 2026-11-01
-- ----------------------------------------------------------------------------
INSERT INTO budgets (budget_id, user_id, category_id, budget_month, budget_amount)
VALUES
-- Rahul's budgets for November 2026
(1, 1, 6, '2026-11-01', 12000.00),  -- Food
(2, 1, 7, '2026-11-01', 5000.00),   -- Transport
(3, 1, 10, '2026-11-01', 25000.00), -- Rent
(4, 1, 11, '2026-11-01', 8000.00),  -- Shopping
(5, 1, 13, '2026-11-01', 4500.00),  -- Utilities
(6, 1, 9, '2026-11-01', 4000.00),   -- Entertainment

-- Rahul's budgets for October 2026
(7, 1, 6, '2026-10-01', 11000.00),  -- Food
(8, 1, 7, '2026-10-01', 4500.00),   -- Transport
(9, 1, 10, '2026-10-01', 25000.00), -- Rent

-- Priya's budgets for November 2026
(10, 2, 6, '2026-11-01', 10000.00), -- Food
(11, 2, 7, '2026-11-01', 6000.00),  -- Transport
(12, 2, 10, '2026-11-01', 22000.00) -- Rent
ON DUPLICATE KEY UPDATE 
    budget_amount = VALUES(budget_amount);

-- ----------------------------------------------------------------------------
-- 4. SEED TRANSACTIONS
-- Comprehensive dataset with various payment methods, categories, and dates.
-- ----------------------------------------------------------------------------
INSERT INTO transactions (transaction_id, user_id, category_id, transaction_type, amount, transaction_date, payment_method, description)
VALUES
-- User 1 (Rahul) - November 2026 Transactions
(1, 1, 1, 'INCOME', 85000.00, '2026-11-01', 'BANK_TRANSFER', 'Monthly Software Engineer Salary'),
(2, 1, 2, 'INCOME', 18500.00, '2026-11-10', 'UPI', 'Web Development Consulting Milestone 1'),
(3, 1, 10, 'EXPENSE', 25000.00, '2026-11-02', 'BANK_TRANSFER', 'Apartment Rent for November'),
(4, 1, 6, 'EXPENSE', 3250.00, '2026-11-03', 'UPI', 'Monthly Grocery shopping at Nature Basket'),
(5, 1, 7, 'EXPENSE', 1200.00, '2026-11-04', 'CARD', 'Metro Card Recharge & Fuel'),
(6, 1, 13, 'EXPENSE', 2450.00, '2026-11-06', 'UPI', 'Electricity & Broadband Bill'),
(7, 1, 6, 'EXPENSE', 1850.00, '2026-11-08', 'CASH', 'Weekend Dining with Family'),
(8, 1, 9, 'EXPENSE', 1500.00, '2026-11-11', 'UPI', 'Cinema tickets and streaming subscription'),
(9, 1, 11, 'EXPENSE', 6200.00, '2026-11-14', 'CARD', 'Winter jacket & office footwear'),
(10, 1, 6, 'EXPENSE', 2100.00, '2026-11-16', 'UPI', 'Mid-month pantry restocking'),
(11, 1, 12, 'EXPENSE', 1400.00, '2026-11-18', 'CARD', 'Routine Health checkup & vitamins'),
(12, 1, 7, 'EXPENSE', 950.00, '2026-11-19', 'UPI', 'Uber ride for client meeting'),

-- User 1 (Rahul) - October 2026 Transactions
(13, 1, 1, 'INCOME', 85000.00, '2026-10-01', 'BANK_TRANSFER', 'Monthly Salary for October'),
(14, 1, 4, 'INCOME', 6200.00, '2026-10-15', 'BANK_TRANSFER', 'Stock Dividend Payout'),
(15, 1, 10, 'EXPENSE', 25000.00, '2026-10-02', 'BANK_TRANSFER', 'Apartment Rent October'),
(16, 1, 6, 'EXPENSE', 9800.00, '2026-10-12', 'UPI', 'Monthly Dining and Grocery expenses'),
(17, 1, 7, 'EXPENSE', 4200.00, '2026-10-20', 'CARD', 'Fuel & Highway Tolls'),
(18, 1, 11, 'EXPENSE', 9500.00, '2026-10-24', 'CARD', 'Diwali Festive shopping'),

-- User 1 (Rahul) - September 2026 Transactions
(19, 1, 1, 'INCOME', 82000.00, '2026-09-01', 'BANK_TRANSFER', 'Monthly Salary for September'),
(20, 1, 10, 'EXPENSE', 25000.00, '2026-09-02', 'BANK_TRANSFER', 'Apartment Rent September'),
(21, 1, 6, 'EXPENSE', 8400.00, '2026-09-15', 'UPI', 'Food & Provisions'),
(22, 1, 8, 'EXPENSE', 12000.00, '2026-09-22', 'CARD', 'Cloud Architecture Certification Exam'),

-- User 2 (Priya) - November 2026 Transactions
(23, 2, 1, 'INCOME', 72000.00, '2026-11-01', 'BANK_TRANSFER', 'Monthly Product Designer Salary'),
(24, 2, 10, 'EXPENSE', 22000.00, '2026-11-02', 'BANK_TRANSFER', 'Studio Apartment Rent'),
(25, 2, 6, 'EXPENSE', 5400.00, '2026-11-09', 'UPI', 'Weekly Groceries and organic produce'),
(26, 2, 7, 'EXPENSE', 3100.00, '2026-11-15', 'UPI', 'Cab rides to design studio')
ON DUPLICATE KEY UPDATE 
    amount = VALUES(amount),
    description = VALUES(description);
