# Test Plan — Mid Review

## 1. Objective

The goal of this test plan is to verify the correctness and robustness of the FFSD web-based project’s frontend and backend modules. Focus areas include validation logic, dynamic HTML generation, and asynchronous data handling (Fetch/AJAX/Axios). The plan ensures that user interactions, data flow, and UI updates function as intended.

## 2. Scope

This test plan covers:
- Form validation using DOM manipulation and JavaScript.
- Dynamic HTML updates (adding, updating, deleting elements in the DOM).
- Asynchronous data handling with Fetch/Axios/AJAX and backend API communication.
- UI and data flow verification across major modules (signup, login, products, orders, etc.).

## 3. Test Environment

- **Browser:** Chrome (latest), Edge (latest)
- **Backend Server:** Node.js with Express
- **Database:** SQLite (primary), MySQL (secondary, if configured)
- **Operating System:** Windows 10/11

## 4. Test Scenarios and Cases

### A. Validation Test Cases (DOM-based)

| Test ID | Role         | Feature         | Input                                 | Expected Output                        |
|---------|--------------|-----------------|---------------------------------------|----------------------------------------|
| V1      | Owner        | Add Branch      | Blank branch name                     | Error: "Branch name required"          |
| V2      | Owner        | Add Branch      | Invalid address                       | Error: "Enter valid address"           |
| V3      | Owner        | Add Branch      | Unchecked terms                       | Error: "Accept terms to continue"      |
| V4      | Owner        | Add Employee    | Short password                        | Error: "Password must be at least 8 characters" |
| V5      | Owner        | Add Employee    | Passwords do not match                | Error: "Passwords do not match"        |
| V6      | Owner        | Add Employee    | Invalid phone number                  | Error: "Enter valid phone number"      |
| V7      | Owner        | Add Product     | Blank product name                    | Error: "Product name required"         |
| V8      | Owner        | Add Product     | Negative price                        | Error: "Price must be positive"        |
| V9      | Owner        | Add Product     | Invalid date                          | Error: "Enter valid date"              |
| V10     | Owner        | Add Product     | Non-numeric price                     | Error: "Price must be a number"        |
| V11     | Salesman     | Login           | Blank username                        | Error: "Username required"             |
| V12     | Salesman     | Login           | Wrong password                        | Error: "Incorrect password"            |
| V13     | Salesman     | Login           | Invalid email format                  | Error: "Enter valid email"             |
| V14     | Salesman     | Add Sale        | Blank sale amount                     | Error: "Sale amount required"          |
| V15     | Salesman     | Add Sale        | Negative sale amount                  | Error: "Sale amount must be positive"  |
| V16     | Salesman     | Add Sale        | Invalid date                          | Error: "Enter valid date"              |
| V17     | Salesman     | Add Sale        | Non-numeric sale amount               | Error: "Sale amount must be a number"  |
| V18     | Salesman     | Add Inventory   | Blank item name                       | Error: "Item name required"            |
| V19     | Salesman     | Add Inventory   | Negative quantity                     | Error: "Quantity must be positive"     |
| V20     | Salesman     | Add Inventory   | Non-numeric quantity                  | Error: "Quantity must be a number"     |
| V21     | Salesmanager | Add Employee    | Blank employee name                   | Error: "Employee name required"        |
| V22     | Salesmanager | Add Employee    | Invalid email format                  | Error: "Enter valid email"             |
| V23     | Salesmanager | Add Employee    | Short password                        | Error: "Password must be at least 8 characters" |
| V24     | Salesmanager | Add Employee    | Passwords do not match                | Error: "Passwords do not match"        |
| V25     | Salesmanager | Add Employee    | Invalid phone number                  | Error: "Enter valid phone number"      |
| V26     | Salesmanager | Add Product     | Blank product name                    | Error: "Product name required"         |
| V27     | Salesmanager | Add Product     | Negative price                        | Error: "Price must be positive"        |
| V28     | Salesmanager | Add Product     | Invalid date                          | Error: "Enter valid date"              |
| V29     | Salesmanager | Add Product     | Non-numeric price                     | Error: "Price must be a number"        |
| V30     | Company      | Add Company     | Blank company name                    | Error: "Company name required"         |
| V31     | Company      | Add Company     | Invalid email format                  | Error: "Enter valid email"             |
| V32     | Company      | Add Company     | Short password                        | Error: "Password must be at least 8 characters" |
| V33     | Company      | Add Company     | Passwords do not match                | Error: "Passwords do not match"        |
| V34     | Company      | Add Company     | Invalid phone number                  | Error: "Enter valid phone number"      |
| V35     | Company      | Add Product     | Blank product name                    | Error: "Product name required"         |
| V36     | Company      | Add Product     | Negative price                        | Error: "Price must be positive"        |
| V37     | Company      | Add Product     | Invalid date                          | Error: "Enter valid date"              |
| V38     | Company      | Add Product     | Non-numeric price                     | Error: "Price must be a number"        |
| V39     | Customer     | Signup          | Existing email                        | Error: "Email already registered"      |
| V40     | Customer     | Signup          | Weak password                         | Error: "Weak Password"                 |
| V41     | Customer     | Signup          | Blank form submit                     | Error: "All fields required"           |
| V42     | Customer     | Signup          | Invalid phone number                  | Error: "Enter valid phone number"      |
| V43     | Customer     | Signup          | Passwords do not match                | Error: "Passwords do not match"        |
| V44     | Customer     | Signup          | Invalid email format                  | Error: "Enter valid email"             |
| V45     | Customer     | Signup          | Short password                        | Error: "Password must be at least 8 characters" |
| V46     | Customer     | Signup          | Unchecked terms                       | Error: "Accept terms to continue"      |
| V47     | Customer     | Add Complaint   | Blank complaint text                  | Error: "Complaint text required"       |
| V48     | Customer     | Add Review      | Blank review text                     | Error: "Review text required"          |
| V49     | Customer     | Add Review      | Invalid rating (e.g., 6 stars)        | Error: "Rating must be 1-5"            |
| V50     | Customer     | Add Review      | Non-numeric rating                    | Error: "Rating must be a number"       |

---

### B. Dynamic HTML Test Cases

| Test ID | Role         | Feature         | Action                                | Expected Result                        |
|---------|--------------|-----------------|---------------------------------------|----------------------------------------|
| D1      | Owner        | Branches        | Add branch                            | Branch card added to DOM               |
| D2      | Owner        | Branches        | Delete branch                         | Branch card removed from DOM           |
| D3      | Owner        | Employees       | Add employee                          | Employee card added to DOM             |
| D4      | Owner        | Employees       | Delete employee                       | Employee card removed from DOM         |
| D5      | Owner        | Products        | Add product                           | Product card added to DOM              |
| D6      | Owner        | Products        | Delete product                        | Product card removed from DOM          |
| D7      | Owner        | Dashboard       | New sale recorded                     | Dashboard stats update instantly       |
| D8      | Owner        | Orders          | Add order                             | Order row added to table               |
| D9      | Owner        | Orders          | Delete order                          | Order row removed from table           |
| D10     | Owner        | Complaints      | Add complaint                         | Complaint appears in list dynamically  |
| D11     | Salesman     | Inventory       | Add inventory item                    | Item appears in inventory list         |
| D12     | Salesman     | Inventory       | Delete inventory item                 | Item removed from inventory list       |
| D13     | Salesman     | Sales           | Add sale                              | Sale row added to sales table          |
| D14     | Salesman     | Sales           | Delete sale                           | Sale row removed from sales table      |
| D15     | Salesman     | Messages        | Add message                           | Message appears in list dynamically    |
| D16     | Salesman     | Messages        | Delete message                        | Message removed from list              |
| D17     | Salesman     | Profile         | Update profile                        | Profile info updates instantly         |
| D18     | Salesman     | Salary          | Update salary info                    | Salary info updates instantly          |
| D19     | Salesmanager | Employees       | Add employee                          | Employee card added to list            |
| D20     | Salesmanager | Employees       | Delete employee                       | Employee card removed from list        |
| D21     | Salesmanager | Products        | Add product                           | Product card added to DOM              |
| D22     | Salesmanager | Products        | Delete product                        | Product card removed from DOM          |
| D23     | Salesmanager | Orders          | Add order                             | Order row added to table               |
| D24     | Salesmanager | Orders          | Delete order                          | Order row removed from table           |
| D25     | Salesmanager | Messages        | Add message                           | Message appears in list dynamically    |
| D26     | Salesmanager | Messages        | Delete message                        | Message removed from list              |
| D27     | Salesmanager | Salary          | Update salary info                    | Salary info updates instantly          |
| D28     | Company      | Products        | Add product                           | Product card added to DOM              |
| D29     | Company      | Products        | Delete product                        | Product card removed from DOM          |
| D30     | Company      | Orders          | Add order                             | Order row added to table               |
| D31     | Company      | Orders          | Delete order                          | Order row removed from table           |
| D32     | Company      | Complaints      | Add complaint                         | Complaint appears in list dynamically  |
| D33     | Company      | Complaints      | Delete complaint                      | Complaint removed from list            |
| D34     | Company      | Messages        | Add message                           | Message appears in list dynamically    |
| D35     | Company      | Messages        | Delete message                        | Message removed from list              |
| D36     | Customer     | Cart            | Add to cart                           | Cart count updates dynamically         |
| D37     | Customer     | Cart            | Remove from cart                      | Cart count updates dynamically         |
| D38     | Customer     | Reviews         | Submit review                         | Review appears below product           |
| D39     | Customer     | Reviews         | Delete review                         | Review removed from list               |
| D40     | Customer     | Complaints      | Submit complaint                      | Complaint appears in list dynamically  |
| D41     | Customer     | Complaints      | Delete complaint                      | Complaint removed from list            |
| D42     | Customer     | Previous Orders | Add order                             | Order row added to table               |
| D43     | Customer     | Previous Orders | Delete order                          | Order row removed from table           |
| D44     | Customer     | Profile         | Update profile                        | Profile info updates instantly         |
| D45     | Customer     | Blogs           | Add blog post                         | Blog post appears in list dynamically  |
| D46     | Customer     | Blogs           | Delete blog post                      | Blog post removed from list            |
| D47     | Customer     | Review Filter   | Change filter                         | Review list updates instantly          |
| D48     | Customer     | Complaint Filter| Change filter                         | Complaint list updates instantly       |
| D49     | Customer     | Cart Filter     | Change filter                         | Cart list updates instantly            |
| D50     | Customer     | Pagination      | Change page                           | New items load without page reload     |

---

### C. Async Data Handling (AJAX/Fetch/Axios) Test Cases

| Test ID | Role         | API / Feature   | Request                               | Expected Response                      |
|---------|--------------|-----------------|---------------------------------------|----------------------------------------|
| A1      | Owner        | GET /api/branches | Fetch branch list                   | 200 OK + branch array                  |
| A2      | Owner        | POST /api/branches | Add branch                          | 201 Created + branch ID                |
| A3      | Owner        | PUT /api/branches/:id | Update branch                      | 200 OK + updated branch                |
| A4      | Owner        | DELETE /api/branches/:id | Delete branch                     | 204 No Content                         |
| A5      | Owner        | GET /api/employees | Fetch employee list                 | 200 OK + employee array                |
| A6      | Owner        | POST /api/employees | Add employee                        | 201 Created + employee ID              |
| A7      | Owner        | PUT /api/employees/:id | Update employee                    | 200 OK + updated employee              |
| A8      | Owner        | DELETE /api/employees/:id | Delete employee                   | 204 No Content                         |
| A9      | Owner        | GET /api/products | Fetch product list                   | 200 OK + product array                 |
| A10     | Owner        | POST /api/products | Add product                          | 201 Created + product ID               |
| A11     | Owner        | PUT /api/products/:id | Update product                      | 200 OK + updated product               |
| A12     | Owner        | DELETE /api/products/:id | Delete product                     | 204 No Content                         |
| A13     | Owner        | GET /api/orders | Fetch order list                      | 200 OK + order array                   |
| A14     | Owner        | POST /api/orders | Add order                             | 201 Created + order ID                 |
| A15     | Owner        | PUT /api/orders/:id | Update order                         | 200 OK + updated order                 |
| A16     | Owner        | DELETE /api/orders/:id | Delete order                        | 204 No Content                         |
| A17     | Salesman     | GET /api/inventory | Fetch inventory list                | 200 OK + inventory array               |
| A18     | Salesman     | POST /api/inventory | Add inventory item                  | 201 Created + inventory ID             |
| A19     | Salesman     | PUT /api/inventory/:id | Update inventory item               | 200 OK + updated inventory             |
| A20     | Salesman     | DELETE /api/inventory/:id | Delete inventory item             | 204 No Content                         |
| A21     | Salesman     | GET /api/sales | Fetch sales list                      | 200 OK + sales array                   |
| A22     | Salesman     | POST /api/sales | Add sale                              | 201 Created + sale ID                  |
| A23     | Salesman     | PUT /api/sales/:id | Update sale                          | 200 OK + updated sale                  |
| A24     | Salesman     | DELETE /api/sales/:id | Delete sale                         | 204 No Content                         |
| A25     | Salesman     | GET /api/messages | Fetch messages list                  | 200 OK + messages array                |
| A26     | Salesman     | POST /api/messages | Add message                          | 201 Created + message ID               |
| A27     | Salesman     | DELETE /api/messages/:id | Delete message                     | 204 No Content                         |
| A28     | Salesmanager | GET /api/employees | Fetch employee list                 | 200 OK + employee array                |
| A29     | Salesmanager | POST /api/employees | Add employee                        | 201 Created + employee ID              |
| A30     | Salesmanager | PUT /api/employees/:id | Update employee                    | 200 OK + updated employee              |
| A31     | Salesmanager | DELETE /api/employees/:id | Delete employee                   | 204 No Content                         |
| A32     | Salesmanager | GET /api/products | Fetch product list                   | 200 OK + product array                 |
| A33     | Salesmanager | POST /api/products | Add product                          | 201 Created + product ID               |
| A34     | Salesmanager | PUT /api/products/:id | Update product                      | 200 OK + updated product               |
| A35     | Salesmanager | DELETE /api/products/:id | Delete product                     | 204 No Content                         |
| A36     | Salesmanager | GET /api/orders | Fetch order list                      | 200 OK + order array                   |
| A37     | Salesmanager | POST /api/orders | Add order                             | 201 Created + order ID                 |
| A38     | Salesmanager | PUT /api/orders/:id | Update order                         | 200 OK + updated order                 |
| A39     | Salesmanager | DELETE /api/orders/:id | Delete order                        | 204 No Content                         |
| A40     | Salesmanager | GET /api/messages | Fetch messages list                  | 200 OK + messages array                |
| A41     | Salesmanager | POST /api/messages | Add message                          | 201 Created + message ID               |
| A42     | Salesmanager | DELETE /api/messages/:id | Delete message                     | 204 No Content                         |
| A43     | Company      | GET /api/company | Fetch company info                   | 200 OK + company object                |
| A44     | Company      | PUT /api/company/:id | Update company info                 | 200 OK + updated company               |
| A45     | Company      | GET /api/products | Fetch product list                   | 200 OK + product array                 |
| A46     | Company      | POST /api/products | Add product                          | 201 Created + product ID               |
| A47     | Company      | PUT /api/products/:id | Update product                      | 200 OK + updated product               |
| A48     | Company      | DELETE /api/products/:id | Delete product                     | 204 No Content                         |
| A49     | Company      | GET /api/orders | Fetch order list                      | 200 OK + order array                   |
| A50     | Company      | POST /api/orders | Add order                             | 201 Created + order ID                 |
| A51     | Company      | PUT /api/orders/:id | Update order                         | 200 OK + updated order                 |
| A52     | Company      | DELETE /api/orders/:id | Delete order                        | 204 No Content                         |
| A53     | Company      | GET /api/complaints | Fetch complaints list               | 200 OK + complaints array              |
| A54     | Company      | POST /api/complaints | Add complaint                       | 201 Created + complaint ID             |
| A55     | Company      | DELETE /api/complaints/:id | Delete complaint                  | 204 No Content                         |
| A56     | Company      | GET /api/messages | Fetch messages list                  | 200 OK + messages array                |
| A57     | Company      | POST /api/messages | Add message                          | 201 Created + message ID               |
| A58     | Company      | DELETE /api/messages/:id | Delete message                     | 204 No Content                         |
| A59     | Customer     | POST /api/signup | Register user                        | 201 Created + user ID                  |
| A60     | Customer     | POST /api/login | Login                                 | 200 OK + token                         |
| A61     | Customer     | GET /api/products | Fetch product list                   | 200 OK + product array                 |
| A62     | Customer     | POST /api/order | Place order                           | 201 Created + order ID                 |
| A63     | Customer     | GET /api/orders | Fetch previous orders                 | 200 OK + orders array                  |
| A64     | Customer     | POST /api/complaint | Submit complaint                    | 201 Created + complaint ID             |
| A65     | Customer     | GET /api/complaints | Fetch complaints list               | 200 OK + complaints array              |
| A66     | Customer     | POST /api/review | Submit review                        | 201 Created + review ID                |
| A67     | Customer     | GET /api/reviews | Fetch reviews list                   | 200 OK + reviews array                 |
| A68     | Customer     | DELETE /api/review/:id | Delete review                      | 204 No Content                         |
| A69     | Customer     | GET /api/blogs | Fetch blogs list                      | 200 OK + blogs array                   |
| A70     | Customer     | POST /api/blogs | Add blog post                         | 201 Created + blog ID                  |
| A71     | Customer     | DELETE /api/blogs/:id | Delete blog post                    | 204 No Content                         |

---

## 5. Test Results Summary

- All validation, dynamic HTML, and async data handling cases covered for each role and feature.
- Dynamic HTML rendering and updates work as expected.
- Minor UI layout bugs (if any) noted for final review.

## 6. Evidence

- `/network_evidence/` — contains screenshots of async API calls (Network tab)
- `/screenshots/validation/` — form validation evidence
- `/screenshots/dynamic/` — dynamic HTML updates

## 7. Conclusion

The mid-review build satisfies FFSD framework requirements:
- Frontend validation
- Dynamic DOM manipulation
- Async API calls

All core modules are working and verified through manual and functional testing.