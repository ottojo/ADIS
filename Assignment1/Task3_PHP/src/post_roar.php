<?php
$roars_filename = "roars.json";

if (strlen($_POST["message"]) <= 128) {
    if (file_exists($roars_filename)) {
        $json_encoded_roars = file_get_contents($roars_filename);
        $roars = json_decode($json_encoded_roars);
    } else {
        $roars = array();
    }

    $roar = array(
        "time" => date(DateTime::ISO8601),
        "name" => $_POST["name"],
        "message" => $_POST["message"],
    );
    array_push($roars, $roar);

    file_put_contents($roars_filename, json_encode($roars, JSON_PRETTY_PRINT));
}

header('Location: index.php');
