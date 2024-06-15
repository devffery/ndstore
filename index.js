const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));


app.get('/', function (req, res) {
  // Perform a query to fetch all products
  pool.query("SELECT * FROM products", (err, result) => {
    if (err) {
      console.error('Query error', err.stack);
      res.status(500).send('Something went wrong!');
    } else {
      res.render('pages/index', { result: result.rows });
    }
  });
});

const { pool } = require('./dbConfig');

pool.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL!');
  }
});

const port = 5000;
app.listen(port, () => console.log(`Server is running at port ${port}`));

