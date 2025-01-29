import os
import shutil

def setup_assets():
    # Create directories if they don't exist
    static_dirs = ['static/images', 'static/audio', 'static/css', 'static/js']
    for dir_path in static_dirs:
        os.makedirs(dir_path, exist_ok=True)

    # Move image files
    image_files = ['Ryan.png', 'dalbird.png', 'villain.png', 'Catlock2.gif']
    for image in image_files:
        if os.path.exists(image):
            shutil.copy2(image, f'static/images/{image}')
            print(f'Copied {image} to static/images/')
        else:
            print(f'Warning: {image} not found')

    # Move audio files
    audio_files = ['superbass.mp3']
    for audio in audio_files:
        if os.path.exists(audio):
            shutil.copy2(audio, f'static/audio/{audio}')
            print(f'Copied {audio} to static/audio/')
        else:
            print(f'Warning: {audio} not found')

if __name__ == '__main__':
    setup_assets() 