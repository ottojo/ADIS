<?php
session_start();
session_destroy();

if (isset($_GET["next"])) {
    header('Location: ' . $_GET["next"]);
}

echo "Logout successful!";
