<html>
    <head>
        <title>Roary - Exercise 1 Task 3</title>
         <meta charset="UTF-8">
        <link rel="stylesheet" href="/exercise1/static/css/index.css">
    </head>
    <body>
        <h1>Roary - Exercise 1 Task 3</h1>
        <div id="new-post-container">
            <p id="new-post-header">New Post</p>
            <form method="POST" action="./post.php">
                <div class="form-entry">
                    <label for="name">Name</label><br>
                    <input type="text" id="name" name="name">
                </div><div class="form-entry">
                    <label for="message">Message</label><br>
                    <textarea id="message" name="message" rows="4"></textarea>
                </div><div class="form-entry">
                    <input type="submit" value="Post Message" id="submit-btn">
                </div>
            </form>
        </div>
        <div id="posts-container"><?php
            const FILE_PATH = "../../data/exercise1/posts.csv";
            const MAX_MESSAGES = 50;
            
            $file = fopen(FILE_PATH, "r");
            $index = 0;
            $posts = array();
            
            // Iterate through the CSV lines and only keep the last MAX_MESSAGES of them
            // in an array (which is used as a ringbuffer)
            
            if ($file !== false) {
                while (($data = fgetcsv($file)) !== false) {
                    if (count($data) != 3)
                        continue;
                        
                    if (count($posts) < MAX_MESSAGES) {
                        $posts[] = array("time" => intval($data[0]), "author" => $data[1], "content" => $data[2]);
                        $index++;
                    } else {
                        $index = $index % MAX_MESSAGES;
                        $posts[$index] = array("time" => intval($data[0]), "author" => $data[1], "content" => $data[2]);
                        $index++;
                    }
                }
                
                fclose($file);
            }
            
            // Sort by post date
            usort($posts, function ($a, $b) {
                return $b["time"] - $a["time"];
            });
            
            // Create the relvant HTML snippets for all posts
            foreach ($posts as $post) {
                $author  = htmlspecialchars(urldecode($post["author"]));
                $content = htmlspecialchars(urldecode($post["content"]));
                $date    = date("Y-m-d H:i:s", $post["time"] / 1000.0);
                
                echo <<<END
                        <div class="post-container">
                            <div class="post-heading">
                                <span class="post-author">$author</span>
                                <span class="post-date">$date</span>
                            </div>
                            <div class="post-content">$content</div>
                        </div>
                    END;
            }
        ?></div>
    <body>
</html>

