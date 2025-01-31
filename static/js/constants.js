// Window Settings
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;
const FPS = 60;

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Colors (RGB)
const BLACK = 'rgb(0, 0, 0)';
const WHITE = 'rgb(255, 255, 255)';
const BACKGROUND = 'rgb(40, 42, 54)';  // Dark dystopian sky
const GROUND_COLOR = 'rgb(70, 72, 84)';  // Barren ground
const PLATFORM_COLOR = 'rgb(100, 102, 114)';  // Industrial platforms
const HAZARD_COLOR = 'rgb(255, 88, 88)';  // Dangerous obstacles

// Character Colors
const CHEESE_COLOR = 'rgb(255, 191, 0)';      // Golden yellow for cheese
const HAIR_COLOR = 'rgb(255, 69, 0)';         // Bright orange-red for hair
const SKIN_COLOR = 'rgb(255, 223, 196)';      // Light skin tone
const UNIFORM_COLOR = 'rgb(255, 255, 255)';   // White uniform
const UNIFORM_STRIPE = 'rgb(220, 220, 220)';  // Light gray for stripes
const EYE_COLOR = 'rgb(0, 162, 232)';         // Bright blue for eyes
const MOUTH_COLOR = 'rgb(200, 80, 80)';       // Pinkish-red for mouth
const CHEESE_SHADOW = 'rgb(230, 171, 0)';     // Darker yellow for cheese holes

// Player constants
const PLAYER_WIDTH = 80;  // Increased size for better detail
const PLAYER_HEIGHT = 80; // Square proportions for better visibility
const PLAYER_SQUAT_HEIGHT = 50;  // Height when squatting
const PLAYER_SPEED = 5;
const PLAYER_SQUAT_SPEED = 3;  // Slower movement while squatting
const PLAYER_JUMP_POWER = -15;
const PLAYER_DOUBLE_JUMP_POWER = -12;  // Slightly weaker second jump
const GRAVITY = 0.8;
const GROUND_HEIGHT = WINDOW_HEIGHT - 100;

// Game mechanics
const INITIAL_HEALTH = 3;
const SPEED_BOOST_MULTIPLIER = 1.8;    // How much faster you go
const JUMP_BOOST_MULTIPLIER = 1.5;     // How much higher you jump
const POWER_UP_DURATION = 5000;        // Power-ups last 5 seconds
const POWER_UP_FADE_TIME = 1000;       // Start fading 1 second before end
const POWER_UP_MESSAGES = {
    'SPEED': 'Speed Boost!',
    'JUMP': 'Super Jump!'
};

// Animation constants
const CHARACTER_BOUNCE_AMPLITUDE = 5;  // How much the character bounces while moving
const CHARACTER_BOUNCE_SPEED = 0.1;    // Speed of the bouncing animation
const CHARACTER_TILT_MAX = 15;        // Maximum rotation angle in degrees
const CHARACTER_WOBBLE_SPEED = 0.05;   // Speed of the wobble animation

// Particle effects
const PARTICLE_COUNT = 10;
const PARTICLE_LIFETIME = 30;
const PARTICLE_COLORS = [CHEESE_COLOR, HAIR_COLOR, WHITE];

// Message display
const MESSAGE_DURATION = 2000;  // How long each message stays on screen (ms)
const MESSAGE_FADE_TIME = 500;  // How long it takes for message to fade (ms)

// Game states
const PLAYER_STATES = {
    'IDLE': 0,
    'RUNNING': 1,
    'JUMPING': 2,
    'FALLING': 3,
    'HURT': 4,
    'SQUATTING': 5
};

// Platform Settings
const PLATFORM_HEIGHT = 20;
const MIN_PLATFORM_WIDTH = 60;
const MAX_PLATFORM_WIDTH = 200;
const PLATFORM_SPACING = 200;  // Minimum horizontal space between platforms

// Obstacle Settings
const OBSTACLE_TYPES = {
    'SPIKE': { width: 50, height: 50, damage: 1 },
    'LASER': { width: 10, height: 100, damage: 2 },
    'DRONE': { width: 50, height: 50, damage: 1, speed: 3 }
};

// Game Settings
const SCROLL_SPEED = 3;
const SCORE_PER_DISTANCE = 1;
const DIFFICULTY_INCREASE_RATE = 0.1;  // Speed increases per second

// Level Generation
const CHUNK_SIZE = WINDOW_WIDTH;  // Size of each generated level chunk
const MIN_GAP = 100;  // Minimum gap between platforms
const MAX_GAP = 300;  // Maximum gap between platforms
const PLATFORM_HEIGHT_VARIANCE = 100;  // How much platforms can vary in height

// Animation Settings
const PLAYER_ANIMATION_SPEED = 0.2;

// Game Settings
const INITIAL_TIME = 60;  // seconds
const PERFECT_MATCH_BONUS = 2;
const COMBO_MULTIPLIER = 1.5;
const LEVEL_UP_SCORE = 1000;

// Power-up Settings
const POWERUP_CHANCE = 0.1;  // 10% chance for power-up orbs
const SLOW_MOTION_DURATION = 5000;  // milliseconds
const MULTIPLIER_DURATION = 3000;  // milliseconds
const AUTO_COLLECT_DURATION = 2000;  // milliseconds

// Enemy Colors
const CAT_COLORS = {
    'BODY': 'rgb(255, 140, 0)',      // Bright orange
    'DARK_STRIPES': 'rgb(200, 80, 0)', // Darker orange for stripes
    'EYE_COLOR': 'rgb(255, 255, 0)',  // Yellow eyes
    'PUPIL_COLOR': 'rgb(0, 0, 0)',    // Black pupils
    'NOSE': 'rgb(255, 105, 180)',     // Pink nose
    'MOUTH': 'rgb(150, 30, 0)'        // Dark red mouth
};

// Cat Enemy Settings
const CAT_WIDTH = 100;
const CAT_HEIGHT = 80;
const CAT_SPEED = 2;
const CAT_ACCELERATION = 0.1;
const CAT_JUMP_POWER = -12;
const CAT_SPAWN_INTERVAL = 5000;  // Spawn a new cat every 5 seconds
const CAT_DAMAGE = 2;            // Cats do more damage than regular obstacles
const CAT_DETECTION_RANGE = 300; // How far the cat can "see" the player

// Level Settings
const LEVELS = {
    1: {
        name: 'Dystopian City',
        background: 'rgb(40, 42, 54)',      // Dark dystopian sky
        ground: 'rgb(70, 72, 84)',          // Barren ground
        platform: 'rgb(100, 102, 114)',     // Industrial platforms
        score_required: 0,
        message: "Welcome to Dystopian City!"
    },
    2: {
        name: 'Neon District',
        background: 'rgb(25, 0, 51)',       // Deep purple
        ground: 'rgb(51, 0, 102)',          // Neon purple ground
        platform: 'rgb(128, 0, 255)',       // Bright purple platforms
        score_required: 1000,
        message: "Welcome to the Neon District!"
    },
    3: {
        name: 'Cyber Zone',
        background: 'rgb(0, 20, 40)',       // Dark cyber blue
        ground: 'rgb(0, 40, 80)',           // Cyber blue ground
        platform: 'rgb(0, 128, 255)',       // Bright blue platforms
        score_required: 2500,
        message: "Entering the Cyber Zone!"
    },
    4: {
        name: 'Digital Wasteland',
        background: 'rgb(40, 0, 0)',        // Dark red
        ground: 'rgb(80, 0, 0)',            // Deep red ground
        platform: 'rgb(255, 0, 0)',         // Bright red platforms
        score_required: 5000,
        message: "Welcome to the Digital Wasteland!"
    },
    5: {
        name: 'Matrix Core',
        background: 'rgb(0, 20, 0)',        // Dark matrix green
        ground: 'rgb(0, 40, 0)',            // Deep green ground
        platform: 'rgb(0, 255, 0)',         // Matrix green platforms
        score_required: 7500,
        message: "Entering the Matrix Core!"
    },
    6: {
        name: "Dalbird's Domain",
        background: 'rgb(30, 0, 30)',       // Dark purple-black
        ground: 'rgb(60, 0, 60)',           // Deep purple ground
        platform: 'rgb(120, 0, 120)',       // Purple platforms
        score_required: 10000,
        message: "Welcome to Dalbird's Domain!"
    },
    7: {
        name: 'Victory Zone',
        background: 'rgb(50, 50, 150)',     // Bright blue sky
        ground: 'rgb(100, 200, 100)',       // Lush green ground
        platform: 'rgb(200, 200, 255)',     // Light platforms
        score_required: 12500,
        message: "Victory is within reach!"
    }
};

// Level Transition Settings
const LEVEL_MESSAGE_DURATION = 3000;  // How long to show level messages (ms)
const LEVEL_FADE_DURATION = 1000;     // How long to fade between levels (ms)
const BACKGROUND_TRANSITION_SPEED = 5;  // How fast to fade between backgrounds

// Laser Settings
const LASER_SPEED = 15;
const LASER_WIDTH = 20;
const LASER_HEIGHT = 5;
const LASER_COLOR = 'rgb(0, 255, 255)';  // Cyan
const LASER_COOLDOWN = 500;  // Milliseconds between shots
const LASER_GLOW = 'rgba(0, 255, 255, 0.5)';  // Semi-transparent cyan
const CAT_ELIMINATION_SCORE = 150;  // Points for eliminating a cat

// Dalbird Settings
const DALBIRD_TAUNT_INTERVAL = 5000;  // Show a taunt every 5 seconds
const DALBIRD_SCALE = 3.0;  // Size multiplier for background Dalbird
const DALBIRD_MAX_HEALTH = 5;
const DALBIRD_HIT_SCORE = 200;  // Points for each successful hit
const DALBIRD_DEFEAT_SCORE = 2000;  // Bonus points for defeating Dalbird
const DALBIRD_DAMAGE_FLASH_DURATION = 30;  // Frames to flash red when hit

// Catlock Settings
const CATLOCK_SCALE = 2.5;  // Size multiplier for Catlock
const CATLOCK_TAUNT_INTERVAL = 4000;  // Show a legal taunt every 4 seconds

// Cheeseball Power-up Settings
const CHEESEBALL_SIZE = 25;
const CHEESEBALL_SPAWN_INTERVAL = 3000;  // Spawn every 3 seconds
const CHEESEBALL_COLORS = {
    'SPEED': 'rgb(255, 215, 0)',     // Golden
    'JUMP': 'rgb(255, 165, 0)'       // Orange
};
const CHEESEBALL_GLOW = 'rgba(255, 255, 200, 0.5)';  // Subtle yellow glow

// Dalbird Taunts
const DALBIRD_TAUNTS = [
    "Hey Ryan, I'm Dalbird",
    "Ryyyyyyan",
    "Ryan, are you stressed",
    "I love this song"
]; 