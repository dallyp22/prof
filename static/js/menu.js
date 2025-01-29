function showInstructions() {
    document.getElementById('instructions').style.display = 'flex';
}

function showHighScores() {
    document.getElementById('highScores').style.display = 'flex';
    // Here you could load high scores from the server
    loadHighScores();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function loadHighScores() {
    // Placeholder for loading high scores
    const scoresList = document.getElementById('scoresList');
    scoresList.innerHTML = '<p>Loading scores...</p>';
    
    // You could fetch scores from the server here
    fetch('/api/scores')
        .then(response => response.json())
        .then(data => {
            if (data.scores && data.scores.length > 0) {
                scoresList.innerHTML = data.scores
                    .map((score, index) => `<p>${index + 1}. ${score.name}: ${score.score}</p>`)
                    .join('');
            } else {
                scoresList.innerHTML = '<p>No scores yet!</p>';
            }
        })
        .catch(error => {
            scoresList.innerHTML = '<p>Error loading scores</p>';
            console.error('Error:', error);
        });
} 