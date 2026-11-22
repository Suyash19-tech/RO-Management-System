-- Bulk seed for load testing (local docker Postgres only).
INSERT INTO "Customer"(id,name,phone,address,status,"joinDate","createdAt","updatedAt")
SELECT 'c'||g,'Customer '||g,'+91'||(9000000000+g),'Address '||g||', Gurugram','Active',now()-(g%365||' days')::interval,now()-(g%365||' days')::interval,now()
FROM generate_series(1,5000) g;

INSERT INTO "Product"(id,name,sku,category,price,"purchasePrice",stock,threshold,status,"createdAt","updatedAt")
SELECT 'p'||g,'RO Model '||g,'SKU-'||g,(ARRAY['Domestic RO','Commercial RO','Spares'])[1+g%3],5000+g*10,3000+g*5,g%50,5,'Active',now(),now()
FROM generate_series(1,200) g;

INSERT INTO "Appointment"(id,"customerName","customerPhone",address,type,tech,date,time,status,"costCharged","paymentStatus","createdAt","updatedAt")
SELECT 'a'||g,'Customer '||(1+g%5000),'+91'||(9000000000+1+g%5000),'Address','Repair Service','Tech '||(g%8),
 now()-((g%365)||' days')::interval,'10:30 AM',(ARRAY['Scheduled','Completed','Pending','In Progress'])[1+g%4],(g%20)*100,'Paid',now(),now()
FROM generate_series(1,20000) g;

INSERT INTO "Installation"(id,"customerName","customerPhone",address,model,"totalPrice","amountPaid",tech,date,time,status,"createdAt","updatedAt")
SELECT 'i'||g,'Customer '||(1+g%5000),'+91'||(9000000000+1+g%5000),'Address','RO Model '||(1+g%200),12000+(g%10)*500,12000,'Tech '||(g%8),
 now()-((g%365)||' days')::interval,'11:00 AM',(ARRAY['Completed','Pending','Scheduled'])[1+g%3],now(),now()
FROM generate_series(1,8000) g;

INSERT INTO "Amc"(id,"customerName","customerPhone",address,plan,"startDate","endDate",status,"totalAmount","amountPaid","createdAt","updatedAt")
SELECT 'm'||g,'Customer '||(1+g%5000),'+91'||(9000000000+1+g%5000),'Address','Gold',now()-interval '100 days',now()+((g%300)||' days')::interval,'Active',3000,3000,now(),now()
FROM generate_series(1,6000) g;

INSERT INTO "Technician"(id,name,phone,spec,"createdAt","updatedAt")
SELECT 't'||g,'Tech '||g,'+91'||(8000000000+g),'RO Service',now(),now() FROM generate_series(0,7) g;
