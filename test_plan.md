# Test Plan — Mid Review

## 1. Objective

The goal of this test plan is to verify the validation logic, dynamic HTML generation, and asynchronous data handling (Fetch/AJAX/Axios) for all major roles and features in the FDFED web-based project. The plan ensures that user interactions, data flow, and UI updates function as intended for each module.

## 2. Scope

This test plan covers:
- Form validation using DOM manipulation and JavaScript for all major forms (add/edit branches, employees, companies, sales, orders, complaints, reviews, contact us).
- Dynamic HTML updates (adding, updating elements in the DOM).
- Asynchronous data handling with Fetch and backend API communication.
- UI and data flow verification across modules for Admin, Company, SalesManager, Salesman, and Customer.

## 3. Test Environment

- **Browser:** Chrome (latest), Edge (latest)
- **Backend Server:** Node.js with Express
- **Database:** MongoDB
- **Operating System:** Windows 10/11

## 4. Test Scenarios and Cases

---

### A. Validation Test Cases (DOM-based)

#### Admin

| Test ID | Feature         | Input                                 | Expected Output                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| V1      | Add Branch      | Blank branch name                     | Error: "Branch name required"          | Name: ""                              |
| V2      | Add Branch      | Valid branch name, address            | Success: Branch added                  | Name: "Hyderabad", Address: "Ameerpet"|
| V3      | Add Branch      | Invalid address                       | Error: "Enter valid address"           | Address: "123"                        |
| V4      | Edit Branch     | Update address to blank               | Error: "Address required"              | Address: ""                           |
| V5      | Edit Branch     | Update address to valid address       | Success: Branch updated                | Address: "Madhapur"                   |
| V6      | Add Company     | Blank company name                    | Error: "Company name required"         | Name: ""                              |
| V7      | Add Company     | Valid company name, address           | Success: Company added                 | Name: "ABC Pvt Ltd", Address: "Banjara Hills" |
| V8      | Add Company     | Invalid email format                  | Error: "Enter valid email"             | Email: "abc@123"                      |
| V9      | Add Company     | Valid name, email, address            | Success: Company added                 | Name: "XYZ Ltd", Email: "xyz@company.com", Address: "Jubilee Hills" |
| V10     | Edit Company    | Update email to valid email           | Success: Company updated               | Email: "abc@company.com"              |
| V11     | Edit Company    | Update email to invalid format        | Error: "Enter valid email"             | Email: "abc@123"                      |
| V12     | Add Employee    | Blank employee name                   | Error: "Employee name required"        | Name: ""                              |
| V13     | Add Employee    | Valid name, phone, salary             | Success: Employee added                | Name: "John Doe", Phone: "9876543210", Salary: "50000" |
| V14     | Add Employee    | Invalid phone number                  | Error: "Enter valid phone number"      | Phone: "abcd123"                      |
| V15     | Edit Employee   | Change salary to valid number         | Success: Employee updated              | Salary: "60000"                       |
| V16     | Edit Employee   | Change salary to negative number      | Error: "Salary must be positive"       | Salary: "-5000"                       |
| V17     | Accept Product  | Valid product ID                      | Success: Product accepted              | Product ID: "P123"                    |
| V18     | Reject Product  | Valid product ID                      | Success: Product rejected              | Product ID: "P124"                    |

---

#### Company

| Test ID | Feature         | Input                                 | Expected Output                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| V19     | Add Complaint   | Blank complaint text                  | Error: "Complaint text required"       | Complaint: ""                         |
| V20     | Add Complaint   | Valid complaint text                  | Success: Complaint added               | Complaint: "Late delivery"            |
| V21     | Add Order       | Blank product list                    | Error: "Select at least one product"   | Products: []                          |
| V22     | Add Order       | Valid product list, quantity          | Success: Order added                   | Products: ["P123"], Quantity: "2"     |
| V23     | Add Message     | Blank message text                    | Error: "Message required"              | Message: ""                           |
| V24     | Add Message     | Valid message text                    | Success: Message sent                  | Message: "Order status update?"       |
| V25     | Edit Order      | Update quantity to valid number       | Success: Order updated                 | Quantity: "5"                         |
| V26     | Edit Order      | Update quantity to negative number    | Error: "Quantity must be positive"     | Quantity: "-2"                        |
| V27     | Add Product     | Blank product name                    | Error: "Product name required"         | Name: ""                              |
| V28     | Add Product     | Valid product name, price             | Success: Product added                 | Name: "Laptop", Price: "45000"        |
| V29     | Edit Product    | Update price to negative number       | Error: "Price must be positive"        | Price: "-1000"                        |
| V30     | Edit Product    | Update price to valid number          | Success: Product updated               | Price: "50000"                        |

---

#### SalesManager

| Test ID | Feature         | Input                                 | Expected Output                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| V31     | Add Employee   | Blank employee name                   | Error: "Employee name required"        | Name: ""                              |
| V32     | Add Employee   | Valid name, phone, salary             | Success: Employee added                | Name: "Ravi", Phone: "9123456789", Salary: "40000" |
| V33     | Edit Employee  | Update phone to invalid number        | Error: "Enter valid phone number"      | Phone: "abcd123"                      |
| V34     | Edit Employee  | Update phone to valid number          | Success: Employee updated              | Phone: "9876543210"                   |
| V37     | Add Sales      | Blank sales amount                    | Error: "Sales amount required"         | Amount: ""                            |
| V38     | Add Sales      | Valid sales amount, date              | Success: Sale added                    | Amount: "15000", Date: "2025-10-12"   |
| V39     | Add Employee     | Blank salary amount                   | Error: "Salary required"               | Salary: ""                            |
| V40     | Edit Employee     | Valid salary amount                   | Success: Salary added                  | Salary: "35000"                       |

---

#### Salesman

| Test ID | Feature         | Input                                 | Expected Output                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| V41     | Add Sales      | Blank sales amount                    | Error: "Sales amount required"         | Amount: ""                            |
| V42     | Add Sales      | Valid sales amount, date              | Success: Sale added                    | Amount: "8000", Date: "2025-10-12"    |
| V43     | Edit Employee  | Update email to invalid      | Error: "Enter valid email"       | Email:"s@123"                       |
| V44     | Edit Employee  | Update email to valid          | Success: Employee updated              | Email: "s@gmail.com"                       |
| V45     | Add Employee   | Blank employee name                   | Error: "Employee name required"        | Name: ""                              |
| V46     | Add Employee   | Valid name, phone, salary             | Success: Employee added                | Name: "Priya", Phone: "9876543210", Salary: "30000" |

---

#### Customer

| Test ID | Feature         | Input                                 | Expected Output                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| V47     | Add Review     | Blank review text                     | Error: "Review text required"          | Review: ""                            |
| V48     | Add Review     | Valid review text, rating             | Success: Review added                  | Review: "Great product!", Rating: "5" |
| V49     | Add Complaint  | Blank complaint text                  | Error: "Complaint text required"       | Complaint: ""                         |
| V50     | Add Complaint  | Valid complaint text                  | Success: Complaint added               | Complaint: "Late delivery"            |

---

#### Static Page

| Test ID | Feature         | Input                                 | Expected Output                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| V57     | Contact Us     | Blank name                            | Error: "Name required"                 | Name: ""                              |
| V58     | Contact Us     | Valid name, email, message            | Success: Message sent                  | Name: "Sai", Email: "sai@gmail.com", Message: "Need help" |
| V59     | Contact Us     | Invalid email format                  | Error: "Enter valid email"             | Email: "sai@123"                      |
| V60     | Contact Us     | Valid email, message                  | Success: Message sent                  | Email: "sai@domain.com", Message: "Support needed" |

---

### B. Dynamic HTML Test Cases

#### Admin

| Test ID | Feature         | Action                                | Expected Result                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| D1      | Branches        | Add branch                            | Branch card added to DOM               | Add "Hyderabad" branch                |
| D2      | Branches        | Edit branch                           | Branch card updated in DOM             | Change address to "Madhapur"          |
| D3      | Company         | Add company                           | Company card added to DOM              | Add "ABC Pvt Ltd"                     |
| D4      | Company         | Edit company                          | Company card updated in DOM            | Update address to "Banjara Hills"     |
| D5      | Employees       | Add employee                          | Employee card added to DOM             | Add "John Doe"                        |
| D6      | Employees       | Edit employee                         | Employee card updated in DOM           | Update salary to "60000"              |
| D7      | Products        | Accept product                        | Product status updated in DOM          | Accept "Laptop" product               |
| D8      | Products        | Reject product                        | Product status updated in DOM          | Reject "Tablet" product               |

---

#### Company

| Test ID | Feature         | Action                                | Expected Result                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| D9      | Complaints      | Add complaint                         | Complaint appears in list dynamically  | "Late delivery"                       |
| D10     | Complaints      | Edit complaint                        | Complaint updated in list              | Update complaint to "Damaged item"    |
| D11     | Orders          | Add order                             | Order row added to table               | Add order for "Suresh"                |
| D12     | Orders          | Edit order                            | Order row updated in table             | Change quantity to "5"                |
| D13     | Messages        | Add message                           | Message appears in list dynamically    | "Order status update?"                |
| D14     | Products        | Add product                           | Product card added to DOM              | Add "Tablet"                          |
| D15     | Products        | Edit product                          | Product card updated in DOM            | Update price to "30000"               |

---

#### SalesManager

| Test ID | Feature         | Action                                | Expected Result                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| D16     | Employees      | Add employee                          | Employee card added to DOM             | Add "Ravi"                            |
| D17     | Employees      | Edit employee                         | Employee card updated in DOM           | Update phone to "9876543210"          |
| D18     | Orders         | Add order                             | Order row added to table               | Add order for "Suresh"                |
| D19     | Orders         | Edit order                            | Order row updated in table             | Change quantity to "5"                |
| D20     | Sales          | Add sale                              | Sale row added to sales table          | Add sale "15000"                      |

---

#### Salesman

| Test ID | Feature         | Action                                | Expected Result                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| D24     | Employees      | Add employee                          | Employee card added to DOM             | Add "Priya"                           |
| D25     | Employees      | Edit employee                         | Employee card updated in DOM           | Update salary to "25000"              |
| D26     | Sales          | Add sale                              | Sale row added to sales table          | Add sale "8000"                       |
| D27     | Sales          | Edit sale                             | Sale row updated in sales table        | Update sale to "9000"                 |

---

#### Customer

| Test ID | Feature         | Action                                | Expected Result                        | Example                               |
|---------|----------------|---------------------------------------|----------------------------------------|---------------------------------------|
| D30     | Reviews        | Add review                            | Review appears below product           | "Great product!" for "Laptop"         |
| D31     | Reviews        | Edit review                           | Review updated below product           | Change rating to "4"                  |
| D32     | Complaints     | Add complaint                         | Complaint appears in list dynamically  | "Late delivery"                       |
| D33     | Complaints     | Edit complaint                        | Complaint updated in list              | Update complaint to "Damaged item"    |

---

### C. Async Data Handling (AJAX/Fetch/Axios) Test Cases

#### Admin

| Test ID | Feature         | Request                                | Expected Response                      | Example                               |
|---------|----------------|----------------------------------------|----------------------------------------|---------------------------------------|
| A1      | Branches        | GET /api/branches                      | 200 OK + branch array                  | Fetch all branches                    |
| A2      | Branches        | POST /api/branches                     | 201 Created + branch ID                | Add "Hyderabad" branch                |
| A3      | Branches        | PUT /api/branches/:id                  | 200 OK + updated branch                | Update address for branch "B001"      |
| A4      | Company         | GET /api/company                       | 200 OK + company array                 | Fetch all companies                   |
| A5      | Company         | POST /api/company                      | 201 Created + company ID               | Add "ABC Pvt Ltd"                     |
| A6      | Company         | PUT /api/company/:id                   | 200 OK + updated company               | Update email for company "C001"       |
| A7      | Employees       | GET /api/employees                     | 200 OK + employee array                | Fetch all employees                   |
| A8      | Employees       | POST /api/employees                    | 201 Created + employee ID              | Add "John Doe"                        |
| A9      | Employees       | PUT /api/employees/:id                 | 200 OK + updated employee              | Update salary for employee "E001"     |
| A10     | Products        | PUT /api/products/:id/accept           | 200 OK + product accepted              | Accept product "P123"                 |
| A11     | Products        | PUT /api/products/:id/reject           | 200 OK + product rejected              | Reject product "P124"                 |

---

#### Company

| Test ID | Feature         | Request                                | Expected Response                      | Example                               |
|---------|----------------|----------------------------------------|----------------------------------------|---------------------------------------|
| A12     | Products        | POST /api/products                     | 201 Created + product ID               | Add "Tablet"                          |
| A13     | Products        | PUT /api/products/:id                  | 200 OK + updated product               | Update price for product "P125"       |
| A14     | Orders          | PUT /api/orders/:id                    | 200 OK + updated order                 | Update quantity for order "O001"      |
| A15     | Complaints      | POST /api/complaints                   | 201 Created + complaint ID             | Add complaint "Late delivery"         |
| A16     | Complaints      | PUT /api/complaints/:id                | 200 OK + updated complaint             | Update complaint "Damaged item"       |

---

#### SalesManager

| Test ID | Feature         | Request                                | Expected Response                      | Example                               |
|---------|----------------|----------------------------------------|----------------------------------------|---------------------------------------|
| A17     | Employees       | POST /api/employees                    | 201 Created + employee ID              | Add "Ravi"                            |
| A18     | Employees       | PUT /api/employees/:id                 | 200 OK + updated employee              | Update phone for employee "E002"      |
| A19     | Orders          | POST /api/orders                       | 201 Created + order ID                 | Add order for "Suresh"                |
| A20     | Orders          | PUT /api/orders/:id                    | 200 OK + updated order                 | Update quantity for order "O002"      |
| A21     | Sales           | POST /api/sales                        | 201 Created + sale ID                  | Add sale "15000"                      |
| A22     | Sales           | PUT /api/sales/:id                     | 200 OK + updated sale                  | Update sale to "18000"                |

---

#### Salesman

| Test ID | Feature         | Request                                | Expected Response                      | Example                               |
|---------|----------------|----------------------------------------|----------------------------------------|---------------------------------------|
| A23     | Employees       | POST /api/employees                    | 201 Created + employee ID              | Add "Priya"                           |
| A24     | Employees       | PUT /api/employees/:id                 | 200 OK + updated employee              | Update salary for employee "E003"     |
| A25     | Sales           | POST /api/sales                        | 201 Created + sale ID                  | Add sale "8000"                       |
| A26     | Sales           | PUT /api/sales/:id                     | 200 OK + updated sale                  | Update sale to "9000"                 |

---

#### Customer

| Test ID | Feature         | Request                                | Expected Response                      | Example                               |
|---------|----------------|----------------------------------------|----------------------------------------|---------------------------------------|
| A27     | Reviews         | POST /api/reviews                      | 201 Created + review ID                | Add review "Great product!"           |
| A28     | Reviews         | PUT /api/reviews/:id                   | 200 OK + updated review                | Update rating to "4"                  |
| A29     | Complaints      | POST /api/complaints                   | 201 Created + complaint ID             | Add complaint "Late delivery"         |
| A30     | Complaints      | PUT /api/complaints/:id                | 200 OK + updated complaint             | Update complaint "Damaged item"       |
| A31     | Contact Us      | POST /api/contactus                    | 201 Created + message ID               | Send message "Need help with order"   |

---

## 5. Test Results Summary

- All validation, dynamic HTML, and async data handling cases covered for each role and feature.
- Dynamic HTML rendering and updates work as expected.
- Minor UI layout bugs (if any) noted for final review.

## 6. Evidence

- `/network_evidence/` — contains screenshots of async API calls (Network tab)
- `/validation/` — form validation evidence
- `/screenshots/dynamic/` — dynamic HTML updates

## 7. Conclusion

The mid-review build satisfies FDFED framework requirements:
- Frontend validation
- Dynamic DOM manipulation
- Async API calls

All core modules are working and verified through manual and functional testing.
