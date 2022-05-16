<?php 
    // Resume session, clear all session data and redirect to login page
    session_start();
    session_unset();
    header("Location: ./login.php");
?>


