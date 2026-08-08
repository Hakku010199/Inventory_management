CREATE DATABASE IF NOT EXISTS inventory_db;

USE inventory_db;

 CREATE TABLE business ( 
    
    id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    strategy enum('FIFO', 'FEFO', 'BATCH') NOT NULL DEFAULT 'FIFO'
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL UNIQUE,
      price DECIMAL(10,2) NOT NULL
);


    CREATE TABLE inventory_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        batch_no VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        purchase_date DATE NOT NULL,
         expiry_date DATE NULL,
            cost_price DECIMAL(10,2) NOT NULL,

        FOREIGN KEY (product_id)
            REFERENCES products(id)
    );

create table sales (
    id int AUTO_INCREMENT primary key,
    business_id int NOT NULL,
    sale_date timestamp DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (business_id)
        REFERENCES business(id)
);





create table sale_items (

    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    batch_id INT NOT NULL,
    quantity INT NOT NULL,

            FOREIGN KEY (sale_id)
                REFERENCES sales(id),

            FOREIGN KEY (batch_id)
                REFERENCES inventory_batches(id)
        );