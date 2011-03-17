

var g_map;
var g_marker_player;
var g_marker_victims = new Array();
var g_step_width = 0.0001;

function show_map(pos) {
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    $("#startPos").text(latlng.toString());
    
    var map_opts = {
        zoom: 15,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    g_map = new google.maps.Map(document.getElementById("map_canvas"), map_opts);
    
    var marker_opts = {
        map: g_map,
        position: latlng,
        title: $("#username").text(),
        zIndex: 10
    };
    g_marker_player = new google.maps.Marker(marker_opts);
    
    $.ajax({
        url: 'checkin',
        data: {lat:latlng.lat(), lng:latlng.lng()},
        dataType: 'json',
        error: function(xhr) {
            alert('unable to do ajax jquery.');
        },
        success: function(response) {
            //alert('lat:' + response.lat + ' lng:' + response.lng);
        }
    });
    
    generate_victims();
}

$(function() {
    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(show_map);
    }
    else {
        $('div#map_canvas').html('Your browser does not support geolocation.');
    }
    
    $(document).keydown(key_handler);
});


function key_handler(e) {
	var key = e.keyCode;
	var old_latlng = g_marker_player.getPosition();
	var lat = old_latlng.lat();
	var lng = old_latlng.lng();
	
    if (key == 37) { // left
    	lng -= g_step_width;
    }
    else if (key == 38) { // up
    	lat += g_step_width;
    }
    else if (key == 39) { // right
    	lng += g_step_width;
    }
    else if (key == 40) { // down
    	lat -= g_step_width;
    }
    else {
    	return;
    }
    
    var new_latlng = new google.maps.LatLng(lat, lng);
	g_marker_player.setPosition(new_latlng);
	g_map.setCenter(new_latlng);
	$("#curPos").text(new_latlng.toString());
}

function generate_victims() {
    $.ajax({
        url: 'generate_victims',
        data: {step_limit: 100, count: 1},
        dataType: 'json',
        error: function(xhr) {
            alert('[error] No more victims, stop robbing!');
        },
        success: function(json) {
        	var p_latlng = g_marker_player.getPosition();
        	
        	for (var i = 0; i < json.length; i++) {
        		var v_latlng = new google.maps.LatLng(
        			p_latlng.lat() + json[i].lat_step * g_step_width,
        			p_latlng.lng() + json[i].lng_step * g_step_width);
        		var marker_opts = {
			        map: g_map,
			        position: v_latlng,
			        title: 'victim',
			        icon: '/img/nuts.png',
			        zIndex: 0
			    };
			    g_marker_victims.push(new google.maps.Marker(marker_opts));	
        	}
        	var bounds = new google.maps.LatLngBounds();
        	bounds.extend(g_marker_player.getPosition());
        	for (var i = 0; i < g_marker_victims.length; i++) {
        		bounds.extend(g_marker_victims[i].getPosition());
        	}
        	g_map.fitBounds(bounds);
        }
    });
}
