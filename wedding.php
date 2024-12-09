<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Venue Vista</title>
    <link rel="icon" type="image/x-icon" href="venue_vista_small.png">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-legend@2.0.0/dist/chartjs-plugin-legend.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg sticky-top bg-dark"  data-bs-theme="dark">
        <div class="container-fluid">

            <a class="navbar-brand d-none d-lg-block" href="#">
                <img src="venue_vista_big.png" alt="desktop-logo" height="50px">
            </a>
            <a class="navbar-brand d-block d-lg-none" href="#">
                <img src="venue_vista_small.png" alt="mobile-logo" height="50px">
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">

                    <li class="nav-item">
                        <span class="nav-link" id="home">Home</span>
                    </li>

                    <li class="nav-item">
                        <span class="nav-link" id="mapView">Map View</span>
                    </li>

                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Venues
                        </a>
                        <ul class="dropdown-menu" id="venuesDropdown">
                            
                        </ul>
                    </li>

                </ul>
            </div>
        </div>
    </nav>

    <section id="filters">
        <div id="filterButtonContainer">
            <button class="btn btn-outline-primary custom-purple-btn" id="filterButton" style="padding-right: 5px;">
                Filters<img src="filter.svg" width="28px">
            </button>
        </div>

        <div id="sidebar">
            <div>
                <h6>Sort By:</h6>
                <select name="sortBy">
                    <option value="recommended">Recommended</option>
                    <option value="rating">Rating</option>
                    <option value="priceHighLow">Price high->low</option>
                    <option value="priceLowHigh">Price low->high</option>
                    <option value="capacity">Capacity</option>
                </select>
            </div>

            <div>
                <h6>Min Capacity:</h6>
                <label>
                    <input type="range" id="capacitySlider" name="capacity" min=50 max=1000 value=50 step=50>
                    <span id="capacityDisplay">50</span><img src="people.svg" alt="People" width="25px">
                </label>
            </div>

            <div>
                <h6>Max Price:</h6>
                <label><input type="checkbox" name="priceTime" value="weekday"><span>Weekday</span></label>
                <label><input type="checkbox" name="priceTime" value="weekend"><span>Weekend</span></label>
            </div>
            
            <div>
                <label>
                    <input type="range" id="priceSlider" name="priceRange" min=1000 max=10000 value=10000 step=500>
                    £<span id="priceRangeDisplay">10000</span>
                </label>
            </div>

            <div>
                <h6>Location:</h6>
                <select name="location" id="locationsFilter" style="width: 130px;">
                    <option value="any">Any</option>
                </select>
            </div>

            <div>
                <h6>Catering Grade:</h6>
                <label><input type="checkbox" name="cateringGrade" value="1"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="cateringGrade" value="2"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="cateringGrade" value="3"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="cateringGrade" value="4"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="cateringGrade" value="5"><img src="star.svg" alt="Stars" width="24px"></label>
                & Up
                <br>
            </div>

            <div>
                <h6>Review Ratings:</h6>
                <label><input type="checkbox" name="reviewRating" value="1"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="reviewRating" value="2"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="reviewRating" value="3"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="reviewRating" value="4"><img src="star.svg" alt="Stars" width="24px"></label>
                <label><input type="checkbox" name="reviewRating" value="5"><img src="star.svg" alt="Stars" width="24px"></label>
                & Up
                <br>
            </div>

            <div>
                <h6>Availability Range:</h6>
                <div id="availabilityRange">
                    <div>
                        <label for="dateRangeStart">From:</label>
                        <input type="date" name="availability" id="dateRangeStart" value="2024-01-01" min="2024-01-01" max="2024-12-31">
                    </div>
                    <div>
                        <label for="dateRangeEnd">To:</label>
                        <input type="date" name="availability" id="dateRangeEnd" value="2024-12-31" min="2024-01-01" max="2024-12-31">
                    </div>
                </div>
            </div>

            <div>
                <h6>Licensed:</h6>
                <label><input type="checkbox" name="licensed" value=1><span>Yes</span></label>
                <label><input type="checkbox" name="licensed" value=0><span>No</span></label>
            </div>

            <br>

            <div>
                <button class="btn btn-outline-primary custom-purple-btn" id="resetFilters">
                    Reset Filters
                </button>
            </div>

            <br>

            <div>
                <button class="btn btn-outline-primary custom-purple-btn" id="submitFilters">
                    Filter Results
                </button>
            </div>
        </div>
    </section>

    <section id="venues">

        <div id="cardDisplay"></div>

        <div id="map"></div>
    
    </section>
    
    <script src="code.js"></script>
</body>
</html>
