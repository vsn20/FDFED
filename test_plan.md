# Test Plan — Mid Review

## 1. Objective

The goal of this test plan is to verify the validation logic, dynamic HTML generation, and asynchronous data handling (Fetch/AJAX/Axios) for all major roles and features in the FFSD web-based project. The plan ensures that user interactions, data flow, and UI updates function as intended for each module.

## 2. Scope

This test plan covers:
- Form validation using DOM manipulation and JavaScript for all major forms (add/edit branches, employees, companies, sales, orders, complaints, reviews, contact us).
- Dynamic HTML updates (adding, updating, deleting elements in the DOM).
- Asynchronous data handling with Fetch/Axios/AJAX and backend API communication.
- UI and data flow verification across modules for Admin, Company, SalesManager, Salesman, and Customer.

## 3. Test Environment

- **Browser:** Chrome (latest), Edge (latest)
- **Backend Server:** Node.js with Express
- **Database:** SQLite (primary), MySQL (secondary, if configured)
- **Operating System:** Windows 10/11

## 4. Test Scenarios and Cases

### A. Validation Test Cases (DOM-based)

#### Admin

| Test ID | Feature         | Input                                 | Expected Output                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| V1      | Add Branch      | Blank branch name                     | Error: "Branch name required"          |
| V2      | Add Branch      | Valid branch name, address            | Success: Branch added                  |
| V3      | Add Branch      | Invalid address                       | Error: "Enter valid address"           |
| V4      | Add Branch      | Valid name, address, terms checked    | Success: Branch added                  |
| V5      | Add Company     | Blank company name                    | Error: "Company name required"         |
| V6      | Add Company     | Valid company name, address           | Success: Company added                 |
| V7      | Add Company     | Invalid email format                  | Error: "Enter valid email"             |
| V8      | Add Company     | Valid name, email, address            | Success: Company added                 |
| V9      | Add Employee    | Blank employee name                   | Error: "Employee name required"        |
| V10     | Add Employee    | Valid name, phone, salary             | Success: Employee added                |
| V11     | Add Employee    | Invalid phone number                  | Error: "Enter valid phone number"      |
| V12     | Add Employee    | Valid name, phone, salary             | Success: Employee added                |
| V13     | Edit Employee   | Change salary to valid number         | Success: Employee updated              |
| V14     | Edit Employee   | Change salary to negative number      | Error: "Salary must be positive"       |
| V15     | Edit Branch     | Update address to valid address       | Success: Branch updated                |
| V16     | Edit Branch     | Update address to blank               | Error: "Address required"              |
| V17     | Edit Company    | Update email to valid email           | Success: Company updated               |
| V18     | Edit Company    | Update email to invalid format        | Error: "Enter valid email"             |

#### Company

| Test ID | Feature         | Input                                 | Expected Output                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| V19     | Add Complaint   | Blank complaint text                  | Error: "Complaint text required"       |
| V20     | Add Complaint   | Valid complaint text                  | Success: Complaint added               |
| V21     | Add Order       | Blank product list                    | Error: "Select at least one product"   |
| V22     | Add Order       | Valid product list, quantity          | Success: Order added                   |
| V23     | Add Message     | Blank message text                    | Error: "Message required"              |
| V24     | Add Message     | Valid message text                    | Success: Message sent                  |
| V25     | Edit Order      | Update quantity to valid number       | Success: Order updated                 |
| V26     | Edit Order      | Update quantity to negative number    | Error: "Quantity must be positive"     |

#### SalesManager

| Test ID | Feature         | Input                                 | Expected Output                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| V27     | Add Sales       | Blank sales amount                    | Error: "Sales amount required"         |
| V28     | Add Sales       | Valid sales amount, date              | Success: Sale added                    |
| V29     | Add Order       | Blank customer name                   | Error: "Customer name required"        |
| V30     | Add Order       | Valid customer name, product list     | Success: Order added                   |
| V31     | Add Employee    | Blank employee name                   | Error: "Employee name required"        |
| V32     | Add Employee    | Valid name, phone, salary             | Success: Employee added                |
| V33     | Edit Employee   | Update phone to valid number          | Success: Employee updated              |
| V34     | Edit Employee   | Update phone to invalid number        | Error: "Enter valid phone number"      |
| V35     | Add Salary      | Blank salary amount                   | Error: "Salary required"               |
| V36     | Add Salary      | Valid salary amount                   | Success: Salary added                  |

#### Salesman

| Test ID | Feature         | Input                                 | Expected Output                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| V37     | Add Sales       | Blank sales amount                    | Error: "Sales amount required"         |
| V38     | Add Sales       | Valid sales amount, date              | Success: Sale added                    |
| V39     | Add Employee    | Blank employee name                   | Error: "Employee name required"        |
| V40     | Add Employee    | Valid name, phone, salary             | Success: Employee added                |
| V41     | Edit Employee   | Update salary to valid number         | Success: Employee updated              |
| V42     | Edit Employee   | Update salary to negative number      | Error: "Salary must be positive"       |
| V43     | Add Salary      | Blank salary amount                   | Error: "Salary required"               |
| V44     | Add Salary      | Valid salary amount                   | Success: Salary added                  |

#### Customer

| Test ID | Feature         | Input                                 | Expected Output                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| V45     | Add Complaint   | Blank complaint text                  | Error: "Complaint text required"       |
| V46     | Add Complaint   | Valid complaint text                  | Success: Complaint added               |
| V47     | Add Review      | Blank review text                     | Error: "Review text required"          |
| V48     | Add Review      | Valid review text, rating             | Success: Review added                  |
| V49     | Previous Purchase| Blank product list                   | Error: "Select at least one product"   |
| V50     | Previous Purchase| Valid product list, quantity         | Success: Purchase recorded             |
| V51     | Contact Us      | Blank name                            | Error: "Name required"                 |
| V52     | Contact Us      | Valid name, email, message            | Success: Message sent                  |
| V53     | Contact Us      | Invalid email format                  | Error: "Enter valid email"             |
| V54     | Contact Us      | Valid email, message                  | Success: Message sent                  |

---

### B. Dynamic HTML Test Cases

#### Admin

| Test ID | Feature         | Action                                | Expected Result                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| D1      | Branches        | Add branch                            | Branch card added to DOM               |
| D2      | Branches        | Edit branch                           | Branch card updated in DOM             |
| D3      | Branches        | Delete branch                         | Branch card removed from DOM           |
| D4      | Company         | Add company                           | Company card added to DOM              |
| D5      | Company         | Edit company                          | Company card updated in DOM            |
| D6      | Company         | Delete company                        | Company card removed from DOM          |
| D7      | Employees       | Add employee                          | Employee card added to DOM             |
| D8      | Employees       | Edit employee                         | Employee card updated in DOM           |
| D9      | Employees       | Delete employee                       | Employee card removed from DOM         |

#### Company

| Test ID | Feature         | Action                                | Expected Result                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| D10     | Complaints      | Add complaint                         | Complaint appears in list dynamically  |
| D11     | Complaints      | Edit complaint                        | Complaint updated in list              |
| D12     | Complaints      | Delete complaint                      | Complaint removed from list            |
| D13     | Orders          | Add order                             | Order row added to table               |
| D14     | Orders          | Edit order                            | Order row updated in table             |
| D15     | Orders          | Delete order                          | Order row removed from table           |
| D16     | Messages        | Add message                           | Message appears in list dynamically    |
| D17     | Messages        | Delete message                        | Message removed from list              |

#### SalesManager

| Test ID | Feature         | Action                                | Expected Result                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| D18     | Sales           | Add sale                              | Sale row added to sales table          |
| D19     | Sales           | Edit sale                             | Sale row updated in sales table        |
| D20     | Sales           | Delete sale                           | Sale row removed from sales table      |
| D21     | Orders          | Add order                             | Order row added to table               |
| D22     | Orders          | Edit order                            | Order row updated in table             |
| D23     | Orders          | Delete order                          | Order row removed from table           |
| D24     | Employees       | Add employee                          | Employee card added to DOM             |
| D25     | Employees       | Edit employee                         | Employee card updated in DOM           |
| D26     | Employees       | Delete employee                       | Employee card removed from DOM         |
| D27     | Salaries        | Add salary                            | Salary row added to table              |
| D28     | Salaries        | Edit salary                           | Salary row updated in table            |
| D29     | Salaries        | Delete salary                         | Salary row removed from table          |

#### Salesman

| Test ID | Feature         | Action                                | Expected Result                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| D30     | Sales           | Add sale                              | Sale row added to sales table          |
| D31     | Sales           | Edit sale                             | Sale row updated in sales table        |
| D32     | Sales           | Delete sale                           | Sale row removed from sales table      |
| D33     | Employees       | Add employee                          | Employee card added to DOM             |
| D34     | Employees       | Edit employee                         | Employee card updated in DOM           |
| D35     | Employees       | Delete employee                       | Employee card removed from DOM         |
| D36     | Salaries        | Add salary                            | Salary row added to table              |
| D37     | Salaries        | Edit salary                           | Salary row updated in table            |
| D38     | Salaries        | Delete salary                         | Salary row removed from table          |

#### Customer

| Test ID | Feature         | Action                                | Expected Result                        |
|---------|-----------------|---------------------------------------|----------------------------------------|
| D39     | Complaints      | Add complaint                         | Complaint appears in list dynamically  |
| D40     | Complaints      | Edit complaint                        | Complaint updated in list              |
| D41     | Complaints      | Delete complaint                      | Complaint removed from list            |
| D42     | Reviews         | Add review                            | Review appears below product           |
| D43     | Reviews         | Edit review                           | Review updated below product           |
| D44     | Reviews         | Delete review                         | Review removed from list               |
| D45     | Previous Purchase| Add purchase                         | Purchase row added to table            |
| D46     | Previous Purchase| Edit purchase                        | Purchase row updated in table          |
| D47     | Previous Purchase| Delete purchase                      | Purchase row removed from table        |
| D48     | Contact Us      | Submit message                        | Message appears in confirmation area   |

---

### C. Async Data Handling (AJAX/Fetch/Axios) Test Cases

#### Admin

| Test ID | Feature         | Request                                | Expected Response                      |
|---------|-----------------|----------------------------------------|----------------------------------------|
| A1      | Branches        | GET /api/branches                      | 200 OK + branch array                  |
| A2      | Branches        | POST /api/branches                     | 201 Created + branch ID                |
| A3      | Branches        | PUT /api/branches/:id                  | 200 OK + updated branch                |
| A4      | Branches        | DELETE /api/branches/:id               | 204 No Content                         |
| A5      | Company         | GET /api/company                       | 200 OK + company array                 |
| A6      | Company         | POST /api/company                      | 201 Created + company ID               |
| A7      | Company         | PUT /api/company/:id                   | 200 OK + updated company               |
| A8      | Company         | DELETE /api/company/:id                | 204 No Content                         |
| A9      | Employees       | GET /api/employees                     | 200 OK + employee array                |
| A10     | Employees       | POST /api/employees                    | 201 Created + employee ID              |
| A11     | Employees       | PUT /api/employees/:id                 | 200 OK + updated employee              |
| A12     | Employees       | DELETE /api/employees/:id              | 204 No Content                         |

#### Company

| Test ID | Feature         | Request                                | Expected Response                      |
|---------|-----------------|----------------------------------------|----------------------------------------|
| A13     | Complaints      | GET /api/complaints                    | 200 OK + complaints array              |
| A14     | Complaints      | POST /api/complaints                   | 201 Created + complaint ID             |
| A15     | Complaints      | PUT /api/complaints/:id                | 200 OK + updated complaint             |
| A16     | Complaints      | DELETE /api/complaints/:id             | 204 No Content                         |
| A17     | Orders          | GET /api/orders                         | 200 OK + order array                   |
| A18     | Orders          | POST /api/orders                        | 201 Created + order ID                 |
| A19     | Orders          | PUT /api/orders/:id                     | 200 OK + updated order                 |
| A20     | Orders          | DELETE /api/orders/:id                  | 204 No Content                         |
| A21     | Messages        | GET /api/messages                       | 200 OK + messages array                |
| A22     | Messages        | POST /api/messages                      | 201 Created + message ID               |
| A23     | Messages        | DELETE /api/messages/:id                | 204 No Content                         |

#### SalesManager

| Test ID | Feature         | Request                                | Expected Response                      |
|---------|-----------------|----------------------------------------|----------------------------------------|
| A24     | Sales           | GET /api/sales                         | 200 OK + sales array                   |
| A25     | Sales           | POST /api/sales                        | 201 Created + sale ID                  |
| A26     | Sales           | PUT /api/sales/:id                     | 200 OK + updated sale                  |
| A27     | Sales           | DELETE /api/sales/:id                  | 204 No Content                         |
| A28     | Orders          | GET /api/orders                        | 200 OK + order array                   |
| A29     | Orders          | POST /api/orders                       | 201 Created + order ID                 |
| A30     | Orders          | PUT /api/orders/:id                    | 200 OK + updated order                 |
| A31     | Orders          | DELETE /api/orders/:id                 | 204 No Content                         |
| A32     | Employees       | GET /api/employees                     | 200 OK + employee array                |
| A33     | Employees       | POST /api/employees                    | 201 Created + employee ID              |
| A34     | Employees       | PUT /api/employees/:id                 | 200 OK + updated employee              |
| A35     | Employees       | DELETE /api/employees/:id              | 204 No Content                         |
| A36     | Salaries        | GET /api/salaries                      | 200 OK + salaries array                |
| A37     | Salaries        | POST /api/salaries                     | 201 Created + salary ID                |
| A38     | Salaries        | PUT /api/salaries/:id                  | 200 OK + updated salary                |
| A39     | Salaries        | DELETE /api/salaries/:id               | 204 No Content                         |

#### Salesman

| Test ID | Feature         | Request                                | Expected Response                      |
|---------|-----------------|----------------------------------------|----------------------------------------|
| A40     | Sales           | GET /api/sales                         | 200 OK + sales array                   |
| A41     | Sales           | POST /api/sales                        | 201 Created + sale ID                  |
| A42     | Sales           | PUT /api/sales/:id                     | 200 OK + updated sale                  |
| A43     | Sales           | DELETE /api/sales/:id                  | 204 No Content                         |
| A44     | Employees       | GET /api/employees                     | 200 OK + employee array                |
| A45     | Employees       | POST /api/employees                    | 201 Created + employee ID              |
| A46     | Employees       | PUT /api/employees/:id                 | 200 OK + updated employee              |
| A47     | Employees       | DELETE /api/employees/:id              | 204 No Content                         |
| A48     | Salaries        | GET /api/salaries                      | 200 OK + salaries array                |
| A49     | Salaries        | POST /api/salaries                     | 201 Created + salary ID                |
| A50     | Salaries        | PUT /api/salaries/:id                  | 200 OK + updated salary                |
| A51     | Salaries        | DELETE /api/salaries/:id               | 204 No Content                         |

#### Customer

| Test ID | Feature         | Request                                | Expected Response                      |
|---------|-----------------|----------------------------------------|----------------------------------------|
| A52     | Complaints      | GET /api/complaints                    | 200 OK + complaints array              |
| A53     | Complaints      | POST /api/complaints                   | 201 Created + complaint ID             |
| A54     | Complaints      | PUT /api/complaints/:id                | 200 OK + updated complaint             |
| A55     | Complaints      | DELETE /api/complaints/:id             | 204 No Content                         |
| A56     | Reviews         | GET /api/reviews                       | 200 OK + reviews array                 |
| A57     | Reviews         | POST /api/reviews                      | 201 Created + review ID                |
| A58     | Reviews         | PUT /api/reviews/:id                   | 200 OK + updated review                |
| A59     | Reviews         | DELETE /api/reviews/:id                | 204 No Content                         |
| A60     | Previous Purchase| GET /api/purchases                    | 200 OK + purchases array               |
| A61     | Previous Purchase| POST /api/purchases                   | 201 Created + purchase ID              |
| A62     | Previous Purchase| PUT /api/purchases/:id                | 200 OK + updated purchase              |
| A63     | Previous Purchase| DELETE /api/purchases/:id             | 204 No Content                         |
| A64     | Contact Us      | POST /api/contactus                    | 201 Created + message ID               |

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