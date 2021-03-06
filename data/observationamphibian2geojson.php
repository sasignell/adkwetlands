<?php
/**
 * Title:   PostGIS to GeoJSON
 * Notes:   Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * Author:  Bryan R. McBride, GISP
 * Contact: bryanmcbride.com
 * GitHub:  https://github.com/bmcbride/PHP-Database-GeoJSON
 */
session_start();

require("../../php/adkwetlands/dbinfoARGIS.php");


$conn = new PDO("pgsql:host=$host;dbname=$database","$user","$password");

# Build SQL SELECT statement and return the geometry as a GeoJSON element
$sql = "SELECT DISTINCT a.name,b.point_number,b.lat,b.lng, c.*, 'amphibian' AS surveytype,d.observation_fk,public.ST_AsGeoJSON(public.ST_Transform(b.geom,4326),6) as geojson
FROM adkwetlands.observationpoint AS b JOIN adkwetlands.site AS a ON a.site_pk=b.site_fk
                      JOIN adkwetlands.observation AS c ON c.observationpoint_fk=b.observationpoint_pk
                        JOIN adkwetlands.amphibian AS d ON c.observation_pk=d.observation_fk";

# Try query or error
$rs = $conn->query($sql);
if (!$rs) {
    echo 'An SQL error occured.\n';
    exit;
}

# Build GeoJSON feature collection array
$geojson = array(
   'type'      => 'FeatureCollection',
   'features'  => array()
);

# Loop through rows to build feature arrays
while ($row = $rs->fetch(PDO::FETCH_ASSOC)) {
    $properties = $row;
    # Remove geojson and geometry fields from properties
    unset($properties['geojson']);
    unset($properties['the_geom']);
    $feature = array(
         'type' => 'Feature',
         'geometry' => json_decode($row['geojson'], true),
         'properties' => $properties
    );
    # Add feature arrays to feature collection array
    array_push($geojson['features'], $feature);
}

header('Content-type: application/json');
echo json_encode($geojson, JSON_NUMERIC_CHECK);
$f = fopen("observationamphibian.geojson", "w"); 
fwrite($f, json_encode($geojson)); 
fclose($f);

$conn = NULL;
?>