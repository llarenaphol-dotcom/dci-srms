-- Run after migration_forms_course.sql and seed_demo.sql. Safe to re-run: it clears forms first.
DELETE FROM forms;

INSERT IGNORE INTO courses (course_code, course_title, units) VALUES
('CC101','Intro to Computing',3),
('CC102','Programming 1',3),
('IT201','Data Structures',3),
('IT301','Networking 1',3),
('CS302','Algorithms',3),
('GE101','Understanding the Self',3);

INSERT INTO forms (student_id, course_id, form_type, details, amount, date_filed, status) VALUES
((SELECT student_id FROM students WHERE student_no='2024-0001'),(SELECT course_id FROM courses WHERE course_code='CC101'),'drop','Work conflict',NULL,'2026-09-10','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0004'),(SELECT course_id FROM courses WHERE course_code='CC102'),'drop','Failing grade',NULL,'2026-09-11','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0006'),(SELECT course_id FROM courses WHERE course_code='IT201'),'drop','Health',NULL,'2026-09-12','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0009'),(SELECT course_id FROM courses WHERE course_code='IT301'),'drop','Financial',NULL,'2026-09-13','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0012'),(SELECT course_id FROM courses WHERE course_code='CS302'),'drop','Work conflict',NULL,'2026-09-14','Rejected'),
((SELECT student_id FROM students WHERE student_no='2024-0015'),(SELECT course_id FROM courses WHERE course_code='GE101'),'drop','Failing grade',NULL,'2026-09-15','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0018'),(SELECT course_id FROM courses WHERE course_code='CC101'),'drop','Health',NULL,'2026-09-16','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0003'),NULL,'loa','1st Sem 26-27: Medical',NULL,'2026-08-15','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0010'),NULL,'loa','2nd Sem 26-27: Family',NULL,'2026-08-16','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0021'),NULL,'loa','1st Sem 26-27: Work',NULL,'2026-08-17','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0030'),NULL,'loa','2nd Sem 26-27: Financial',NULL,'2026-08-18','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0002'),NULL,'scholarship','Academic (Deans Lister)',5000,'2026-08-20','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0005'),NULL,'scholarship','CHED TES',20000,'2026-08-21','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0007'),NULL,'scholarship','Mayors Scholarship',15000,'2026-08-22','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0011'),NULL,'scholarship','Athletic',8000,'2026-08-23','Approved'),
((SELECT student_id FROM students WHERE student_no='2024-0014'),NULL,'scholarship','Academic (Deans Lister)',5000,'2026-08-24','Pending'),
((SELECT student_id FROM students WHERE student_no='2024-0023'),NULL,'scholarship','CHED TES',20000,'2026-08-25','Rejected');