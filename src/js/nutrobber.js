

var g_map;
var g_marker_player;
var g_marker_victims = new Array();
var g_step_width = 0.0001;
var g_info_window_victim = new google.maps.InfoWindow(
    {
        content: '',
        zIndex: 0,
        size: new google.maps.Size(30, 30)
    }); 

function show_map(pos) {
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    $("#startPos").text(latlng.toString());
    
    var map_opts = {
        zoom: 15,
        maxZoom: 18,
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
    $(document).keydown(key_handler);
}

$(function() {
    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(show_map);
        $('a.victim-menu').live('click', function(event){
            event.preventDefault();
            $(this).html('目前尚未開放此功能!XD');
            // TODO: send robbery info to server thru ajax
        });
    }
    else {
        $('div#map_canvas').html('Your browser does not support geolocation.');
    }
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
	keep_markers_in_map();
	$("#curPos").text(new_latlng.toString());
}

function generate_victims() {
    $.ajax({
        url: 'generate_victims',
        data: {step_limit: 100, count: 2},
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
			    var marker = new google.maps.Marker(marker_opts);
			    set_victims_event(marker);
			    g_marker_victims.push(marker);
        	}
        	keep_markers_in_map();
        }
    });
}

function keep_markers_in_map() {
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(g_marker_player.getPosition());
	for (var i = 0; i < g_marker_victims.length; i++) {
		bounds.extend(g_marker_victims[i].getPosition());
	}
	g_map.fitBounds(bounds);
}

function set_victims_event(marker){
    google.maps.event.addListener(marker, 'click', function(event){
        debug(marker.getPosition());
        open_menu(marker);
    });
}
function open_menu(marker) {
    var rob_link_id=marker.getPosition().lat().toString()+'|'+marker.getPosition().lng().toString();
    g_info_window_victim.setPosition(marker.getPosition());
    g_info_window_victim.setContent('<a id="'+rob_link_id+'" class="victim-menu" href="#">進行搶奪</a>');
    g_info_window_victim.open(g_map, marker);
}
function debug(message) {
    $('#debug').html('[DEBUG]: '+message);
}
