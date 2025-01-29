import pygame
import math

# Window Settings
WINDOW_WIDTH = 1200
WINDOW_HEIGHT = 800
FPS = 60

# Colors (RGB)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
BACKGROUND = (40, 42, 54)  # Dark dystopian sky
GROUND_COLOR = (70, 72, 84)  # Barren ground
PLATFORM_COLOR = (100, 102, 114)  # Industrial platforms
HAZARD_COLOR = (255, 88, 88)  # Dangerous obstacles

# Character Colors
CHEESE_COLOR = (255, 191, 0)      # Golden yellow for cheese
HAIR_COLOR = (255, 69, 0)         # Bright orange-red for hair
SKIN_COLOR = (255, 223, 196)      # Light skin tone
UNIFORM_COLOR = (255, 255, 255)   # White uniform
UNIFORM_STRIPE = (220, 220, 220)  # Light gray for stripes
EYE_COLOR = (0, 162, 232)         # Bright blue for eyes
MOUTH_COLOR = (200, 80, 80)       # Pinkish-red for mouth
CHEESE_SHADOW = (230, 171, 0)     # Darker yellow for cheese holes

# Player Settings
PLAYER_WIDTH = 80  # Increased size for better detail
PLAYER_HEIGHT = 80 # Square proportions for better visibility
PLAYER_SQUAT_HEIGHT = 50  # Height when squatting
PLAYER_SPEED = 5
PLAYER_SQUAT_SPEED = 3  # Slower movement while squatting
PLAYER_JUMP_POWER = -15
PLAYER_DOUBLE_JUMP_POWER = -12  # Slightly weaker second jump
GRAVITY = 0.8
GROUND_HEIGHT = WINDOW_HEIGHT - 100

# Character Animation
CHARACTER_BOUNCE_AMPLITUDE = 5  # How much the character bounces while moving
CHARACTER_BOUNCE_SPEED = 0.1    # Speed of the bouncing animation
CHARACTER_TILT_MAX = 15        # Maximum rotation angle in degrees
CHARACTER_WOBBLE_SPEED = 0.05   # Speed of the wobble animation

# Platform Settings
PLATFORM_HEIGHT = 20
MIN_PLATFORM_WIDTH = 60
MAX_PLATFORM_WIDTH = 200
PLATFORM_SPACING = 200  # Minimum horizontal space between platforms

# Obstacle Settings
OBSTACLE_TYPES = {
    'SPIKE': {'width': 50, 'height': 50, 'damage': 1},
    'LASER': {'width': 10, 'height': 100, 'damage': 2},
    'DRONE': {'width': 50, 'height': 50, 'damage': 1, 'speed': 3}
}

# Game Settings
SCROLL_SPEED = 3
INITIAL_HEALTH = 3
SCORE_PER_DISTANCE = 1
DIFFICULTY_INCREASE_RATE = 0.1  # Speed increases per second

# Visual Effects
PARTICLE_COLORS = [CHEESE_COLOR, HAIR_COLOR, WHITE]
PARTICLE_LIFETIME = 30
PARTICLE_COUNT = 10

# Level Generation
CHUNK_SIZE = WINDOW_WIDTH  # Size of each generated level chunk
MIN_GAP = 100  # Minimum gap between platforms
MAX_GAP = 300  # Maximum gap between platforms
PLATFORM_HEIGHT_VARIANCE = 100  # How much platforms can vary in height

# Animation Settings
PLAYER_ANIMATION_SPEED = 0.2
PLAYER_STATES = {
    'IDLE': 0,
    'RUNNING': 1,
    'JUMPING': 2,
    'FALLING': 3,
    'HURT': 4,
    'SQUATTING': 5
}

# Sound Settings
VOLUME = 0.7
MUSIC_VOLUME = 0.5

# Difficulty Scaling
DIFFICULTY_THRESHOLDS = [
    1000,   # Level 1
    2500,   # Level 2
    5000,   # Level 3
    7500,   # Level 4
    10000   # Level 5
]

SPEED_SCALE_FACTOR = 1.2      # Game speed increases by 20% per level
OBSTACLE_SCALE_FACTOR = 1.3   # More obstacles per level
PLATFORM_SCALE_FACTOR = 0.9   # Platforms get slightly smaller/further apart

# Orb Settings
ORB_RADIUS = 20
ORB_SPAWN_RATE = 2000  # milliseconds
FADE_TIME = 5000  # milliseconds
MIN_SPAWN_INTERVAL = 500  # minimum spawn interval in milliseconds

# Zone Settings
ZONE_RADIUS = 80
ZONE_POSITIONS = {
    'RED': (WINDOW_WIDTH - ZONE_RADIUS, ZONE_RADIUS),
    'BLUE': (WINDOW_WIDTH - ZONE_RADIUS, WINDOW_HEIGHT - ZONE_RADIUS),
    'GREEN': (ZONE_RADIUS, WINDOW_HEIGHT - ZONE_RADIUS),
    'YELLOW': (ZONE_RADIUS, ZONE_RADIUS),
    'PURPLE': (WINDOW_WIDTH // 2, WINDOW_HEIGHT - ZONE_RADIUS)
}

# Zone Movement Settings
ZONE_MOVEMENT_SPEED = 2
ZONE_MOVEMENT_RADIUS = 50  # Radius of circular movement
ZONE_MOVEMENT_PATTERNS = {
    'RED': 'circular',      # Moves in a circle
    'BLUE': 'horizontal',   # Moves left and right
    'GREEN': 'vertical',    # Moves up and down
    'YELLOW': 'diagonal',   # Moves diagonally
    'PURPLE': 'figure8'     # Moves in a figure-8 pattern
}

# Game Settings
INITIAL_TIME = 60  # seconds
PERFECT_MATCH_BONUS = 2
COMBO_MULTIPLIER = 1.5
LEVEL_UP_SCORE = 1000

# Power-up Settings
POWERUP_CHANCE = 0.1  # 10% chance for power-up orbs
SLOW_MOTION_DURATION = 5000  # milliseconds
MULTIPLIER_DURATION = 3000  # milliseconds
AUTO_COLLECT_DURATION = 2000  # milliseconds

# Base values for scaling
BASE_MOVEMENT_SPEED = ZONE_MOVEMENT_SPEED
BASE_SPAWN_RATE = ORB_SPAWN_RATE
BASE_FADE_TIME = FADE_TIME
BASE_MOVEMENT_RADIUS = ZONE_MOVEMENT_RADIUS

# Enemy Colors
CAT_COLORS = {
    'BODY': (255, 140, 0),      # Bright orange
    'DARK_STRIPES': (200, 80, 0), # Darker orange for stripes
    'EYE_COLOR': (255, 255, 0),  # Yellow eyes
    'PUPIL_COLOR': (0, 0, 0),    # Black pupils
    'NOSE': (255, 105, 180),     # Pink nose
    'MOUTH': (150, 30, 0)        # Dark red mouth
}

# Cat Enemy Settings
CAT_WIDTH = 100
CAT_HEIGHT = 80
CAT_SPEED = 2
CAT_ACCELERATION = 0.1
CAT_JUMP_POWER = -12
CAT_SPAWN_INTERVAL = 5000  # Spawn a new cat every 5 seconds
CAT_DAMAGE = 2            # Cats do more damage than regular obstacles
CAT_DETECTION_RANGE = 300 # How far the cat can "see" the player

# Cat Messages
CAT_TAUNTS = [
    "Mmm... cheese and human, my favorite!",
    "Here kitty kitty... Oh wait, I'M the kitty!",
    "Your cheese belongs to me now!",
    "Running makes you tastier!",
    "I can smell your fear... and cheese!",
    "Time for a cheese sandwich... with YOU in it!",
    "You can't outrun a hungry cat forever!",
    "That cheese would go great with some running human!",
    "Purrfect timing for lunch!",
    "Fast food? More like fast human!"
]

# Message Display Settings
MESSAGE_DURATION = 2000  # How long each message stays on screen (ms)
MESSAGE_FADE_TIME = 500  # How long it takes for message to fade (ms)

# Cheeseball Power-up Settings
CHEESEBALL_SIZE = 25
CHEESEBALL_SPAWN_INTERVAL = 3000  # Spawn every 3 seconds
CHEESEBALL_COLORS = {
    'SPEED': (255, 215, 0),     # Golden
    'JUMP': (255, 165, 0)       # Orange
}
CHEESEBALL_GLOW = (255, 255, 200, 50)  # Subtle yellow glow

# Power-up Effects
SPEED_BOOST_MULTIPLIER = 1.8    # How much faster you go
JUMP_BOOST_MULTIPLIER = 1.5     # How much higher you jump
POWER_UP_DURATION = 5000        # Power-ups last 5 seconds
POWER_UP_FADE_TIME = 1000       # Start fading 1 second before end

# Power-up Messages
POWER_UP_MESSAGES = {
    'SPEED': "Super Speed!",
    'JUMP': "Super Jump!"
}

# Level Settings
LEVELS = {
    1: {
        'name': 'Dystopian City',
        'background': (40, 42, 54),      # Dark dystopian sky
        'ground': (70, 72, 84),          # Barren ground
        'platform': (100, 102, 114),     # Industrial platforms
        'score_required': 0,
        'message': "Welcome to Dystopian City!"
    },
    2: {
        'name': 'Neon District',
        'background': (25, 0, 51),       # Deep purple
        'ground': (51, 0, 102),          # Neon purple ground
        'platform': (128, 0, 255),       # Bright purple platforms
        'score_required': 1000,
        'message': ""
    },
    3: {
        'name': 'Cyber Zone',
        'background': (0, 20, 40),       # Dark cyber blue
        'ground': (0, 40, 80),           # Cyber blue ground
        'platform': (0, 128, 255),       # Bright blue platforms
        'score_required': 2500,
        'message': ""
    },
    4: {
        'name': 'Digital Wasteland',
        'background': (40, 0, 0),        # Dark red
        'ground': (80, 0, 0),            # Deep red ground
        'platform': (255, 0, 0),         # Bright red platforms
        'score_required': 5000,
        'message': ""
    },
    5: {
        'name': 'Matrix Core',
        'background': (0, 20, 0),        # Dark matrix green
        'ground': (0, 40, 0),            # Deep green ground
        'platform': (0, 255, 0),         # Matrix green platforms
        'score_required': 7500,
        'message': ""
    },
    6: {
        'name': 'Dalbird\'s Domain',
        'background': (30, 0, 30),       # Dark purple-black
        'ground': (60, 0, 60),           # Deep purple ground
        'platform': (120, 0, 120),       # Purple platforms
        'score_required': 10000,
        'message': ""
    },
    7: {
        'name': 'Victory Zone',
        'background': (50, 50, 150),     # Bright blue sky
        'ground': (100, 200, 100),       # Lush green ground
        'platform': (200, 200, 255),     # Light platforms
        'score_required': 12500,
        'message': ""
    }
}

# Level Transition Settings
LEVEL_MESSAGE_DURATION = 3000  # How long to show level messages (ms)
LEVEL_FADE_DURATION = 1000     # How long to fade between levels (ms)
BACKGROUND_TRANSITION_SPEED = 5  # How fast to fade between backgrounds 

# Laser Settings
LASER_SPEED = 15
LASER_WIDTH = 20
LASER_HEIGHT = 5
LASER_COLOR = (0, 255, 255)  # Cyan
LASER_COOLDOWN = 500  # Milliseconds between shots
LASER_GLOW = (0, 255, 255, 50)  # Semi-transparent cyan
CAT_ELIMINATION_SCORE = 150  # Points for eliminating a cat
LASER_SOUND_VOLUME = 0.3 

# Dalbird Taunts for Level 6
DALBIRD_TAUNTS = [
    "Hey Ryan, I'm Dalbird",
    "Ryyyyyyan",
    "Ryan, are you stressed",
    "I love this song"
]

# Dalbird Settings
DALBIRD_TAUNT_INTERVAL = 5000  # Show a taunt every 5 seconds
DALBIRD_SCALE = 3.0  # Size multiplier for background Dalbird 

# Dalbird Battle Settings
DALBIRD_MAX_HEALTH = 5
DALBIRD_HIT_SCORE = 200  # Points for each successful hit
DALBIRD_DEFEAT_SCORE = 2000  # Bonus points for defeating Dalbird
DALBIRD_DAMAGE_FLASH_DURATION = 30  # Frames to flash red when hit
DALBIRD_DEFEAT_MESSAGES = [
    "Impossible! How could you...",
    "My birds... avenge me!",
    "This isn't the last you'll see of me!",
    "Noooooooo!",
    "I'll be back, stronger than ever!"
]

# Catlock Legal Taunts for Level 4
CATLOCK_LEGAL_TAUNTS = [
    "According to Article Paw, Section Meow of the Catsitution...",
    "By Feline Law 4.2.0, all mice belong to cats!",
    "The Supreme Cat Court ruled in Whiskers v. Paws that naps are mandatory!",
    "As per the Catsitution, all boxes are cat property!",
    "The Feline Rights Act of 1876 declares all laps as cat seats!",
    "By Pawcedural Law, treats must be given on demand!",
    "The Cat Congress passed the Mandatory Petting Act!",
    "Under Kitty Common Law, birds behind windows are fair game!",
    "The Department of Feline Justice requires hourly snacks!",
    "The Catsitutional Amendment protects the right to knock things off tables!",
    "By Federal Feline Regulation, all yarn is contraband!",
    "The National Cat Agency has declared lasers as weapons of mass distraction!",
    "The Bureau of Feline Affairs states all dogs must be chased!",
    "As per the Catsitution, resistance to belly rubs is futile!",
    "The Cat Supreme Court ruled in favor of 3AM zoomies!"
]

# Catlock Level 4 Settings
CATLOCK_SCALE = 2.5  # Reduced from 4.0 to make Catlock smaller
CATLOCK_TAUNT_INTERVAL = 4000  # Show a legal taunt every 4 seconds 