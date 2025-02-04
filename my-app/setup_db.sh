#!/bin/bash

DB_NAME="aiims"
DB_USER="aiims"
DB_PASS="Bharat@1947"

echo "🚀 Starting MySQL user and database setup..."

# Ensure MySQL is running
echo "Checking if MySQL is running..."
if ! pgrep mysqld > /dev/null; then
    echo "Starting MySQL..."
    sudo systemctl start mysql
fi

echo "✅ MySQL is running."

# Step 1: Create the MySQL User if it doesn't exist
echo "🔹 Checking if user '$DB_USER' exists..."
USER_EXISTS=$(sudo mysql -sse "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '$DB_USER');")

if [ "$USER_EXISTS" -eq 0 ]; then
    echo "🆕 Creating MySQL user '$DB_USER'..."
    sudo mysql <<EOF
    CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
    GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'localhost' WITH GRANT OPTION;
    ALTER USER '$DB_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASS';
    FLUSH PRIVILEGES;
EOF
    echo "✅ MySQL user '$DB_USER' created successfully!"
else
    echo "✅ User '$DB_USER' already exists. Skipping creation."
fi

# Step 2: Check if the database already exists
DB_EXIST=$(mysql -u$DB_USER -p$DB_PASS -e "SHOW DATABASES LIKE '$DB_NAME';" | grep "$DB_NAME")

if [ "$DB_EXIST" ]; then
    echo "⚠️ Database '$DB_NAME' already exists. Dropping and recreating..."
    mysql -u$DB_USER -p$DB_PASS -e "DROP DATABASE $DB_NAME;"
fi

# Step 3: Create the database
echo "📌 Creating database '$DB_NAME'..."
mysql -u$DB_USER -p$DB_PASS -e "CREATE DATABASE $DB_NAME;"

# Step 4: Import the schema directly from the script
echo "📥 Importing schema into '$DB_NAME'..."

mysql -u$DB_USER -p$DB_PASS $DB_NAME <<EOF
-- Set MySQL settings
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- Table: patient_media
CREATE TABLE patient_media (
    id INT NOT NULL AUTO_INCREMENT,
    patientId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    audioPath VARCHAR(255) DEFAULT NULL,
    videoPath VARCHAR(255) DEFAULT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    score INT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY patientId (patientId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: model_inference
CREATE TABLE model_inference (
    id INT NOT NULL AUTO_INCREMENT,
    patientId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    audioResult VARCHAR(255) DEFAULT NULL,
    videoResult VARCHAR(255) DEFAULT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    mmseScore INT DEFAULT NULL,
    status VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY patientId (patientId),
    CONSTRAINT model_inference_ibfk_1 FOREIGN KEY (patientId) REFERENCES patient_media (patientId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Trigger: set_status_on_mmse_insert
DELIMITER ;;
CREATE TRIGGER set_status_on_mmse_insert BEFORE INSERT ON model_inference
FOR EACH ROW BEGIN
    IF NEW.mmseScore >= 0 AND NEW.mmseScore <= 9 THEN
        SET NEW.status = 'Severe';
    ELSEIF NEW.mmseScore >= 10 AND NEW.mmseScore <= 20 THEN
        SET NEW.status = 'Moderate';
    ELSEIF NEW.mmseScore >= 21 AND NEW.mmseScore <= 24 THEN
        SET NEW.status = 'Mild';
    ELSEIF NEW.mmseScore >= 25 AND NEW.mmseScore <= 30 THEN
        SET NEW.status = 'May be Normal';
    ELSE
        SET NEW.status = 'Invalid Score';
    END IF;
END;;
DELIMITER ;

-- Trigger: set_status_on_mmse_update
DELIMITER ;;
CREATE TRIGGER set_status_on_mmse_update BEFORE UPDATE ON model_inference
FOR EACH ROW BEGIN
    IF NEW.mmseScore >= 0 AND NEW.mmseScore <= 9 THEN
        SET NEW.status = 'Severe';
    ELSEIF NEW.mmseScore >= 10 AND NEW.mmseScore <= 20 THEN
        SET NEW.status = 'Moderate';
    ELSEIF NEW.mmseScore >= 21 AND NEW.mmseScore <= 24 THEN
        SET NEW.status = 'Mild';
    ELSEIF NEW.mmseScore >= 25 AND NEW.mmseScore <= 30 THEN
        SET NEW.status = 'May be Normal';
    ELSE
        SET NEW.status = 'Invalid Score';
    END IF;
END;;
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
EOF

echo "✅ Database schema imported successfully!"

# Step 5: Verify tables exist
echo "🔎 Checking created tables..."
mysql -u$DB_USER -p$DB_PASS -e "USE $DB_NAME; SHOW TABLES;"

echo "🎉 MySQL user and database setup completed successfully!"

