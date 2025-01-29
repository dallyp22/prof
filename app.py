from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

# Ensure the static and templates directories exist
os.makedirs('static', exist_ok=True)
os.makedirs('templates', exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/api/save_score', methods=['POST'])
def save_score():
    data = request.get_json()
    score = data.get('score', 0)
    # Here you could save the score to a database
    return jsonify({'success': True, 'score': score})

if __name__ == '__main__':
    app.run(debug=True) 