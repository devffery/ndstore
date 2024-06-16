const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require('express-session');
const { pool } = require('./dbConfig');

const app = express();

// middleware
app.use(express.static('public'));
app.use(session({secret:"secret"}))
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({extended:true}));

// Function to check if a product is in the cart
function isProductInCart(cart, id) {
	for (let i=0; i<cart.length; i++){
		if(cart[i].id == id){
			return true;
		}
	}
	return false;
}

// Function to calculate the total
function calculateTotal(cart,req){
	let total = 0;
	for(let i=0; i<cart.length; i++){
		if(cart[i].sale_price){
			total += cart[i].sale_price * cart[i].quantity;
		}else{
			total += cart[i].price * cart[i].quantity;
		}
	}
	req.session.total = total;
	return total;
}

//Routes

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

	for(let i=0; i<cart.length; i++){
		if(cart[i].id == id){
			cart.splice(i, 1);
      break;
		}
	}

	//re-celculate total
	calculateTotal(cart,req);
	res.redirect('/cart');

});


app.post('/edit_product_quantity', function(req,res){

	var id = req.body.id;
	var quantity = req.body.quantity;
	var increase_btn = req.body.increase_product_quantity;
	var decrease_btn = req.body.decrease_product_quantity;

	var cart = req.session.cart;

	if(increase_btn){
		for(let i=0; i<cart.length; i++){
			if (cart[i].id == id) {	
				if (cart[i].quantity>0){
					cart[i].quantity = parseInt(cart[i].quantity)+1;
				}
			}
		}
	}

	if(decrease_btn){
		for(let i=0; i<cart.length; i++){
			if (cart[i].id == id) {	
				if (cart[i].quantity>1){
					cart[i].quantity = parseInt(cart[i].quantity)-1;
				}
			}
		}
	}

	calculateTotal(cart,req);
	res.redirect('/cart')

});



pool.connect(err => {
	if (err) {
		console.error('Connection error', err.stack);
	} else {
		console.log('Connected to PostgreSQL!');
	}
});

const port = 5000;
app.listen(port, () => console.log(`Server is running at port ${port}`));

