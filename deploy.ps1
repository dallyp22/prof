# Create necessary directories
New-Item -ItemType Directory -Force -Path "static"
New-Item -ItemType Directory -Force -Path "static/js"
New-Item -ItemType Directory -Force -Path "static/js/classes"
New-Item -ItemType Directory -Force -Path "static/images"
New-Item -ItemType Directory -Force -Path "static/audio"
New-Item -ItemType Directory -Force -Path "templates"

# Copy JavaScript files
Copy-Item "static/js/game.js" -Destination "static/js/" -Force
Copy-Item "static/js/constants.js" -Destination "static/js/" -Force
Copy-Item "static/js/classes/*" -Destination "static/js/classes/" -Force

# Copy HTML templates
Copy-Item "templates/game.html" -Destination "templates/" -Force

# Create requirements.txt if it doesn't exist
if (-not(Test-Path -Path "requirements.txt" -PathType Leaf)) {
    @"
Flask==2.0.1
python-dotenv==0.19.0
gunicorn==20.1.0
"@ | Out-File -FilePath "requirements.txt"
}

# Create .env file if it doesn't exist
if (-not(Test-Path -Path ".env" -PathType Leaf)) {
    @"
FLASK_APP=app.py
FLASK_ENV=production
"@ | Out-File -FilePath ".env"
}

Write-Host "Deployment files prepared successfully!" 