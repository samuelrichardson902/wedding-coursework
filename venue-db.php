<?php
    //all code modified to query a json rather than a phpmyadmin database like it did in the coursework

    // Get venue name from URL
    $venueName = urldecode($_GET['data']);

    // Load the JSON file
    $jsonData = file_get_contents('coa123wdb.json');
    $data = json_decode($jsonData, true);

    // Extract relevant tables
    $venues = [];
    $catering = [];
    $reviews = [];
    $bookings = [];

    foreach ($data as $table) {
        if ($table['type'] === 'table') {
            switch ($table['name']) {
                case 'venue':
                    $venues = $table['data'];
                    break;
                case 'catering':
                    $catering = $table['data'];
                    break;
                case 'venue_review_score':
                    $reviews = $table['data'];
                    break;
                case 'venue_booking':
                    $bookings = $table['data'];
                    break;
            }
        }
    }

    //find offsett to modify the dates of bookings so that they are recent
    // Get current date
    $currentDate = new DateTime();

    // Set reference date (28/02/2024)
    $referenceDate = new DateTime('2024-01-01');

    // Calculate the number of days that have passed since 28/02/2024
    $interval = $referenceDate->diff($currentDate);
    $daysPassed = $interval->days;

    // Find requested venue
    $venue = null;
    foreach ($venues as $v) {
        if ($v['name'] === $venueName) {
            $venue = $v;
            break;
        }
    }

    if (!$venue) {
        echo json_encode(["error" => "Venue not found"]);
        exit;
    }

    $venue_id = $venue['venue_id'];

    // Get catering data
    $catering_grades = [];
    $catering_costs = [];
    foreach ($catering as $c) {
        if ($c['venue_id'] == $venue_id) {
            $catering_grades[] = $c['grade'];
            $catering_costs[] = $c['cost'];
        }
    }

    // Get review data
    $review_score = 'No reviews yet';
    $num_reviews = 0;
    $ratings_counts_array = array_fill(0, 11, 0); // Array to store count of scores from 0 to 10
    $review_sum = 0;

    foreach ($reviews as $r) {
        if ($r['venue_id'] == $venue_id) {
            $score = (int) $r['score'];
            $review_sum += $score;
            $num_reviews++;
            $ratings_counts_array[$score]++; // Count occurrences of each score
        }
    }

    // Calculate average review score
    if ($num_reviews > 0) {
        $review_score = round($review_sum / $num_reviews, 1); // Round to 1 decimal place
    }

    // Convert ratings count array to comma-separated string
    $ratings_counts = implode(',', $ratings_counts_array);
    

    // Get booking data
    $venue_bookings = [];
    foreach ($bookings as $b) {
        if ($b['venue_id'] == $venue_id) {
            $bookingDate = new DateTime($b['booking_date']);
            
            // If the booking date is in the past, add the number of days passed since 28/02/2024
            if ($bookingDate < $currentDate) {
                $bookingDate->modify("+$daysPassed days"); // Add the days that have passed
            }
            
            $venue_bookings[] = $bookingDate->format('Y-m-d'); // Store the adjusted or current booking date
        }
    }

    // Assemble venue data
    $venue['catering_grade'] = implode(',', $catering_grades);
    $venue['catering_cost'] = implode(',', $catering_costs);
    $venue['review_score'] = $review_score;
    $venue['num_reviews'] = $num_reviews;
    $venue['ratings_counts'] = $ratings_counts;
    $venue['bookings'] = $venue_bookings;

    // Get all other venues
    $otherVenues = array_map(fn($v) => ["name" => $v['name'], "venue_id" => $v['venue_id']], $venues);

    $venuesData = [$venue, $otherVenues];

    // Output JSON
    echo json_encode($venuesData, JSON_PRETTY_PRINT);
?>
