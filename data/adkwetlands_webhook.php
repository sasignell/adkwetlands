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


# Fulcrum Info
$form_id = '441bdd57-635d-4ce8-984d-4027b0101e00';
//$input = file_get_contents('webhook-payload.json'); # local file for testing
$input = file_get_contents('php://input'); # POST data from webhook
$data = json_decode($input,true);

# Make sure it's the form we want
if ($data['data']['form_id'] == $form_id) {

  # Array to hold form fields
  $formArray = array();
  # Loop through form values and format values
  foreach ($data['data']['form_values'] as $key => $value) {
    # Join choice values & other values and convert to string
    if (isset($value['choice_values']) && is_array($value['choice_values'])) {
      if (isset($value['other_values'])) {
        $value = array_merge($value['choice_values'], $value['other_values']);
      }
      $value = implode(',', $value);
    }
    # Get string of photo id's
    if ($key == 'c18f') {
      $photoArray = array();
      foreach ($value as $photoKey => $photoVal) {
        $photoArray[] = $photoVal['photo_id'];
      }
      $value = implode(',', $photoArray);
    }
    $formArray[$key] = $value;
    # Inspect local payload for testing
    //echo $key . ': ' . $value . '<br>';
  }

  # Standard Fulcrum fields
  $fulcrum_id = $data['data']['id'];
  $status = $data['data']['status'];
  $version = $data['data']['version'];
  $form_id = $data['data']['form_id'];
  $form_version = $data['data']['form_version'];
  //$project_id = $data['data']['project_id'];
  //$project = $project_name[$project_id];
  $created_at = $data['data']['created_at'];
  $updated_at = $data['data']['updated_at'];
  $client_created_at = $data['data']['client_created_at'];
  $client_updated_at = $data['data']['client_updated_at'];
  $created_by = $data['data']['created_by'];
  $created_by_id = $data['data']['created_by_id'];
  $updated_by = $data['data']['updated_by'];
  $updated_by_id = $data['data']['updated_by_id'];
  $assigned_to = $data['data']['assigned_to'];
  $assigned_to_id = $data['data']['assigned_to_id'];
  $latitude = $data['data']['latitude'];
  $longitude = $data['data']['longitude'];
  $altitude = $data['data']['altitude'];
  $speed = $data['data']['speed'];
  $course = $data['data']['course'];
  $horizontal_accuracy = $data['data']['horizontal_accuracy'];
  $vertical_accuracy = $data['data']['vertical_accuracy'];

  # Custom form fields

  # Check if field is in payload and return an empty string if not
  function field($id) {
    global $formArray;
    return (isset($formArray[$id]) ? $formArray[$id] : '');
  }

  $surveysite = field('37c2');
  $nhp_uid = field('8db1');
  # Visit Details (repeatable)
  /*if (isset($formArray['5ef8'])) {
    $visits = $formArray['5ef8'];
    $visit_ids = array();
    foreach ($visits as $key => $value) {
      $visit_id = $value['id'];
      $visit_parent_id = $fulcrum_id;
      $visit_date = $value['form_values']['6d7f'];
      $visit_time = $value['form_values']['6679'];
      $visit_comments = $value['form_values']['84a5'];
      $field_technician = implode(', ', array_merge($value['form_values']['eb9a']['choice_values'], $value['form_values']['eb9a']['other_values']));
      $sql = "DELETE FROM lowell_regulator_inspections_visit_details WHERE fulcrum_id = $$$visit_id$$; INSERT INTO lowell_regulator_inspections_visit_details (fulcrum_id, fulcrum_parent_id, visit_date, visit_time, visit_comments, field_technician) VALUES ($$$visit_id$$, $$$visit_parent_id$$, $$$visit_date$$, $$$visit_time$$, $$$visit_comments$$, $$$field_technician$$);";
      $ch = curl_init('https://'.$cartodb_username.'.cartodb.com/api/v2/sql');
      $query = http_build_query(array('q'=>$sql,'api_key'=>$cartodb_api_key));
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
      curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
      curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
      $result = curl_exec($ch);
      curl_close($ch);
    }
  }*/

  # Insert new CartoDB Record
  if ($data['type'] == 'record.create') {
    $sql = "INSERT INTO $table (fulcrum_id, longitude,latitude, surveysite, nhp_uid) VALUES ($$$fulcrum_id$$,$$$longitude$$,$$$latitude$$,$$$surveysite$$, $$$nhp_uid$$);";
  }
  # Update existing CartoDB record
  if ($data['type'] == 'record.update') {
    $sql = "UPDATE $table SET (fulcrum_id,longitude,latitude, surveysite, nhp_uid) = ($$$fulcrum_id$$,$$$longitude$$,$$$latitude$$,$$$surveysite$$, $$$nhp_uid$$) WHERE fulcrum_id = $$$fulcrum_id$$;";
  }
  # Delete existing CartoDB record
  if ($data['type'] == 'record.delete') {
    $sql = "DELETE FROM $table WHERE fulcrum_id = $$$fulcrum_id$$;";
  }

$result = pg_query($sql); 
        if (!$result) { 
            $errormessage = pg_last_error(); 
            echo "Error with query: " . $errormessage; 
            exit(); 
        } 

  # Write SQL out to file for inspection
  $text = fopen('webhook-insp.sql', 'w+');
  fwrite($text, $sql);
  fclose($text);

  # Write payload out to file for inspection
  $json = json_encode($input);
  $data = json_decode($json, true);
  $payload = fopen('webhook-payload.json', 'w+');
  fwrite($payload, $data);
  fclose($payload);
}
?>
