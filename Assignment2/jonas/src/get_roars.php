<?php

require "SQLiteConnection.php";
$conn = new SQLiteConnection;
$conn->connect();
$roars = $conn->get_roars();

echo json_encode($roars);
