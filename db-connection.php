<?php
    //start then check database connection
    include "db-config.php";
    $conn = new mysqli($servername, $username, $password, $database);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    //sql to get db contents
    $sql = "SELECT
        venue.venue_id,
        venue.name,
        venue.capacity,
        venue.licensed,
        venue.latitude,
        venue.longitude,
        venue.weekday_price,
        venue.weekend_price,
        catering_types.grades AS catering_grade,
        catering_types.costs AS catering_cost,
        COALESCE(review_scores.review_score, 'No reviews yet') AS review_score,
        review_scores.reviews_count AS num_reviews,
        review_scores.ratings_counts AS ratings_counts

        FROM venue
            
        LEFT JOIN (
            SELECT venue_id,
                GROUP_CONCAT(grade) as grades,
                GROUP_CONCAT(cost) as costs
            FROM catering
            GROUP BY venue_id
        ) catering_types ON venue.venue_id = catering_types.venue_id
                
        LEFT JOIN (
            SELECT venue_id,
                AVG(score) AS review_score,
                COUNT(score) AS reviews_count,
                CONCAT_WS(',',
                SUM(score = 0),
                SUM(score = 1),
                SUM(score = 2),
                SUM(score = 3),
                SUM(score = 4),
                SUM(score = 5),
                SUM(score = 6),
                SUM(score = 7),
                SUM(score = 8),
                SUM(score = 9),
                SUM(score = 10)
                ) AS ratings_counts
            FROM venue_review_score
            GROUP BY venue_id
        ) review_scores on venue.venue_id = review_scores.venue_id";

    //send sql request to db
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        //initialise array to store all data
        $venues = array();

        //go over db contents
        while($row = $result->fetch_assoc()){
            //get bookings from db
            $bookingQuery = "SELECT booking_date
            FROM venue_booking
            WHERE venue_id = " . $row['venue_id'];
            $bookingResults = $conn->query($bookingQuery);

            //add all bookings for a venue to its row
            $bookings = array();
            while($booking = $bookingResults->fetch_assoc()){
                $bookings[] = $booking['booking_date'];
            }
            $row['bookings'] = $bookings;

            //add all data to venues array
            $venues[] = $row;
        }
    }
    //close db connection and send json data back
    $conn->close();
    echo json_encode($venues);
?>