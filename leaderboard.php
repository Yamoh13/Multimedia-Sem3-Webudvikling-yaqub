<?php
header('Content-Type: application/json');
require_once 'config.php';

// Query top 10 scores
$sql = "SELECT player_name, score FROM scores ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$scores = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }
}

echo json_encode($scores);
?>
