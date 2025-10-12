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

| Test ID | Feature | Input | Expected Output | Actual Result | Status |
|--------|--------------------------|--------------------------|-----------------------------|------------------|--------|
| V1 | Email field validation | test@ | Error: "Enter valid email" | As expected | ✅ |
| V2 | Required field validation | Blank form submit | Error message shown | As expected | ✅ |
| V3 | Password strength | "123" | "Weak Password" shown | As expected | ✅ |
| V4 | Confirm password match | "pass123" vs "pass124" | Error shown | As expected | ✅ |
| V5 | Phone number validation | "abc123" | Error: "Enter valid phone number" | As expected | ✅ |
| V6 | Username length | "ab" | Error: "Username too short" | As expected | ✅ |
| V7 | Email uniqueness | "existing@mail.com" | Error: "Email already registered" | As expected | ✅ |
| V8 | Password length | "12345" | Error: "Password must be at least 8 characters" | As expected | ✅ |
| V9 | Special character in password | "password" | Error: "Include special character" | As expected | ✅ |
| V10 | Numeric-only password | "12345678" | Error: "Include letters" | As expected | ✅ |
| V11 | Name field validation | "John123" | Error: "Name must contain only letters" | As expected | ✅ |
| V12 | Address field required | Blank address | Error: "Address required" | As expected | ✅ |
| V13 | Product price validation | "-10" | Error: "Price must be positive" | As expected | ✅ |
| V14 | Date field validation | "32/13/2025" | Error: "Enter valid date" | As expected | ✅ |
| V15 | Terms acceptance | Unchecked | Error: "Accept terms to continue" | As expected | ✅ |

### B. Dynamic HTML Test Cases

| Test ID | Feature | Action | Expected Result | Actual Result | Status |
|--------|--------------------------|--------------------------|-----------------------------|------------------|--------|
| D1 | Add new product card dynamically | Submit form | Product card added to DOM without page reload | Works | ✅ |
| D2 | Update element dynamically | Change category filter | List updates instantly | Works | ✅ |
| D3 | Delete dynamic element | Click delete on product | Element removed from DOM | Works | ✅ |
| D4 | Add row to order table | Add item | Row appears in table | Works | ✅ |
| D5 | Remove row from table | Delete item | Row disappears | Works | ✅ |
| D6 | Show/hide password | Toggle icon | Password field visibility toggles | Works | ✅ |
| D7 | Expand/collapse FAQ | Click question | Answer toggles | Works | ✅ |
| D8 | Add review dynamically | Submit review | Review appears below product | Works | ✅ |
| D9 | Update cart count | Add to cart | Cart count updates | Works | ✅ |
| D10 | Show error message | Invalid input | Error message appears | Works | ✅ |
| D11 | Hide error message | Correct input | Error message disappears | Works | ✅ |
| D12 | Add employee card | Submit employee form | Card added to employee list | Works | ✅ |
| D13 | Update dashboard stats | New sale | Stats update instantly | Works | ✅ |
| D14 | Filter complaints | Select status | Complaint list updates | Works | ✅ |
| D15 | Dynamic pagination | Change page | New items load without reload | Works | ✅ |

### C. Async Data Handling (AJAX/Fetch/Axios) Test Cases

| Test ID | API / Function | Request | Expected Response | Actual Response | Network Verified | Status |
|--------|--------------------------|--------------------------|-----------------------------|------------------|-------------------|--------|
| A1 | GET /api/products | Fetch product list | 200 OK + product array | Verified in Network tab | Yes | ✅ |
| A2 | POST /api/order | Send order data | 201 Created + order ID | Verified | Yes | ✅ |
| A3 | PUT /api/product/:id | Update product | 200 OK + updated data | Verified | Yes | ✅ |
| A4 | DELETE /api/product/:id | Delete product | 204 No Content | Verified | Yes | ✅ |
| A5 | GET /api/customers | Fetch customer list | 200 OK + customer array | Verified | Yes | ✅ |
| A6 | POST /api/login | Login credentials | 200 OK + token | Verified | Yes | ✅ |
| A7 | GET /api/orders | Fetch orders | 200 OK + orders array | Verified | Yes | ✅ |
| A8 | POST /api/complaint | Submit complaint | 201 Created + complaint ID | Verified | Yes | ✅ |
| A9 | GET /api/messages | Fetch messages | 200 OK + messages array | Verified | Yes | ✅ |
| A10 | PUT /api/customer/:id | Update customer | 200 OK + updated data | Verified | Yes | ✅ |
| A11 | DELETE /api/employee/:id | Delete employee | 204 No Content | Verified | Yes | ✅ |
| A12 | GET /api/inventory | Fetch inventory | 200 OK + inventory array | Verified | Yes | ✅ |
| A13 | POST /api/signup | Register user | 201 Created + user ID | Verified | Yes | ✅ |
| A14 | GET /api/sales | Fetch sales data | 200 OK + sales array | Verified | Yes | ✅ |
| A15 | PUT /api/order/:id | Update order | 200 OK + updated order | Verified | Yes | ✅ |

## 5. Test Results Summary

- All validation, dynamic HTML, and async data handling cases passed.
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