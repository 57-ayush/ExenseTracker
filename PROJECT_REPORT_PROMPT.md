# MASTER PROMPT: ACADEMIC DBMS MINI-PROJECT REPORT GENERATOR

Copy and paste the entire block below into ChatGPT, Claude, Gemini, or any AI model to generate a comprehensive, publication-grade academic project report for the **Expense Tracker and Budget Management System**.

---

```markdown
# ROLE AND TASK
Act as a Senior Professor of Computer Science & Engineering, expert DBMS Researcher, and Technical Documentation Specialist. 

Generate a comprehensive, formal, university-standard **B.Tech Computer Science and Engineering DBMS Mini-Project Report** for the project titled:
**"EXPENSE TRACKER AND BUDGET MANAGEMENT SYSTEM"**

The generated report must be complete, technically rigorous, highly structured, and written in formal academic style. Do not use placeholders or summaries where technical detail is required; provide exhaustive SQL definitions, relational calculus/algebra notations, architectural explanations, database normal forms, and test cases.

---

## PROJECT METADATA & CONTEXT

- **Project Title:** Expense Tracker and Budget Management System
- **Degree / Branch:** Bachelor of Technology (B.Tech) in Computer Science and Engineering
- **Course / Subject:** Database Management Systems (DBMS) Mini-Project & Laboratory
- **Candidate / Author:** [Student Name: e.g., Rahul Sharma]
- **Roll Number / Enrollment No:** [Roll No: e.g., 22BCSE101]
- **Supervisor / Project Guide:** [Guide Name: e.g., Dr. A. K. Verma, Associate Professor]
- **Department / University:** Department of Computer Science & Engineering, [College / University Name]
- **Academic Year:** 2026-2027

### Technical Stack Used:
- **Database Engine:** MySQL Server 8.0+ (InnoDB Storage Engine with ACID Compliance)
- **Backend Architecture:** Node.js, Express.js (RESTful API Architecture), mysql2 connection pooling
- **Authentication & Security:** JSON Web Tokens (JWT), Salted Bcrypt Password Hashing, Input Sanitization (express-validator), Helmet, CORS
- **Frontend Architecture:** React.js 18 (Vite Bundler), Tailwind CSS (SaaS Fintech Theme: Slate/Navy/Indigo), React Router DOM v6, Axios, Recharts (Area, Bar, Line, Pie/Donut charts), Lucide React, React Hook Form
- **Default Currency:** Indian Rupee (₹ INR)

### Exact Database Relational Schema Implemented:
1. **users**: `(user_id INT PK AUTO_INCREMENT, full_name VARCHAR(100), email VARCHAR(150) UNIQUE, password_hash VARCHAR(255), created_at TIMESTAMP)`
2. **categories**: `(category_id INT PK AUTO_INCREMENT, category_name VARCHAR(60), category_type ENUM('INCOME','EXPENSE'), UNIQUE(category_name, category_type))`
3. **transactions**: `(transaction_id INT PK AUTO_INCREMENT, user_id INT FK -> users(user_id) ON DELETE CASCADE, category_id INT FK -> categories(category_id) ON DELETE RESTRICT, transaction_type ENUM('INCOME','EXPENSE'), amount DECIMAL(10,2) CHECK > 0, transaction_date DATE, payment_method ENUM('CASH','UPI','CARD','BANK_TRANSFER','OTHER'), description VARCHAR(255), created_at TIMESTAMP)`
4. **budgets**: `(budget_id INT PK AUTO_INCREMENT, user_id INT FK -> users(user_id) ON DELETE CASCADE, category_id INT FK -> categories(category_id) ON DELETE RESTRICT, budget_month DATE, budget_amount DECIMAL(10,2) CHECK > 0, UNIQUE(user_id, category_id, budget_month))`

### Database Indexes:
- `idx_transactions_user_id (user_id)`
- `idx_transactions_category_id (category_id)`
- `idx_transactions_date (transaction_date)`
- `idx_transactions_user_date (user_id, transaction_date)`
- `idx_budgets_user_month (user_id, budget_month)`

### Four Exact Database Views Implemented (Core DBMS Focus):
1. **`v_expense_transactions`** (Updatable with `WITH CHECK OPTION`):
   - Single-table horizontal slice projecting only `EXPENSE` records.
   - Genuinely updatable in MySQL: Supports SELECT, INSERT, UPDATE, DELETE directly.
   - Created with `WITH CHECK OPTION`: Intercepts and rejects any attempt to insert or mutate records to `transaction_type = 'INCOME'` with native MySQL Error 1369 (`CHECK OPTION failed`).
2. **`v_transaction_details`** (Multi-Table Joined View):
   - Relational `INNER JOIN` of `transactions`, `users`, and `categories`. Read-only.
3. **`v_monthly_expense_summary`** (Aggregated Summary View):
   - Aggregates income, expenses, net savings, and counts using `SUM()`, `COUNT()`, conditional `CASE`, and `GROUP BY user_id, month`. Read-only.
4. **`v_budget_utilization`** (Complex Analytical View):
   - Joins `budgets` with `categories` and `LEFT JOIN` on `transactions` to compute live monthly expenditure, remaining budget, percentage utilization, and categorical status (`On Track`, `Near Limit`, `Exceeded`). Read-only.

---

## REQUIRED REPORT STRUCTURE AND CHAPTER SPECIFICATIONS

Format the output using standard GitHub Flavored Markdown with clean typography, mathematical notations (LaTeX for normalization and relational algebra), ASCII/Mermaid diagrams, and tabular data dictionaries.

The generated report must strictly contain the following sections:

### 1. FRONT MATTER
- **Title Page:** Project title, academic submission statement, candidate details, guide details, institution name, and date.
- **Certificate of Authenticity:** Standard university-format guide certificate with signature placeholders.
- **Candidate Declaration:** Statement of original student work.
- **Acknowledgements:** Acknowledgements to guide, HOD, faculty, and university laboratory infrastructure.
- **Abstract:** Concise summary (250-300 words) encompassing background, problem statement, database architecture, key DBMS innovations (updatable views, WITH CHECK OPTION), and results.
- **Keywords:** (e.g., Relational Database, MySQL 8.0, Updatable Views, WITH CHECK OPTION, Financial Management, Normalization, React).

### 2. CHAPTER 1: INTRODUCTION
- **1.1 Background & Motivation:** The growing need for digital personal financial discipline and real-time budget tracking in the modern fintech landscape.
- **1.2 Problem Statement:** Shortcomings of spreadsheet tracking and static applications lacking database-level integrity, atomic multi-user isolation, and automated budget utilization calculations.
- **1.3 Project Objectives:** Academic and functional objectives (relational modeling, referential integrity, view operations, live charts).
- **1.4 Scope of the Project:** Boundaries of the system, target user personas, and technological limitations.

### 3. CHAPTER 2: LITERATURE REVIEW & SYSTEM STUDY
- **2.1 Review of Existing Systems:** Analysis of existing expense management systems (Excel, mobile-only apps, closed-source banking portals).
- **2.2 Comparative Analysis Table:** Feature matrix comparing Existing Systems vs. Proposed Expense Tracker (Data Isolation, Relational Integrity, View Support, Budget Alerts, Open APIs).
- **2.3 Feasibility Analysis:**
  - Technical Feasibility (MySQL 8.0, Node.js, React).
  - Economic Feasibility (Zero-licensing open-source stack).
  - Operational Feasibility (User-friendly SaaS dashboard, responsive web accessibility).

### 4. CHAPTER 3: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
- **3.1 Functional Requirements:** Module-by-module breakdown (Authentication, Transactions, Categories, Budgets, Reports, Views Lab).
- **3.2 Non-Functional Requirements:** Security (Bcrypt, JWT, SQL injection prevention), Performance (indexing, query execution < 50ms), Reliability, ACID compliance, Usability.
- **3.3 Hardware & Software Specifications:** Minimum and recommended development and runtime environments.

### 5. CHAPTER 4: SYSTEM ARCHITECTURE & RELATIONAL DATABASE DESIGN
- **4.1 High-Level System Architecture:** 3-Tier architecture diagram and explanation (Presentation Tier, Application Tier, Database Tier).
- **4.2 Entity-Relationship (ER) Modeling:**
  - Comprehensive Mermaid ER diagram (`erDiagram`) showing cardinalities, PKs, and FKs.
  - Detailed explanation of entities, attributes, and relationships (1:N from Users to Transactions, 1:N from Categories to Transactions, 1:N from Categories to Budgets).
- **4.3 Relational Schema & Data Dictionary:**
  - Complete tables defining Column Name, Data Type, Constraints, Nullability, Key Type, and Default Values for `users`, `categories`, `transactions`, and `budgets`.
- **4.4 Database Normalization Analysis:**
  - Step-by-step walkthrough of normalization from Unnormalized Form (UNF) $\rightarrow$ 1NF $\rightarrow$ 2NF $\rightarrow$ 3NF / Boyce-Codd Normal Form (BCNF).
  - Identification of Functional Dependencies (FDs) proving absence of insertion, update, and deletion anomalies.
- **4.5 Relational Algebra Formulations:**
  - Relational algebra expressions for:
    - User expense query: $\sigma_{user\_id=u \land transaction\_type='EXPENSE'}(transactions)$
    - Joined transaction details: $\pi_{...}(transactions \bowtie users \bowtie categories)$
    - Monthly budget variance projection.

### 6. CHAPTER 5: DATABASE VIEWS & ADVANCED DBMS CONCEPTS (CORE HIGHLIGHT)
- **5.1 Database Views Theory:** Definition of a view as a stored query, logical data independence, security encapsulation, and performance characteristics.
- **5.2 Detailed Breakdown of the 4 Views:**
  - Exhaustive SQL code for `v_expense_transactions`, `v_transaction_details`, `v_monthly_expense_summary`, `v_budget_utilization`.
  - Analytical breakdown of why `v_expense_transactions` is updatable under ISO/ANSI SQL:1999 and MySQL 8.0 standards (1:1 row correspondence to base table).
- **5.3 The `WITH CHECK OPTION` Mechanism:**
  - Detailed mathematical and relational explanation of the Check Option.
  - Difference between `LOCAL` and `CASCADED` check options.
  - **Empirical Demonstration:** The exact SQL UPDATE/INSERT attempting to write `transaction_type = 'INCOME'` and the resulting MySQL Engine Error: `ERROR 1369 (HY000): CHECK OPTION failed 'expense_tracker.v_expense_transactions'`.
- **5.4 Referential Integrity Actions:**
  - Comparative analysis of `CASCADE` vs. `RESTRICT` in production schemas.
  - Proof of category deletion rejection when child transactions exist.
- **5.5 Indexing Strategy & Execution Plans:**
  - Role of composite B-Tree indexes in speeding up range scans on `(user_id, transaction_date)`.

### 7. CHAPTER 6: IMPLEMENTATION DETAILS
- **6.1 Backend API Implementation:**
  - Directory structure (`controllers/`, `routes/`, `middleware/`, `config/`).
  - Parameterized query implementation protecting against SQL injection attacks.
  - Error handler mapping MySQL error codes (1369, 1062, 1451, 3819) to meaningful client responses.
- **6.2 Frontend Architecture:**
  - Component hierarchy (`DashboardLayout`, `StatCard`, `TransactionModal`, `ViewMutationConsole`, `CheckOptionDemo`).
  - State management, Axios request/response interceptors, and JWT persistence.
  - Recharts visualization implementation (Area, Bar, Pie).

### 8. CHAPTER 7: TESTING, VERIFICATION & VALIDATION
- **7.1 Testing Methodology:** Unit testing, integration testing, database stress testing, and boundary constraint verification.
- **7.2 Test Case Matrix Table:** At least 10 formal test cases with:
  - Test ID, Test Description, Inputs, Expected Output, Actual MySQL Output, and Status (Pass/Fail).
  - Include tests for: Login, Amount > 0 check constraint, Duplicate category, Category delete restrict, View SELECT, View INSERT, View UPDATE, View DELETE, WITH CHECK OPTION rejection (Error 1369), and DROP VIEW auto-recreation.
- **7.3 Automated Test Suite Summary:** Overview of the 32 automated test assertions executed on the live MySQL server.

### 9. CHAPTER 8: RESULTS, USER INTERFACE & VIVA PREPARATION
- **8.1 User Interface Progression:** Detailed walkthrough of Dashboard, Transactions Ledger, Category Manager, Budget Utilization, Reports, and Views Lab.
- **8.2 Project Demonstration Guide for Evaluators:** Step-by-step instructions for demonstrating database view updatability and check option enforcement during oral examination.
- **8.3 Key DBMS Viva Voce Questions & Answers:**
  - 10 high-probability viva questions specifically targeting Views, WITH CHECK OPTION, Normalization, ACID transactions, and Indexes with comprehensive, textbook-grade model answers.

### 10. CHAPTER 9: CONCLUSION & FUTURE WORK
- **10.1 Project Summary:** Review of achieved goals and educational takeaways.
- **10.2 Limitations:** Scope boundaries.
- **10.3 Future Enhancements:** Multi-currency forex conversion, AI receipt scanning (OCR), recurring scheduled transactions via MySQL events, and automated bank API integration.

### 11. REFERENCES & APPENDIX
- **References:** IEEE format citations for database textbooks (e.g., Elmasri & Navathe, Silberschatz & Korth) and modern web documentation.
- **Appendix A:** Complete database SQL scripts (`schema.sql`, `views.sql`, `seed.sql`).

---

## OUTPUT CONSTRAINTS
- Ensure all SQL snippets, mathematical relational algebra formulas, and Mermaid diagrams are complete and syntactically valid.
- Maintain a professional, publication-quality tone suitable for immediate submission to university project evaluation panels.
```
