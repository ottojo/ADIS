<?php

require "SQLiteConnection.php";

$username = $_POST["name"];
$password = $_POST["password"];

if (array_key_exists("login", $_POST)) {
    $conn = new SQLiteConnection;
    $conn->connect();

    $hash = $conn->get_user_hash($username);

    if (!$hash) {
        http_response_code(400);
        echo "Username does not exist!";
        return;
    }

    $valid = password_verify($password, $hash);
    if ($valid) {
        session_start();
        $_SESSION["username"] = $username;
    } else {
        http_response_code(401);
        echo "Bad password";
    }
} else if (array_key_exists("register", $_POST)) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $conn = new SQLiteConnection;
    $conn->connect();
    $result = $conn->register_user($username, $hash);
    if ($result) {
        http_response_code(200);
        echo "User created!";
    } else {
        http_response_code(400);
        echo "Username already taken!";
    }
} else {
    http_response_code(400);
    echo "Missing register/login parameter!";
}

if (isset($_GET["next"])) {
    header('Location: ' . $_GET["next"]);
}
