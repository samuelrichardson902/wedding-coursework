/*
feature list:

✔    star rating bar graph
✔    like/save venues with cookies
✔    homepage mini indicators
✔    location name (reverse geo caching)
✔    map view
✔    reset filters button
✔    filters & sort by sidebar
✔    filter code

carousel when on venue
calendar date select/availability view
random contact info

inspo: https://www.hitched.co.uk/busc.php?id_grupo=1&id_region=1001&showmode=list&NumPage=1&userSearch=1&isNearby=0&priceType=menu
*/


function updateLikedCookie(likedVenues){
    const likedVenuesString = likedVenues.join(",");
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    document.cookie = `likedVenues=${likedVenuesString}; expires=${expiryDate.toUTCString()}; path=/`;
}


function getCookie(cookieType) {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if(name===cookieType){
            return value;
        }
    }
    return null;
}


function getLikeCookies() {
    cookies = getCookie("likedVenues");
    if (cookies){
        return cookies.split(",");
    }
    return null;
}

function convertToStars(ratings) {
    let starRatingCounts = [0,0,0,0,0];
    ratings = ratings.map(num => parseInt(num))

    total = ratings[0]
    starRatingCounts[4] += ratings[0];
    for (let i=1; i<ratings.length; i++){
        total += ratings[i]
        starRatingCounts[5-Math.ceil(i/2)] += ratings[i];
    }

    return starRatingCounts.map(num=> (num/total)*100);
}


//the construction of each card
function constructCard(object) {
    cateringCosts = object.catering_cost.split(",");
    cateringCostMin = Math.min(...cateringCosts);
    cateringCostMax = Math.max(...cateringCosts);
    licensedImg = parseInt(object.licensed) ? "tick.svg" : "cross.svg";
    licensedText = parseInt(object.licensed) ? "Licensed" : "Not Licensed";
    
    let locationCard = `
        <div class="card text-bg-dark" id="${object.venue_id}">
            <img src="placeholder.webp" class="card-img-top" alt="${object.name}">
            <img src="star.svg" class="card-img-top liked" alt="Favourite">
            <div class="card-body">
                <h5 class="card-title">${object.name}</h5>
                <p class="card-text">

                    ${object.name}
                    <br>

                    <span data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-title="Catering Cost">
                        <img src="food.svg" alt="Catering" width="27px">
                        £${cateringCostMin} - £${cateringCostMax}
                    </span>

                    <span data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-title="Capacity">
                        <img src="people.svg" alt="Capacity" width="25px">
                        Up to ${object.capacity}
                    </span>

                    <br>

                    <span data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-title="Weekday/Weekend Price">
                        <img src="money.svg" alt="Cost" width="25px">
                        £${object.weekday_price} / £${object.weekend_price}
                    </span>

                    <span data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-title="${licensedText}">
                        <img src="licensed.svg" alt="Licensed" width="24px">
                        <img src="${licensedImg}" alt="Conformation" width="25px" style="margin-left: -10px;">
                    </span>

                    <br>

                    <div class="city" id="${object.venue_id}">
                        <span class="spinner-border spinner-border-sm"></span>
                        <span role="status">Loading...</span>
                    </div>

                </p>
                <p class="starRating">
                    <img src="star.svg" alt="Stars" width="24px">
                    ${Math.round(object.review_score * 50)/100} 
                    (${object.num_reviews})
                    <img src="expand.svg" alt="Expand" width="10px" style="margin-top: 0px;">
                </p>
                <div class="overlay" id="graphContainer${object.venue_id}">
                    <canvas id="chart${object.venue_id}" width="270" height="165"></canvas>
                </div>
                <button class="btn btn-outline-primary custom-purple-btn venueViewLink" data-id="${object.venue_id}">View More</button>
            </div>
        </div>
    `;

    return locationCard;
}


//construct ratings graph
function constructGraph(object) {
        const ctx = $(`#chart${object.venue_id}`);
        new Chart(ctx,{
            type:"bar",
            data: {
                labels: ["5","4","3","2","1"],
                datasets: [{
                label: "# of Ratings",
                data: object.stars,
                borderWidth: 1,
                borderRadius: 50,
                backgroundColor: "rgba(255,225,0,1)"
                }]
            },
            options: {
                indexAxis: "y",
                responsive: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks:{color: "white"},
                        grid: {color: "rgba(255, 255, 255, 0.2)"},
                        title: {
                            display: true,
                            text: "Stars",
                            color: "white"
                        }
                    },
                    x: {
                        ticks:{display: false},
                        grid: {color: "rgba(255, 255, 255, 0.2)"}
                    }},
                plugins: {legend: {display: false}}
            }
        });
    
        $(`#graphContainer${object.venue_id}`).hide();
        $(`#chart${object.venue_id}`).hide();
}

let customIcon = L.icon({
                    iconUrl: "purpleMarker.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [0, -41],
                });


function populateCards(){
    databaseJson.forEach(venue => {
        //get ratings into an array and convert to percentage of 1-5 star reviews
        let reviewRatings = venue.ratings_counts.split(",");
        venue.stars = convertToStars(reviewRatings);
        venue.liked = false;
        venues[venue.venue_id] = venue;

        //construct card for each element of the json
        let venueCard = constructCard(venue);
        $("#cardDisplay").append(venueCard);

        //construct the graph for ratings and hide it
        constructGraph(venue);


        //add the markers to the map
        let marker = L.marker([venue.latitude, venue.longitude],{
            icon: customIcon
        }).addTo(map)
        marker.bindPopup(`<a class="markerLink">${venue.name}</a>`);
        marker.on("mouseover", function() {
            this.openPopup();
        });
        marker.on("mouseout", function() {
            map.closePopup();
        });
        marker.on("click", function() {
            openVenue(venue.venue_id);
        });
        mapMarkers.push(marker);
    });
}

async function addLocations(){
    let keys = Object.keys(venues);
    keys.forEach(key => {
        let venue = venues[key];

        //dont re-request location if its already known
        if("location" in venue){
            $(`#${venue.venue_id} .city`).text(venue.location);

            //check locations not already added to the selector
            if (!$(`#locationsFilter option[value="${location}"]`).length) {
                var optionHtml = `<option value="${location}">${location}</option>`;
                $("#locationsFilter").append(optionHtml);
            }
        }

        let latitude = parseFloat(venue.latitude);
        let longitude = parseFloat(venue.longitude);
        let locationUrl = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + latitude + "&lon=" + longitude;
        let location;

        fetch(locationUrl)
        .then(response => {
            return response.json();
        })
        .then(data => {
            location = data.address.town ? data.address.town :  data.address.city;
            venue.location = location;
            $(`#${venue.venue_id} .city`).text(location);

            //check locations not already added to the selector
            if (!$(`#locationsFilter option[value="${location}"]`).length) {
                var optionHtml = `<option value="${location}">${location}</option>`;
                $("#locationsFilter").append(optionHtml);
            }
        })
    })
}

function updateVenueDropdown(){
    $("#venuesDropdown").html(`<li><hr class="dropdown-divider"></li>`);
    let keys = Object.keys(venues);
    keys.forEach(key => {
        let venueLink = `<li><a class="dropdown-item venueViewLink" data-id="${venues[key].venue_id}">${venues[key].name}</a></li>`;
        if (venues[key].liked) {
            $("#venuesDropdown").prepend(venueLink);
        } else {
            $("#venuesDropdown").append(venueLink);
        }
    })
}

function openVenue(venueId){
    venueName = venues[venueId].name;
    let serialName = encodeURIComponent(venueName);
    window.location.href = `venueView.php?data=${serialName}`;
}

function addCardListeners(){
    //add event listeners for hovering over star rating
    const fadeTime = 300;
    $(".starRating").hover(function(){
        let id = $(this).parent().parent().attr("id");
        $(`#graphContainer${id}`).stop().fadeIn(fadeTime);
        $(`#chart${id}`).stop().fadeIn(fadeTime);
    }, function(){
        let id = $(this).parent().parent().attr("id");
        $(`#graphContainer${id}`).stop().fadeOut(fadeTime);
        $(`#chart${id}`).stop().fadeOut(fadeTime);
    });

    $(document).on("click", ".venueViewLink", function(){
        let objId = $(this).data("id");
        openVenue(objId);
    });

    $(".liked").click(function(){
        //change star image showing and edit in venues array
        let id = $(this).parent().attr("id");
        let currentSrc = $(this).attr("src");
        let newSrc;
        if(currentSrc==="star.svg"){
            newSrc = "starFilled.svg";
            venues[id].liked = true;
            likedVenues.push(id)
        } else{
            newSrc = "star.svg";
            venues[id].liked = false;
            likedVenues = likedVenues.filter(num => num!== id);
        }

        //update the venue dropdown in the navbar
        updateVenueDropdown()

        //animate the star when clicked
        let likeShrink = 8;
        $(this).animate({ 
            width: `-=${likeShrink}px`, 
            height: `-=${likeShrink}px`,
            top: `+=${likeShrink/2}px`,
            left: `+=${likeShrink/2}px`,
        }, "fast").animate({ 
            width: `+=${likeShrink}px`, 
            height: `+=${likeShrink}px`,
            top: `-=${likeShrink/2}px`,
            left: `-=${likeShrink/2}px`
        }, "fast");


        $(this).attr("src", newSrc);
        updateLikedCookie(likedVenues);
    });

    likes = getLikeCookies();
    if (likes && likes.length >= 1){
        likes.forEach(id =>{
            likedVenues.push(id);
            venues[id].liked = true;
            const selector = `#${id} .liked`;
            $(selector).attr("src", "starFilled.svg");
        });
    }
}


async function getData() {
    try {
        const databaseResponse = await fetch("db-connection.php");
        const databaseJson = await databaseResponse.json();
        return databaseJson;
    } catch(error) {
        throw error;
    }
}

let databaseJson;
let venues = {};
let likedVenues = [];
let mapMarkers = [];
let map;

async function makeCards(){
    databaseJson = await getData();
    constructMap();
    populateCards();
    addCardListeners();
    updateVenueDropdown()
    const tooltipTriggerList = document.querySelectorAll(`[data-bs-toggle="tooltip"]`)
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    console.log(venues);//this isnt necessary, only here for debugging/finding attribute names..........................................
    checkPage();
    addLocations();
}


//construct all venue cards for the home page
makeCards()

/* map page code */


function constructMap(){
    // Initialize the map
    map = L.map("map",{
        zoomSnap: 0,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 10,
    });
    map.setView([52.7721, -1.2062], 7); //latitude, longitude, zoom level

    // Add a tile layer
    L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
        attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`
    }).addTo(map);

    $("#map").hide()
}



//control what page is showing based of the navbar selection
addNavBarListeners()
function addNavBarListeners(){
    $(".nav-link").click(function() {
        let page= $(this).attr("id");
        switch(page){
            case "home":
                $("#cardDisplay").show();
                $("#map").hide();
                $("#sidebar").show();
                break;
            case "mapView":
                $("#cardDisplay").hide();
                $("#map").show();
                $("#sidebar").hide();
                break;
        }
    });
}


/* sidebar, filters code */


//button to hide/show filters on mobile
$("#filterButton").click(function() {
    $("#sidebar").toggle();
});

//make sure sidebar is shown large windows
$(window).on("resize", handleResize);

function handleResize() {
    if($(window).width()>=768){
        if ($("#map").is(':hidden')) {
            $("#sidebar").show();
        }
    }
}

let filterValues;

function initialiseFilters() {
    filterValues = {
        "sortBy":"recommended",
        "capacity":50,
        "priceTime":"any",
        "priceRange":10000,
        "location":"any",
        "cateringGrade":"any",
        "reviewRating":"any",
        "dateRangeStart":"2024-01-01",
        "dateRangeEnd":"2024-12-31",
        "licensed":"any"
    };
}

initialiseFilters();


//unselect other checkboxes, update filter values and graphics
$(`input[type="checkbox"]`).on("change", function() {
    //unselect other checkboxes, update filter values
    let inputGroup = $(this).attr("name");
    if ($(this).prop("checked")) {
        $(`input[type="checkbox"][name="${inputGroup}"]`).not(this).prop("checked", false);
        filterValues[inputGroup] = $(this).attr("value");
    } else {
        filterValues[inputGroup] = "any";
    }
    //update graphics
    if((inputGroup === "cateringGrade") || (inputGroup === "reviewRating")) {
        let fieldValue = filterValues[inputGroup];
        $(`input[type="checkbox"][name="${inputGroup}"]`).each(function() {
            modifyStarGraphics($(this), fieldValue);
        });
    } else if((inputGroup === "priceTime") || (inputGroup === "licensed")) {
        $(`input[type="checkbox"][name="${inputGroup}"]`).each(function() {
            $(this).parent().removeClass("selectedCheckbox");
        });
        if ($(this).prop("checked")) {
            $(this).parent().addClass("selectedCheckbox");
        }
    }
});

function modifyStarGraphics(element, selectorNum){
    let num = element.attr("value");
    let label = element.parent();
    let image = label.find("img");
    if(selectorNum === "any"){selectorNum=0;}
    if (num <= selectorNum){
        image.attr("src", "starFilled.svg");
    } else {
        image.attr("src", "star.svg");
    }
}


$(`input[type="range"]`).on("input", function() {
    //update value graphic, update filter values
    let inputGroup = $(this).attr("name");
    let value = $(this).val();
    filterValues[inputGroup] = value;
    //update graphics
    $(`#${inputGroup}Display`).text(value);
});

$(`select`).change(function() {
    //update filter values for select elments
    let inputGroup = $(this).attr("name");
    let value = $(this).val();
    filterValues[inputGroup] = value;
})

$("#dateRangeStart").on("change", function() {
    value = $(this).val()
    filterValues[this.id] = value;
    $("#dateRangeEnd").attr("min",value)
});

$("#dateRangeEnd").on("change", function() {
    value = $(this).val()
    filterValues[this.id] = value;
    $("#dateRangeStart").attr("max",value)
});




$("#resetFilters").click(function() {
    initialiseFilters();

    //reset all input fields in the filter section
    $(`input[type="checkbox"]`).prop("checked", false);

    $(`input[type="checkbox"][name="cateringGrade"], input[type="checkbox"][name="reviewRating"]`).each(function() {
        modifyStarGraphics($(this), "any");
    });

    $(`input[type="checkbox"][name="priceTime"], input[type="checkbox"][name="licensed"]`).each(function() {
        $(this).parent().removeClass("selectedCheckbox");
    });

    $(`input[type="range"]`).each(function() {
        let defaultValue = filterValues[$(this).attr("name")];
        $(this).val(defaultValue);
        $(this).next("span").text(defaultValue);
    });

    $(`input[type="date"]`).each(function() {
        let value = filterValues[this.id];
        $(this).val(value);
        $(this).attr("min","2024-01-01")
        $(this).attr("max","2024-12-31")
    });

    $(`select[name=sortBy]`).val("recommended");
    $(`select[name=location]`).val("any");
})


function priceSort(x, y, asc, time) {
    let xPrice;
    let yPrice;
    if (time === "any") {
        if (asc){
            xPrice = Math.min(x.weekend_price,x.weekday_price);
            yPrice = Math.min(y.weekend_price,y.weekday_price);
        } else {
            xPrice = Math.max(x.weekend_price,x.weekday_price);
            yPrice = Math.max(y.weekend_price,y.weekday_price);
        }
    } else {
        xPrice = x[`${time}_price`];
        yPrice = y[`${time}_price`];
    }
    
    if (asc) {
        return xPrice - yPrice;
    } else {
        return yPrice - xPrice;
    }
}


function checkAvailability(rangeStart, rangeEnd, dates) {
    let start = new Date(rangeStart);
    let end = new Date(rangeEnd);
    for (let i = 0; i < dates.length; i++) {
        let testDate = new Date(dates[i]);
        if (start <= testDate && testDate <= end) {
            return true;
        }
    }
    return false;
}



$("#submitFilters").click(function() {
    let filterVenues = $(".card").get();

    filterVenues.sort(function(x,y) {
        let flip;
        switch(filterValues.sortBy){
            case "recommended":
                flip = x.id - y.id
                break;
            case "rating":
                flip = venues[y.id].review_score - venues[x.id].review_score;
                break;
            case "priceHighLow":
                flip = priceSort(venues[x.id], venues[y.id], false, filterValues.priceTime);
                break;
            case "priceLowHigh":
                flip = priceSort(venues[x.id], venues[y.id], true, filterValues.priceTime);
                break;
            case "capacity":
                flip = venues[y.id].capacity - venues[x.id].capacity;
                break;
        }
        return flip;
    });

    $("#cardDisplay").empty().append(filterVenues);

    filterVenues.forEach(venueCard => {
        $(venueCard).show();
        let venue = venues[venueCard.id];

        let passedFilters = true;
        //capacity
        if (parseInt(venue.capacity) < parseInt(filterValues.capacity)){passedFilters = false;}

        //price
        if(filterValues.priceTime === "weekend"){
            if (venue.weekend_price > filterValues.priceRange){passedFilters = false;}
        } else {
            if (venue.weekday_price > filterValues.priceRange){passedFilters = false;}
        }

        //location
        if((venue.location !== filterValues.location) && (filterValues.location !== "any")){passedFilters = false;}

        //catering grade
        let maxCateringGrade = Math.max(...venue.catering_grade.split(","));
        if((maxCateringGrade < filterValues.cateringGrade) && (filterValues.cateringGrade !== "any")){
            passedFilters = false;
        }

        //review score
        if(((Math.round(venue.review_score * 50)/100) < filterValues.reviewRating) && (filterValues.reviewRating !== "any")){
            passedFilters = false;
        }

        //availability
        if(!checkAvailability(filterValues.dateRangeStart, filterValues.dateRangeEnd, venue.bookings)) {passedFilters = false;}

        //licensed
        if((venue.licensed !== filterValues.licensed) && (filterValues.licensed !== "any")){passedFilters = false;}

        if (!passedFilters){
            $(venueCard).hide();
        }
    });

    addCardListeners();
})


function checkPage() {
    if(sessionStorage.getItem("page")){
        let page = sessionStorage.getItem("page");
        sessionStorage.setItem("page", null);
        switch(page){
            case "home":
                $("#cardDisplay").show();
                $("#map").hide();
                $("#sidebar").show();
                break;
            case "mapView":
                $("#cardDisplay").hide();
                $("#map").show();
                $("#sidebar").hide();
                break;
        }
    }
}