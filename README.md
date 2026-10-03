# Expense Tracker

Expense Tracker is a web application for managing personal expenses. Users can add, edit, delete, search, and filter expenses, while the app displays summary information such as the total amount, number of expenses, and highest expense.

## How to run

### Backend

1. Open the project folder in VS Code.
2. Make sure PostgreSQL is installed and running.
3. Create a PostgreSQL database named `expense_tracker`.
4. Open pgAdmin or PostgreSQL Query Tool.
5. Run the `schema.sql` file to create the required table.
6. Inside the `backend` folder, create a `.env` file.
7. Add the PostgreSQL connection information to the `.env` file:
DB_USER=postgres
DB_HOST=localhost
DB_NAME=expense_tracker
DB_PASSWORD=your_password
DB_PORT=5432
8. Open the terminal in the `backend` folder.
9. Run:
npm install
10. Start the backend server:
node server.js
11. The backend will run on `http://localhost:3000`.

### Frontend

1. Keep the backend server running.
2. Open the frontend `index.html`.
3. Open it in Google Chrome or another web browser.
4. The frontend connects to the backend API at `http://localhost:3000/api/expenses`.

## Features

- [x] Add an expense (with validation)
- [x] Delete an expense
- [x] Edit an expense
- [x] Filter by category
- [x] Search expenses by title
- [x] Summary cards (total, count, highest)
- [x] Data is saved in a PostgreSQL database
- [x] Dark mode

## Screenshots

### Desktop View

![Desktop View](frontend/images/desktop.png)

### Mobile View

![Mobile View](frontend/images/mobile.png)

### Edit Expense

![Edit Expense](frontend/images/edit-expense.png)

## What was the hardest part?

The hardest part was connecting the frontend to the backend and making sure that all operations work correctly with the PostgreSQL database. I also had some difficulty handling validation, error messages, and displaying the table correctly on mobile devices. I solved these problems by using fetch with async/await, adding validation and error handling, and using Bootstrap classes to improve the mobile layout.
