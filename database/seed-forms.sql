USE dci_srms;
-- Run after schema.sql and seed.sql. Safe to re-run: it clears forms first.
DELETE FROM forms;

INSERT IGNORE INTO courses (course_code, course_title, units) VALUES
('CC101','Intro to Computing',3),
('CC102','Programming 1',3),
('IT201','Data Structures',3),
('IT301','Networking 1',3),
('CS302','Algorithms',3),
('GE101','Understanding the Self',3);

INSERT IGNORE INTO scholarships (name, amount) VALUES
('Academic (Deans Lister)',5000),
('CHED TES',20000),
('Mayors Scholarship',15000),
('Athletic',8000);

INSERT INTO forms (student_id, form_type, course_id, scholarship_id, academic_year, semester, details, date_filed, status) VALUES
((SELECT student_id FROM students WHERE student_no='2024-0001'),'drop',(SELECT course_id FROM courses WHERE course_code='CC101'),NULL,NULL,NULL,'Work conflict','2026-09-10','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0004'),'drop',(SELECT course_id FROM courses WHERE course_code='CC102'),NULL,NULL,NULL,'Failing grade','2026-09-11','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0006'),'drop',(SELECT course_id FROM courses WHERE course_code='IT201'),NULL,NULL,NULL,'Health','2026-09-12','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0009'),'drop',(SELECT course_id FROM courses WHERE course_code='IT301'),NULL,NULL,NULL,'Financial','2026-09-13','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0012'),'drop',(SELECT course_id FROM courses WHERE course_code='CS302'),NULL,NULL,NULL,'Work conflict','2026-09-14','Rejected'),
((SELECT student_id FROM students WHERE student_no='2024-0015'),'drop',(SELECT course_id FROM courses WHERE course_code='GE101'),NULL,NULL,NULL,'Failing grade','2026-09-15','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0018'),'drop',(SELECT course_id FROM courses WHERE course_code='CC101'),NULL,NULL,NULL,'Health','2026-09-16','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0003'),'loa',NULL,NULL,'2026-2027','1st Semester','Medical','2026-08-15','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0010'),'loa',NULL,NULL,'2026-2027','2nd Semester','Family','2026-08-16','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0021'),'loa',NULL,NULL,'2026-2027','1st Semester','Work','2026-08-17','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0030'),'loa',NULL,NULL,'2026-2027','2nd Semester','Financial','2026-08-18','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0002'),'scholarship',NULL,(SELECT scholarship_id FROM scholarships WHERE name='Academic (Deans Lister)'),NULL,NULL,NULL,'2026-08-20','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0005'),'scholarship',NULL,(SELECT scholarship_id FROM scholarships WHERE name='CHED TES'),NULL,NULL,NULL,'2026-08-21','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0007'),'scholarship',NULL,(SELECT scholarship_id FROM scholarships WHERE name='Mayors Scholarship'),NULL,NULL,NULL,'2026-08-22','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0011'),'scholarship',NULL,(SELECT scholarship_id FROM scholarships WHERE name='Athletic'),NULL,NULL,NULL,'2026-08-23','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0014'),'scholarship',NULL,(SELECT scholarship_id FROM scholarships WHERE name='Academic (Deans Lister)'),NULL,NULL,NULL,'2026-08-24','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0023'),'scholarship',NULL,(SELECT scholarship_id FROM scholarships WHERE name='CHED TES'),NULL,NULL,NULL,'2026-08-25','Rejected');