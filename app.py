from flask import Flask, render_template, send_from_directory, jsonify, request
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Ensure the static and templates directories exist
os.makedirs('static', exist_ok=True)
os.makedirs('templates', exist_ok=True)

@app.route('/')
def index():
    """Redirect to game page"""
    return render_template('game.html')

@app.route('/game')
def game():
    """Serve the game page"""
    return render_template('game.html')

@app.route('/static/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('static', path)

@app.route('/api/save_score', methods=['POST'])
def save_score():
    """Save player score (can be expanded later)"""
    data = request.get_json()
    score = data.get('score', 0)
    # Here you could save the score to a database
    return jsonify({'success': True, 'score': score})

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Use 0.0.0.0 to bind to all interfaces
    app.run(host='0.0.0.0', port=port) 