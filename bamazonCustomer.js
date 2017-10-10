var mysql = require("mysql");
var inquirer = require("inquirer");
var clear = require('clear');
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "Hawaii50",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  clear();
  start();
});

function start() {
  inquirer
    .prompt({
      name: "command",
      type: "rawlist",
      message: "Would you like to [BUY] an item or [VIEW] inventory?",
      choices: ["BUY", "VIEW","QUIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.command.toUpperCase() === "VIEW") {
        viewInventory();
      }
      else if (answer.command.toUpperCase() === "BUY"){
        buyItem();
      } else{
        process.exit()
      }
    });
}

function viewInventory(id){  //  read inventory of products db
  var columnify = require("columnify");
  var sql = "";
    if (id>0) // if a product id is passed change to selective query instead of general search for all products
      sql="SELECT * FROM products where id="+id;
    else
      sql="SELECT * FROM products";

    connection.query(sql, function(err, res) {
        if (err) throw err;
        var data = []
        for (var i = 0; i < res.length; i++) { // push results into data array for use with columnify app
          data.push({
            id:res[i].id,
            product_name:res[i]. product_name,
            department_name:res[i].department_name,
            price:res[i].price,
            quantity:res[i].quantity
          });
        }
        // print results
        printSpacer("*");
        console.log(columnify(data, {columns: ['id', 'product_name', 'department_name', 'price', 'quantity']}));
        printSpacer("*");
        start();
    });
}

function buyItem() {
    inquirer
      .prompt([
        {
          name: "id",
          type: "input",
          message: "What is the product ID of the item you want to buy"
        },
        {
          name: "quantity",
          type: "input",
          message: "What is the quantity you want to buy?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(answer) {
        connection.query("SELECT * FROM products WHERE id=" + answer.id,function(err, res){  
          if (res[0]){

              // select product id of item to be bought
              connection.query("SELECT * FROM products WHERE id=" + answer.id,function(err, res){   
                // if there is enough inventory to fufill order update db  
                if (parseInt(answer.quantity) <= parseInt(res[0].quantity)){ 
                  var newQuantity = parseInt(res[0].quantity) - parseInt(answer.quantity);        
                  var query=connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                      {
                        quantity: newQuantity
                      },
                      {
                        id: answer.id
                      }
                    ],
                    function(error) {
                      if (error) throw err;
                      clear();
                      var price = answer.quantity * res[0].price;
                      clear();
                      printSpacer("*");
                      console.log(res[0].product_name + " bought successfully! Your total cost is $" + price);
                      updateProductSales(res[0].id, parseInt(res[0].product_sales) + price);
                      viewInventory(answer.id);
                    }
                  );
                } else { // else if not enough inventory, try again
                    console.log("Not enough inventory. Try again...");
                    start(); 
                }
              
              });

          } else {
            console.log("No id found. Try again.");
            start();
          }
        });


        
    });  
}

function updateProductSales(prodID, totalSales){
    var query=connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          product_sales: totalSales
        },
        {
          id: prodID
        }
      ],
      function(error) {
        if (error) throw err;
        // user really doesn't need to know this info so no console message needed if successful.
        console.log("$"+totalSales + " is the new total for product_sales field for this item. *this is only for the video");       
      });
}

function printSpacer(character){
  var spacer="";
  for (var i = 0; i < 60; i++) {
    spacer+=character;
  }
  console.log("\n" + spacer + "\n");
}