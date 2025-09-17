document.addEventListener('DOMContentLoaded', function() {
    // Initialize Image Comparison Slider
    initImageComparisonSlider();
    
    // Initialize Animated Flies
    initAnimatedFlies();
    
    // Initialize Flying Fly
    initFlyingFly();
    
    // Initialize Fly Swatter Game
    initFlySwatter();
    
    // Initialize Sound Controls
    initSoundControls();
    
    // Smooth scrolling for navigation links
    initSmoothScrolling();
});

// Image Comparison Slider Implementation
function initImageComparisonSlider() {
    const slider = document.querySelector('.image-comparison');
    const beforeImage = document.querySelector('.before-image');
    const sliderHandle = document.querySelector('.slider-handle');
    
    if (!slider || !beforeImage || !sliderHandle) return;
    
    let isDragging = false;
    
    // Initialize slider position to left side (25% from left)
    updateSliderPosition(25);
    
    // Mouse down on slider handle
    sliderHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
    });
    
    // Touch start on slider handle
    sliderHandle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isDragging = true;
    }, { passive: false });
    
    // Move events
    document.addEventListener('mousemove', moveSlider);
    document.addEventListener('touchmove', moveSlider, { passive: false });
    
    // Release events
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    // Click on slider container
    slider.addEventListener('click', function(e) {
        // Ignore if clicking on handle
        if (e.target === sliderHandle || sliderHandle.contains(e.target)) return;
        
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = (x / rect.width) * 100;
        
        // Update position
        updateSliderPosition(percent);
    });
    
    function moveSlider(e) {
        if (!isDragging) return;
        
        // Prevent default behaviors
        e.preventDefault();
        
        // Get cursor position
        let x;
        if (e.type === 'touchmove') {
            x = e.touches[0].clientX;
        } else {
            x = e.clientX;
        }
        
        // Calculate position relative to container
        const rect = slider.getBoundingClientRect();
        const containerX = x - rect.left;
        const percent = (containerX / rect.width) * 100;
        
        // Limit to container bounds (0-100%)
        const limitedPercent = Math.min(100, Math.max(0, percent));
        
        // Update positions
        updateSliderPosition(limitedPercent);
    }
    
    function updateSliderPosition(percent) {
        // Position the slider handle
        sliderHandle.style.left = percent + '%';
        
        // Use clip-path to reveal/hide the top image
        // When percent is 0, the right side is completely cropped (0 visible)
        // When percent is 100, nothing is cropped (fully visible)
        beforeImage.style.clipPath = `inset(0 ${100-percent}% 0 0)`;
    }
}

// Function to handle animated flies
function initAnimatedFlies() {
    // Add some random movement to flies when hovered
    const flies = document.querySelectorAll('.fly-1, .fly-2, .fly-3');
    
    flies.forEach(fly => {
        fly.addEventListener('mouseover', function() {
            // Apply a random wiggle animation
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            const randomRotate = (Math.random() - 0.5) * 15;
            
            // Apply transformation
            this.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg) scale(1.1)`;
        });
        
        fly.addEventListener('mouseout', function() {
            // Reset transformation after a short delay
            setTimeout(() => {
                this.style.transition = 'transform 0.5s ease';
                this.style.transform = '';
            }, 200);
        });
    });
    
    // Add subtle animation to the animated fly in the how-it-works section
    const animatedFly = document.querySelector('.animated-fly');
    if (animatedFly) {
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 10;
            const randomY = (Math.random() - 0.5) * 10;
            const randomRotate = (Math.random() - 0.5) * 5;
            
            animatedFly.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
            
            setTimeout(() => {
                animatedFly.style.transition = 'transform 2s ease';
                animatedFly.style.transform = '';
            }, 2000);
        }, 5000);
    }
}

// Smooth scrolling implementation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target section id from the href
            const targetId = this.getAttribute('href');
            
            // Only handle internal links (those starting with #)
            if (targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Smooth scroll to the section
                    window.scrollTo({
                        top: targetSection.offsetTop - 80, // Offset for header
                        behavior: 'smooth'
                    });
                }
            }
            // External links (like the Docs link) will work normally without preventDefault
        });
    });
}

// Intersection Observer for scroll-triggered animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, { threshold: 0.1 });

// Observe all sections for fade-in effects
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// Handle responsive navigation
document.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Flying Fly Animation Function
function initFlyingFly() {
    const fly = document.getElementById('flying-fly');
    if (!fly) return;
    
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    let isOffScreen = false;
    let animationId;
    
    // Set initial position
    fly.style.left = currentX + 'px';
    fly.style.top = currentY + 'px';
    
    function getRandomPosition() {
        // 10% chance to fly off screen
        if (Math.random() < 0.1 && !isOffScreen) {
            isOffScreen = true;
            // Choose random edge to fly to
            const edge = Math.floor(Math.random() * 4);
            switch (edge) {
                case 0: // Top
                    return { x: Math.random() * window.innerWidth, y: -50 };
                case 1: // Right
                    return { x: window.innerWidth + 50, y: Math.random() * window.innerHeight };
                case 2: // Bottom
                    return { x: Math.random() * window.innerWidth, y: window.innerHeight + 50 };
                case 3: // Left
                    return { x: -50, y: Math.random() * window.innerHeight };
            }
        } else if (isOffScreen) {
            // Come back from off-screen
            isOffScreen = false;
            return {
                x: Math.random() * (window.innerWidth - 100) + 50,
                y: Math.random() * (window.innerHeight - 100) + 50
            };
        } else {
            // Normal on-screen movement
            return {
                x: Math.random() * (window.innerWidth - 100) + 50,
                y: Math.random() * (window.innerHeight - 100) + 50
            };
        }
    }
    
    function animateFly() {
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            // Reached target, set new target
            const newTarget = getRandomPosition();
            targetX = newTarget.x;
            targetY = newTarget.y;
            
            // Random pause (like a real fly)
            setTimeout(() => {
                animationId = requestAnimationFrame(animateFly);
            }, Math.random() * 2000 + 500); // 0.5-2.5 second pause
            
            return;
        }
        
        // Move towards target with realistic fly movement
        const speed = 1.5 + Math.random() * 2.5; // Variable speed - increased from 0.5-2.0 to 1.5-4.0
        const angle = Math.atan2(dy, dx);
        
        // Add some randomness to the path (zigzag like real fly)
        const zigzag = (Math.random() - 0.5) * 0.5;
        const moveX = Math.cos(angle + zigzag) * speed;
        const moveY = Math.sin(angle + zigzag) * speed;
        
        currentX += moveX;
        currentY += moveY;
        
        // Update position
        fly.style.left = currentX + 'px';
        fly.style.top = currentY + 'px';
        
        // Rotate fly based on direction
        const rotation = (angle * 180 / Math.PI) + 90;
        fly.style.transform = `rotate(${rotation}deg)`;
        
        animationId = requestAnimationFrame(animateFly);
    }
    
    // Start initial movement after a short delay
    setTimeout(() => {
        const initialTarget = getRandomPosition();
        targetX = initialTarget.x;
        targetY = initialTarget.y;
        animateFly();
    }, 1000);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // If fly is off-screen after resize, bring it back
        if (currentX > window.innerWidth + 100 || currentY > window.innerHeight + 100 || 
            currentX < -100 || currentY < -100) {
            const newTarget = getRandomPosition();
            targetX = newTarget.x;
            targetY = newTarget.y;
            isOffScreen = false;
        }
    });
}

// Fly Swatter Game Function
function initFlySwatter() {
    const swatter = document.getElementById('fly-swatter');
    const fly = document.getElementById('flying-fly');
    if (!swatter || !fly) return;
    
    let isPickedUp = false;
    let flySmacked = false;
    
    // Detect if it's a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Mobile: Click to pickup spatula
        swatter.addEventListener('click', function(e) {
            if (flySmacked || isPickedUp) return;
            
            pickUpSwatter();
            e.stopPropagation();
        });
    } else {
        // Desktop: Hover to pickup spatula
        swatter.addEventListener('mouseenter', function(e) {
            if (flySmacked || isPickedUp) return;
            
            pickUpSwatter();
        });
    }
    
    // Right click to return spatula
    document.addEventListener('contextmenu', function(e) {
        if (isPickedUp && !flySmacked) {
            returnToCorner();
            e.preventDefault();
        }
    });
    
    // Click anywhere when picked up = smack attempt
    document.addEventListener('click', function(e) {
        if (!isPickedUp || flySmacked) return;
        
        // Always do smack animation on click
        doSmackAnimation();
        
        // Check if we hit the fly
        if (checkFlyHit(e.clientX, e.clientY)) {
            smackFlySuccess();
        }
        
        e.stopPropagation();
    });
    
    // Follow mouse when picked up
    document.addEventListener('mousemove', followMouse);
    document.addEventListener('touchmove', followMouse, { passive: false });
    
    function pickUpSwatter() {
        isPickedUp = true;
        swatter.classList.add('picked-up');
        swatter.style.position = 'fixed';
        swatter.style.right = 'auto';
        swatter.style.bottom = 'auto';
        
        console.log('Spatula picked up! Click to smack, right-click to put back!');
    }
    
    function followMouse(e) {
        if (!isPickedUp || flySmacked) return; // Don't follow mouse if fly is smacked
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        // Center the spatula on cursor
        const centerX = clientX - (swatter.offsetWidth / 2);
        const centerY = clientY - (swatter.offsetHeight / 2);
        
        swatter.style.left = centerX + 'px';
        swatter.style.top = centerY + 'px';
        
        if (e.type === 'touchmove') {
            e.preventDefault();
        }
    }
    
    function doSmackAnimation() {
        // Add smack animation
        swatter.classList.add('smack-animation');
        
        // Play swosh sound
        playSwoshSound();
        
        // Remove animation class after it completes
        setTimeout(() => {
            swatter.classList.remove('smack-animation');
        }, 400);
    }
    
    function checkFlyHit(clickX, clickY) {
        const flyRect = fly.getBoundingClientRect();
        const flySize = 120; // Very forgiving hit area - can hit near the fly
        
        const flyCenterX = flyRect.left + flyRect.width / 2;
        const flyCenterY = flyRect.top + flyRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(clickX - flyCenterX, 2) + 
            Math.pow(clickY - flyCenterY, 2)
        );
        
        return distance < flySize;
    }
    
    function smackFlySuccess() {
        flySmacked = true;
        
        // Get current fly position before hiding it
        const flyRect = fly.getBoundingClientRect();
        const flyX = flyRect.left + flyRect.width / 2 - 40; // Center the smashed fly (40 = half width)
        const flyY = flyRect.top + flyRect.height / 2 - 40; // Center the smashed fly (40 = half height)
        
        // Keep spatula at fly position (stop following mouse)
        const swatterX = flyRect.left + flyRect.width / 2 - (swatter.offsetWidth / 2);
        const swatterY = flyRect.top + flyRect.height / 2 - (swatter.offsetHeight / 2);
        swatter.style.left = swatterX + 'px';
        swatter.style.top = swatterY + 'px';
        
        // Create smashed fly at current position
        createSmashedFly(flyX, flyY);
        
        // Hide the current fly
        fly.classList.add('smacked');
        
        // Visual feedback
        console.log('SMACK! Fly got squashed! 💥 Another one will come soon...');
        
        // Keep spatula on fly for 1 second, then return to corner
        setTimeout(() => {
            returnToCorner();
        }, 1000);
        
        // Spawn new fly after 3 seconds
        setTimeout(() => {
            fly.classList.remove('smacked');
            flySmacked = false;
            console.log('A new fly appears! 🪰');
        }, 3000);
    }
    
    function createSmashedFly(x, y) {
        // Create smashed fly element
        const smashedFly = document.createElement('div');
        smashedFly.className = 'smashed-fly';
        smashedFly.style.left = x + 'px';
        smashedFly.style.top = y + 'px';
        
        // Add random rotation for variety
        const randomRotation = Math.random() * 360;
        smashedFly.style.transform = `rotate(${randomRotation}deg)`;
        
        // Create and add the image
        const smashedImage = document.createElement('img');
        smashedImage.src = 'fly/squash.png';
        smashedImage.alt = 'Smashed Fly';
        smashedImage.className = 'smashed-fly-image';
        
        smashedFly.appendChild(smashedImage);
        document.body.appendChild(smashedFly);
        
        // Keep count for fun
        const smashedCount = document.querySelectorAll('.smashed-fly').length;
        console.log(`Smashed flies: ${smashedCount} 🪰💀`);
    }
    
    function returnToCorner() {
        isPickedUp = false;
        swatter.classList.remove('picked-up');
        swatter.classList.add('returning');
        
        // Reset to original position
        swatter.style.position = 'fixed';
        swatter.style.left = '';
        swatter.style.top = '';
        swatter.style.right = '20px';
        swatter.style.bottom = '20px';
        
        setTimeout(() => {
            swatter.classList.remove('returning');
            flySmacked = false; // Reset smacked state when fully returned
        }, 1000);
    }
}

// Sound Controls Function
function initSoundControls() {
    const buzzToggle = document.getElementById('buzz-toggle');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const buzzSound = document.getElementById('buzz-sound');
    
    let isPlaying = false;
    
    buzzToggle.addEventListener('click', function() {
        if (isPlaying) {
            // Stop buzz sound
            buzzSound.pause();
            buzzSound.currentTime = 0;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            isPlaying = false;
        } else {
            // Play buzz sound
            buzzSound.play().catch(e => console.log('Audio play failed:', e));
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            isPlaying = true;
        }
    });
    
    // Handle audio end (in case it's not looping)
    buzzSound.addEventListener('ended', function() {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        isPlaying = false;
    });
}

// Play Swosh Sound Function
function playSwoshSound() {
    const swoshSound = document.getElementById('swosh-sound');
    swoshSound.currentTime = 0; // Reset to beginning
    swoshSound.play().catch(e => console.log('Swosh sound play failed:', e));
} 