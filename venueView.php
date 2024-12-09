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
    <link href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css' rel='stylesheet'>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/@fullcalendar/bootstrap5@6.1.11/index.global.min.js"></script>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="venue.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg sticky-top bg-dark"  data-bs-theme="dark">
        <div class="container-fluid">

            <a class="navbar-brand d-none d-lg-block" href="wedding.php">
                <img src="venue_vista_big.png" alt="desktop-logo" height="50px">
            </a>
            <a class="navbar-brand d-block d-lg-none" href="wedding.php">
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

    <div id="venueDisplay">
        <div id="venuePhotoCarousel" class="carousel slide" data-bs-ride="true">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img src="placeholder.webp" alt="venuePhoto">
                </div>

                <div class="carousel-item">
                    <img src="placeholder.webp" alt="venuePhoto">
                </div>
                
                <div class="carousel-item">
                    <img src="placeholder.webp" alt="venuePhoto">
                </div>
            </div>

            <button class="carousel-control-prev" type="button" data-bs-target="#venuePhotoCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>

            <button class="carousel-control-next" type="button" data-bs-target="#venuePhotoCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>

        <div id="venueDisplayDesc" class="container-fluid venueInfo">
            <div class="d-flex justify-content-center align-items-center" style="height: 80vh;">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>

        <div id="venuePackageDesc" class="container-fluid venueInfo"></div>

        <div id="venueExtraInfo" class="container-fluid venueInfo">
            <div id="calendarContainer">
                <h5> Availability: </h5>
                <div id="calendar"></div>
            </div>

            <div id="reviewContainer">
                <h5> Reviews: </h5>
                <p id="averageRating"></p>
                <div class="chart-container">
                    <canvas id="reviewsGraph"></canvas>
                </div>
            </div>
        </div>


    </div>

    <script> let venueName = "<?php echo urldecode($_GET['data']); ?>"; </script>
    <script src="venueCode.js"></script>

</body>
</html>