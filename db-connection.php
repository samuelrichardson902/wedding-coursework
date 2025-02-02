<?php
    //all code modified to query a json rather than a phpmyadmin database like it did in the coursework
    
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

    // Process data
    $result = [];
    foreach ($venues as $venue) {
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
                $venue_bookings[] = $b['booking_date'];
            }
        }

        // Assemble venue data
        $result[] = [
            'venue_id' => $venue_id,
            'name' => $venue['name'],
            'capacity' => $venue['capacity'],
            'licensed' => $venue['licensed'],
            'latitude' => $venue['latitude'],
            'longitude' => $venue['longitude'],
            'weekday_price' => $venue['weekday_price'],
            'weekend_price' => $venue['weekend_price'],
            'catering_grade' => implode(',', $catering_grades),
            'catering_cost' => implode(',', $catering_costs),
            'review_score' => $review_score,
            'num_reviews' => $num_reviews,
            'ratings_counts' => $ratings_counts,
            'bookings' => $venue_bookings
        ];
    }

    // Output JSON
    echo json_encode($result, JSON_PRETTY_PRINT);
?>