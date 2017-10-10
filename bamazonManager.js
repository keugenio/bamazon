var mysql = require("mysql");
var inquirer = require("inquirer");
var clear = require('clear');
var columnify = require("columnify");

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
      message: "Select [View Low Inventory] or [View All Inventory] or [Add Quantity] or [Add New Product]",
      choices: ["View Low Inventory", "View Products for Sale", "Add Quantity", "Add New Product", "QUIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the manager functions
        switch(answer.command.toUpperCase()){
          case "VIEW LOW INVENTORY":
            viewInventory("low");    
            break;
          case "VIEW PRODUCTS FOR SALE":
            viewInventory("all");
            break;      
          case "ADD QUANTITY":
            addInventory();
            break;      
          case "ADD NEW PRODUCT":
            addNew();
            break;
          default:
            process.exit()
            break;        
        }

    });
}

function viewInventory(param){  //  read inventory of products db
  var columnify = require("columnify");
  var sql = "";
    switch(param){
      case "all":
        sql="SELECT * FROM products";      
        break;
      case "low":
        sql="SELECT * FROM products where quantity <= 5";
        break;      
      default : // a product id was passed
        sql="SELECT * FROM products where id=" + param;
        break; 
    }
    connection.query(sql, function(err, res) {
        if (err) throw err;
        var data = [];
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

function addInventory() {
    inquirer
      .prompt([
        {
          name: "id",
          type: "input",
          message: "What is the product ID of the item you want to add to"
        },
        {
          name: "quantity",
          type: "input",
          message: "How much do you want to add?"
        }
      ])
      .then(function(answer) {     
          // select product id of item to be bought
          connection.query("SELECT * FROM products WHERE id = " + answer.id,function(err, res){ 
              var newQuantity = parseInt(res[0].quantity) + parseInt(answer.quantity);
              viewInventory(answer.id); 
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
                  console.log(res[0].product_name + " upddated successfully! The new quantity is " + newQuantity);
                  viewInventory(answer.id);
                }
              );

          });     
     });  
}

function addNew() {
    inquirer
      .prompt([
        { 
          name: "product_name",
          type: "input",
          message: "What is the product name of the new item?"
        },
        { 
          name: "department_name",
          type: "input",
          message: "What is the department name of the new item?"
        },
        {
          name: "price",
          type: "input",
          message: "What is the price of the item you want to add?",   
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        },   
        {
          name: "quantity",
          type: "input",
          message: "How much do you want to add?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;          
          }
        }        
      ])
      .then(function(answer) {    
          var product = {
            product_name:answer.product_name,
            department_name:answer.department_name,
            price:answer.price,
            quantity:answer.quantity
          };  
          var query = connection.query("INSERT INTO products SET ?", product ,function(err, res){            
                  if (err) throw err;
                  clear();
                  console.log(answer.product_name + " upddated successfully!");                  
                  connection.query("SELECT * FROM products ORDER BY id DESC" ,function(err, res){
                    viewInventory(res[0].id);
                  });
                }
          );   
     });  
}

function printSpacer(character){
  var spacer="";
  for (var i = 0; i < 60; i++) {
    spacer+=character;
  }
  console.log("\n" + spacer + "\n");
}