var map;

var markers =[];

var Data = function (data) {
    this.type = ko.observable(data.type);
    this.title = ko.observable(data.title);
    this.position= ko.observable(data.position);
    this.url = ko.observable(data.url);
};

var viewModel = function() {

    var self = this;

    self.locationList = ko.observableArray([]);

    locations.forEach(function(data){
        self.locationList.push(new Data(data));
    });

    this.classListLength = ko.observable(1);

    this.openNav = function(){
        return classListLength(document.getElementById("hamberger").classList.length);
    };


    this.listShow = ko.observable(false);

    this.clicked = function () {
        this.listShow(true);
    };


    

        this.filter = ko.observable("");

        this.filteredLocations = ko.computed(function(){
        
            var temporaryLoc = this.locationList();

            var filter = this.filter().toLowerCase();
            console.log(self.listShow());

            if(self.listShow() == false){
                return;
            }else{
        
            if(!filter){
                CreateMarkers(temporaryLoc);
                return temporaryLoc;

                } else {
                var output = ko.utils.arrayFilter(temporaryLoc,function(locate){
                    return stringStartsWith(locate.title().toLowerCase(),filter);
            });
            CreateMarkers(output);
            return output;
        }
    }
    });

    var stringStartsWith = function (string, startsWith) {
        string = string || "";
        if (startsWith.length > string.length)
            return false;
        return string.substring(0, startsWith.length) === startsWith;
    };

    
    this.currentLocation = ko.observableArray("");

    this.setLoc = function (clickedLoc) {
        console.log('I am run');
        self.listShow(false);
        self.currentLocation([]);
        self.currentLocation().push(clickedLoc);
        CreateMarkers(self.currentLocation());
    };


};
ko.applyBindings(viewModel);





function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 12.9141417,
            lng: 74.8559568
        },
        zoom: 10
    });

    CreateMarkers(locationList());

     var searchBox = new google.maps.places.SearchBox(
         document.getElementById('places-search')
     );

     // Bias the SearchBox results towards current map's viewport.
     map.addListener('bounds_changed', function () {
         searchBox.setBounds(map.getBounds());
     });

     searchBox.addListener('places_changed', function () {
         console.log("place changed");
         searchForPlaces(this);
     });
    
} 

 

function CreateMarkers(locationsArray) {
    //create markers
    var place_id = -1;

    console.log("inside Create Markers");

    var largeInfoWindow = new google.maps.InfoWindow();

    var bounds = new google.maps.LatLngBounds();

    console.log(locationsArray.length);

    markers.forEach(function(marker){
        marker.setMap(null);
    })

    locationsArray.forEach(function (location) {
        place_id += 1;
        var marker = new google.maps.Marker({
            position: location.position(),
            map: map,
            title: location.title(),
            animation: google.maps.Animation.DROP,
            id: place_id,
        });


        markers.push(marker);

       

        //Create the "highlighted location" marker color when the user hovers over it
        var highlightedIcon = makeMarkerIcon('FFFF24');
        /**       li.addEventListener('click', function () {
            var place = this.getAttribute("id");
            markers[place].setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){
                markers[place].setAnimation(null);
            }, 3000);
            populateInfoWindow(markers[place],largeInfoWindow,location.url);
        });

        marker.addListener('mouseover', function () {
           this.setIcon(highlightedIcon);
        });

        marker.addListener('mouseout' ,function(){
            this.setIcon(null);
        });
     
        marker.addListener('click', function(){
            populateInfoWindow(this,largeInfoWindow,location.url);
        });
        **/

        bounds.extend(marker.position);
    });
    map.fitBounds(bounds);
    }


    

    


function populateInfoWindow(marker, infoWindow, url) {
    if (infoWindow.marker != marker) {
        infoWindow.setContent('<div>' + marker.title + '</div>' + '<br> <a href="' + url + '" target="_blank">know more </span>');
        infoWindow.open(map, marker);

    }
}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}


/**
function openNav(){
    document.getElementById("mySideNav").style.width = "250px";
    document.getElementById("map").style.left = "250px";
    var hamberger = document.getElementById("hamberger");
    if(hamberger.classList.length === 0){
    hamberger.classList.add('side-nav-open');
}
else{
    hamberger.classList.remove('side-nav-open');
    document.getElementById("mySideNav").style.width = "0";
    document.getElementById("map").style.left = "0";
}
}
**/


function SearchPlace(){
    document.getElementById("searchDown").style.display='block';
}

function searchForPlaces(searchBox){
    hideMarkers(markers);
    var places = searchBox.getPlaces();
    if (places.length == 0) {
        window.alert("We did not find any places any places matching that query!");
    }
    createMarkersForPlaces(places);
}

function hideMarkers(placemarkers){
    for(var i=0; i<placemarkers.length ; i++){
        placemarkers[i].setMap(null);
    }
}

function createMarkersForPlaces(places) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            anchor: new google.maps.Point(15, 34),
            origin: new google.maps.Point(0, 0),
            scaledsize: new google.maps.Size(25, 25)
        };
        //create a marker for each place.
        var marker = new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id
        });

        //Create a single InfoWindow to be used with the place details info 
        //so that only one is open at once.
        var placeInfoWindow = new google.maps.InfoWindow();
        //If a marker is clicked , do a place details search on it in the next function
        marker.addListener('click', function () {
            if (placeInfoWindow.marker == this) {
                console.log("This info window is already on this marker!");
            } else {
                getPlacesDetails(this, placeInfoWindow);
            }
        });
        markers.push(marker);
        if (place.geometry.viewport) {
            //Only geocodes have viewports
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(places.geometry.location);
        }
    }
    map.fitBounds(bounds);
}

function getPlacesDetails(marker, infoWindow) {
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: marker.id
    }, function (place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            //set the marker property on this infoWindow so it is not created again.
            infoWindow.marker = marker;
            var innerHTML = '<div>';
            if (place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
            }
            if (place.formatted_address) {
                innerHTML += '<br>' + place.formatted_address;
            }
            if (place.formatted_phone_number) {
                innerHTML += '<br>' + place.formatted_phone_number;
            }
            if (place.opening_hours) {
                innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weakday_text[0] + '<br' +
                    place.opening_hours.weakday_text[1] + '<br' +
                    place.opening_hours.weakday_text[2] + '<br' +
                    place.opening_hours.weakday_text[3] + '<br' +
                    place.opening_hours.weakday_text[4] + '<br' +
                    place.opening_hours.weakday_text[5] + '<br' +
                    place.opening_hours.weakday_text[6];
            }
            if (place.photos) {
                innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                    { maxHeight: 100, maxWidth: 200 }) + '">';
            }
            innerHTML += '</div>';
            infoWindow.setContent(innerHTML);
            infoWindow.open(map, marker);
            //make sure the marker property is cleared if the infowindow is closed
            infoWindow.addListener('closeclick', function () {
                infoWindow.marker = null;
            });
        } else {
            console.log("status: not OK");
        }
    });
}
