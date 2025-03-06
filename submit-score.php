<?php
header('Content-Type: application/json');
require_once 'config.php';

// For JSON post:
$input = json_decode(file_get_contents("php://input"), true);
if (!$input || !isset($input['player'], $input['score'])) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

// Sanitize
$player = $conn->real_escape_string($input['player']);
$score  = (int)$input['score'];

$sql = "INSERT INTO scores (player_name, score) VALUES ('$player', $score)";
if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "DB Error: " . $conn->error]);
}
