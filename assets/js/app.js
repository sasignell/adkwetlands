var map, featureList, siteSearch = [], birdSearch = [], amphibianSearch = [];

$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(site.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});

function sidebarClick(id) {
  map.addLayer(birdLayer).addLayer(amphibianLayer);
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 18);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

/* Basemap Layers */
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);

var site = new L.GeoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: 'assets/img/site.png',
                iconSize: [18, 21],
                iconAnchor: [12, 28],
                popupAnchor: [0, -25]
            }),
            title: feature.properties.name
        });
    },
    onEachFeature: function (feature, layer) {

                //console.log(feature.geometry.coordinates[0][0])
                layer.bindPopup("<strong>" + feature.properties.name + "</strong><br>" + "NHP ID:" + feature.properties.surveysite_id +"<br> Survey Date: " + feature.properties.surveydate + "<br><i>" + feature.properties.strcomment ,  {
                    closeButton: true

        })
      siteSearch.push({
        name: layer.feature.properties.name,
        address: layer.feature.properties.surveysite_id,
        source: "Sites",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
});

$.getJSON("data/site.geojson", function (data) {
  site.addData(data);
  map.addLayer(site);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 20
});

/* Empty layer placeholder to add to layer control for listening when to add/remove birds to markerClusters layer */
var birdLayer = L.geoJson(null);
var birds = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/bird.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.name + ", " +"Pt. " + feature.properties.point_number + ", " + feature.properties.date,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      layer.bindPopup("<strong>Bird Survey: " + feature.properties.date + "</strong><br>" + feature.properties.time_start + "-" + feature.properties.time_start + "<br> Temp: " + feature.properties.temp_f + "<br><i>Observer: " + feature.properties.observer ,  {
                    closeButton: true

        })
/*      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.name + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.observer + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.lat + "</td></tr>" + "<tr></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            stroke: false,
            fillColor: "#00FFFF",
            fillOpacity: 0.7,
            radius: 10
          }));
        }
      });*/
      $("#feature-list tbody").append('<tr class="feature-row" id="'+L.stamp(layer)+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/bird.png"></td><td class="feature-name">' + layer.feature.properties.name + ', Pt. ' + layer.feature.properties.point_number +'<br>' + layer.feature.properties.date +'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      birdSearch.push({
        name: layer.feature.properties.name,
        address: layer.feature.properties.observer,
        source: "Birds",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/observationbird.geojson", function (data) {
  birds.addData(data);
  map.addLayer(birdLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove amphibians to markerClusters layer */
var amphibianLayer = L.geoJson(null);
var amphibians = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/amphibian.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.name + ", " +"Pt. " + feature.properties.point_number + ", " + feature.properties.date,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.name + "</td></tr>" + "<tr><th>Point</th><td>" + feature.properties.point_number + "</td></tr>" + "<tr><th>Date</th><td>" + feature.properties.date + "</td></tr>" + "<tr><th>Observer</th><td>" + feature.properties.observer + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            stroke: false,
            fillColor: "#00FFFF",
            fillOpacity: 0.7,
            radius: 10
          }));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="'+L.stamp(layer)+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/amphibian.png"></td><td class="feature-name">'+ layer.feature.properties.name + ', Pt. ' + layer.feature.properties.point_number +'<br>' + layer.feature.properties.date +'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      amphibianSearch.push({
        name: layer.feature.properties.name,
        address: layer.feature.properties.point_number,
        source: "Amphibians",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/observationamphibian.geojson", function (data) {
  amphibians.addData(data);
});

map = L.map("map", {
  zoom: 10,
  center: [40.702222, -73.979378],
  layers: [mapquestHYB, site, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === birdLayer) {
    markerClusters.addLayer(birds);
  }
  if (e.layer === amphibianLayer) {
    markerClusters.addLayer(amphibians);
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === birdLayer) {
    markerClusters.removeLayer(birds);
  }
  if (e.layer === amphibianLayer) {
    markerClusters.removeLayer(amphibians);
  }
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": mapquestOSM,
  "Aerial Imagery": mapquestOAM,
  "Imagery with Streets": mapquestHYB
};

var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/img/bird.png' width='24' height='28'>&nbsp;Bird Surveys": birdLayer,
    "<img src='assets/img/amphibian.png' width='24' height='28'>&nbsp;Amphibian Surveys": amphibianLayer
  },
  "Reference": {
    "Survey Sites": site
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  /* Fit map to sites bounds */
  map.fitBounds(site.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var siteBH = new Bloodhound({
    name: "Boroughs",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: siteSearch,
    limit: 10
  });

  var birdsBH = new Bloodhound({
    name: "Birds",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: birdSearch,
    limit: 10
  });

  var amphibiansBH = new Bloodhound({
    name: "Amphibians",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: amphibianSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  siteBH.initialize();
  birdsBH.initialize();
  amphibiansBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Sites",
    displayKey: "name",
    source: siteBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Study Sites</h4>"
    }
  }/*, {
    name: "Birds",
    displayKey: "name",
    source: birdsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/bird.png' width='24' height='28'>&nbsp;Birds</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Amphibians",
    displayKey: "name",
    source: amphibiansBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/amphibian.png' width='24' height='28'>&nbsp;Amphibians</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }*/, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Sites") {
      if (!map.hasLayer(site)) {
        map.addLayer(site);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    /*if (datum.source === "Birds") {
      if (!map.hasLayer(birdLayer)) {
        map.addLayer(birdLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Amphibians") {
      if (!map.hasLayer(amphibianLayer)) {
        map.addLayer(amphibianLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }*/
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});
