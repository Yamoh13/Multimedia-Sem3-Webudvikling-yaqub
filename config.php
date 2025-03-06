<?php

$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = 'root';
$dbName = 'vibevolley_db';

$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
