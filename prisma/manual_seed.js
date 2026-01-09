/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../dev.db');
const db = new Database(dbPath);

console.log('Seeding database manually via raw SQL...');

async function main() {
    const password = await bcrypt.hash('password123', 12);
    const now = new Date().toISOString();

    // Create Users
    const insertUser = db.prepare(`
    INSERT OR IGNORE INTO User (id, email, name, password, role, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    const insertProfile = db.prepare(`
    INSERT OR IGNORE INTO UserProfile (id, userId, phone, designation, department, salary, status, joinDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    // Admin
    const adminId = 'cmadmin001';
    insertUser.run(adminId, 'admin@bhunethri.in', 'Super Admin', password, 'ADMIN', now, now);
    insertProfile.run('pfadmin001', adminId, '+91 8884050999', 'Director', 'Management', null, 'Active', now);

    // Architect
    const archId = 'cmarch001';
    insertUser.run(archId, 'architect@bhunethri.in', 'Sneha Reddy', password, 'ARCHITECT', now, now);
    insertProfile.run('pfarch001', archId, '+91 9876543210', 'Senior Architect', 'Design', 75000, 'Active', now);

    // Sales
    const salesId = 'cmsales001';
    insertUser.run(salesId, 'sales@bhunethri.in', 'Sales Manager', password, 'SALES', now, now);
    insertProfile.run('pfsales001', salesId, '+91 7766554433', 'Sales Head', 'Sales', 50000, 'Active', now);

    console.log('Users seeded.');

    // Projects
    const insertProject = db.prepare(`
    INSERT OR IGNORE INTO Project (id, name, location, status, type, unitsTotal, unitsSold, image, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertProject.run('pj001', 'Lakshmi Nivas', 'K R Pura, Bangalore', 'Completed', 'Apartment', 20, 18, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000', now, now);
    insertProject.run('pj002', 'Varnasi Layout', 'Varnasi, Bangalore', 'In Progress', 'Plot', 50, 12, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000', now, now);

    console.log('Projects seeded.');

    // Customers
    const insertCustomer = db.prepare(`
    INSERT OR IGNORE INTO Customer (id, name, email, phone, status, purchasedUnit, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const custId = 'cust001';
    insertCustomer.run(custId, 'Rahul Sharma', 'rahul.s@gmail.com', '+91 9988776655', 'Customer', 'Flat 101 - Lakshmi Nivas', now, now);

    console.log('Customers seeded.');

    // Invoices
    const insertInvoice = db.prepare(`
    INSERT OR IGNORE INTO Invoice (id, invoiceNo, customerId, amount, status, dueDate, issuedDate, items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertInvoice.run('inv001', 'INV-2024-001', custId, 250000, 'Paid', now, now, JSON.stringify([{ desc: 'Booking Amount', amount: 250000 }]));

    console.log('Invoices seeded.');
    console.log('Database seeding completed successfully.');
}

main().catch(console.error);
