<?php 
    require "../private/db_conn.php";
    session_start();

    // Already logged in => redirect to index
    if (isset($_SESSION["UID"])) {
        header("Location: ./index.php");
        die();
    }

    // Login data sent via POST form
    if (isset($_POST["name"]) && isset($_POST["password"])) {
        if (strlen($_POST["name"]) == 0 || strlen($_POST["name"]) > 20)
            $statusMsg = "name length must be between 1 and 20 characters";
        if (strlen($_POST["password"]) < 8 || strlen($_POST["password"]) > 20)
            $statusMsg = "password length must be between 8 and 20 characters";

        if (!isset($statusMsg)) {
            $db = RoaryDB::getDB();
            $user = $db->getUser($_POST["name"]);
            
            // If the user doesn't exist: Create the user, otherwise check the password
            if (!$user) {
                $pwd = password_hash($_POST["password"],  PASSWORD_DEFAULT);
                $db->addUser($_POST["name"], $pwd);
                $user = $db->getUser($_POST["name"]);
            } else if (!password_verify($_POST["password"], $user["pwd"])) {
                $statusMsg = "Invalid password";
            }

            $db->close();

            // Constraints met and password valid (or user didn't exist) => Set UID session cookie and redirect to main page
            if (!isset($statusMsg)) {
                $_SESSION["UID"] = $user["UID"];
                header("Location: ./index.php");
                die();
            }
        }
    }
?>
<html>
    <head>
        <title>Roary - Exercise 2</title>
         <meta charset="UTF-8">
        <link rel="stylesheet" href="./index.css">
    </head>
    <body>
        <h1>Roary - Exercise 2</h1>
        <div id="form-container">
            <p id="form-heading">Login</p>
            <?php if (isset($statusMsg)) : ?>
                <div id="status-message" class="status-err"><?php echo $statusMsg ?></div>
            <?php endif; ?>
            <form method="POST" action="./login.php">
                <div class="form-entry">
                    <label for="name">Name</label><br>
                    <input type="text" id="name" name="name">
                </div><div class="form-entry">
                    <label for="password">Password</label><br>
                    <input type="password" id="password" name="password"></textarea>
                </div><div class="form-entry">
                    <input type="submit" value="Login/Register" id="submit-btn">
                </div>
            </form>
        </div>
    <body>
</html>

