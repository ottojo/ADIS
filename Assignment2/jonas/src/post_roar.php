<?php

session_start();
if (!array_key_exists("username", $_SESSION)) {
    http_response_code(401);
    return;
}

if (strlen($_POST["message"]) > 128) {
    http_response_code(401);
    echo "Roar exceeds 128 character limit!";
    return;
}

require "SQLiteConnection.php";
$conn = new SQLiteConnection;
$conn->connect();

$conn->post_roar($_SESSION["username"], $_POST["message"]);

if (isset($_GET["next"])) {
    header('Location: ' . $_GET["next"]);
}
