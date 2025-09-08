const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error connecting to SQLite in-memory database:', err.message);
    } else {
        console.log('Connected to SQLite in-memory database');
    }
});

db.serialize(() => {
    // Existing sales_manager_sales table
    db.run(`
        CREATE TABLE IF NOT EXISTS sales_manager_sales (
            sales_id INTEGER PRIMARY KEY AUTOINCREMENT,
            branch_name TEXT NOT NULL,
            salesman_name TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            saledate TEXT NOT NULL,
            price REAL NOT NULL,
            profit_loss REAL NOT NULL,
            phone_number TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating sales_manager_sales table:', err.message);
        } else {
            console.log('sales_manager_sales table created successfully');
        }
    });

    const salesStmt = db.prepare(`
        INSERT INTO sales_manager_sales (branch_name, salesman_name, customer_name, product_name, quantity, total_amount, saledate, price, profit_loss, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    salesStmt.run('Hyderabad Branch', 'Rajesh Kumar', 'Alice Smith', 'LED TV', 5, 5000.00, '2025-03-15', 1000.00, 500.00, '9876543210');
    salesStmt.run('Hyderabad Branch', 'Priya Sharma', 'Bob Johnson', 'Washing Machine', 3, 3600.00, '2025-03-16', 1200.00, 300.00, '9876543211');
    salesStmt.run('Hyderabad Branch', 'Vikram Singh', 'Emma Davis', 'Refrigerator', 2, 2400.00, '2025-03-17', 1200.00, -100.00, '9876543212');
    salesStmt.finalize();

    // New orders table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            branch_name TEXT NOT NULL,
            company_name TEXT NOT NULL,
            product_name TEXT NOT NULL,
            status TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            ordered_date TEXT NOT NULL,
            expected_delivery_date TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating orders table:', err.message);
        } else {
            console.log('orders table created successfully');
        }
    });

    const orderStmt = db.prepare(`
        INSERT INTO orders (branch_name, company_name, product_name, status, quantity, ordered_date, expected_delivery_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    orderStmt.run('Hyderabad Branch', 'TechCorp', 'Smartphone', 'pending', 10, '2025-03-15', null);
    orderStmt.run('Hyderabad Branch', 'ElectroMart', 'Laptop', 'shipped', 5, '2025-03-16', '2025-03-20');
    orderStmt.run('Hyderabad Branch', 'GadgetZone', 'Tablet', 'delivered', 8, '2025-03-14', null);
    orderStmt.finalize();

    console.log('Dummy data inserted successfully');
});

module.exports = db;