//link to Hack Reactor Project requirements: https://docs.google.com/document/d/1KYDJ3cANthdyFLoTWat8jbhF8YsvYtbq_bG78vrNwHY/edit

//OVERALL GOAL: Create website that makes it easier to bike around the city of SF
//and incentivizes you to bike over taking Uber

//links to APIs for reference:
	//Google Maps: https://developers.google.com/maps/documentation/javascript/
		//API KEY (need to add reference website to get it working): AIzaSyDc5cYrZq0EZUzvyazKCtjXgGtqNlV3G7M
	//Uber: //(http://jonsadka.com/blog/how-to-use-the-uber-api-to-get-pricing-data/)
		//(must be passed as an Authorization Header with type=Token): curl -H 'Authorization: Token YOUR_SERVER_TOKEN' \
		'https://api.uber.com/v1/products?latitude=37.7759792&longitude=-122.41823'
	//SF Open Data: 
		//Bike Theft: https://data.sfgov.org/Public-Safety/Bicycle-Theft-Filter/rj3c-cgxu
		//Bike Parking: https://data.sfgov.org/Transportation/Bicycle-Parking-Public-/w969-5mn4
    
 //other resources:
    //Directions!: http://www.dreamdealer.nl/tutorials/getting_directions_with_google_maps.html
    //Google drop down directions: https://developers.google.com/maps/documentation/javascript/examples/directions-panel

/*

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com/");
*/

//SUB-GOAL: On initial page load, load Google map with the biking directions functionality
var globalPlaceArray = [];
    
function initMap() {
  var origin_place_id = null;
  var destination_place_id = null;
  var travel_mode = google.maps.TravelMode.BICYCLING;
  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    center: {lat: 37.7833, lng: -122.4167},
    zoom: 13
  });
  
  
//resize map as the window is resized, keeping it centered on the page

var center;
function calculateCenter() {
  center = map.getCenter();
}
  
google.maps.event.addDomListener(map, 'idle', function() {
  calculateCenter();
});
  
google.maps.event.addDomListener(window, 'resize', function() {
  map.setCenter(center);
});

//add directions capabilities
var directionsService = new google.maps.DirectionsService;
var directionsDisplay = new google.maps.DirectionsRenderer;
directionsDisplay.setMap(map);

var origin_input = document.getElementById('origin-input');
var destination_input = document.getElementById('destination-input');
var modes = document.getElementById('mode-selector');

map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
map.controls[google.maps.ControlPosition.TOP_LEFT].push(destination_input);
map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
origin_autocomplete.bindTo('bounds', map);
var destination_autocomplete =
    new google.maps.places.Autocomplete(destination_input);
destination_autocomplete.bindTo('bounds', map);

//auto adjust map size to the screen

function expandViewportToFitPlace(map, place) {
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  }

origin_autocomplete.addListener('place_changed', function() {
  var place = origin_autocomplete.getPlace();
  if (!place.geometry) {
    window.alert("Autocomplete's returned place contains no geometry");
    return;
  }
  expandViewportToFitPlace(map, place);

  // For origin, if the place has a geometry, store its place ID and route if we have
  // the other place ID
  origin_place_id = place.place_id;
  
  route(origin_place_id, destination_place_id, travel_mode,
        directionsService, directionsDisplay);
    
  //add lat/lng to global array to be able to access later by Uber API
  origin_lat = place.geometry.location.lat();
  origin_lng = place.geometry.location.lng();
  globalPlaceArray.push(origin_lat);
  globalPlaceArray.push(origin_lng);
});

destination_autocomplete.addListener('place_changed', function() {
  var place = destination_autocomplete.getPlace();
  if (!place.geometry) {
    window.alert("Autocomplete's returned place contains no geometry");
    return;
  }
  expandViewportToFitPlace(map, place);

  //For Destination, if the place has a geometry, store its place ID and route if we have the other place ID
  destination_place_id = place.place_id;
  route(origin_place_id, destination_place_id, travel_mode,
        directionsService, directionsDisplay);
  
  //add lat/lng to global array to be able to access later by Uber API
  destination_lat = place.geometry.location.lat();
  destination_lng = place.geometry.location.lng();
  globalPlaceArray.push(destination_lat);
  globalPlaceArray.push(destination_lng);

  var coordinateManipulation = 'https://data.sfgov.org/resource/w969-5mn4.json?$where=within_circle(latitude, ' + destination_lat + ', ' + destination_lng + ', 100)';

  $.getJSON(coordinateManipulation, function(data) {
    bikeParkingParsed = data;
  });
});

  function route(origin_place_id, destination_place_id, travel_mode,
                 directionsService, directionsDisplay) {
    if (!origin_place_id || !destination_place_id) {
      return;
    }
    directionsService.route({
      origin: {'placeId': origin_place_id},
      destination: {'placeId': destination_place_id},
      travelMode: travel_mode
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }
}

//**UBER FARE CALCULATION SECTION: use as the inputs origin_place_id, destination_place_id
//compile string that is the data request to the server which includes lat/long of 

var uberClientId = "CzJIujgzsNGObUPtD9DU5m2HYyywu88T";
var uberServerToken = "F6nx3eyW2Z7QWxsXMtP3FrjCiMEDJy-wetF9lJlM";


var start_latitude = globalPlaceArray[0];
var start_longitude = globalPlaceArray[1];
var destination_latitude = globalPlaceArray[2];
var destination_longitude = globalPlaceArray[3];

//**TBD: https://github.com/Thinkful/guide-uber-api/blob/master/app/05-parsing-uber-api/js/uber.js
//**ALSO HERE: https://github.com/devleague/Uber-Price-Estimate/blob/master/api.js
//NEED TO COMMECT TO A SERVER?

function getEstimatesForUserLocation(latitude, longitude) {
  console.log("hi");
  $.ajax({
    url: "https://api.uber.com/v1/estimates/price",
    headers: {
        Authorization: "Token " + uberServerToken
    },
    data: {
      start_latitude: latitude,
      start_longitude: longitude,
      end_latitude: destination_latitude,
      end_longitude: destination_longitude
    },
    success: function(result) {
      console.log(result);
    }
  });
}

getEstimatesForUserLocation(start_latitude, start_longitude);

//parse the Uber JSON object to get the fare estimate from the object,
//https://www.thinkful.com/learn/uber-api/#Fetching-Time-Estimates-from-Uber
  //identify the the sub-object with the key:value of "display_name": "UberBLACK",

var lowEstimate = 10;
var highEstimate = 8;
var totalSavings = 0;
var bikeButton = document.getElementById("bike"); //first button which is add button
var uberButton = document.getElementById("uber"); //second button which is uber ("subtract") button
var totalUberCalculationHolder = document.getElementById("total-savings"); //total savings
var ThisTripSavingsText = document.createElement("this-trip-savings");
var totalSavingsArray = [];

// get from that object the value of the low estimate and the high estimate, and then average the two
var averageCost = function () {
  return ((lowEstimate + highEstimate) / 2);
}

//Add the cost of this trip cost to the main page by editing innerHTML
var addToThisTrip = function() {
  document.getElementById("this-trip-savings").innerHTML = "$" + averageCost() + ".00";
}

var addToTotalSavings = function() {
  document.getElementById("total-savings-calculator").innerHTML = "$" + averageCost() + ".00";
}


addToThisTrip();

//***NEED TO FIX THIS FUNCTION SO IT ADDS BIKE TRIP TO SUM TOTAL!
var addToSum = function() {
  //**function that adds fanfare!
  console.log(averageCost());
  
  totalSavingsArray.push(averageCost());
  
  //sum the items in the total savings array into a local variable of grand total
  var totalSavings = totalSavingsArray.reduce(function (a,b) {
      return a + b;
      });
  
  //**need to append the total savings to the total money saved
  document.getElementById("total-savings-calculator").innerHTML = "$" + totalSavings + ".00";
  console.log(totalSavingsArray);
  //  
  
  //add to local storage the total savings as a new element in object
  localStorage.setItem(Date(), totalSavings);
  
  //append listItem to totalUberCalculationHolder?
      //totalUberCalculationHolder.appendChild(totalSavings);
  //**bindTaskEvents(totalSavings, taskCompleted);
}

//***function like the one for the bike click, but this time for Uber --
var subtractFromSum = function() {
  //**function that adds fanfare!
  console.log(-averageCost());
  
  totalSavingsArray.push(-averageCost());
  
  //sum the items in the total savings array
  var totalSavings = totalSavingsArray.reduce(function (a,b) {
      return a + b;
      });
  
  //**need to append the total savings to the total money saved
  document.getElementById("total-savings-calculator").innerHTML = "$" + totalSavings + ".00";
  console.log(totalSavingsArray);
  //  
  
    //add to local storage the total savings as a new element in object
  localStorage.setItem(Date(), totalSavings);
  
  //**TBD don't know if I need; append listItem to incompleteTasksHolder
  //totalUberCalculationHolder.appendChild(totalSavings);
  //**bindTaskEvents(totalSavings, taskCompleted);
}
bikeButton.addEventListener("click", addToSum);
uberButton.addEventListener("click", subtractFromSum);

/*Local storage pull total savings if page is refreshed
$.each(localStorage, function(key, value) {
    totalSavings = localStorage[0];
});
*/

   //add element to map that receives / stores to/from input
      //takes input and stores as new objects
      //var fromLocation = {"lat": , "long": };
      //var toLocation = {"lat": , "long": };
      //need to convert to geolocation using another API: https://developers.google.com/maps/documentation/geocoding/intro  

    //access directions API
    
  //***create fanfare when you submit the bike button
  //***also add marker for start address when put in, right now it just zooms!
  
  
//JSON SECTION: parse JSON files for bike parking and bike theft

//return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
  console.log("hi2");
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));    
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}

//JSON to get parking nearest (line 619 in bike parking app has the object format); latitude and longitude are keys
var nearestParkingCounter = [];


var bikeParkingParsed;
var testParse;


//define the load JSON function
/*function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'js/bike_parking.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

loadJSON(function(response) {
  // Parse JSON string into object
    var actual_JSON = JSON.parse(response);
 });
*/
var latmanipulation = destination_latitude;
var longmanipulation = destination_longitude;
var coordinateManipulation = 'https://data.sfgov.org/resource/w969-5mn4.json?$where=within_circle(latitude, ' + latmanipulation + ', ' + longmanipulation + ', 100)';

$.getJSON(coordinateManipulation, function(data) {
  bikeParkingParsed = data;
});

/*
$.getJSON('js/test.json', function(data) {
  testParse = data;
});

console.log(testParse);

*/
/*
$.getJSON('js/bike_parking.json', function(data) {
  console.log("running");
  console.log(data[2][2]);
  $.each(data, function(latitude, val) {
    if (destination_latitude - latitude < .01 || latitude - destination_latitude < .01) {
      nearestParkingCounter.push(data[1].ADDRESS);
    }
  });
});

*/
/*
//JSON to get bike theft (problem is there isn't key:values)
$(function() {
   var theftCounter = [];

   $.getJSON('js/bike_theft.json', function(data) {
       $.each(data.data, function() {
          console.log(data[17]);
     });

   });

});

*/
	//Access the SF Open API "SFPD Incidents Previous Year (2015)"
		//filter for PETTY THEFT BICYCLE "or" GRAND THEFT BICYCLE
		//additional filter for +/- 3 hrs from the time of page load (since crime varies by time of day)
	//Access the bike parking spot API
	//Create section that is "Money saved versus Uber" with a running total for the year
		//Access Uber API
		//Access database with the total money saved for the year
		//show 2x total money save this year biking (assumes that you return at the same price)


//SUB-GOAL: Locate bike parking spots close to a destination that have the lowest likelihood of bicycle
	//theft so that you a) don't waste time in transit trying to figure out where to park and
	//b) don't have to worry as much about your bike getting stolen
//2. When you submit "to" and "from" address to get directions,
	//For "to" address only, 
		//a) store the destination in a destination object with key: "original destination"
		//b) query the bike parking database from SF API 
			//filter list to only parking spots within .5 miles of destination
			//for each parking spot,
				//query the filtered SFPD bicycle incidents list
				//count the number of incidents within .5 miles of destination over past year
				//create new column in database attributed to that object with the count of incidents
		//c) Pull the parking spot with the least number of incidents within .5 miles
			//if multiple spots have the least number of incidents,
				//find spot with shortest distance to stated destination in original search
		//d) store sparking spot as new key "optimal parking spot" 
		//e) complete direction request to optimal parking spot as a WAYPOINT on directions
        //see waypoint API: https://developers.google.com/maps/documentation/directions/intro#TravelModes

//SUB-GOAL: Create a "nudge" to get you to bike rather than spend money on taking Uber!
//3. Access the Uber API
	//enter latitude and longitude of to and "original" from destination
	//store object as a new variable "uberPrice"
	//average low and high estimate to get a median price for trip 
		
//4. Create two buttons on homepage: "Bike?" and "Uber?"
	//if bike button pressed, 
		//store the median uber price in database in "moneySaved column"
		//this should automatically add to the running total, but if not 
			//add 2x amount to the running total (assumes you bike home at same price)
//store time saved?
  //use google to calculate the estimated time biking
  //use Uber to find estimated trip time + wait time
  //calculate difference between Uber and biking
  //increment "time saved" box
