<?php
# CartoDB Info
//$cartodb_username = 'adkwetlands';
//$cartodb_api_key = 'b95cb696e7db8bc5e49ea110fa1be260c507a039';
//$table = 'study_sites';


$user="adkwetlands";
$password="@dkw3t1*1";
$database="argis";
$host="beierlab.net";
$port="5432";
$table = 'adkwetlands.adk_wetlands4_0';

// Open a connection to PostgreSQL server
$connection=pg_connect ("dbname=$database user=$user password=$password host=$host port=$port");
if (!$connection) {
  die("Not connected : " . pg_error());
}

$sql = "INSERT INTO adkwetlands.adk_wetlands4_0 (surveysite, nhp_uid) VALUES ('test', 'test');";

 
$result = pg_query($sql); 
        if (!$result) { 
            $errormessage = pg_last_error(); 
            echo "Error with query: " . $errormessage; 
            exit(); 
        } 
        //printf ("These values were inserted into the database - %s %s %s", $firstname, $surname, $emailaddress); 
        pg_close(); 

?>
