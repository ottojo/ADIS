<?php
require "../../private/db_conn.php";

$sinceRID = 0;

// Accept request via GET or POST
if (isset($_GET["sinceRID"])) 
    $sinceRID = intval($_GET["sinceRID"]);
if (isset($_POST["sinceRID"])) 
    $sinceRID = intval($_POST["sinceRID"]);

$db = RoaryDB::getDB();

// Send data as JSON
header("Content-Type: application/json");
echo json_encode($db->getMessages($sinceRID));

$db->close();

?>
