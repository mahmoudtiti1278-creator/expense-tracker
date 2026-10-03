const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Database connected");
    }
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Expense Tracker API is running"
    });
});

app.get("/api/expenses", async (req, res) => {
    try {
       const result = await pool.query(
    "SELECT id, title, amount::float8, category, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM expenses"
);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/expenses/:id", async (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid ID"
        });
    }
    try {
        const result = await pool.query(
    "SELECT id, title, amount::float8, category, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM expenses WHERE id = $1",
    [id]
);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
app.post("/api/expenses", async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        if (!title || amount === undefined || !category || !date) {
    return res.status(400).json({
        message: "All fields are required"
    });
}

        if (isNaN(amount)) {
        return res.status(400).json({
            message: "Amount must be a number"
        });
    }

        if (amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0"
        });
   }
        const allowedCategories = [
            "Food",
            "Transport",
            "Bills",
            "Entertainment",
            "Other"
        ];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid category"
            });
        }
        const expenseDate = new Date(date);

        if (isNaN(expenseDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date"
            });
}
        const result = await pool.query(
        `INSERT INTO expenses (title, amount, category, date)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, amount::float8, category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date`,
        [title, amount, category, date]
    );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
app.put("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
        message: "Invalid ID"
    });
}
    try {
        const { title, amount, category, date } = req.body;

        if (!title || amount === undefined || !category || !date) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (isNaN(amount)) {
            return res.status(400).json({
                message: "Amount must be a number"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const allowedCategories = [
            "Food",
            "Transport",
            "Bills",
            "Entertainment",
            "Other"
        ];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid category"
            });
        }

        const expenseDate = new Date(date);

        if (isNaN(expenseDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        const result = await pool.query(
        `UPDATE expenses
        SET title = $1,
        amount = $2,
        category = $3,
        date = $4
        WHERE id = $5
        RETURNING id, title, amount::float8, category,
        TO_CHAR(date, 'YYYY-MM-DD') AS date`,
        [title, amount, category, date, id]
    );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
app.delete("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
        message: "Invalid ID"
    });
}
    try {
    const result = await pool.query(
    `DELETE FROM expenses
     WHERE id = $1
     RETURNING id, title, amount::float8, category,
               TO_CHAR(date, 'YYYY-MM-DD') AS date`,
    [id]
);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully",
            expense: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});