import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Clear existing data to ensure a clean state
    await prisma.$transaction([
      prisma.customer.deleteMany(),
      prisma.product.deleteMany(),
      prisma.lead.deleteMany(),
      prisma.amc.deleteMany(),
      prisma.appointment.deleteMany(),
      prisma.inventoryItem.deleteMany(),
      prisma.installation.deleteMany(),
      prisma.technician.deleteMany(),
    ]);

    // Create Customers
    await prisma.customer.createMany({
      data: [
        { name: 'Rahul Sharma', phone: '+91 98765 43210', address: 'Sector 14, Gurugram, Haryana', status: 'Active' },
        { name: 'Priya Verma', phone: '+91 98765 11111', address: 'Vasant Kunj, New Delhi', status: 'Inactive' },
        { name: 'Vikash Patel', phone: '+91 98765 22222', address: 'DLF Phase 3, Gurugram', status: 'Active' },
        { name: 'Sunil Yadav', phone: '+91 98765 33333', address: 'Rohini Sector 7, Delhi', status: 'Active' },
        { name: 'Amit Kumar', phone: '+91 98765 44444', address: 'Indirapuram, Ghaziabad', status: 'Inactive' },
        { name: 'Neha Singh', phone: '+91 98765 55555', address: 'Noida Sector 62, UP', status: 'Active' },
      ],
    });

    // Create Products (Includes RO Machines and AMC Plans)
    await prisma.product.createMany({
      data: [
        // RO Machines
        { 
          name: 'SardarJi Classic RO', 
          sku: 'SRO-CLS-01', 
          category: 'Domestic RO', 
          price: 12500, 
          purchasePrice: 8500,
          stock: 18,
          image: 'https://images.unsplash.com/photo-1618506469810-2fc2a1d86b3f?w=300&q=80',
          status: 'Active' 
        },
        { 
          name: 'SardarJi Premium RO', 
          sku: 'SRO-PRM-02', 
          category: 'Domestic RO', 
          price: 16500, 
          purchasePrice: 11000,
          stock: 12,
          image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300&q=80',
          status: 'Active' 
        },
        { 
          name: 'Pure Water RO Max', 
          sku: 'PWR-MAX-01', 
          category: 'Commercial RO', 
          price: 24000, 
          purchasePrice: 17500,
          stock: 5,
          image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=300&q=80',
          status: 'Active' 
        },
        { 
          name: 'Alkaline Copper Filter', 
          sku: 'FLT-ALK-01', 
          category: 'Accessories', 
          price: 1200, 
          purchasePrice: 750,
          stock: 45,
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&q=80',
          status: 'Active' 
        },
        { 
          name: 'SardarJi Eco Water Purifier', 
          sku: 'SRO-ECO-03', 
          category: 'Domestic RO', 
          price: 9500, 
          purchasePrice: 6500,
          stock: 22,
          image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=300&q=80',
          status: 'Active' 
        },
        { 
          name: 'Heavy Duty 50LPH RO', 
          sku: 'COM-50L-01', 
          category: 'Commercial RO', 
          price: 35000, 
          purchasePrice: 26000,
          stock: 2,
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
          status: 'Discontinued' 
        },
        // AMC Plans
        { 
          name: 'Basic 1-Year AMC', 
          sku: 'AMC-BSC-1Y', 
          category: 'AMC Plan', 
          price: 1500, 
          purchasePrice: 500,
          stock: 999, // AMC plans have unlimited or high stock
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&q=80',
          status: 'Active' 
        },
        { 
          name: 'Premium 1-Year AMC', 
          sku: 'AMC-PRM-1Y', 
          category: 'AMC Plan', 
          price: 2500, 
          purchasePrice: 800,
          stock: 999,
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&q=80',
          status: 'Active' 
        },
        { 
          name: 'Standard 2-Year AMC', 
          sku: 'AMC-STD-2Y', 
          category: 'AMC Plan', 
          price: 3000, 
          purchasePrice: 1000,
          stock: 999,
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&q=80',
          status: 'Active' 
        },
      ],
    });

    // Create Leads
    await prisma.lead.createMany({
      data: [
        { name: 'Kunal Bhatia', phone: '+91 98765 00000', source: 'Website Form', status: 'New', rep: 'Unassigned', date: new Date('2024-05-26') },
        { name: 'Pooja Sharma', phone: '+91 98765 11111', source: 'Facebook Ad', status: 'Contacted', rep: 'Ramesh Singh', date: new Date('2024-05-26') },
        { name: 'Suresh Gupta', phone: '+91 98765 22222', source: 'Referral', status: 'Converted', rep: 'Anjali Verma', date: new Date('2024-05-25') },
        { name: 'Deepak Tiwari', phone: '+91 98765 33333', source: 'Direct Call', status: 'Dead', rep: 'Ramesh Singh', date: new Date('2024-05-24') },
        { name: 'Kavita Reddy', phone: '+91 98765 44444', source: 'Website Form', status: 'Contacted', rep: 'Anjali Verma', date: new Date('2024-05-23') },
      ],
    });

    // Create AMC contracts
    await prisma.amc.createMany({
      data: [
        { id: 'AMC-5091', customerName: 'Priya Verma', customerPhone: '+91 98765 11111', address: 'Vasant Kunj, New Delhi', plan: 'Premium 1-Year AMC', startDate: new Date('2024-01-10'), endDate: new Date('2025-01-09'), status: 'Active', payment: 'Paid', totalAmount: 2500, amountPaid: 2500, balanceDue: 0 },
        { id: 'AMC-5092', customerName: 'Rahul Sharma', customerPhone: '+91 98765 43210', address: 'Sector 14, Gurugram', plan: 'Standard 2-Year AMC', startDate: new Date('2022-06-15'), endDate: new Date('2024-06-14'), status: 'Expiring Soon', payment: 'Paid', totalAmount: 3000, amountPaid: 3000, balanceDue: 0 },
        { id: 'AMC-5093', customerName: 'Sunil Yadav', customerPhone: '+91 98765 33333', address: 'Rohini Sector 7, Delhi', plan: 'Basic 1-Year AMC', startDate: new Date('2023-05-05'), endDate: new Date('2024-05-04'), status: 'Expired', payment: 'Pending', totalAmount: 1500, amountPaid: 0, balanceDue: 1500 },
        { id: 'AMC-5094', customerName: 'Neha Singh', customerPhone: '+91 98765 55555', address: 'Noida Sector 62, UP', plan: 'Premium 1-Year AMC', startDate: new Date('2024-05-20'), endDate: new Date('2025-05-19'), status: 'Active', payment: 'Paid', totalAmount: 2500, amountPaid: 2500, balanceDue: 0 },
        { id: 'AMC-5095', customerName: 'Amit Kumar', customerPhone: '+91 98765 44444', address: 'Indirapuram, Ghaziabad', plan: 'Standard 1-Year AMC', startDate: new Date('2023-07-01'), endDate: new Date('2024-06-30'), status: 'Expiring Soon', payment: 'Paid', totalAmount: 2000, amountPaid: 2000, balanceDue: 0 },
        { id: 'AMC-5096', customerName: 'Vikash Patel', customerPhone: '+91 98765 22222', address: 'DLF Phase 3, Gurugram', plan: 'Basic 2-Year AMC', startDate: new Date('2022-04-12'), endDate: new Date('2024-04-11'), status: 'Expired', payment: 'Paid', totalAmount: 2000, amountPaid: 2000, balanceDue: 0 },
      ],
    });

    // Create Appointments
    await prisma.appointment.createMany({
      data: [
        { id: 'APT-4010', customerName: 'Priya Verma', customerPhone: '+91 98765 11111', address: 'Vasant Kunj, New Delhi', type: 'Installation', tech: 'Ravi Kumar', date: new Date('2024-05-24'), time: '01:30 PM', status: 'Scheduled' },
        { id: 'APT-4011', customerName: 'Vikash Patel', customerPhone: '+91 98765 22222', address: 'DLF Phase 3, Gurugram', type: 'Repair Service', tech: 'Suresh Prajapati', date: new Date('2024-05-24'), time: '10:00 AM', status: 'In Progress' },
        { id: 'APT-4012', customerName: 'Sunil Yadav', customerPhone: '+91 98765 33333', address: 'Rohini Sector 7, Delhi', type: 'AMC Visit', tech: 'Mohit Yadav', date: new Date('2024-05-23'), time: '12:00 PM', status: 'Completed' },
        { id: 'APT-4013', customerName: 'Neha Singh', customerPhone: '+91 98765 55555', address: 'Noida Sector 62, UP', type: 'Routine Maintenance', tech: 'Unassigned', date: new Date('2024-05-25'), time: '04:00 PM', status: 'Pending' },
        { id: 'APT-4014', customerName: 'Amit Kumar', customerPhone: '+91 98765 44444', address: 'Indirapuram, Ghaziabad', type: 'Repair Service', tech: 'Unassigned', date: new Date('2024-05-25'), time: '11:00 AM', status: 'Pending' },
        { id: 'APT-4015', customerName: 'Rahul Sharma', customerPhone: '+91 98765 43210', address: 'Sector 14, Gurugram', type: 'Installation', tech: 'Arjun Singh', date: new Date('2024-05-22'), time: '02:30 PM', status: 'Cancelled' },
      ],
    });

    // Create Inventory Items (Equipments / Parts)
    await prisma.inventoryItem.createMany({
      data: [
        { id: 'INV-101', item: 'Spun Filter 10 inch', sku: 'FLT-SPUN-10', category: 'Consumables', price: 150, stock: 145, reorder: 50, status: 'In Stock' },
        { id: 'INV-102', item: 'RO Membrane 75 GPD', sku: 'MEM-75G-01', category: 'Spare Parts', price: 1200, stock: 12, reorder: 20, status: 'Low Stock' },
        { id: 'INV-103', item: 'Booster Pump 100 GPD', sku: 'PMP-100G-02', category: 'Spare Parts', price: 1500, stock: 45, reorder: 15, status: 'In Stock' },
        { id: 'INV-104', item: 'Inline Carbon Filter', sku: 'FLT-CRB-IN', category: 'Consumables', price: 300, stock: 0, reorder: 30, status: 'Out of Stock' },
        { id: 'INV-105', item: 'Solenoid Valve (SV)', sku: 'VLV-SOL-01', category: 'Electricals', price: 450, stock: 8, reorder: 25, status: 'Low Stock' },
        { id: 'INV-106', item: 'SMPS Power Supply', sku: 'PWR-SMP-24', category: 'Electricals', price: 600, stock: 34, reorder: 10, status: 'In Stock' },
      ],
    });

    // Create Installations
    await prisma.installation.createMany({
      data: [
        { id: 'INS-2051', customerName: 'Rahul Sharma', customerPhone: '+91 98765 43210', address: 'Sector 14, Gurugram', model: 'Pure Water RO X1', tech: 'Arjun Singh', date: new Date('2024-05-24'), time: '10:00 AM', status: 'Scheduled' },
        { id: 'INS-2052', customerName: 'Priya Verma', customerPhone: '+91 98765 11111', address: 'Vasant Kunj, New Delhi', model: 'SardarJi Classic', tech: 'Ravi Kumar', date: new Date('2024-05-24'), time: '01:30 PM', status: 'In Progress' },
        { id: 'INS-2053', customerName: 'Amit Kumar', customerPhone: '+91 98765 44444', address: 'Indirapuram, Ghaziabad', model: 'Pure Water RO Max', tech: 'Mohit Yadav', date: new Date('2024-05-23'), time: '11:00 AM', status: 'Completed' },
        { id: 'INS-2054', customerName: 'Neha Singh', customerPhone: '+91 98765 55555', address: 'Noida Sector 62, UP', model: 'SardarJi Premium', tech: 'Unassigned', date: new Date('2024-05-25'), time: '04:00 PM', status: 'Pending' },
        { id: 'INS-2055', customerName: 'Vikash Patel', customerPhone: '+91 98765 22222', address: 'DLF Phase 3, Gurugram', model: 'Pure Water RO X1', tech: 'Suresh Prajapati', date: new Date('2024-05-22'), time: '09:30 AM', status: 'Completed' },
        { id: 'INS-2056', customerName: 'Sunil Yadav', customerPhone: '+91 98765 33333', address: 'Rohini Sector 7, Delhi', model: 'SardarJi Classic', tech: 'Arjun Singh', date: new Date('2024-05-26'), time: '12:00 PM', status: 'Scheduled' },
      ],
    });

    // Create Technicians
    await prisma.technician.createMany({
      data: [
        { id: 'TECH-01', name: 'Arjun Singh', phone: '+91 98765 10001', spec: 'Installation & Repair', status: 'On Duty', rating: 4.9, activeJobs: 3 },
        { id: 'TECH-02', name: 'Ravi Kumar', phone: '+91 98765 10002', spec: 'Filter Changes', status: 'On Duty', rating: 4.8, activeJobs: 5 },
        { id: 'TECH-03', name: 'Suresh Prajapati', phone: '+91 98765 10003', spec: 'Commercial RO Specialist', status: 'Off Duty', rating: 4.6, activeJobs: 0 },
        { id: 'TECH-04', name: 'Mohit Yadav', phone: '+91 98765 10004', spec: 'General Maintenance', status: 'On Duty', rating: 4.7, activeJobs: 2 },
      ],
    });

    return NextResponse.json({ message: 'Database cleared and seeded successfully!' });
  } catch (error) {
    console.error('Seeding failed:', error);
    return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 });
  }
}
