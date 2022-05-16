<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class Config
{
    /**
     * path to the sqlite file
     */
    const PATH_TO_SQLITE_FILE = '/var/www/html/phpsqlite.db';
}
