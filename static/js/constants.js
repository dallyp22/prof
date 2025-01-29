// Window Settings
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;
const FPS = 60;

// Colors (RGB)
const COLORS = {
    BLACK: [0, 0, 0],
    WHITE: [255, 255, 255],
    BACKGROUND: [40, 42, 54],
    GROUND_COLOR: [70, 72, 84],
    PLATFORM_COLOR: [100, 102, 114],
    HAZARD_COLOR: [255, 88, 88],
    CHEESE_COLOR: [255, 191, 0],
    HAIR_COLOR: [255, 69, 0],
    SKIN_COLOR: [255, 223, 196],
    UNIFORM_COLOR: [255, 255, 255],
    UNIFORM_STRIPE: [220, 220, 220],
    EYE_COLOR: [0, 162, 232],
    MOUTH_COLOR: [200, 80, 80],
    CHEESE_SHADOW: [230, 171, 0]
};

// Player Settings
const PLAYER = {
    WIDTH: 80,
    HEIGHT: 80,
    SQUAT_HEIGHT: 50,
    SPEED: 5,
    SQUAT_SPEED: 3,
    JUMP_POWER: -15,
    DOUBLE_JUMP_POWER: -12,
    GRAVITY: 0.8,
    GROUND_HEIGHT: WINDOW_HEIGHT - 100,
    BOUNCE_AMPLITUDE: 1.5,
    BOUNCE_SPEED: 0.03,
    TILT_MAX: 5,
    WOBBLE_SPEED: 0.02
};

// Platform Settings
const PLATFORM = {
    MIN_WIDTH: 60,
    MAX_WIDTH: 200,
    HEIGHT: 20,
    MIN_GAP: 100,
    MAX_GAP: 300,
    HEIGHT_VARIANCE: 100
};

// Level Settings
const LEVELS = {
    1: {
        name: 'Dystopian City',
        background: [40, 42, 54],
        ground: [70, 72, 84],
        platform: [100, 102, 114],
        scoreRequired: 0,
        message: "Welcome to Dystopian City!"
    },
    2: {
        name: 'Neon District',
        background: [25, 0, 51],
        ground: [51, 0, 102],
        platform: [128, 0, 255],
        scoreRequired: 1000,
        message: ""
    },
    3: {
        name: 'Cyber Zone',
        background: [0, 20, 40],
        ground: [0, 40, 80],
        platform: [0, 128, 255],
        scoreRequired: 2500,
        message: ""
    },
    4: {
        name: 'Catlock\'s Lair',
        background: [40, 0, 0],
        ground: [80, 0, 0],
        platform: [255, 0, 0],
        scoreRequired: 5000,
        message: "Watch out! Catlock is here!"
    },
    5: {
        name: 'Matrix Core',
        background: [0, 20, 0],
        ground: [0, 40, 0],
        platform: [0, 255, 0],
        scoreRequired: 7500,
        message: ""
    },
    6: {
        name: "Dalbird's Domain",
        background: [30, 0, 30],
        ground: [60, 0, 60],
        platform: [120, 0, 120],
        scoreRequired: 10000,
        message: ""
    },
    7: {
        name: 'Victory Zone',
        background: [50, 50, 150],
        ground: [100, 200, 100],
        platform: [200, 200, 255],
        scoreRequired: 12500,
        message: ""
    }
};

// Game Settings
const INITIAL_HEALTH = 3;
const SCROLL_SPEED = 3;
const SCORE_PER_DISTANCE = 1;
const DIFFICULTY_INCREASE_RATE = 0.1;

// Dalbird Taunts
const DALBIRD_TAUNTS = [
    "Hey Ryan, I'm Dalbird",
    "Ryyyyyyan",
    "Ryan, are you stressed",
    "I love this song"
]; 