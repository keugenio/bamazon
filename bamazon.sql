DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products(
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NULL,
  department_name VARCHAR(45) NULL,
  price DECIMAL(10,2) NULL,  
  quantity INT NULL,
  PRIMARY KEY (id)
);
INSERT INTO products (product_name, department_name, price, quantity)
VALUES ("USB Mouse", "Office", "25.00", 2);
INSERT INTO products (product_name, department_name, price, quantity)
VALUES ("USB Keyboard", "Office", "35.00", 4);
INSERT INTO products (product_name, department_name, price, quantity)
VALUES ("men's shorts", "clothing", "24.00", 2);
INSERT INTO products (product_name, department_name, price, quantity)
VALUES ("bald head cream", "home", "5.00",  40;
