const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');


function isProductInCart(cart,id){

  for (let i=0; i<cart.length; i++){
    if(cart[i].id == id){
      return true;
    }
  }

  return false;
}


function calculateTotal(cart,req){
  total = 0;
  for(let i=0; i<cart.length; i++){
    if(cart[i].sale_price){
      total = total + (cart[i].sale_price*cart[i].quantity);
    }else{
      total = total + (cart[i].price*cart[i].quantity)
    }
  }
  req.session.total = total;
  return total;
}

app.use(express.static('public'));

app.use(session({secret:"secret"}))

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

app.post('/cart', function(req,res){
  var id = req.body.id;
  var name = req.body.name;
  var price = req.body.price;
  var sale_price = req.body.sale_price;
  var quantity = req.body.quantity;
  var image = req.body.image;

  if (!id || !name || !price || !quantity || !image) {
    res.status(400).send('Missing product details!');
    return;
  }

  var product = {id:id, name:name, price:price, sale_price:sale_price,quantity:quantity,image:image};

  if (req.session.cart){
    var cart = req.session.cart;

    if (!isProductInCart(cart,id)){
      cart.push(product);
    }
  }else{
    req.session.cart = [product]
    var cart = req.session.cart;
  }
  //calculate total amount
  calculateTotal(cart,req);

  //return to cart page
  res.redirect('/cart');
});

app.get('/cart',function(req,res){

  if (!req.session.cart) {
    req.session.cart = [];
  }

  var cart = req.session.cart;
  var total = req.session.total;

  res.render('pages/cart',{cart:cart,total:total});

});


app.post('/remove_product',function(req,res){
  var id = req.body.id;
  var cart = req.session.cart;

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

