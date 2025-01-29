import pygame
import sys
import random
import math
from constants import *

class Player:
    def __init__(self):
        self.width = PLAYER_WIDTH
        self.height = PLAYER_HEIGHT
        self.normal_height = PLAYER_HEIGHT
        self.x = WINDOW_WIDTH // 4
        self.y = GROUND_HEIGHT - self.height
        self.vel_x = 0
        self.vel_y = 0
        self.jumping = False
        self.squatting = False
        self.double_jump_available = True
        self.health = INITIAL_HEALTH
        self.state = PLAYER_STATES['IDLE']
        self.invulnerable = False
        self.invulnerable_timer = 0
        self.particles = []
        self.animation_time = 0
        self.rotation = 0
        self.facing_right = True  # Track which direction Ryan is facing
        
        # Power-up states
        self.speed_boost = False
        self.jump_boost = False
        self.speed_boost_timer = 0
        self.jump_boost_timer = 0
        self.power_up_message = ""
        self.message_timer = 0
        
        # Cheat code states
        self.unlimited_health = False
        self.cheat_code_buffer = ""
        self.cheat_code = "HuggyB"
        self.last_shot_time = 0
        self.lasers = []

    def update(self):
        # Update power-up timers
        current_time = pygame.time.get_ticks()
        
        if self.speed_boost:
            if current_time > self.speed_boost_timer:
                self.speed_boost = False
        
        if self.jump_boost:
            if current_time > self.jump_boost_timer:
                self.jump_boost = False
        
        if self.message_timer > 0:
            self.message_timer -= 1

        # Handle squatting
        keys = pygame.key.get_pressed()
        if keys[pygame.K_DOWN]:
            if not self.squatting and not self.jumping:
                self.squatting = True
                self.height = PLAYER_SQUAT_HEIGHT
                # Adjust y position to maintain feet position
                self.y = GROUND_HEIGHT - self.height
                self.state = PLAYER_STATES['SQUATTING']
        else:
            if self.squatting:
                # Check if there's room to stand up
                if not any(obstacle for obstacle in game.obstacles 
                          if (self.x + self.width > obstacle.x and
                              self.x < obstacle.x + obstacle.width and
                              self.y - (self.normal_height - self.height) < obstacle.y + obstacle.height)):
                    self.squatting = False
                    self.height = self.normal_height
                    self.y = GROUND_HEIGHT - self.height
                    self.state = PLAYER_STATES['IDLE']

        # Handle horizontal movement with arrow keys
        self.vel_x = 0
        if keys[pygame.K_LEFT]:
            self.vel_x = -PLAYER_SPEED * (SPEED_BOOST_MULTIPLIER if self.speed_boost else 1)
            if self.squatting:
                self.vel_x *= PLAYER_SQUAT_SPEED / PLAYER_SPEED
        if keys[pygame.K_RIGHT]:
            self.vel_x = PLAYER_SPEED * (SPEED_BOOST_MULTIPLIER if self.speed_boost else 1)
            if self.squatting:
                self.vel_x *= PLAYER_SQUAT_SPEED / PLAYER_SPEED
        
        # Update position
        self.x += self.vel_x
        # Keep player in bounds
        self.x = max(0, min(self.x, WINDOW_WIDTH - self.width))

        # Apply gravity
        self.vel_y += GRAVITY
        self.y += self.vel_y

        # Ground collision
        if self.y > GROUND_HEIGHT - self.height:
            self.y = GROUND_HEIGHT - self.height
            self.vel_y = 0
            self.jumping = False
            if abs(self.vel_y) < 0.1 and not self.squatting:
                self.state = PLAYER_STATES['RUNNING']

        # Update invulnerability
        if self.invulnerable:
            self.invulnerable_timer -= 1
            if self.invulnerable_timer <= 0:
                self.invulnerable = False

        # Update particles
        self.particles = [p for p in self.particles if p['lifetime'] > 0]
        for p in self.particles:
            p['x'] += p['vel_x']
            p['y'] += p['vel_y']
            p['lifetime'] -= 1

        # Update animation
        self.animation_time += 1
        if self.jumping:
            self.rotation = -CHARACTER_TILT_MAX * (self.vel_y / PLAYER_JUMP_POWER)
        elif not self.squatting:
            self.rotation = CHARACTER_TILT_MAX * math.sin(self.animation_time * CHARACTER_WOBBLE_SPEED)

        # Update lasers
        for laser in self.lasers[:]:
            laser.update()
            # Remove lasers that are off screen
            if laser.x > WINDOW_WIDTH:
                self.lasers.remove(laser)

        # Update facing direction based on movement
        if self.vel_x > 0:
            self.facing_right = True
        elif self.vel_x < 0:
            self.facing_right = False

    def jump(self):
        if self.squatting:  # Can't jump while squatting
            return
            
        jump_power = PLAYER_JUMP_POWER * (JUMP_BOOST_MULTIPLIER if self.jump_boost else 1)
        if not self.jumping:  # First jump
            self.vel_y = jump_power
            self.jumping = True
            self.double_jump_available = True
            self.state = PLAYER_STATES['JUMPING']
            self.spawn_particles()
        elif self.double_jump_available:  # Double jump
            self.vel_y = jump_power * 0.8  # Slightly weaker double jump
            self.double_jump_available = False
            self.spawn_particles()
            self.spawn_particles()

    def take_damage(self):
        if self.unlimited_health:  # Skip damage if unlimited health is active
            return
            
        if not self.invulnerable:
            self.health -= 1
            self.invulnerable = True
            self.invulnerable_timer = 60
            self.state = PLAYER_STATES['HURT']
            self.spawn_particles()

    def activate_power_up(self, power_type):
        current_time = pygame.time.get_ticks()
        if power_type == 'SPEED':
            self.speed_boost = True
            self.speed_boost_timer = current_time + POWER_UP_DURATION
        elif power_type == 'JUMP':
            self.jump_boost = True
            self.jump_boost_timer = current_time + POWER_UP_DURATION
        
        # Show power-up message
        self.power_up_message = POWER_UP_MESSAGES[power_type]
        self.message_timer = MESSAGE_DURATION
        
        # Spawn celebration particles
        for _ in range(PARTICLE_COUNT * 2):
            self.spawn_particles()

    def spawn_particles(self):
        for _ in range(PARTICLE_COUNT):
            angle = random.uniform(0, math.pi * 2)
            speed = random.uniform(2, 5)
            self.particles.append({
                'x': self.x + self.width // 2,
                'y': self.y + self.height // 2,
                'vel_x': math.cos(angle) * speed,
                'vel_y': math.sin(angle) * speed,
                'color': random.choice(PARTICLE_COLORS),
                'lifetime': PARTICLE_LIFETIME
            })

    def draw(self, screen):
        # Draw power-up message if active
        if self.message_timer > 0:
            font = pygame.font.Font(None, 36)
            alpha = 255
            if self.message_timer < MESSAGE_FADE_TIME:
                alpha = int(255 * (self.message_timer / MESSAGE_FADE_TIME))
            
            text_surface = font.render(self.power_up_message, True, WHITE)
            alpha_surface = pygame.Surface(text_surface.get_rect().size, pygame.SRCALPHA)
            alpha_surface.fill((255, 255, 255, alpha))
            text_surface.blit(alpha_surface, (0, 0), special_flags=pygame.BLEND_RGBA_MULT)
            
            text_rect = text_surface.get_rect(centerx=self.x + self.width//2,
                                            bottom=self.y - 20)
            screen.blit(text_surface, text_rect)

        # Draw particles
        for p in self.particles:
            pygame.draw.circle(screen, p['color'], 
                             (int(p['x']), int(p['y'])), 2)

        if not self.invulnerable or pygame.time.get_ticks() % 200 < 100:
            bounce_offset = 0
            if not self.jumping and not self.squatting:
                bounce_offset = math.sin(self.animation_time * CHARACTER_BOUNCE_SPEED) * CHARACTER_BOUNCE_AMPLITUDE

            if hasattr(game, 'has_ryan') and game.has_ryan:
                # Get the image and flip it if needed
                image = game.ryan_img
                if not self.facing_right:
                    image = pygame.transform.flip(image, True, False)
                
                if self.squatting:
                    # Scale the image to squatting height while maintaining aspect ratio
                    squat_aspect = image.get_width() / image.get_height()
                    squat_height = PLAYER_SQUAT_HEIGHT
                    squat_width = int(squat_height * squat_aspect)
                    image = pygame.transform.scale(image, (squat_width, squat_height))
                
                # Rotate the image
                rotated_image = pygame.transform.rotate(image, self.rotation)
                rotated_rect = rotated_image.get_rect(center=(self.x + self.width//2,
                                                            self.y + self.height//2 + bounce_offset))
                screen.blit(rotated_image, rotated_rect)
            else:
                # Create surface for the character
                char_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
                
                # Adjust proportions when squatting
                if self.squatting:
                    cheese_height = self.height * 0.7  # Make cheese part larger when squatting
                    head_scale = 0.8  # Slightly smaller head when squatting
                else:
                    cheese_height = self.height * 0.55
                    head_scale = 1.0
                
                # Draw cheese block
                cheese_rect = pygame.Rect(0, self.height - cheese_height, 
                                        self.width, cheese_height)
                pygame.draw.ellipse(char_surface, CHEESE_COLOR, cheese_rect)
                
                # Add cheese texture and holes (adjusted for squatting)
                hole_radius = 5
                hole_positions = [
                    (self.width * 0.2, self.height - cheese_height * 0.3),
                    (self.width * 0.5, self.height - cheese_height * 0.5),
                    (self.width * 0.8, self.height - cheese_height * 0.7),
                    (self.width * 0.3, self.height - cheese_height * 0.8),
                    (self.width * 0.7, self.height - cheese_height * 0.2)
                ]
                # Draw hole shadows
                for pos in hole_positions:
                    shadow_offset = 2
                    pygame.draw.circle(char_surface, CHEESE_SHADOW,
                                     (pos[0] + shadow_offset, pos[1] + shadow_offset), 
                                     hole_radius)
                # Draw holes
                for pos in hole_positions:
                    pygame.draw.circle(char_surface, (CHEESE_COLOR[0]-60, CHEESE_COLOR[1]-60, 0), 
                                     pos, hole_radius)

                # Draw character with adjusted proportions
                head_size = self.width * 0.45 * head_scale
                head_x = self.width // 2 - head_size // 2
                head_y = self.height - cheese_height - head_size * (0.5 if self.squatting else 0.8)
                
                # Draw body
                body_width = head_size * 0.8
                body_height = head_size * 0.9
                body_x = head_x + head_size * 0.1
                body_y = head_y + head_size * 0.7
                
                # Draw uniform with shading
                pygame.draw.ellipse(char_surface, UNIFORM_COLOR, 
                                  (body_x, body_y, body_width, body_height))
                # Stripes with subtle shading
                stripe_spacing = body_width // 4
                for i in range(3):
                    x = body_x + stripe_spacing * (i + 1)
                    pygame.draw.line(char_surface, UNIFORM_STRIPE,
                                   (x, body_y),
                                   (x, body_y + body_height), 3)

                # Draw head with subtle shading
                pygame.draw.ellipse(char_surface, SKIN_COLOR,
                                  (head_x, head_y, head_size, head_size))
                
                # Add cheeks
                cheek_color = (255, 180, 180, 100)  # Soft pink, semi-transparent
                cheek_size = head_size * 0.2
                pygame.draw.ellipse(char_surface, cheek_color,
                                  (head_x + head_size * 0.15, head_y + head_size * 0.45,
                                   cheek_size, cheek_size * 0.7))
                pygame.draw.ellipse(char_surface, cheek_color,
                                  (head_x + head_size * 0.65, head_y + head_size * 0.45,
                                   cheek_size, cheek_size * 0.7))

                # Enhanced spiky hair
                hair_height = head_size * 0.5
                hair_points = [
                    (head_x + head_size * 0.2, head_y + head_size * 0.3),          # Left base
                    (head_x + head_size * 0.1, head_y + head_size * 0.2),          # Left spike base
                    (head_x + head_size * 0.15, head_y - hair_height * 0.3),       # Left spike mid
                    (head_x + head_size * 0.3, head_y - hair_height * 0.7),        # Left-mid spike
                    (head_x + head_size * 0.5, head_y - hair_height),              # Middle spike
                    (head_x + head_size * 0.7, head_y - hair_height * 0.7),        # Right-mid spike
                    (head_x + head_size * 0.85, head_y - hair_height * 0.3),       # Right spike mid
                    (head_x + head_size * 0.9, head_y + head_size * 0.2),          # Right spike base
                    (head_x + head_size * 0.8, head_y + head_size * 0.3),          # Right base
                ]
                pygame.draw.polygon(char_surface, HAIR_COLOR, hair_points)
                
                # Hair highlights
                highlight_points = [
                    (head_x + head_size * 0.3, head_y - hair_height * 0.5),
                    (head_x + head_size * 0.5, head_y - hair_height * 0.8),
                    (head_x + head_size * 0.7, head_y - hair_height * 0.5)
                ]
                for i in range(len(highlight_points) - 1):
                    pygame.draw.line(char_surface, (255, 120, 50), 
                                   highlight_points[i], highlight_points[i + 1], 2)

                # Draw detailed eyes
                eye_size = head_size * 0.28
                eye_y = head_y + head_size * 0.35
                
                # Eye whites with shading
                pygame.draw.ellipse(char_surface, WHITE,
                                  (head_x + head_size * 0.18, eye_y, eye_size, eye_size))
                pygame.draw.ellipse(char_surface, WHITE,
                                  (head_x + head_size * 0.58, eye_y, eye_size, eye_size))
                
                # Pupils with highlight
                pupil_size = eye_size * 0.65
                pupil_y = eye_y + eye_size * 0.18
                
                # Main pupil color
                pygame.draw.ellipse(char_surface, EYE_COLOR,
                                  (head_x + head_size * 0.22, pupil_y, pupil_size, pupil_size))
                pygame.draw.ellipse(char_surface, EYE_COLOR,
                                  (head_x + head_size * 0.62, pupil_y, pupil_size, pupil_size))
                
                # Eye highlights
                highlight_size = pupil_size * 0.4
                pygame.draw.ellipse(char_surface, WHITE,
                                  (head_x + head_size * 0.24, pupil_y + pupil_size * 0.1,
                                   highlight_size, highlight_size))
                pygame.draw.ellipse(char_surface, WHITE,
                                  (head_x + head_size * 0.64, pupil_y + pupil_size * 0.1,
                                   highlight_size, highlight_size))

                # Draw expressive mouth
                smile_width = head_size * 0.5
                smile_height = head_size * 0.3
                smile_x = head_x + head_size * 0.25
                smile_y = head_y + head_size * 0.55
                
                # Draw main smile
                pygame.draw.arc(char_surface, MOUTH_COLOR, 
                              (smile_x, smile_y, smile_width, smile_height),
                              0, math.pi, 3)
                
                # Add teeth highlight
                teeth_width = smile_width * 0.8
                teeth_height = smile_height * 0.3
                teeth_x = smile_x + (smile_width - teeth_width) / 2
                teeth_y = smile_y + smile_height * 0.1
                pygame.draw.arc(char_surface, WHITE,
                              (teeth_x, teeth_y, teeth_width, teeth_height),
                              0, math.pi, 2)

                # Rotate and position the character
                rotated_surface = pygame.transform.rotate(char_surface, self.rotation)
                rotated_rect = rotated_surface.get_rect(center=(self.x + self.width//2,
                                                                  self.y + self.height//2 + bounce_offset))
                screen.blit(rotated_surface, rotated_rect)

        # Draw lasers
        for laser in self.lasers:
            laser.draw(screen)

    def shoot_laser(self):
        current_time = pygame.time.get_ticks()
        if current_time - self.last_shot_time >= LASER_COOLDOWN:
            # Create new laser at player's position
            laser_x = self.x + self.width
            laser_y = self.y + self.height // 2
            self.lasers.append(Laser(laser_x, laser_y))
            self.last_shot_time = current_time

class Platform:
    def __init__(self, x, y, width):
        self.x = x
        self.y = y
        self.width = width
        self.height = PLATFORM_HEIGHT

    def update(self, scroll_speed):
        self.x -= scroll_speed

    def draw(self, screen, color):
        pygame.draw.rect(screen, color, 
                        (self.x, self.y, self.width, self.height))
        # Add a darker shade at the bottom for depth
        pygame.draw.rect(screen, tuple(max(0, c - 40) for c in color), 
                        (self.x, self.y + self.height - 4, self.width, 4))

class Obstacle:
    def __init__(self, x, y, type_name):
        self.type = OBSTACLE_TYPES[type_name]
        self.x = x
        self.y = y
        self.width = self.type['width']
        self.height = self.type['height']
        self.damage = self.type['damage']
        
        if type_name == 'DRONE':
            self.original_y = y
            self.movement = 0
            self.facing_left = True  # Track direction for image flipping

    def update(self, scroll_speed):
        self.x -= scroll_speed
        if hasattr(self, 'original_y'):
            self.movement += 0.05
            self.y = self.original_y + math.sin(self.movement) * 50
            # Update facing direction based on vertical movement
            if math.cos(self.movement) > 0:
                self.facing_left = False
            else:
                self.facing_left = True

    def draw(self, screen):
        if hasattr(game, 'has_dalbird') and game.has_dalbird:
            # Get the image and flip it if needed
            image = game.dalbird_img
            if hasattr(self, 'facing_left') and not self.facing_left:
                image = pygame.transform.flip(image, True, False)
            
            # Draw the dalbird image
            screen.blit(image, (self.x, self.y))
        else:
            # Fallback to original red rectangle
            pygame.draw.rect(screen, HAZARD_COLOR, 
                           (self.x, self.y, self.width, self.height))

class Cat:
    def __init__(self, x, y):
        self.width = CAT_WIDTH
        self.height = CAT_HEIGHT
        self.x = x
        self.y = y
        self.vel_x = -CAT_SPEED
        self.vel_y = 0
        self.state = 'chase'
        self.animation_time = 0
        self.last_jump = 0
        self.angry = False
        self.message = ""
        self.message_timer = 0
        self.last_taunt = 0
        self.frame_index = 0
        self.frame_delay = 3  # Update frame every N game frames
        self.frame_counter = 0

    def update(self, player, platforms):
        self.animation_time += 1
        
        # Update message timer
        if self.message_timer > 0:
            self.message_timer -= 1
        
        # Apply gravity
        self.vel_y += GRAVITY
        self.y += self.vel_y

        # Ground collision
        if self.y > GROUND_HEIGHT - self.height:
            self.y = GROUND_HEIGHT - self.height
            self.vel_y = 0

        # Platform collisions
        for platform in platforms:
            if (self.y + self.height >= platform.y and 
                self.y + self.height <= platform.y + platform.height and
                self.x + self.width > platform.x and 
                self.x < platform.x + platform.width):
                self.y = platform.y - self.height
                self.vel_y = 0

        # Chase player behavior
        dx = player.x - self.x
        dy = player.y - self.y
        dist = math.sqrt(dx*dx + dy*dy)
        
        if dist < CAT_DETECTION_RANGE:
            self.angry = True
            # Accelerate towards player
            if dx > 0:
                self.vel_x += CAT_ACCELERATION
            else:
                self.vel_x -= CAT_ACCELERATION
            
            # Maybe taunt the player
            current_time = pygame.time.get_ticks()
            if current_time - self.last_taunt > MESSAGE_DURATION * 2:  # Don't spam messages
                if random.random() < 0.02:  # 2% chance each frame when in range
                    self.message = random.choice(CAT_TAUNTS)
                    self.message_timer = MESSAGE_DURATION
                    self.last_taunt = current_time
            
            # Jump if player is above
            if dy < -50 and current_time - self.last_jump > 1000:  # Jump cooldown
                self.vel_y = CAT_JUMP_POWER
                self.last_jump = current_time
        else:
            self.angry = False
            self.vel_x = -CAT_SPEED

        # Limit maximum speed
        self.vel_x = max(-CAT_SPEED * 2, min(CAT_SPEED * 2, self.vel_x))
        
        # Update position
        self.x += self.vel_x

        # Update animation frame
        self.frame_counter += 1
        if self.frame_counter >= self.frame_delay:
            self.frame_counter = 0
            if hasattr(game, 'has_catlock') and game.has_catlock:
                self.frame_index = (self.frame_index + 1) % len(game.catlock_frames)

    def draw(self, screen):
        # Draw the cat message if active
        if self.message_timer > 0:
            font = pygame.font.Font(None, 24)
            text_surface = font.render(self.message, True, WHITE)
            text_rect = text_surface.get_rect(centerx=self.x + self.width//2,
                                            bottom=self.y - 10)
            screen.blit(text_surface, text_rect)
            self.message_timer -= 1

        if hasattr(game, 'has_catlock') and game.has_catlock:
            # Draw the current frame of the GIF
            image = game.catlock_frames[self.frame_index]
            if self.vel_x > 0:  # Flip if moving right
                image = pygame.transform.flip(image, True, False)
            screen.blit(image, (int(self.x), int(self.y)))
        else:
            # Create surface for the cat
            cat_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
            
            # Body (oval shape)
            body_rect = pygame.Rect(0, self.height * 0.2, 
                                  self.width * 0.8, self.height * 0.6)
            pygame.draw.ellipse(cat_surface, CAT_COLORS['BODY'], body_rect)
            
            # Stripes
            stripe_count = 3
            stripe_width = body_rect.width / (stripe_count * 2)
            for i in range(stripe_count):
                x = body_rect.x + body_rect.width * (i + 0.5) / stripe_count
                stripe_rect = pygame.Rect(x - stripe_width/2, body_rect.y,
                                        stripe_width, body_rect.height)
                pygame.draw.ellipse(cat_surface, CAT_COLORS['DARK_STRIPES'], stripe_rect)
            
            # Head
            head_size = self.height * 0.5
            head_x = self.width * 0.6
            head_y = self.height * 0.1
            pygame.draw.ellipse(cat_surface, CAT_COLORS['BODY'],
                              (head_x, head_y, head_size, head_size))
            
            # Eyes
            eye_size = head_size * 0.3
            eye_spacing = eye_size * 0.8
            eye_y = head_y + head_size * 0.3
            
            # Left eye
            pygame.draw.ellipse(cat_surface, CAT_COLORS['EYE_COLOR'],
                              (head_x + head_size * 0.2, eye_y, eye_size, eye_size))
            # Right eye
            pygame.draw.ellipse(cat_surface, CAT_COLORS['EYE_COLOR'],
                              (head_x + head_size * 0.2 + eye_spacing, eye_y, eye_size, eye_size))
            
            # Pupils (make them narrow for angry look)
            pupil_width = eye_size * (0.2 if self.angry else 0.4)
            pupil_height = eye_size * 0.7
            
            # Add slight wobble to pupils
            pupil_offset = math.sin(self.animation_time * 0.1) * 2
            
            pygame.draw.ellipse(cat_surface, CAT_COLORS['PUPIL_COLOR'],
                              (head_x + head_size * 0.2 + eye_size/2 - pupil_width/2 + pupil_offset,
                               eye_y + eye_size * 0.15,
                               pupil_width, pupil_height))
            pygame.draw.ellipse(cat_surface, CAT_COLORS['PUPIL_COLOR'],
                              (head_x + head_size * 0.2 + eye_spacing + eye_size/2 - pupil_width/2 + pupil_offset,
                               eye_y + eye_size * 0.15,
                               pupil_width, pupil_height))
            
            # Nose
            nose_size = head_size * 0.15
            pygame.draw.ellipse(cat_surface, CAT_COLORS['NOSE'],
                              (head_x + head_size * 0.5 - nose_size/2,
                               head_y + head_size * 0.5,
                               nose_size, nose_size * 0.8))
            
            # Mouth (make it more aggressive when angry)
            if self.angry:
                # Angry mouth with teeth
                mouth_points = [
                    (head_x + head_size * 0.3, head_y + head_size * 0.65),  # Left
                    (head_x + head_size * 0.5, head_y + head_size * 0.75),  # Middle
                    (head_x + head_size * 0.7, head_y + head_size * 0.65)   # Right
                ]
                pygame.draw.lines(cat_surface, CAT_COLORS['MOUTH'], False, mouth_points, 2)
                
                # Add teeth
                tooth_size = head_size * 0.1
                pygame.draw.polygon(cat_surface, WHITE,
                                  [(mouth_points[0][0], mouth_points[0][1]),
                                   (mouth_points[0][0] + tooth_size, mouth_points[0][1] + tooth_size),
                                   (mouth_points[0][0] + tooth_size * 2, mouth_points[0][1])])
                pygame.draw.polygon(cat_surface, WHITE,
                                  [(mouth_points[2][0], mouth_points[2][1]),
                                   (mouth_points[2][0] - tooth_size, mouth_points[2][1] + tooth_size),
                                   (mouth_points[2][0] - tooth_size * 2, mouth_points[2][1])])
            else:
                # Normal mouth
                mouth_width = head_size * 0.4
                mouth_height = head_size * 0.2
                pygame.draw.arc(cat_surface, CAT_COLORS['MOUTH'],
                              (head_x + head_size * 0.3,
                               head_y + head_size * 0.6,
                               mouth_width, mouth_height),
                              0, math.pi, 2)
            
            # Ears
            ear_width = head_size * 0.4
            ear_height = head_size * 0.4
            # Left ear
            pygame.draw.polygon(cat_surface, CAT_COLORS['BODY'],
                              [(head_x + head_size * 0.2, head_y),
                               (head_x + head_size * 0.1, head_y - ear_height),
                               (head_x + head_size * 0.4, head_y)])
            # Right ear
            pygame.draw.polygon(cat_surface, CAT_COLORS['BODY'],
                              [(head_x + head_size * 0.6, head_y),
                               (head_x + head_size * 0.9, head_y - ear_height),
                               (head_x + head_size * 0.8, head_y)])

            # Draw the cat on screen
            screen.blit(cat_surface, (int(self.x), int(self.y)))

class Cheeseball:
    def __init__(self, x, y, power_type):
        self.x = x
        self.y = y
        self.size = CHEESEBALL_SIZE
        self.type = power_type
        self.color = CHEESEBALL_COLORS[power_type]
        self.animation_time = 0
        self.collected = False

    def update(self, scroll_speed):
        self.x -= scroll_speed
        self.animation_time += 1
        
    def draw(self, screen):
        # Draw glow effect
        glow_size = self.size * (1.2 + math.sin(self.animation_time * 0.1) * 0.2)
        glow_surface = pygame.Surface((glow_size * 2, glow_size * 2), pygame.SRCALPHA)
        pygame.draw.circle(glow_surface, CHEESEBALL_GLOW, 
                         (glow_size, glow_size), glow_size)
        screen.blit(glow_surface, 
                   (self.x - glow_size + self.size/2, 
                    self.y - glow_size + self.size/2))
        
        # Draw cheeseball
        pygame.draw.circle(screen, self.color, 
                         (int(self.x + self.size/2), int(self.y + self.size/2)), 
                         self.size)
        # Add some shine
        shine_pos = (self.x + self.size * 0.7, self.y + self.size * 0.3)
        pygame.draw.circle(screen, (255, 255, 255), 
                         (int(shine_pos[0]), int(shine_pos[1])), 
                         self.size // 4)

class Laser:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = LASER_WIDTH
        self.height = LASER_HEIGHT
        self.speed = LASER_SPEED
        self.active = True

    def update(self):
        self.x += self.speed

    def draw(self, screen):
        # Draw glow effect
        glow_surface = pygame.Surface((self.width * 2, self.height * 3), pygame.SRCALPHA)
        pygame.draw.ellipse(glow_surface, LASER_GLOW, 
                          (0, 0, self.width * 2, self.height * 3))
        screen.blit(glow_surface, 
                   (self.x - self.width//2, self.y - self.height))

        # Draw laser beam
        pygame.draw.rect(screen, LASER_COLOR,
                        (self.x, self.y, self.width, self.height))

class CheatInput:
    def __init__(self):
        self.active = False
        self.text = ""
        self.font = pygame.font.Font(None, 36)
        self.color = WHITE
        self.background = (40, 40, 40)
        self.border = WHITE
        self.width = 200
        self.height = 40
        self.x = WINDOW_WIDTH // 2 - self.width // 2
        self.y = WINDOW_HEIGHT // 2 - self.height // 2
        self.cursor_visible = True
        self.cursor_timer = 0

    def handle_event(self, event):
        if not self.active:
            return None

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN:
                result = self.text
                self.text = ""
                self.active = False
                return result
            elif event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            elif event.key == pygame.K_ESCAPE:
                self.text = ""
                self.active = False
            else:
                if event.unicode.isalpha():  # Only allow letters
                    self.text += event.unicode
        return None

    def draw(self, screen):
        if not self.active:
            return

        # Draw input box background with border
        pygame.draw.rect(screen, self.background, 
                        (self.x - 5, self.y - 5, 
                         self.width + 10, self.height + 10))
        pygame.draw.rect(screen, self.border, 
                        (self.x - 5, self.y - 5, 
                         self.width + 10, self.height + 10), 2)

        # Draw the text
        text_surface = self.font.render(self.text, True, self.color)
        screen.blit(text_surface, (self.x + 5, self.y + 5))

        # Draw blinking cursor
        self.cursor_timer += 1
        if self.cursor_timer % 30 < 15:  # Blink every half second
            cursor_x = self.x + 5 + text_surface.get_width()
            pygame.draw.line(screen, self.color,
                           (cursor_x, self.y + 5),
                           (cursor_x, self.y + self.height - 5), 2)

        # Draw "Enter Cheat Code" text above the input box
        label = self.font.render("Enter Cheat Code", True, self.color)
        label_rect = label.get_rect(centerx=WINDOW_WIDTH // 2, 
                                  bottom=self.y - 10)
        screen.blit(label, label_rect)

class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Dystopian Runner")
        self.clock = pygame.time.Clock()
        
        # Load background image for level 3
        try:
            self.villain_bg = pygame.image.load('villain.png').convert_alpha()
            bg_aspect = self.villain_bg.get_width() / self.villain_bg.get_height()
            target_height = WINDOW_HEIGHT
            target_width = int(target_height * bg_aspect)
            self.villain_bg = pygame.transform.scale(self.villain_bg, (target_width, target_height))
            self.has_villain_bg = True
        except:
            print("Warning: villain.png not found. Using default background.")
            self.has_villain_bg = False
            
        # Load dalbird obstacle image
        try:
            self.dalbird_img = pygame.image.load('dalbird.png').convert_alpha()
            self.dalbird_img = pygame.transform.scale(self.dalbird_img, (50, 50))
            # Create larger version for background
            self.dalbird_bg_img = pygame.transform.scale(
                self.dalbird_img,
                (int(50 * DALBIRD_SCALE), int(50 * DALBIRD_SCALE))
            )
            self.has_dalbird = True
        except:
            print("Warning: dalbird.png not found. Using default obstacle.")
            self.has_dalbird = False
            
        # Load Ryan character image
        try:
            self.ryan_img = pygame.image.load('Ryan.png').convert_alpha()
            ryan_aspect = self.ryan_img.get_width() / self.ryan_img.get_height()
            target_height = PLAYER_HEIGHT
            target_width = int(target_height * ryan_aspect)
            self.ryan_img = pygame.transform.scale(self.ryan_img, (target_width, target_height))
            self.has_ryan = True
        except:
            print("Warning: Ryan.png not found. Using default character.")
            self.has_ryan = False
            
        # Load Catlock GIF
        try:
            import PIL.Image
            self.catlock_gif = PIL.Image.open('Catlock2.gif')  # Updated to Catlock2.gif
            # Get the number of frames
            self.catlock_frames = []
            try:
                while True:
                    # Convert each frame to pygame surface
                    frame = self.catlock_gif.copy()
                    frame = frame.convert('RGBA')
                    # Scale the frame
                    frame = frame.resize((CAT_WIDTH, CAT_HEIGHT))
                    # Convert PIL image to pygame surface
                    mode = frame.mode
                    size = frame.size
                    data = frame.tobytes()
                    py_image = pygame.image.fromstring(data, size, mode)
                    self.catlock_frames.append(py_image)
                    self.catlock_gif.seek(self.catlock_gif.tell() + 1)
            except EOFError:
                pass  # We've reached the end of the frames
            self.has_catlock = True
            print(f"Loaded {len(self.catlock_frames)} frames from Catlock2.gif")
        except Exception as e:
            print(f"Warning: Catlock2.gif not loaded: {e}")
            self.has_catlock = False
        
        self.player = Player()
        self.platforms = []
        self.obstacles = []
        self.cats = []
        self.cheeseballs = []
        self.score = 0
        self.scroll_speed = SCROLL_SPEED
        self.game_over = False
        self.last_cat_spawn = 0
        self.last_cheeseball_spawn = 0
        
        # Add cheat input box
        self.cheat_input = CheatInput()
        self.cheat_message_timer = 0
        
        # Level handling
        self.current_level = 1
        self.level_message_timer = LEVEL_MESSAGE_DURATION
        self.current_background = LEVELS[1]['background']
        self.current_ground = LEVELS[1]['ground']
        self.current_platform = LEVELS[1]['platform']
        self.target_background = self.current_background
        self.target_ground = self.current_ground
        self.target_platform = self.current_platform
        
        # Pause handling
        self.paused = False
        self.pause_alpha = 0  # For fade effect
        self.pause_alpha_target = 180  # Maximum darkness of overlay
        
        # Generate initial platforms
        self.generate_chunk()
        
        # Dalbird state for Level 6
        self.dalbird_pos = [WINDOW_WIDTH // 2, WINDOW_HEIGHT // 4]
        self.dalbird_movement = 0
        self.last_dalbird_taunt = 0
        self.dalbird_message = ""
        self.dalbird_message_timer = 0
        self.dalbird_health = DALBIRD_MAX_HEALTH
        self.dalbird_damage_flash = 0
        self.dalbird_defeated = False
        
        # Catlock state for Level 4
        self.catlock_pos = [WINDOW_WIDTH // 2, WINDOW_HEIGHT // 4]
        self.catlock_movement = 0
        self.last_catlock_taunt = 0
        self.catlock_message = ""
        self.catlock_message_timer = 0
        self.frame_index = 0
        self.frame_delay = 3
        self.frame_counter = 0

    def lerp_color(self, color1, color2, t):
        """Linear interpolation between two colors"""
        return tuple(int(a + (b - a) * t) for a, b in zip(color1, color2))

    def update_level_colors(self):
        # Update background color
        if self.current_background != self.target_background:
            t = BACKGROUND_TRANSITION_SPEED / 255
            self.current_background = self.lerp_color(
                self.current_background,
                self.target_background,
                t
            )
        
        # Update ground color
        if self.current_ground != self.target_ground:
            t = BACKGROUND_TRANSITION_SPEED / 255
            self.current_ground = self.lerp_color(
                self.current_ground,
                self.target_ground,
                t
            )
        
        # Update platform color
        if self.current_platform != self.target_platform:
            t = BACKGROUND_TRANSITION_SPEED / 255
            self.current_platform = self.lerp_color(
                self.current_platform,
                self.target_platform,
                t
            )

    def check_level_progression(self):
        for level in sorted(LEVELS.keys(), reverse=True):
            if (self.score >= LEVELS[level]['score_required'] and 
                self.current_level < level):
                self.current_level = level
                self.level_message_timer = LEVEL_MESSAGE_DURATION
                self.target_background = LEVELS[level]['background']
                self.target_ground = LEVELS[level]['ground']
                self.target_platform = LEVELS[level]['platform']
                
                # Play superbass.mp3 when entering Level 6
                if level == 6:
                    try:
                        pygame.mixer.music.load('superbass.mp3')
                        pygame.mixer.music.set_volume(0.5)  # Set to 50% volume
                        pygame.mixer.music.play(-1)  # -1 means loop indefinitely
                    except Exception as e:
                        print(f"Warning: Could not load superbass.mp3: {e}")
                
                # Increase difficulty
                self.scroll_speed *= SPEED_SCALE_FACTOR
                return True
        return False

    def generate_chunk(self):
        x = WINDOW_WIDTH
        while x < WINDOW_WIDTH * 2:
            width = random.randint(MIN_PLATFORM_WIDTH, MAX_PLATFORM_WIDTH)
            y = random.randint(GROUND_HEIGHT - PLATFORM_HEIGHT_VARIANCE, 
                             GROUND_HEIGHT - PLATFORM_HEIGHT)
            
            # Add platform
            self.platforms.append(Platform(x, y, width))
            
            # Maybe add obstacle
            if random.random() < 0.5:
                obs_type = random.choice(list(OBSTACLE_TYPES.keys()))
                obs_y = y - OBSTACLE_TYPES[obs_type]['height']
                self.obstacles.append(Obstacle(x + width//2, obs_y, obs_type))
            
            # Maybe add cheeseball
            if random.random() < 0.3:  # 30% chance per platform
                power_type = random.choice(['SPEED', 'JUMP'])
                cheeseball_y = y - CHEESEBALL_SIZE - 20  # Place above platform
                self.cheeseballs.append(Cheeseball(x + width//2, cheeseball_y, power_type))
            
            x += width + random.randint(MIN_GAP, MAX_GAP)

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_p and not self.game_over:
                    self.paused = not self.paused
                    if self.paused:
                        self.pause_alpha = 0
                elif event.key == pygame.K_r:
                    self.__init__()
                    return True
                elif not self.paused:
                    if event.key == pygame.K_SPACE and not self.cheat_input.active:
                        self.player.jump()
                    elif event.key == pygame.K_c and not self.game_over:
                        self.cheat_input.active = not self.cheat_input.active
                    else:
                        cheat_result = self.cheat_input.handle_event(event)
                        if cheat_result is not None:
                            if cheat_result.lower() == self.player.cheat_code.lower():
                                self.player.unlimited_health = not self.player.unlimited_health
                                self.cheat_message_timer = 120
            
            # Handle laser shooting with X key
            keys = pygame.key.get_pressed()
            if keys[pygame.K_x] and not self.paused and not self.game_over:
                self.player.shoot_laser()
                
        return True

    def check_collisions(self):
        # Platform collisions
        for platform in self.platforms:
            if (self.player.y + self.player.height >= platform.y and 
                self.player.y + self.player.height <= platform.y + platform.height and
                self.player.x + self.player.width > platform.x and 
                self.player.x < platform.x + platform.width):
                self.player.y = platform.y - self.player.height
                self.player.vel_y = 0
                self.player.jumping = False

        # Obstacle collisions
        for obstacle in self.obstacles:
            if (self.player.x + self.player.width > obstacle.x and
                self.player.x < obstacle.x + obstacle.width and
                self.player.y + self.player.height > obstacle.y and
                self.player.y < obstacle.y + obstacle.height):
                self.player.take_damage()
                if self.player.health <= 0:
                    self.game_over = True
                    pygame.mixer.music.stop()  # Stop music when game over

        # Cat collisions
        for cat in self.cats:
            if (self.player.x + self.player.width > cat.x and
                self.player.x < cat.x + cat.width and
                self.player.y + self.player.height > cat.y and
                self.player.y < cat.y + cat.height):
                self.player.take_damage()
                if self.player.health <= 0:
                    self.game_over = True

        # Cheeseball collisions
        for ball in self.cheeseballs[:]:  # Use slice to safely remove while iterating
            if not ball.collected and (
                self.player.x + self.player.width > ball.x and
                self.player.x < ball.x + ball.size and
                self.player.y + self.player.height > ball.y and
                self.player.y < ball.y + ball.size
            ):
                self.player.activate_power_up(ball.type)
                ball.collected = True
                self.cheeseballs.remove(ball)

        # Check laser collisions with cats and birds
        for laser in self.player.lasers[:]:
            # Check collisions with cats
            for cat in self.cats[:]:
                if (laser.x + laser.width > cat.x and
                    laser.x < cat.x + cat.width and
                    laser.y + laser.height > cat.y and
                    laser.y < cat.y + cat.height):
                    if laser in self.player.lasers:
                        self.player.lasers.remove(laser)
                    if cat in self.cats:
                        self.cats.remove(cat)
                    self.score += CAT_ELIMINATION_SCORE
                    break  # Break after first collision with cats
            
            # If laser wasn't removed by cat collision, check bird collisions
            if laser in self.player.lasers:
                for obstacle in self.obstacles[:]:
                    if (laser.x + laser.width > obstacle.x and
                        laser.x < obstacle.x + obstacle.width and
                        laser.y + laser.height > obstacle.y and
                        laser.y < obstacle.y + obstacle.height):
                        if laser in self.player.lasers:
                            self.player.lasers.remove(laser)
                        if obstacle in self.obstacles:
                            self.obstacles.remove(obstacle)
                        self.score += CAT_ELIMINATION_SCORE // 2  # Half points for birds
                        break  # Break after first collision with birds

        # Check laser collisions with Dalbird in Level 6
        if self.current_level == 6 and not self.dalbird_defeated:
            dalbird_rect = pygame.Rect(
                self.dalbird_pos[0] - self.dalbird_bg_img.get_width()//2,
                self.dalbird_pos[1] - self.dalbird_bg_img.get_height()//2,
                self.dalbird_bg_img.get_width(),
                self.dalbird_bg_img.get_height()
            )
            
            for laser in self.player.lasers[:]:
                if (laser.x + laser.width > dalbird_rect.x and
                    laser.x < dalbird_rect.x + dalbird_rect.width and
                    laser.y + laser.height > dalbird_rect.y and
                    laser.y < dalbird_rect.y + dalbird_rect.height):
                    if laser in self.player.lasers:
                        self.player.lasers.remove(laser)
                        self.dalbird_health -= 1
                        self.score += DALBIRD_HIT_SCORE
                        self.dalbird_damage_flash = DALBIRD_DAMAGE_FLASH_DURATION
                        
                        # Check if Dalbird is defeated
                        if self.dalbird_health <= 0:
                            self.dalbird_defeated = True
                            self.score += DALBIRD_DEFEAT_SCORE
                            self.dalbird_message = random.choice(DALBIRD_DEFEAT_MESSAGES)
                            self.dalbird_message_timer = MESSAGE_DURATION * 2
                            pygame.mixer.music.stop()  # Stop music when Dalbird is defeated
                            # Progress to Level 7
                            self.current_level = 7
                            self.level_message_timer = LEVEL_MESSAGE_DURATION
                            self.target_background = LEVELS[7]['background']
                            self.target_ground = LEVELS[7]['ground']
                            self.target_platform = LEVELS[7]['platform']
                        break

    def update(self):
        if not self.game_over and not self.cheat_input.active and not self.paused:
            self.player.update()
            
            # Update level progression
            self.check_level_progression()
            self.update_level_colors()
            
            if self.level_message_timer > 0:
                self.level_message_timer -= 1
            
            # Update platforms and obstacles
            for platform in self.platforms:
                platform.update(self.scroll_speed)
            for obstacle in self.obstacles:
                    obstacle.update(self.scroll_speed)
            
            # Update cats and cheeseballs
            for cat in self.cats:
                cat.update(self.player, self.platforms)
            for ball in self.cheeseballs:
                ball.update(self.scroll_speed)
            
            # Remove off-screen objects
            self.platforms = [p for p in self.platforms if p.x + p.width > 0]
            self.obstacles = [o for o in self.obstacles if o.x + o.width > 0]
            self.cats = [c for c in self.cats if c.x + c.width > -100]
            self.cheeseballs = [b for b in self.cheeseballs if b.x + b.size > 0]
            
            # Generate new chunks if needed
            if self.platforms[-1].x + self.platforms[-1].width < WINDOW_WIDTH:
                self.generate_chunk()
            
            # Spawn new cats
            current_time = pygame.time.get_ticks()
            if current_time - self.last_cat_spawn > CAT_SPAWN_INTERVAL:
                self.cats.append(Cat(WINDOW_WIDTH + 50, GROUND_HEIGHT - CAT_HEIGHT))
                self.last_cat_spawn = current_time
            
            # Update score and difficulty
            self.score += SCORE_PER_DISTANCE
            self.scroll_speed += DIFFICULTY_INCREASE_RATE / FPS
            
            self.check_collisions()
            
            # Update Dalbird in Level 6
            if self.current_level >= 6:
                self.dalbird_movement += 0.02
                # Move in a figure-8 pattern
                self.dalbird_pos[0] = WINDOW_WIDTH // 2 + math.sin(self.dalbird_movement) * 200
                self.dalbird_pos[1] = WINDOW_HEIGHT // 4 + math.sin(2 * self.dalbird_movement) * 100
                
                # Show random taunts
                if current_time - self.last_dalbird_taunt > DALBIRD_TAUNT_INTERVAL:
                    self.dalbird_message = random.choice(DALBIRD_TAUNTS)
                    self.dalbird_message_timer = MESSAGE_DURATION
                    self.last_dalbird_taunt = current_time
                
                if self.dalbird_message_timer > 0:
                    self.dalbird_message_timer -= 1

            # Update Catlock in Level 4
            if self.current_level == 4:
                self.catlock_movement += 0.02
                # Move in a menacing figure-8 pattern
                self.catlock_pos[0] = WINDOW_WIDTH // 2 + math.sin(self.catlock_movement) * 150
                self.catlock_pos[1] = WINDOW_HEIGHT // 4 + math.sin(2 * self.catlock_movement) * 75
                
                # Update animation frame
                self.frame_counter += 1
                if self.frame_counter >= self.frame_delay:
                    self.frame_counter = 0
                    if self.has_catlock:
                        self.frame_index = (self.frame_index + 1) % len(self.catlock_frames)
                
                # Show random legal taunts
                if current_time - self.last_catlock_taunt > CATLOCK_TAUNT_INTERVAL:
                    self.catlock_message = random.choice(CATLOCK_LEGAL_TAUNTS)
                    self.catlock_message_timer = MESSAGE_DURATION * 1.5
                    self.last_catlock_taunt = current_time
                
                if self.catlock_message_timer > 0:
                    self.catlock_message_timer -= 1

        elif self.paused:
            # Update pause overlay fade effect
            if self.pause_alpha < self.pause_alpha_target:
                self.pause_alpha = min(self.pause_alpha + 10, self.pause_alpha_target)

    def draw(self):
        # Clear the screen with the current background color
        self.screen.fill(self.current_background)

        # Draw background
        if self.current_level == 3 and self.has_villain_bg:
            # Draw the villain background with parallax effect
            rel_x = -(self.score * 0.3) % self.villain_bg.get_width()
            self.screen.blit(self.villain_bg, (rel_x, 0))
            # If the image doesn't fill the screen, draw a second one
            if rel_x + self.villain_bg.get_width() < WINDOW_WIDTH:
                self.screen.blit(self.villain_bg, (rel_x + self.villain_bg.get_width(), 0))
            
            # Add a semi-transparent overlay of the level color for consistency
            overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
            overlay.fill(self.current_background)
            overlay.set_alpha(150)  # Adjust transparency (0-255)
            self.screen.blit(overlay, (0, 0))
        
        # Draw ground
        pygame.draw.rect(self.screen, self.current_ground, 
                        (0, GROUND_HEIGHT, WINDOW_WIDTH, WINDOW_HEIGHT - GROUND_HEIGHT))
        
        # Draw platforms and obstacles
        for platform in self.platforms:
            platform.draw(self.screen, self.current_platform)
        for obstacle in self.obstacles:
            obstacle.draw(self.screen)
        
        # Draw cheeseballs
        for ball in self.cheeseballs:
            ball.draw(self.screen)
        
        # Draw cats
        for cat in self.cats:
            cat.draw(self.screen)
        
        # Draw player (and their lasers)
        self.player.draw(self.screen)
        
        # Draw HUD
        font = pygame.font.Font(None, 36)
        score_text = font.render(f"Score: {int(self.score)}", True, WHITE)
        health_text = font.render(f"Health: {'∞' if self.player.unlimited_health else self.player.health}", True, WHITE)
        level_text = font.render(f"Level: {self.current_level} - {LEVELS[self.current_level]['name']}", True, WHITE)
        
        self.screen.blit(score_text, (10, 10))
        self.screen.blit(health_text, (10, 50))
        self.screen.blit(level_text, (10, 90))
        
        # Draw active power-ups
        if self.player.speed_boost:
            speed_text = font.render("SPEED BOOST!", True, CHEESEBALL_COLORS['SPEED'])
            self.screen.blit(speed_text, (10, 130))
        if self.player.jump_boost:
            jump_text = font.render("JUMP BOOST!", True, CHEESEBALL_COLORS['JUMP'])
            self.screen.blit(jump_text, (10, 170))
        
        # Draw level transition message
        if self.level_message_timer > 0:
            alpha = min(255, self.level_message_timer * 255 // LEVEL_FADE_DURATION)
            level_message = LEVELS[self.current_level]['message']
            message_surface = font.render(level_message, True, WHITE)
            message_surface.set_alpha(alpha)
            message_rect = message_surface.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//3))
            self.screen.blit(message_surface, message_rect)
        
        # Draw cheat code activation message
        if self.cheat_message_timer > 0:
            cheat_text = font.render(
                f"Unlimited Health {'Activated!' if self.player.unlimited_health else 'Deactivated!'}",
                True, (255, 215, 0))  # Golden color
            text_rect = cheat_text.get_rect(center=(WINDOW_WIDTH//2, 100))
            self.screen.blit(cheat_text, text_rect)
            self.cheat_message_timer -= 1
        
        if self.game_over:
            game_over_text = font.render("Game Over! Press R to restart", True, WHITE)
            text_rect = game_over_text.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//2))
            self.screen.blit(game_over_text, text_rect)
        
        # Draw pause overlay if paused
        if self.paused:
            # Create semi-transparent dark overlay
            overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
            overlay.fill((0, 0, 0))
            overlay.set_alpha(self.pause_alpha)
            self.screen.blit(overlay, (0, 0))
            
            # Draw pause menu
            title_font = pygame.font.Font(None, 74)
            menu_font = pygame.font.Font(None, 48)
            
            # Draw "PAUSED" title
            pause_text = title_font.render("PAUSED", True, WHITE)
            text_rect = pause_text.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//3))
            self.screen.blit(pause_text, text_rect)
            
            # Draw instructions
            instructions = [
                "Press P to Resume",
                f"Score: {int(self.score)}",
                f"Level: {self.current_level}",
                "Press R to Restart Game"
            ]
            
            for i, text in enumerate(instructions):
                instruction_text = menu_font.render(text, True, WHITE)
                text_rect = instruction_text.get_rect(
                    center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//2 + i * 50)
                )
                self.screen.blit(instruction_text, text_rect)
        
        # Draw cheat input box if active
        self.cheat_input.draw(self.screen)
        
        # Draw Dalbird in Level 6
        if self.current_level >= 6 and self.has_dalbird and not self.dalbird_defeated:
            # Draw large Dalbird in background
            dalbird_surface = self.dalbird_bg_img.copy()
            
            # Add damage flash effect when hit
            if self.dalbird_damage_flash > 0:
                flash_surface = pygame.Surface(dalbird_surface.get_size(), pygame.SRCALPHA)
                flash_intensity = min(255, self.dalbird_damage_flash * 8)
                flash_surface.fill((255, 0, 0, flash_intensity))
                dalbird_surface.blit(flash_surface, (0, 0), special_flags=pygame.BLEND_RGBA_ADD)
                self.dalbird_damage_flash -= 1
            
            # Draw Dalbird with rotation
            angle = math.sin(self.dalbird_movement) * 20
            rotated_dalbird = pygame.transform.rotate(dalbird_surface, angle)
            dalbird_rect = rotated_dalbird.get_rect(center=self.dalbird_pos)
            self.screen.blit(rotated_dalbird, dalbird_rect)
            
            # Draw Dalbird's message
            if self.dalbird_message_timer > 0:
                font = pygame.font.Font(None, 48)
                alpha = min(255, self.dalbird_message_timer * 255 // MESSAGE_FADE_TIME)
                message_surface = font.render(self.dalbird_message, True, (255, 0, 0))
                message_surface.set_alpha(alpha)
                message_rect = message_surface.get_rect(center=(WINDOW_WIDTH//2, WINDOW_HEIGHT//4 - 100))
                self.screen.blit(message_surface, message_rect)
        
        # Draw Catlock in Level 4
        if self.current_level == 4 and self.has_catlock:
            # Get the current frame and scale it up
            catlock_frame = self.catlock_frames[self.frame_index].copy()
            scaled_size = (int(CAT_WIDTH * CATLOCK_SCALE), int(CAT_HEIGHT * CATLOCK_SCALE))
            catlock_surface = pygame.transform.scale(catlock_frame, scaled_size)
            
            # Draw Catlock with slight rotation for menacing effect
            angle = math.sin(self.catlock_movement) * 15
            rotated_catlock = pygame.transform.rotate(catlock_surface, angle)
            catlock_rect = rotated_catlock.get_rect(center=self.catlock_pos)
            self.screen.blit(rotated_catlock, catlock_rect)
            
            # Draw Catlock's legal message in a thought bubble
            if self.catlock_message_timer > 0:
                font = pygame.font.Font(None, 32)  # Slightly larger font
                alpha = min(255, self.catlock_message_timer * 255 // MESSAGE_FADE_TIME)
                
                # Split long messages into multiple lines
                words = self.catlock_message.split()
                lines = []
                current_line = []
                
                for word in words:
                    current_line.append(word)
                    test_line = ' '.join(current_line)
                    if font.size(test_line)[0] > 400:  # Fixed width for bubble
                        current_line.pop()
                        lines.append(' '.join(current_line))
                        current_line = [word]
                if current_line:
                    lines.append(' '.join(current_line))
                
                # Calculate bubble dimensions
                line_height = 28  # Increased line height
                padding = 20
                bubble_width = 400  # Fixed width
                bubble_height = len(lines) * line_height + padding * 2
                
                # Position bubble to the right of Catlock
                bubble_x = self.catlock_pos[0] + (CAT_WIDTH * CATLOCK_SCALE) // 2 + 20
                bubble_y = self.catlock_pos[1] - bubble_height // 2
                
                # Keep bubble within screen bounds
                if bubble_x + bubble_width > WINDOW_WIDTH - 20:
                    # If too far right, place to the left of Catlock instead
                    bubble_x = self.catlock_pos[0] - (CAT_WIDTH * CATLOCK_SCALE) // 2 - bubble_width - 20
                
                # Draw thought bubble
                bubble_surface = pygame.Surface((bubble_width + 40, bubble_height + 40), pygame.SRCALPHA)
                bubble_surface.set_alpha(alpha)
                
                # Draw main bubble
                pygame.draw.ellipse(bubble_surface, (255, 255, 255), 
                                  (20, 0, bubble_width, bubble_height))
                pygame.draw.ellipse(bubble_surface, (100, 100, 100), 
                                  (20, 0, bubble_width, bubble_height), 2)
                
                # Draw thought circles (adjusted for side positioning)
                if bubble_x > self.catlock_pos[0]:  # Bubble is on the right
                    circle_positions = [
                        (15, bubble_height//2, 12),
                        (8, bubble_height//2 - 5, 8),
                        (0, bubble_height//2 - 10, 5)
                    ]
                else:  # Bubble is on the left
                    circle_positions = [
                        (bubble_width + 25, bubble_height//2, 12),
                        (bubble_width + 32, bubble_height//2 - 5, 8),
                        (bubble_width + 40, bubble_height//2 - 10, 5)
                    ]
                
                for x, y, radius in circle_positions:
                    pygame.draw.circle(bubble_surface, (255, 255, 255), (x, y), radius)
                    pygame.draw.circle(bubble_surface, (100, 100, 100), (x, y), radius, 2)
                
                # Draw text in bubble
                for i, line in enumerate(lines):
                    text_surface = font.render(line, True, (0, 0, 0))  # Black text
                    text_rect = text_surface.get_rect(
                        centerx=bubble_width//2 + 20,
                        top=padding + i * line_height
                    )
                    bubble_surface.blit(text_surface, text_rect)
                
                # Draw the complete bubble
                self.screen.blit(bubble_surface, (bubble_x, bubble_y))
        
        pygame.display.flip()

    def run(self):
        running = True
        while running:
            running = self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run() 