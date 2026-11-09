CREATE DATABASE IF NOT EXISTS dci_srms CHARACTER SET utf8mb4;
USE dci_srms;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin','staff','dean') NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_code VARCHAR(50) NOT NULL UNIQUE,
    program_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    course_title VARCHAR(100) NOT NULL,
    units INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_no VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    year_level TINYINT NOT NULL,
    program_id INT NOT NULL,
    standing ENUM('Regular','Irregular') NOT NULL DEFAULT 'Regular',
    status ENUM('Active','Transferred','Dropped') NOT NULL DEFAULT 'Active',
    CONSTRAINT fk_student_program FOREIGN KEY (program_id)
        REFERENCES programs(program_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sections (
    section_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    UNIQUE (course_id, academic_year, semester, section_name),
    CONSTRAINT fk_section_course FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    section_id INT NOT NULL,
    grade DECIMAL(4,2) DEFAULT NULL,
    enrollment_status ENUM('Enrolled','Dropped','Completed') NOT NULL DEFAULT 'Enrolled',
    UNIQUE (student_id, section_id),
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_enrollment_section FOREIGN KEY (section_id)
        REFERENCES sections(section_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Each scholarship has one fixed amount, so the amount lives here, not on every form.
CREATE TABLE scholarships (
    scholarship_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Columns per form_type: drop = course_id + details, loa = academic_year + semester + details,
-- scholarship = scholarship_id. details only ever holds the reason.
CREATE TABLE forms (
    form_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    form_type ENUM('drop','loa','scholarship') NOT NULL,
    course_id INT NULL,
    scholarship_id INT NULL,
    academic_year VARCHAR(20) NULL,
    semester ENUM('1st Semester','2nd Semester') NULL,
    details VARCHAR(255) NULL,
    date_filed DATE NOT NULL,
    status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_form_student FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_form_course FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_form_scholarship FOREIGN KEY (scholarship_id)
        REFERENCES scholarships(scholarship_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;