var pathArray = [];
var select_path = document.getElementById("path_list");
var start;
var end;      
var selected_path;
var starting_name;
var destination_name;
var duration;
var syntetagmenes = new Array();

function readPathNames() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            responsePathNames(this);
            }
        };
        xmlhttp.open("GET", 'http://feed.opendata.imet.gr:23577/itravel/paths.xml', true);
        xmlhttp.send();
}

function responsePathNames(xml) {
  var x, i, xmlDoc;
  xmlDoc = xml.responseXML;
  x = xmlDoc.getElementsByTagName("Path_Name");
  for (i = 0; i< x.length; i++) {    
      pathArray.push(x[i].childNodes[0].nodeValue);    
  }

  for (var i = 0; i < pathArray.length; i++) { 
        var diadromi = pathArray[i]; 
        var option = document.createElement("option"); 
        option.textContent = diadromi; 
        option.value = diadromi; 
        select_path.appendChild(option); 
    }
}

function getPathListData(){
  selected_path = document.getElementById("path_list").value;
  //console.log(selected_path);
  searchforSelectedPath();
} 

function searchforSelectedPath() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      responseSearchforSelectedPath(this);
    }
  };
  xmlhttp.open("GET", 'http://feed.opendata.imet.gr:23577/itravel/paths.xml', true);
  xmlhttp.send();
}            
function responseSearchforSelectedPath(xml){
    var x, i, xmlDoc;
    var coords;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName("element");
    //Search for selected Path
    for (i = 0; i < x.length; i++) {
        if(x[i].getElementsByTagName("Path_Name")[0].childNodes[0].nodeValue == selected_path){        
          coords = x[i].getElementsByTagName("polyline")[0].childNodes[0].nodeValue;
          // start: Το id της αφετηρίας
          // end: Το id του προορισμού
          start = x[i].getElementsByTagName("Path_origin_device_id")[0].childNodes[0].nodeValue;
          end = x[i].getElementsByTagName("Path_destination_device_id")[0].childNodes[0].nodeValue;
          id = x[i].getElementsByTagName("Path_id")[0].childNodes[0].nodeValue;
        }    
    }
    //console.log("Type of coords:" + typeof coords);
    var pattern = /[0-9]+\.[0-9]+/g;
    var parsedCoords = coords.match(pattern);
    var convertedCoords = new Array();
    //console.log("parsedCoords------" + parsedCoords);
    for(var i=0;i<parsedCoords.length;i+=2){
        convertedCoords.push({lat: parseFloat(parsedCoords[i+1]), lng: parseFloat(parsedCoords[i])});
    }
    syntetagmenes = convertedCoords;
    askforDevice();
}


function askforDevice() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      responseforDevice(this);
    }
  };
  xmlhttp.open("GET", 'http://feed.opendata.imet.gr:23577/itravel/devices.xml', true);
  xmlhttp.send();
}

var starting_lat, starting_lng;
var destination_lat, destination_lng;
function responseforDevice(xml){
  var x, i, xmlDoc;
  xmlDoc = xml.responseXML;
  x = xmlDoc.getElementsByTagName("element");
  //Με βάση τα id: start και end ψάχνουμε στο αρχείο με τις στάσεις για το όνομα και τις συντεταγμένες  
  //των στάσεων αφετηρίας και προορισμού.
  for (i = 0; i < x.length; i++) {
    if(start == x[i].getElementsByTagName("device_id")[0].childNodes[0].nodeValue){
        starting_name = x[i].getElementsByTagName("device_Name")[0].childNodes[0].nodeValue;
        starting_lat =  x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue;
        starting_lng =  x[i].getElementsByTagName("lon")[0].childNodes[0].nodeValue;
        // console.log("starting_lat: " + starting_lat);
        // console.log(typeof(starting_lat));
    }          
    if(end == x[i].getElementsByTagName("device_id")[0].childNodes[0].nodeValue){
      destination_name = x[i].getElementsByTagName("device_Name")[0].childNodes[0].nodeValue;
      destination_lat =  x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue;
      destination_lng =   x[i].getElementsByTagName("lon")[0].childNodes[0].nodeValue;            
    }      
  }
    askTravelTime();   
}

function askTravelTime() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            responseTravelTime(this);
        }
    };
    xmlhttp.open("GET", 'http://feed.opendata.imet.gr:23577/itravel/traveltimes.xml', true);
    xmlhttp.send();
} 
function responseTravelTime(xml){
    var x, i, xmlDoc;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName("element");
    //Με βάση το id κάθε Path ψάχνουμε στο αρχείο με τις διάρκειες διαδρομών για την επιλεγμένη 
    //από τον χρήστη.
    for (i = 0; i < x.length; i++) {
        if(id == x[i].getElementsByTagName("Path_id")[0].childNodes[0].nodeValue){
            duration = x[i].getElementsByTagName("Duration")[0].childNodes[0].nodeValue
        }                
    }  
    askStartingWeather();
}

function askStartingWeather(){
    var coord_API_endpoint = "http://api.openweathermap.org/data/2.5/weather?";
    var lat_long = "lat=" + starting_lat+ "&lon=" + starting_lng;
    //console.log("lat_lon:" + lat_long);
    var mode = "&mode=xml";
    var join_key = "&appid=" + "0800a68d8043afded0d069b79b9ff587";
    var units = "&units=metric";
    var current_coord_weather_url= coord_API_endpoint + lat_long + mode + join_key + units;
    var xmlhttp = new XMLHttpRequest();
    var x,y;
    x = {destination_lat};
    y = {destination_lng};
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            responseStartingWeather(this);
        }
    };
    // console.log(x);
    // console.log(typeof(x));
    xmlhttp.open("GET", current_coord_weather_url, true);
    xmlhttp.send();
} 
var starting_weather;
var destination_weather;
function responseStartingWeather(xml){    
    var x, y, z, i, xmlDoc;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("value");
    starting_weather = x;
    y = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("min");
    z = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("max");
    
    // console.log("Thermokrasia:" + x);
    // console.log("Thermokrasia min:" + y);
    // console.log("Thermokrasia max:" + z);
    askDestinationWeather();
}
function askDestinationWeather(){
    var coord_API_endpoint = "http://api.openweathermap.org/data/2.5/weather?";
    var lat_long = "lat=" + starting_lat+ "&lon=" + starting_lng;
    //console.log("lat_lon:" + lat_long);
    var mode = "&mode=xml";
    var join_key = "&appid=" + "0800a68d8043afded0d069b79b9ff587";
    var units = "&units=metric";
    var current_coord_weather_url= coord_API_endpoint + lat_long + mode + join_key + units;
    var x,y;
    x = destination_lat;
    y = destination_lng;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            responseDestinationgWeather(this);
        }
    };
    xmlhttp.open("GET", current_coord_weather_url, true);
    xmlhttp.send();
} 


function responseDestinationgWeather(xml){
    var x, y, z, i, xmlDoc;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("value");
    destination_weather = x;
    y = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("min");
    z = xmlDoc.getElementsByTagName("temperature")[0].getAttribute("max");

    //y = x.getElementsByTagName("current")[0].childNodes[0].nodeValue;
    // console.log("Thermokrasia:" + x);
    // console.log("Thermokrasia min:" + y);
    // console.log("Thermokrasia max:" + z);
    outAll();
}


function outAll(){
    window.location.href="#output-wrapper";
    document.getElementById("plirofories").innerHTML = "ΠΛΗΡΟΦΟΡΙΕΣ ΔΙΑΔΡΟΜΗΣ:";   
    document.getElementById("lineName").innerHTML =  "Γραμμή: " + selected_path;
    document.getElementById("startingPoint").innerHTML =  "Αφετηρία: " + starting_name;
    document.getElementById("destination").innerHTML =  "Προορισμός: " + destination_name;
    document.getElementById("travelTime").innerHTML =  "Διάρκεια Διαδρομής: " + duration;
    document.getElementById("starting_weather").innerHTML =  "Θερμοκρασία στην Αφετηρία: " + starting_weather;
    document.getElementById("destination_weather").innerHTML =  "Θερμοκρασία στον Προορισμό: " + destination_weather;
    initMap();
}

function initMap(){
    // console.log(syntetagmenes);
    var a = parseFloat(starting_lat);
    var b = parseFloat(starting_lng);

    var map = new google.maps.Map(
            document.getElementById('map-canvas'), {
            zoom: 14,
            center: new google.maps.LatLng(a, b),               
            mapTypeId: 'terrain'
            });

    var grammi = new google.maps.Polyline({
        path: syntetagmenes,
        geodesic: true,
        strokeColor:"#FF0000",
        strokeOpacity: 0.7,
        strokeWeight:7
        });

    grammi.setMap(map);
    google.maps.event.trigger(map, 'resize');   
} 
             
