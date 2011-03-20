var g_map;
var g_myid;
var g_myname;
var g_mymarker;
var g_marker_victims = new Array();
var g_step_width = 0.0001;
var g_players = new Array();

function ajax_refresh_map(latlng) {
    $.getJSON(
        'refresh_map',
        {lat:latlng.lat(), lng:latlng.lng()},
        function (json) {
            // clear all player markers
            for (var i = 0; i < g_players.length; i++) {
                g_players[i].setMap(null);
                g_players.pop()
            }
            // redraw player markers
            for (var i = 0; i < json.players.length; i++) {
                if (json.players[i].id != g_myid) {
                    var p_latlng = new google.maps.LatLng(json.players[i].lat, json.players[i].lng);
                    var p_marker_opts = {
                        map: g_map,
                        position: p_latlng,
                        title: json.players[i].name,
                        zIndex: 10
                    };
                    var p_marker = new google.maps.Marker(p_marker_opts);
                    g_players.push(p_marker);
                }
            }            
        }
    )
}

function ajax_update_position(latlng) {
    $.getJSON(
        'update_position',
        {lat:latlng.lat(), lng:latlng.lng()},
        function (json) {}
    )
}

function ajax_checkin(latlng) {
    $.getJSON(
        'checkin',
        {lat:latlng.lat(), lng:latlng.lng()},
        function (json) {
            g_myid = json.myid;
            g_myname = json.myname;
            var marker_opts = {
                map: g_map,
                position: latlng,
                title: g_myname,
                zIndex: 10
            }
            g_mymarker = new google.maps.Marker(marker_opts);
        }
    )
}

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
        
    ajax_checkin(latlng);
    ajax_refresh_map(latlng);
    ajax_generate_victims();
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

function need_update(old_latlng, new_latlng) {
    var olat = old_latlng.lat();
    var olng = old_latlng.lng();
    var nlat = new_latlng.lat();
    var nlng = new_latlng.lng();
    
    return (olat-nlat)^2 + (olng-nlng)^2 >= 50*g_step_width; 
}

function key_handler(e) {
	var key = e.keyCode;
	var old_latlng = g_mymarker.getPosition();
	var nlat = old_latlng.lat();
	var nlng = old_latlng.lng();
	
    if (key == 37) { // left
    	nlng -= g_step_width;
    }
    else if (key == 38) { // up
    	nlat += g_step_width;
    }
    else if (key == 39) { // right
    	nlng += g_step_width;
    }
    else if (key == 40) { // down
    	nlat -= g_step_width;
    }
    else {
    	return;
    }
    
    var new_latlng = new google.maps.LatLng(nlat, nlng);
	g_mymarker.setPosition(new_latlng);
	keep_markers_in_map();
	$("#curPos").text(new_latlng.toString());
	
	if (need_update(old_latlng, new_latlng)) {
	    ajax_update_position(new_latlng);
	}
}

function ajax_generate_victims() {
    $.getJSON(
        'generate_victims', 
        {step_limit: 100, count: 2}, 
        function(json) {
            var p_latlng = g_mymarker.getPosition();
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
    )
}

function keep_markers_in_map() {
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(g_mymarker.getPosition());
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
