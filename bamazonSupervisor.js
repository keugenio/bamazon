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
      message: "Select [View Product Sales by Department] or [Add New Department] or [View Departments]",
      choices: ["View Products Sales by Department", "Add New Department", "View Departments","QUIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the manager functions
        switch(answer.command.toUpperCase()){
          case "VIEW PRODUCTS SALES BY DEPARTMENT":
            clear();
            viewProductSales();
            break;        
          case "ADD NEW DEPARTMENT":
            addNewDept();
            break;
          case "VIEW DEPARTMENTS":
            clear();
            viewDepartments();
            break;            
          default:
            process.exit()
            break;        
        }

    });
}

function viewProductSales(){  //  read inventory of products db
  var columnify = require("columnify");
  var sql ="SELECT " + 
      "departments.id," +
      "departments.department_name," + 
      "departments.over_head_costs," + 
      "sum(products.product_sales) AS product_sales," + 
      "sum(products.product_sales) - departments.over_head_costs AS total_profit " +
      "FROM bamazon.departments " + 
      "INNER JOIN products ON departments.department_name = products.department_name " + 
      "GROUP BY departments.department_name";

    var query = connection.query(sql, function(err, res) {
        if (err) throw err;
        var data = [];
        var total_profit=0;
        for (var i = 0; i < res.length; i++) { // push results into data array for use with columnify app

          data.push({
            department_id:res[i].id,
            department_name:res[i].department_name,
            over_head_costs:res[i].over_head_costs,
            product_sales:res[i].product_sales,
            total_profit:res[i].total_profit
          });
        }
        // print results
        printSpacer("*");
        console.log(columnify(data, {columns: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']}));
        printSpacer("*");
        start();
    });
}

function addNewDept() {
    inquirer
      .prompt([
        {
          name: "department_name",
          type: "input",
          message: "What is the Department Name you want to add?"
        },
        {
          name: "over_head_costs",
          type: "input",
          message: "What are the Over Head Costs Amount?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(answer) {     
          // insert new department        
          var query=connection.query(
            "INSERT INTO departments SET ?",
            [
              {
                department_name: answer.department_name,
                over_head_costs: answer.over_head_costs
              }
            ],
            function(err) {
              console.log(query.sql);
              if (err) throw err;
              clear();
              console.log(answer.department_name + " inserted successfully!");
              viewDepartments();
            }
          );    
     });  
}

function viewDepartments() {
  var sql="SELECT * FROM departments ORDER BY id DESC";
    connection.query(sql, function(err, res) {
        if (err) throw err;
        var data = [];
        for (var i = 0; i < res.length; i++) { // push results into data array for use with columnify app
          data.push({
            id:res[i].id,
            department_name:res[i].department_name,
            over_head_costs:res[i].over_head_costs,
          });
        }
        // print results
        printSpacer("*");
        console.log(columnify(data, {columns: ['id', 'department_name', 'over_head_costs']}));
        printSpacer("*");
        start();
    });
}

function printSpacer(character){
  var spacer="";
  for (var i = 0; i < 60; i++) {
    spacer+=character;
  }
  console.log("\n" + spacer + "\n");
}