<?php 
    require "../private/db_conn.php";
    session_start(); 

    // Not logged in => redirect to login page
    if (!isset($_SESSION["UID"])) {
        header("Location: ./login.php");
        die();
    }

    $db = RoaryDB::getDB();
    $user = $db->getUser(null, $_SESSION["UID"]);

    // User doesn't exist => redirect to logout page to clear session
    if (!$user) {
        header("Location: ./logout.php");
    }

    $db->close();
?>
<html>
    <head>
        <title>Roary - Exercise 2</title>
         <meta charset="UTF-8">
        <link rel="stylesheet" href="./index.css">
        <script src="./index.js"></script>
    </head>
    <body>
        <h1>Roary - Exercise 2</h1>
        <div id="form-container">
            <div id="form-heading">
                New Roar
                <a href="./logout.php"><button id="logout-btn">Logout</button></a>
            </div>
            <div id="status-message"></div>
            <form>
                <div class="form-entry">
                    <label for="name">Name</label><br>
                    <input type="text" id="name" name="name" disabled="" value="<?php echo $user["name"] ?>">
                </div><div class="form-entry">
                    <label for="message">Message</label><br>
                    <textarea id="message" name="message" rows="4"></textarea>
                </div><div class="form-entry">
                    <input type="submit" value="Post Message" id="submit-btn">
                </div>
            </form>
        </div>
        <div id="posts-container"></div>
    <body>
</html>

