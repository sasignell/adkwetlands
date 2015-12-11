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
$sql = "SELECT DISTINCT 
    b.name AS site,
    a.obs_point,
    c.observers,
    c.date,
    c.start_time,
    c.wind,
    c.cloud, 
    d.species_code,
    d.call_index,
    public.ST_AsGeoJSON(public.ST_Transform(a.geom,4326),6) as geojson
FROM adkwetlands.obs_point AS a JOIN adkwetlands.site AS b ON a.site_fk=b.site_pk
     JOIN adkwetlands.herp_survey AS c ON a.obs_point_pk=c.obs_point_fk
     JOIN adkwetlands.herp_obs AS d ON c.herp_survey_pk=d.herp_survey_fk
     ORDER by b.name,c.date ";

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
$f = fopen("herp_obs.geojson", "w"); 
fwrite($f, json_encode($geojson)); 
fclose($f);

$conn = NULL;
?>