<?php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vibe Volley</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sigmar&display=swap" rel="stylesheet">
</head>
<body>
<div id="gameContainer">

    <!-- MAIN MENU OVERLAY -->
    <div id="mainMenuOverlay">
        <div id="mainMenuTitle">VIBE VOLLEY</div>
        <img id="menuLogo" src="pics/logopic.png" alt="Game Logo">
        <div id="playGameText">Play the Game</div>
        <div id="guideText">Guide</div>
        <div id="leaderboardText">Leaderboard</div>
    </div>

    <!-- GUIDE OVERLAY -->
    <div id="guideOverlay" style="display: none;">
        <div id="guideTitle">How to Play</div>
        <div id="guideContent">Your instructions here...</div>
        <div id="guideGoBack">Go Back</div>
    </div>

    <!-- START OVERLAY -->
    <div id="startOverlay" style="display: none;">
        <div id="startTitle">START</div>
        <div id="startGoBack">Go Back</div>
    </div>

    <!-- COUNTDOWN OVERLAY -->
    <div id="countdownOverlay" style="display: none;">
        <div id="countdownNumber">3</div>
    </div>

    <!-- GAME CANVAS -->
    <canvas id="gameCanvas" width="1480" height="630"></canvas>

    <!-- GAME OVER OVERLAY -->
    <div id="gameOverOverlay">
        <div id="gameOverTitle">GAME OVER</div>
        <div id="gameOverSub">Click to Restart</div>

        <div id="scoreSaveWrapper">
            <input type="text" id="playerNameInput" placeholder="Enter your name">
            <div id="saveScoreBtn">Save Score</div>
        </div>

        <div id="finalScoreWrapper">
            Your Score: <span id="finalScoreDisplay"></span>
        </div>
        <div id="gameOverGoBack">Go Back</div>
    </div>

    <!-- LEADERBOARD OVERLAY -->
    <div id="leaderboardOverlay" style="display:none;">
        <div id="leaderboardTitle">Leaderboard</div>
        <table id="leaderboardTable">

        </table>
        <div id="leaderboardGoBack">Go Back</div>
    </div>

</div>
<script src="game.js"></script>
</body>
</html>
