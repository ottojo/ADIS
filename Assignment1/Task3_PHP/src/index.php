<html>

<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>

<body>
    <form action="post_roar.php" method="post">
        Name: <input type="text" name="name"><br>
        Message: <input type="text" name="message"><br>
        <input type="submit" , value="Post Message">
    </form>

    <?php
    $roars_filename = "roars.json";
    if (file_exists($roars_filename)) {
        $json_encoded_roars = file_get_contents($roars_filename);
        $roars = json_decode($json_encoded_roars);
    } else {
        $roars = array();
    }
    ?>

    <table>
        <tr>
            <th>Time</th>
            <th>Name</th>
            <th>Message</th>
        </tr>

        <?php
        foreach ($roars as $roar) {
            echo "<tr>";
            echo "<td>{$roar->{'time'}}</td>";
            echo "<td>{$roar->{'name'}}</td>";
            echo "<td>{$roar->{'message'}}</td>";
            echo "</tr>";
        }
        ?>
    </table>
</body>

</html>
