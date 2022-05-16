<?php

require "config.php";

/**
 * SQLite connnection
 */
class SQLiteConnection
{
    /**
     * PDO instance
     * @var PDO
     */
    private $pdo;

    /**
     * return in instance of the PDO object that connects to the SQLite database
     * @return PDO
     */
    public function connect()
    {
        if ($this->pdo == null) {
            $this->pdo = new PDO("sqlite:" . Config::PATH_TO_SQLITE_FILE);
        }

        $create_users = "CREATE TABLE IF NOT EXISTS users (
                         name TEXT PRIMARY KEY UNIQUE,
                         pw TEXT)";
        $this->pdo->exec($create_users);

        $create_roars = "CREATE TABLE IF NOT EXISTS roars (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         creation_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                         author TEXT NOT NULL,
                         text TEXT,
                         FOREIGN KEY(author) REFERENCES users(name))";
        $this->pdo->exec($create_roars);

        return $this->pdo;
    }

    /**
     * Creates user, returns true on success, and false otherwise
     */
    public function register_user($username, $hashed_pw)
    {
        $insert = "INSERT OR FAIL INTO users (name, pw) VALUES(:name, :pw)";
        $stmt = $this->pdo->prepare($insert);
        $stmt->bindParam(':name', $username);
        $stmt->bindParam(':pw', $hashed_pw);
        $result = $stmt->execute();
        return $result;
    }

    /**
     * Returns user hash or false if user does not exist
     */
    public function get_user_hash($username)
    {
        $select_query = "SELECT pw FROM users WHERE name == :name";
        $stmt = $this->pdo->prepare($select_query);
        $stmt->bindParam(':name', $username);
        $stmt->execute();
        $result = $stmt->fetch();
        if ($result == false) {
            return false;
        }
        return $result["pw"];
    }

    public function get_roars()
    {
        $select_query = "SELECT id, creation_time, author, text FROM roars";
        $result = $this->pdo->query($select_query);
        $all_roars = array();
        foreach ($result as $r) {
            $all_roars[] = array(
                "id" => $r["id"],
                "creation_time" => $r["creation_time"],
                "author" => $r["author"],
                "text" => $r["text"],
            );
        }
        return $all_roars;
    }

    public function post_roar($username, $message)
    {
        $insert = "INSERT OR FAIL INTO roars (author, text) VALUES(:author, :text)";
        $stmt = $this->pdo->prepare($insert);
        $stmt->bindParam(':author', $username);
        $stmt->bindParam(':text', $message);
        $result = $stmt->execute();
        return $result;
    }
}
