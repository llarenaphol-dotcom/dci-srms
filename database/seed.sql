-- Seed data (demo logins: admin/admin123, staff/staff123, dean/dean123)
-- INSERT INTO users (username, password_hash, full_name, role) VALUES
-- ('admin', '$2y$10$4O.CRdz.sC/2N7jT1CepReAiufUvOiY3cxTjPfJT2EcrC41EHj5GW', 'Maria Santos', 'admin'),
-- ('staff', '$2y$10$JB1X192dr.DI7npwgkjQ2O/sPgHaEGRaBEhscP0sFA8dBx17hW5GW', 'Jose Reyes', 'staff'),
-- ('dean',  '$2y$10$r/Jn.V.IV1sqPRUXaNE8yuUyAIneMZ1oJhe4pCgy3l/XrkVyX9bE6', 'Dr. Elena Villanueva', 'dean');

-- INSERT INTO programs (program_code, program_name) VALUES
-- ('BSCS', 'Bachelor of Science in Computer Science'),
-- ('BSIT', 'Bachelor of Science in Information Technology');

-- Demo data for dci_srms. Run after schema.sql.
USE dci_srms;

INSERT IGNORE INTO programs (program_code, program_name) VALUES ('BSCS','BS Computer Science'),('BSIT','BS Information Technology');

INSERT INTO students (student_no, first_name, last_name, email, program_id, year_level, standing, status) VALUES
('2024-0001','Juan','Santos','juan.santos@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),3,'Regular','Transferred'),
('2024-0002','Maria','Reyes','maria.reyes@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),1,'Regular','Active'),
('2024-0003','Jose','Cruz','jose.cruz@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),3,'Irregular','Active'),
('2024-0004','Ana','Bautista','ana.bautista@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),2,'Regular','Active'),
('2024-0005','Mark','Ocampo','mark.ocampo@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),3,'Regular','Active'),
('2024-0006','Joy','Garcia','joy.garcia@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),2,'Regular','Transferred'),
('2024-0007','Paolo','Mendoza','paolo.mendoza@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),1,'Irregular','Active'),
('2024-0008','Grace','Torres','grace.torres@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),2,'Irregular','Active'),
('2024-0009','Carlo','Flores','carlo.flores@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),3,'Regular','Active'),
('2024-0010','Kim','Ramos','kim.ramos@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),1,'Irregular','Active'),
('2024-0011','Ella','Aquino','ella.aquino@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),2,'Regular','Active'),
('2024-0012','Rico','Castro','rico.castro@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),1,'Irregular','Active'),
('2024-0013','Nina','Rivera','nina.rivera@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),2,'Regular','Active'),
('2024-0014','Luis','Navarro','luis.navarro@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),3,'Regular','Active'),
('2024-0015','Bea','Villanueva','bea.villanueva@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),1,'Irregular','Active'),
('2024-0016','Miguel','Dela Cruz','miguel.delacruz@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),4,'Irregular','Transferred'),
('2024-0017','Tina','Soriano','tina.soriano@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),3,'Regular','Dropped'),
('2024-0018','Ramon','Pascual','ramon.pascual@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),3,'Regular','Active'),
('2024-0019','Jenny','Salazar','jenny.salazar@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),2,'Regular','Active'),
('2024-0020','Dino','Domingo','dino.domingo@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),2,'Irregular','Dropped'),
('2024-0021','Lara','Lim','lara.lim@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),3,'Regular','Active'),
('2024-0022','Noel','Tan','noel.tan@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),1,'Regular','Transferred'),
('2024-0023','Sofia','Perez','sofia.perez@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),2,'Regular','Active'),
('2024-0024','Enzo','Gonzales','enzo.gonzales@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),4,'Regular','Active'),
('2024-0025','Faye','Aguilar','faye.aguilar@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),1,'Irregular','Active'),
('2024-0026','Gab','Marquez','gab.marquez@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),3,'Regular','Dropped'),
('2024-0027','Hannah','Valdez','hannah.valdez@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),4,'Regular','Active'),
('2024-0028','Ian','Santiago','ian.santiago@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),2,'Regular','Active'),
('2024-0029','Jade','Mercado','jade.mercado@example.com',(SELECT program_id FROM programs WHERE program_code='BSCS'),1,'Regular','Dropped'),
('2024-0030','Kyle','Fernandez','kyle.fernandez@example.com',(SELECT program_id FROM programs WHERE program_code='BSIT'),2,'Regular','Active');

INSERT INTO forms (student_id, form_type, details, amount, date_filed, status) VALUES
((SELECT student_id FROM students WHERE student_no='2024-0001'),'drop','Dropping a subject',NULL,'2024-01-10','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0002'),'drop','Dropping a subject',NULL,'2024-02-11','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0003'),'drop','Dropping a subject',NULL,'2024-03-12','Rejected'),
((SELECT student_id FROM students WHERE student_no='2024-0004'),'loa','Medical leave',NULL,'2024-04-13','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0005'),'loa','Family reasons',NULL,'2024-05-14','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0006'),'loa','Work commitments',NULL,'2024-06-15','Rejected'),
((SELECT student_id FROM students WHERE student_no='2024-0007'),'scholarship','Academic scholarship',15000,'2024-07-16','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0008'),'scholarship','Financial aid',8000,'2024-08-17','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0009'),'scholarship','Deans lister grant',12000,'2024-09-18','Rejected'),
((SELECT student_id FROM students WHERE student_no='2024-0010'),'scholarship','Tuition discount',5000,'2024-01-10','Pending');