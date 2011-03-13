function show_map(pos) {
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    var map_opts = {
        zoom: 11,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), map_opts);
    
    var marker_opts = {
        map: map,
        position: latlng
    };
    var marker = new google.maps.Marker(marker_opts);
    
    $.ajax({
        url: 'checkin',
        data: {lat:latlng.lat(), lng:latlng.lng()},
        dataType: 'json',
        error: function(xhr) {
            alert('unable to do ajax jquery.');
        },
        success: function(response) {
            alert('lat:' + response.lat + ' lng:' + response.lng);
        }
    })
}

function initialize() {
    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(show_map);
    }
    else {
        $('div#map_canvas').html('Your browser does not support geolocation.');
    }    
}