<?php
require "../../private/db_conn.php";
session_start();

// Require session UID
if (!isset($_SESSION["UID"])) {
    header("HTTP/1.1 400 Missing UID");
    die();
}
// and message string
if (!isset($_POST["message"])) {
    header("HTTP/1.1 400 Missing message");
    die();
}

$db = RoaryDB::getDB();

// Try to insert message
if (!$db->addMessage($_SESSION["UID"], urldecode($_POST["message"])))
    header("HTTP/1.1 500 Failed to store message");

$db->close();

?>
