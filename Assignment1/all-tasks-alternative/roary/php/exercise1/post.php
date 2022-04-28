<?php
    const FILE_PATH = "../../data/exercise1/posts.csv";
    $statusMsg = null;

    // Check validity first: Name and message specified, not empty and not above size limit
    if (!isset($_POST["name"]) || !$_POST["name"])
        $statusMsg = "Missing name";
    else  if (strlen($_POST["name"]) > 20)
        $statusMsg = "Max name length: 20 characters";

    if (!isset($_POST["message"]) || !$_POST["message"])
        $statusMsg = "Missing content";
    else  if (strlen($_POST["message"]) > 128)
        $statusMsg = "Max message length: 128 characters";

    // If $statusMsg ist not null, there was an error. Otherwise, add the new post to the messages file
    if ($statusMsg != null) {
        echo "<h1>Error: " . $statusMsg . "</h1>";
    } else {
        $file = fopen(FILE_PATH, 'a');
        
        // Append the message as a CSV line.
        // Important, the input must be urlencoded since the CGI version relies on that
        // and secondly we don't have to deal with special chars (esp. comma) in this way
        
        fwrite($file, strval(intval(round(microtime(true) * 1000))) 
                . "," . urlencode($_POST["name"])
                . "," . urlencode($_POST["message"])
                 . "\n");
        
        fclose($file);

        header("Location: ./index.php", true, 303);
    }
?>
