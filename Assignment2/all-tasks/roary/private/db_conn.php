<?php
    const DB_PATH = '/var/www/roary/data/roary.db';

    // SQLite3 subclass for fetching and storing Roars
    class RoaryDB extends SQLite3 {
        private static $db_instance = null;
        
        // Gets the RoaryDB singleton
        public static function getDB() {
            if (self::$db_instance == null) {
                self::$db_instance = new RoaryDB();
            }

            return self::$db_instance;
        }

        private $addUsrStmt;
        private $getUsrStmt;
        private $addMsgStmt;
        private $getMsgStmt;
        
        private function __construct() {
            parent::__construct(DB_PATH);
            $this->exec('PRAGMA foreign_keys = ON;'); // Check foreign key constraints!
            $this->setupDB();
        }

        private function setupDB() {
            // user table: UID, name and password
            // roars table: RID (roar ID), author (= UID), time (ECMAScript epoch) and message (arbitrary text).
            $this->exec(<<<END
                CREATE TABLE IF NOT EXISTS user (
                    UID INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE,
                    pwd TEXT
                );
                CREATE TABLE IF NOT EXISTS roars (
                    RID INTEGER PRIMARY KEY AUTOINCREMENT,
                    author INTEGER REFERENCES user(UID),
                    time INTEGER,
                    message TEXT
                );
            END);
            
            // Prepared statements for fetching/inserting user/roar
            $this->addUsrStmt = $this->prepare('INSERT INTO user VALUES (null, :name, :pwd)');
            $this->addMsgStmt = $this->prepare('INSERT INTO roars VALUES (null, :uid, :time, :msg)');
            $this->getUsrStmt = $this->prepare('SELECT * FROM user WHERE name=:name OR UID=:uid');
            $this->getMsgStmt = $this->prepare('SELECT RID, name, time, message FROM roars JOIN user ON author=UID WHERE RID > :rid ORDER BY time');
        }

        // Adds a user to the database given name and password
        public function addUser($name, $pwd) {
            if (!$this->addUsrStmt) 
                return false;         
   
            $this->addUsrStmt->bindParam(':name', $name);
            $this->addUsrStmt->bindParam(':pwd', $pwd);

            $res = $this->addUsrStmt->execute();
            if ($res) $res->finalize();

            $this->addUsrStmt->reset();
            return $res != false;
        }

        // Adds a Roar for a user given UID and message content
        public function addMessage($uid, $message) {
            if (!$this->addMsgStmt) 
                return false;         
   
            $this->addMsgStmt->bindParam(':uid', $uid);
            $this->addMsgStmt->bindParam(':msg', $message);
            
            $time = intval(round(microtime(true) * 1000));
            $this->addMsgStmt->bindParam(':time', $time);

            $res = $this->addMsgStmt->execute();
            if ($res) $res->finalize();

            $this->addMsgStmt->reset();
            return $res != false;
        }

        // Retrieves user data given user name or UID.
        // Returns false on error or an associative array with keys UID, name and pwd
        public function getUser($name = null, $uid = null) {
            if (!$this->getUsrStmt) 
                return false;         
   
            $this->getUsrStmt->bindParam(':name', $name);
            $this->getUsrStmt->bindParam(':uid', $uid);

            $res = $this->getUsrStmt->execute();
            $data = false;
            
            if ($res) {
                $data = $res->fetchArray(SQLITE3_ASSOC);
                $res->finalize();
            }

            $this->getUsrStmt->reset();
            return $data;
        }

        // Retrieves message data given a starting Roar ID (= sequence number)
        // Returns false on error or an array of associative arrays with keys RID, name, time, message
        public function getMessages($sinceRID = 0) {
            if (!$this->getMsgStmt) 
                return false;         
   
            $this->getMsgStmt->bindParam(':rid', $sinceRID, SQLITE3_INTEGER);

            $res = $this->getMsgStmt->execute();
            $data = false;
            
            if ($res) {
                $data = [];
                while ($row = $res->fetchArray(SQLITE3_ASSOC))
                    $data[] = $row;
                $res->finalize();
            }

            $this->getMsgStmt->reset();
            return $data;
        }
    }
?>
