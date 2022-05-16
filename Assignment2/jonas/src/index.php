<html>

<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>

<head>
    <title>Roary</title>
    <script>
        console.log("hi!");

        function updateRoars() {
            console.log("updating roars");
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                const table = document.getElementById("roars");
                const rows = table.rows.length;
                for (let i = 1; i < rows; i++) {
                    table.deleteRow(1);
                }

                console.log(this.responseText);
                const roars = JSON.parse(this.responseText);

                for (const roar of roars) {
                    let row = table.insertRow(-1);

                    let time = row.insertCell(0);
                    let name = row.insertCell(1);
                    let message = row.insertCell(1);

                    time.innerHTML = roar.creation_time;
                    name.innerHTML = roar.author;
                    message.innerHTML = roar.text;
                }

            }
            xhttp.open("GET", "get_roars.php", true);
            xhttp.send();
        }

        updateRoars();
        setInterval(updateRoars, 1000);
    </script>
</head>

<body>
    <h1>Roary</h1>
    <h2>User management</h2>
    <?php
    session_start();
    if (array_key_exists("username", $_SESSION)) {
    ?>
        Welcome, <?php echo $_SESSION["username"] ?>!
        <a href="logout.php?next=index.php">logout</a>
    <?php
    } else {
    ?>
        <form action="login.php?next=index.php" method="post">
            Username: <input type="text" name="name"><br>
            Password: <input type="password" name="password"><br>
            <input type="submit" name="login" value="Login">
            <input type="submit" name="register" value="Register">
        </form>
    <?php
    }
    ?>

    <?php
    if (array_key_exists("username", $_SESSION)) {    ?>
        <h2>Post Roars</h2>
        <form action="post_roar.php?next=index.php" method="post">
            Message: <input type="text" name="message"><br>
            <input type="submit" , value="Post Message">
        </form>
    <?php } ?>

    <h2>Roars</h2>

    <table border="1" id="roars">
        <tr>
            <th>Time</th>
            <th>Name</th>
            <th>Message</th>
        </tr>
    </table>
</body>

</html>