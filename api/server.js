const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');

app.use(express.json())
app.use(cors())
dotenv.config();

// Creating connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

// Checking if connection succeeded
db.connect((err) => {
    // if connection doesn't succeed
    if(err) return console.log("Error connecting to MySQL")

    // if connection succeeded
    console.log("Connected to MySQL as id: ", db.threadId)

    //create a database
    db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
        // If creating database doesn't succeeded
        if(err) return console.log(err) 

        // If database creation succeeded
        console.log("database expense_tracker created/checked");
        //Using our created database
        db.changeUser({ database: 'expense_tracker' }, (err, result) => {
             // if changing the database doesn't succeeds
            if(err) return console.log(err)
            // If database changing succeeds
            console.log("expense_tracker is in use"); 

            //create Users table
            const usersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255)
                )
            `;

            db.query(usersTable, (err, result) => {
                // if creating table fails
                if(err) return console.log(err) 

                //If creating users table succeeds
                console.log("users table created/checked") 
            })

            //create Expense table
            const expenseTable = `
                CREATE TABLE IF NOT EXISTS Expense (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    category VARCHAR(255),
                    amount DECIMAL(10, 2),
                    date DATE,
                    user_id INT,
                    FOREIGN KEY (user_id) REFERENCES Users(id)
                )
            `;

            db.query(expenseTable, (err, result) => {
                // if creating table fails
                if(err) return console.log(err) 

                //If creating Expense table succeeds
                console.log("Expense table created/checked") 
            })
        })
    })
})

//user registration route
app.post('/api/register', async(req, res) => {
    try{
        const users = `SELECT * FROM users WHERE email = ?`
        //check if user exists
        db.query(users, [req.body.email], (err, data) => {
            // if we find user with same email in database
            if(data.length > 0) return res.status(409).json("User already exists");

            // If we don't find user email in database
            //hashing password(encryption)
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.password, salt)

            // query to create new user
            const newUser = `INSERT INTO users(email, username, password) VALUES (?)`
            value = [ req.body.email, req.body.username, hashedPassword ]

            db.query(newUser, [value], (err, data) => {
                if(err) return res.status(400).json("Something went wrong")

                return res.status(201).json("User created successfully")
            })
        })
    }
    catch(err) {
        res.status(500).json("Internal Server Error")
    }
})

// user login route
app.post('/api/login', async(req, res) => {
    try{
        // check existing user
        const users = `SELECT * FROM users WHERE email = ?`
        db.query(users, [req.body.email], (err, data) => {
            // if there is no user
            if(data.length === 0) return res.status(404).json("User not found")
            
            //if user exists and we compare password
            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password)

            // if passwords don't much
            if(!isPasswordValid) return res.status(400).json("Invalid Email or Password")

            //passwords match we accept
            return res.status(200).json("Login successful")
        })
    } 
    catch(err) {
        res.status(500).json("Internal Server Error")
    }
})

//Expense adding route
app.post('/api/index', async(req, res) => {
    try{
            // query to create/add expense
            const newExpense = `INSERT INTO Expense(category, amount, date) VALUES (?)`
            value = [ req.body.category, req.body.amount, req.body.date ]

            db.query(newExpense, [value], (err, data) => {
                if(err) return res.status(400).json("Something went wrong")

                return res.status(201).json("Expense added successfully")
            })
    }
    catch(err) {
        res.status(500).json("Internal Server Error")
    }
})

// Codes for selecting data from our database
app.get('/api/view', (req, res) => {
    const userId = req.query.userId; 
    if (!userId) {
        return res.status(400).json("User ID is required");
    }

    const query = 'SELECT category, amount, date FROM Expense WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json("Database query error: ", err);
        res.json(results);
    });
});

// starts our server
app.listen(5500, () => {
    console.log('server is running on PORT 5500...')   
})
