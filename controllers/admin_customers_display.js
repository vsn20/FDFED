// customer.js
const customerData = [
    {
        cid: "C001",
        customer_first_name: "John",
        customer_last_name: "Doe",
        customer_ph_no: "9876543210",
        profit_from_customer: "Rs.70000"
    },
    {
        cid: "C002",
        customer_first_name: "Priya",
        customer_last_name: "Sharma",
        customer_ph_no: "9123456789",
        profit_from_customer: "Rs.55000"
    },
    {
        cid: "C003",
        customer_first_name: "Michael",
        customer_last_name: "Brown",
        customer_ph_no: "9988776655",
        profit_from_customer: "Rs.40000"
    },
    {
        cid: "C004",
        customer_first_name: "Aisha",
        customer_last_name: "Khan",
        customer_ph_no: "9456789123",
        profit_from_customer: "Rs.30000"
    },
    {
        cid: "C005",
        customer_first_name: "Robert",
        customer_last_name: "Smith",
        customer_ph_no: "9871234567",
        profit_from_customer: "Rs.27000"
    },
    {
        cid: "C006",
        customer_first_name: "Sofia",
        customer_last_name: "Garcia",
        customer_ph_no: "9765432109",
        profit_from_customer: "Rs.10000"
    }
];

async function customers_display(req, res) {
    try {
        const activeCustomers = customerData;
        res.render("owner/customer_feature/customer_admin", {
            customerData: activeCustomers,
            activePage: 'employee',
            activeRoute: 'customers'
        });
    } catch (error) {
        console.error("Error rendering customers:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { customerData, customers_display };

//removed trailing commas and added missing semicolons
//added fetch api functionality to admin_customers_display.ejs