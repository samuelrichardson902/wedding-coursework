async function getData() {
    try {
        const databaseResponse = await fetch(`venue-db.php?data=${encodeURIComponent(venueName)}`);
        const databaseJson = await databaseResponse.json();
        return databaseJson
    } catch(error) {
        throw error;
    }
}

let venueObj;
async function showVenue() {
    addNavBarListeners()
    let venueData = await getData();
    let venueObj = venueData[0];
    makeCalendar(venueObj.bookings);
    makeReviewGraph(venueObj);
    window.addEventListener('resize', function() {
        makeReviewGraph(venueObj);
    });
    makePackageDesc(venueObj);
    makeVenueDropdown(venueData[1]);
    venueObj.location = await getLocation(venueObj.latitude, venueObj.longitude);
    constructVenue(venueObj);
    console.log(venueData[0],venueData[1]);//only for debugging.........................................................................
}


showVenue();


//control nav bar links linking back to the correct pages
function addNavBarListeners() {
    $(".nav-link").click(function() {
        let page= $(this).attr("id");

        if((page==="home")||(page==="mapView")){
            // Store data in the session
            sessionStorage.setItem("page", page);
            window.location.href= "wedding.php";
        }
    });
}


function makeVenueDropdown(venuesData) {
    $("#venuesDropdown").html(`<li><hr class="dropdown-divider"></li>`);
    venuesData.forEach(venue => {
        let venueLink = `<li><a class="dropdown-item venueViewLink" data-id="${venue.name}">${venue.name}</a></li>`;
        if (venue.name === venueName) {
            $("#venuesDropdown").prepend(venueLink);
        } else {
            $("#venuesDropdown").append(venueLink);
        }
    });
    addDropdownListeners();
}

function addDropdownListeners() {
    //listeners for venues dropdown
    $(document).on("click", ".venueViewLink", function(){
        let name = $(this).data("id");
        let serialName = encodeURIComponent(name);
        window.location.href = `venueView.php?data=${serialName}`;
        openVenue(objId);
    });
}

async function getLocation(lat,long) {
    let latitude = parseFloat(lat);
    let longitude = parseFloat(long);
    let locationUrl = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + latitude + "&lon=" + longitude;
    try {
        const response = await fetch(locationUrl);
        const data = await response.json();
        let location = data.address.town ? data.address.town : data.address.city;
        return location;
    } catch (error) {
        console.error("Error fetching location:", error);
        return null;
    }
}


function makeCateringTable(venue) {
    let cateringGrades = venue.catering_grade.split(",");
    let cateringCosts = venue.catering_cost.split(",");
    let cateringPackages = cateringGrades.map((grade, i) => ({grade, cost: cateringCosts[i]}));
    let packages = "";
    cateringPackages.reverse().forEach(package => {
        packages += `<tr><td>${package.grade}<img src="star.svg" width="24px"></td><td>£${package.cost}</td></tr>`;
    });

    let tableHtml = `
        <table>
            <tr><th>Grade</th><th>Price per Person</th></tr>
            ${packages}
        </table>
    `;

    return tableHtml;
}

function getEvents(bookings) {
    eventsJson = [];
    bookings.forEach(date => {
        let dateObj = {
            start: date,
            display: "background"
        };
        eventsJson.push(dateObj);
    });
    return eventsJson;
}

function makeCalendar(bookings) {
    let calendarEl = document.getElementById("calendar");
    let calendar = new FullCalendar.Calendar(calendarEl, {
        themeSystem: "bootstrap5",
        initialView: "dayGridMonth",
        titleFormat: { year: 'numeric', month: 'short'},
        firstDay: "1",
        eventBackgroundColor: "rgb(197,18,255)",
        events: getEvents(bookings),
    });
    calendar.render();

    var buttons = document.querySelectorAll('.fc button');

    buttons.forEach(function(button) {
      // Add Bootstrap classes to the buttons
      button.classList.add('custom-purple-btn', 'noBg');
    });
}


function constructVenue(venue) {
    if(parseInt(venue.licensed)){
        licensedText = `
        This venue is licensed providing peace of mind for couples and their guests,
        and removing the need to visit the registry office.
        `;
    } else {
        licensedText = `
        This venue isnt licensed but the nearest registry office is only a short drive away.
        `;
    }

    let venueDesc = `
    <h3>${venue.name}</h3>
    <p>
        ${venue.name} is a great venue, where dreams of the perfect wedding come to life. 
        Nestled in the heart of ${venue.location} boasting stunning views of the skyline, 
        this enchanting venue sets the stage for an unforgettable celebration for you and up to ${venue.capacity} guest.
        With its timeless charm and picturesque surroundings, ${venue.name} offers a captivating backdrop for couples to exchange vows and create cherished memories.
        As you step onto the grounds, you'll be greeted by manicured gardens, majestic architecture, and elegant interiors.
        Whether you envision an intimate gathering or a grand affair, the versatile space can accommodate your unique vision.
        From romantic ceremonies beneath a canopy of trees to lavish receptions in the grand ballroom, 
        every detail is meticulously curated to reflect your personal style and preferences.
        The experienced team of wedding specialists will work tirelessly to ensure that every aspect exceeds your expectations,
        from the initial planning stages to the final moments of your special day.
        With their commitment to excellence and attention to detail, you can relax and savor every moment, 
        knowing that your wedding is in capable hands.
        ${licensedText}
    </p>`;
    
    let licensedImg = parseInt(venue.licensed) ? "tick.svg" : "cross.svg";
    let licensedYN = parseInt(venue.licensed) ? "Yes" : "No";
    let generalInfo = `
    <p>
        Location : ${venue.location} <br>
        Capacity : ${venue.capacity} People <br>
        Licensed : ${licensedYN} <img src="${licensedImg}" alt="Conformation" width="25px" style="margin-left: -5px;">
    </p>`;

    $("#venueDisplayDesc").html(venueDesc + generalInfo);
}


function makePackageDesc(venue){
    let venueCosts = `
    <p>
        <h5> Venue Cost: </h5>
        <table>
            <tr><th>Weekend</th><th>Weekday</th></tr>
            <tr><td>£${venue.weekend_price}</td><td>£${venue.weekday_price}</td></tr>
        </table><br>

        <h5> catering packages: </h5>
        ${makeCateringTable(venue)}
    </p>`;

    let venueContact = `
    <p>
        <h5> Contact Information: </h5>
        Phone No: 000-000-0000
        <br>
        Email: ${venue["name"].replace(/\s/g, '_')}@example.com
    </p>`;

    $("#venuePackageDesc").html(venueCosts + venueContact);
}



function makeReviewGraph(venue){

    let avgRating = `
        ${Math.round(venue.review_score * 50)/100}
        <img src="star.svg" alt="Stars" width="24px"> Average
        From ${venue.num_reviews} Reviews
    `;

    $("#averageRating").html(avgRating)

    let ratings = venue.ratings_counts.split(",");
    ratings = ratings.map(num => parseInt(num))
    let starRatingCounts = [0,0,0,0,0];
    
    total = ratings[0]
    starRatingCounts[4] += ratings[0];

    for (let i=1; i<ratings.length; i++){
        total += ratings[i]
        starRatingCounts[5-Math.ceil(i/2)] += ratings[i];
    }

    let canvas = $('#reviewsGraph');
    let existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = $(`#reviewsGraph`);
    new Chart(ctx,{
        type:"bar",
        data: {
            labels: ["5","4","3","2","1"],
            datasets: [{
            label: "# of Ratings",
            data: starRatingCounts,
            borderWidth: 1,
            borderRadius: 50,
            backgroundColor: "rgba(255,225,0,1)"
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
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
            plugins: {
                legend: {display: false},
                tooltip: {
                    callbacks: {
                        title: (ctx) => {
                            return (5 - ctx[0].dataIndex) + " Stars"
                        }
                    }
                }
            }
        }
    });
}
