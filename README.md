# DCI Student Record Management System (SRMS)

A course project for **Web Design & Programming** that demonstrates a role-based student records web application using HTML, CSS, JavaScript, PHP, and MySQL.

The system provides:

- Admin account management
- Staff student and form management
- Dean dashboard summaries and charts
- Session-based authentication
- Role-based page and API authorization
- MySQL database relationships

---

## 1. Requirements

Install the following before setup:

- [XAMPP](https://www.apachefriends.org/) with **Apache** and **MySQL/MariaDB**
- A modern web browser such as Chrome, Edge, or Firefox
- A text editor, such as Visual Studio Code

Recommended minimum versions:

- PHP 8.0 or newer
- MySQL 8 or MariaDB 10.4

No JavaScript package installation is required. Chart.js is loaded by CDN.

---

## 2. Project Structure

```text
dci-srms/
|-- api/                 PHP API endpoints
|-- assets/
|   |-- css/             Shared CSS
|   `-- js/              Frontend JavaScript
|-- config/db.php        Database connection
|-- database/
|   |-- schema.sql       Database tables
|   |-- seed.sql         Demo accounts, programs, and students
|   `-- seed-forms.sql   Sample courses, scholarships, and forms
|-- includes/auth.php    Sessions and role authorization
|-- *.html               User-facing pages
`-- README.md            Setup instructions
```

---

## 3. Put the Project in XAMPP

Place the project inside XAMPP's web directory:

```text
C:\xampp\htdocs\dci-srms
```

Alternatively, copy or clone the repository into `C:\xampp\htdocs\`.

The project folder name must be `dci-srms` because the setup URL will use that name.

---

## 4. Start XAMPP

1. Open the XAMPP Control Panel.
2. Start **Apache**.
3. Start **MySQL**.
4. Check that Apache uses port `80` and MySQL uses port `3306`.

If Apache or MySQL does not start, close programs that use their ports and restart XAMPP.

---

## 5. Create and Seed the Database

### Option A: Using phpMyAdmin

1. Open `http://localhost/phpmyadmin`.
2. Click **Import**.
3. Import `database/schema.sql`.
4. Import `database/seed.sql`.
5. Import `database/seed-forms.sql`.
6. Confirm that the database `dci_srms` appears in the left sidebar.

Import the SQL files in this exact order:

```text
schema.sql
seed.sql
seed-forms.sql
```

### Option B: Importing with MySQL commands

From the project folder, run:

```bat
"C:\xampp\mysql\bin\mysql.exe" -u root < database\schema.sql
"C:\xampp\mysql\bin\mysql.exe" -u root dci_srms < database\seed.sql
"C:\xampp\mysql\bin\mysql.exe" -u root dci_srms < database\seed-forms.sql
```

---

## 6. Configure the Database Connection

The default configuration in `config/db.php` matches a standard XAMPP installation:

```php
mysql:host=localhost;dbname=dci_srms;charset=utf8mb4
username: root
password: empty
```

Change the connection values only if your MySQL installation has a different database name, username, or password.

---

## 7. Run the Project

Open:

```text
http://localhost/dci-srms/login.html
```

Keep the project open through a localhost URL. Opening an HTML file directly, for example with a `file://` URL, will prevent the PHP APIs from working correctly.

---

## 8. Demo Accounts

| Role | Username | Password | Opens |
|---|---|---|---|
| Admin | `admin` | `admin123` | Account Management |
| Staff | `staff` | `staff123` | Students |
| Dean | `dean` | `dean123` | Dashboard |

These accounts are intended for course demonstration and local development.

---

## 9. Role Features

### Administrator

- Views system accounts
- Adds accounts
- Changes user roles
- Resets passwords
- Removes other accounts

### Staff

- Views student records
- Searches and filters students
- Adds, updates, or removes student records
- Views student request forms
- Adds, edits, and deletes subjects (a subject used by any form cannot be deleted)

### Dean

- Views student totals
- Views the student dashboard
- Views enrollment status and program summaries
- Views pending and categorized request forms

---

## 10. Technology Used

| Area | Technology |
|---|---|
| Structure | HTML5 |
| Interface styling | Tailwind CSS |
| Client behavior | JavaScript |
| Server logic | PHP |
| Database | MySQL/MariaDB |
| Database access | PDO and prepared statements |
| Charts | Chart.js |
| Local hosting | XAMPP Apache |

---

## 11. How the Application Works

```text
HTML page
   -> JavaScript fetch request
   -> PHP file in api/
   -> PDO database connection
   -> MySQL query
   -> JSON response
   -> HTML table, dialog, or chart
```

For example, loading the dean dashboard:

1. `dashboard.html` loads `dashboard.js`.
2. `dashboard.js` requests `api/stats.php`.
3. `api/stats.php` verifies the dean session and queries MySQL.
4. PHP returns summary and chart data as JSON.
5. Chart.js displays the result in browser canvases.

---

## 12. Database Reset

To reset the project database during testing (also required after schema changes):

1. Open phpMyAdmin and run in the **SQL** tab:

   ```sql
   DROP DATABASE IF EXISTS dci_srms;
   ```

2. Import the SQL files again:
   - `database/schema.sql`
   - `database/seed.sql`
   - `database/seed-forms.sql`

Dropping the database removes all locally added accounts, students, and forms.

---

## 13. Database Design

The tables are in third normal form (3NF): every column holds one value and depends only on its table's key.

| Table | Holds |
|---|---|
| `users` | Login accounts and roles |
| `programs` | Degree programs |
| `students` | Student records, linked to a program |
| `courses` | Subjects |
| `scholarships` | Scholarship names and their fixed amounts |
| `forms` | Drop, leave of absence, and scholarship requests |

`forms` columns by type:

- **drop**: `course_id`, `details` (reason)
- **loa**: `academic_year`, `semester`, `details` (reason)
- **scholarship**: `scholarship_id` (the amount comes from `scholarships`)

---

## 14. Troubleshooting

### Database connection failed

- Confirm Apache and MySQL are running.
- Confirm the database is named `dci_srms`.
- Reimport `database/schema.sql`.
- Verify the database values in `config/db.php`.

### Wrong username or password

- Use one of the demo accounts listed above.
- Ensure `seed.sql` completed without errors.
- Reimport the seed data after resetting the database.

### Page stays on the login screen

- Open through `http://localhost/dci-srms/...`.
- Check that PHP sessions are enabled.
- Clear the browser cookies for localhost and sign in again.

### Tables show loading or empty states

- Confirm MySQL is running.
- Confirm the schema and seed SQL files were imported.
- Refresh the page with `Ctrl + F5`.
- Open browser Developer Tools and check the Network tab for an API error.

### PHP shows 404 for API files

- Confirm the project folder is in `C:\xampp\htdocs\`.
- Confirm the project folder name is `dci-srms`.
- Confirm the endpoint exists in the `api` folder.

### Blank page

Open browser Developer Tools:

- Select **Console** to find JavaScript errors.
- Select **Network** to inspect failed API requests.
- Select **Sources** to confirm that the expected JavaScript file loaded.

---

## 15. Security Notes

This project is designed for course and local demonstration use.

- Passwords are stored as hashes using PHP `password_hash()`.
- Login passwords are verified using `password_verify()`.
- User-provided database values are handled with prepared statements.
- Protected APIs enforce roles with `require_role()`.

Before real-world deployment, the project should additionally consider:

- CSRF tokens
- HTTPS
- Secure production session settings
- Stronger server error handling
- Additional input validation
- Production database credentials

---

## 16. Presentation Resources

- Project presentation guide: [PRESENTATION_MANUAL.md](PRESENTATION_MANUAL.md)
- Database structure: [database/schema.sql](database/schema.sql)
- Demo data: [database/seed.sql](database/seed.sql)
- Authentication: [includes/auth.php](includes/auth.php)