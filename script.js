// Stunning Loader Animation Controller
function initLoaderAnimation() {
    const overlay = document.getElementById("loader");
    if (!overlay || overlay.dataset.init) { return; }
    overlay.dataset.init = "1";
    
    // Add loading class to body (DISABLED - loader is hidden for testing)
    // document.body.classList.add("loading");
    
    // Add boom effect for screen flash
    setTimeout(() => {
        overlay.classList.add("boom");
    }, 2600);
    
    // Start fade out and reveal content
    setTimeout(() => {
        overlay.classList.add("fade-out");
        document.body.classList.remove("loading");
    }, 3400);
    
    // Remove loader from DOM after fade completes
    overlay.addEventListener("transitionend", (e) => {
        if (e.propertyName === "opacity" && overlay.classList.contains("fade-out")) {
            overlay.remove();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize Stunning Loader Animation - FIRST!
        initLoaderAnimation();
        
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
        
        // Initialize Prize System
        initPrizeSystem();
        
        // Smooth scrolling for navigation links
        initSmoothScrolling();
    } catch (error) {
        console.error('Initialization error:', error);
        // Ensure loader still completes even if there's an error
        const overlay = document.getElementById("loader");
        if (overlay) {
            setTimeout(() => {
                overlay.classList.add("fade-out");
                document.body.classList.remove("loading");
                setTimeout(() => overlay.remove(), 500);
            }, 100);
        }
    }
});

// Image Comparison Slider Implementation
function initImageComparisonSlider() {
    const slider = document.querySelector('.image-comparison');
    const beforeImage = document.querySelector('.before-image');
    const sliderHandle = document.querySelector('.slider-handle');
    
    if (!slider || !beforeImage || !sliderHandle) return;
    
    let isDragging = false;
    let autoAnimation = true;
    let animationInterval;
    let currentPosition = 25;
    let direction = 1; // 1 for right, -1 for left
    
    // Initialize slider position to left side (25% from left)
    updateSliderPosition(25);
    
    // Start automatic animation
    startAutoAnimation();
    
    // Mouse down on slider handle
    sliderHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        pauseAutoAnimation();
    });
    
    // Touch start on slider handle
    sliderHandle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isDragging = true;
        pauseAutoAnimation();
    }, { passive: false });
    
    // Move events
    document.addEventListener('mousemove', moveSlider);
    document.addEventListener('touchmove', moveSlider, { passive: false });
    
    // Release events
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            // Resume auto-animation after 3 seconds of inactivity
            setTimeout(() => {
                if (!isDragging) startAutoAnimation();
            }, 3000);
        }
    });
    
    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            // Resume auto-animation after 3 seconds of inactivity
            setTimeout(() => {
                if (!isDragging) startAutoAnimation();
            }, 3000);
        }
    });
    
    // Click on slider container
    slider.addEventListener('click', function(e) {
        // Ignore if clicking on handle
        if (e.target === sliderHandle || sliderHandle.contains(e.target)) return;
        
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = (x / rect.width) * 100;
        
        pauseAutoAnimation();
        updateSliderPosition(percent);
        currentPosition = percent;
        
        // Resume auto-animation after 3 seconds
        setTimeout(() => {
            if (!isDragging) startAutoAnimation();
        }, 3000);
    });
    
    function startAutoAnimation() {
        if (animationInterval) return;
        autoAnimation = true;
        
        let animationState = 'showing_before'; // 'showing_before', 'transitioning_to_after', 'showing_after', 'transitioning_to_before'
        let stateTimer = 0;
        const SHOW_DURATION = 60; // 3 seconds at 50ms intervals
        const TRANSITION_DURATION = 30; // 1.5 seconds at 50ms intervals
        
        animationInterval = setInterval(() => {
            if (isDragging) return;
            
            stateTimer++;
            
            switch(animationState) {
                case 'showing_before':
                    // Hold at 10% to fully show "before" image
                    currentPosition = 10;
                    updateSliderPosition(currentPosition);
                    
                    if (stateTimer >= SHOW_DURATION) {
                        animationState = 'transitioning_to_after';
                        stateTimer = 0;
                    }
                    break;
                    
                case 'transitioning_to_after':
                    // Smooth transition from 10% to 90%
                    const progressToAfter = stateTimer / TRANSITION_DURATION;
                    const easedProgress = easeInOutCubic(progressToAfter);
                    currentPosition = 10 + (easedProgress * 80); // 10% to 90%
                    updateSliderPosition(currentPosition);
                    
                    if (stateTimer >= TRANSITION_DURATION) {
                        animationState = 'showing_after';
                        stateTimer = 0;
                        currentPosition = 90;
                    }
                    break;
                    
                case 'showing_after':
                    // Hold at 90% to fully show "after" image
                    currentPosition = 90;
                    updateSliderPosition(currentPosition);
                    
                    if (stateTimer >= SHOW_DURATION) {
                        animationState = 'transitioning_to_before';
                        stateTimer = 0;
                    }
                    break;
                    
                case 'transitioning_to_before':
                    // Smooth transition from 90% back to 10%
                    const progressToBefore = stateTimer / TRANSITION_DURATION;
                    const easedProgressBack = easeInOutCubic(progressToBefore);
                    currentPosition = 90 - (easedProgressBack * 80); // 90% to 10%
                    updateSliderPosition(currentPosition);
                    
                    if (stateTimer >= TRANSITION_DURATION) {
                        animationState = 'showing_before';
                        stateTimer = 0;
                        currentPosition = 10;
                    }
                    break;
            }
        }, 50); // 50ms intervals for smooth animation
        
        // Easing function for smooth transitions
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
    }
    
    function pauseAutoAnimation() {
        autoAnimation = false;
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }
    
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
        currentPosition = limitedPercent;
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
        } else {
            // Miss - swatter should NOT return to corner on miss
            console.log('Miss! Try again!');
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
        swatter.style.opacity = '1';
        swatter.style.visibility = 'visible';
        swatter.style.display = 'flex';
        swatter.style.zIndex = '5201';
        
        console.log('Spatula picked up! Click to smack, right-click to put back!');
    }
    
    function followMouse(e) {
        if (!isPickedUp || flySmacked) return; // Don't follow mouse if fly is smacked
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        // Calculate centered position
        const centerX = clientX - (swatter.offsetWidth / 2);
        const centerY = clientY - (swatter.offsetHeight / 2);
        
        // Ensure swatter is visible and positioned correctly
        swatter.style.position = 'fixed';
        swatter.style.left = centerX + 'px';
        swatter.style.top = centerY + 'px';
        swatter.style.right = 'auto';
        swatter.style.bottom = 'auto';
        swatter.style.transform = 'none'; // Clear any conflicting transforms
        swatter.style.opacity = '1';
        swatter.style.visibility = 'visible';
        swatter.style.display = 'flex';
        swatter.style.zIndex = '5201';
        
        if (e.type === 'touchmove') {
            e.preventDefault();
        }
    }
    
    function doSmackAnimation() {
        // Add smack animation (CSS class is 'smack' not 'smack-animation')
        swatter.classList.add('smack');
        
        // Play swosh sound
        playSwoshSound();
        
        // Remove animation class after it completes
        setTimeout(() => {
            swatter.classList.remove('smack');
        }, 300);
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
        
        // Reset to original position - CRITICAL: Clear transform too!
        swatter.style.position = 'fixed';
        swatter.style.left = '';
        swatter.style.top = '';
        swatter.style.transform = ''; // Clear any transform that was applied during mouse follow
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

// Prize System Functions
async function initPrizeSystem() {
    try {
        // Fetch from database API
        const response = await fetch('/api/prizes');
        const prizeData = await response.json();
        
        // Compute automatic states from dates
        if (prizeData.current && prizeData.current.length > 0) {
            prizeData.current = prizeData.current.map(prize => computePrizeState(prize));
        }
        if (prizeData.upcoming && prizeData.upcoming.length > 0) {
            prizeData.upcoming = prizeData.upcoming.map(prize => computePrizeState(prize));
        }
        
        // Check leaderboard toggle setting and apply visibility controls
        applyLeaderboardToggle(prizeData.config.leaderboard_enabled);
        
        // Update hero banner (will be hidden if leaderboard disabled)
        updateHeroPrizeBanner(prizeData);
        
        // Prize pill removed from leaderboard section
        
        // Start countdown timers
        startPrizeCountdowns(prizeData);
        
        // If on leaderboard page, initialize prize hub
        if (window.location.pathname.includes('leaderboard.html')) {
            initPrizeHub(prizeData);
        }
    } catch (error) {
        console.log('Prize data loading failed:', error);
    }
}

// Initialize Prize Hub on leaderboard page
function initPrizeHub(data) {
    // Update total winners count from history
    const totalWinners = data.stats?.total_winners || 0;
    const winnersElement = document.getElementById('total-winners');
    if (winnersElement) {
        winnersElement.textContent = totalWinners;
    }
    
    // Populate winners carousel with real data from history
    const winnersCarousel = document.getElementById('winners-carousel');
    if (winnersCarousel && data.history && data.history.length > 0) {
        winnersCarousel.innerHTML = data.history.map(comp => {
            // Get winners for this competition
            const winners = comp.winners || [];
            if (winners.length === 0) return '';
            
            return `
                <div class="winner-card">
                    <div class="winner-header">
                        <h4>${comp.title}</h4>
                        <span class="winner-date">${new Date(comp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div class="winner-list">
                        ${winners.slice(0, 3).map((w, i) => `
                            <div class="winner-item">
                                <span class="winner-rank">${['🥇', '🥈', '🥉'][i] || `#${w.place}`}</span>
                                <span class="winner-name">${w.username || 'Anonymous'}</span>
                                <span class="winner-prize">$${(w.amount_usd || 0).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    } else if (winnersCarousel) {
        winnersCarousel.innerHTML = '<div class="no-winners">No past winners yet. Be the first!</div>';
    }
    
    // Update future prizes container
    const futureContainer = document.getElementById('future-prizes-container');
    if (futureContainer && data.upcoming && data.upcoming.length > 0) {
        futureContainer.innerHTML = data.upcoming.map(prize => {
            const prizeAmount = prize.prize_pool || prize.total_prize_pool || 0;
            return `
                <div class="future-prize-card">
                    <h4>${prize.title}</h4>
                    <div class="prize-amount">$${prizeAmount.toLocaleString()}</div>
                    <div class="prize-date">Starts ${new Date(prize.start_date).toLocaleDateString()}</div>
                </div>
            `;
        }).join('');
    }
}

// Apply leaderboard visibility controls based on admin toggle
function applyLeaderboardToggle(leaderboardEnabled) {
    // Elements to control based on leaderboard toggle
    const leaderboardSection = document.getElementById('leaderboard-preview');
    const prizeBanner = document.getElementById('prize-promotion-banner');
    
    // Find navigation links to leaderboard
    const navLinks = document.querySelectorAll('a[href="leaderboard.html"], a[href="#leaderboard-preview"]');
    
    if (leaderboardEnabled) {
        // Show all leaderboard elements
        if (leaderboardSection) leaderboardSection.style.display = 'block';
        if (prizeBanner) prizeBanner.style.display = 'block';
        navLinks.forEach(link => link.style.display = '');
    } else {
        // Hide all leaderboard elements for production control
        if (leaderboardSection) leaderboardSection.style.display = 'none';
        if (prizeBanner) prizeBanner.style.display = 'none';
        navLinks.forEach(link => link.style.display = 'none');
    }
}

function updateHeroPrizeBanner(data) {
    const banner = document.getElementById('prize-promotion-banner');
    const headline = document.getElementById('prize-headline');
    const countdown = document.getElementById('prize-countdown');
    const ctaBtn = document.getElementById('prize-cta-btn');
    
    if (!banner || !data.current || data.current.length === 0) return;
    
    // CRITICAL: Check leaderboard toggle first - if disabled, don't show banner at all
    if (!data.config?.leaderboard_enabled) {
        banner.style.display = 'none';
        return;
    }
    
    const currentPrize = data.current[0]; // Get first current competition
    const now = new Date();
    const startDate = new Date(currentPrize.start_date);
    const endDate = new Date(currentPrize.end_date);
    
    // Check if prize should be shown (active or within promo period) - use computed status
    const promoDays = data.config?.hero_promo_days_before_start || 7;
    const promoStart = new Date(startDate.getTime() - (promoDays * 24 * 60 * 60 * 1000));
    
    // Show if currently active OR within promo period before start
    const showPromo = (currentPrize.computed_status === 'active') || 
                      (currentPrize.computed_status === 'upcoming' && now >= promoStart);
    
    if (showPromo && now <= endDate) {
        // Update content immediately with fallback
        const prizeAmount = currentPrize.prize_pool || currentPrize.total_prize_pool || 0;
        if (headline) headline.textContent = currentPrize.highlight_copy || `🔥 ${currentPrize.title} - ${Math.round(prizeAmount/1000)}K Prize Pool!`;
        if (ctaBtn) {
            ctaBtn.textContent = currentPrize.cta_text || 'JOIN NOW';
            ctaBtn.href = currentPrize.cta_link || 'leaderboard.html#prize-hub';
        }
        
        // Show banner only if leaderboard is enabled
        banner.style.display = 'block';
        banner.style.visibility = 'visible';
        banner.style.opacity = '1';
        
        // Update countdown
        if (countdown) updateCountdown(countdown, endDate);
    } else {
        banner.style.display = 'none';
    }
}

function updateLeaderboardPrizePill(data) {
    const pill = document.getElementById('prize-pill');
    if (!pill || !data.current) return;
    
    const currentPrize = data.current;
    const prizeAmount = currentPrize.prize_pool || currentPrize.total_prize_pool || 0;
    const amount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(prizeAmount);
    
    pill.textContent = `💰 ${amount} Prize Pool`;
    pill.style.display = 'inline-block';
    pill.onclick = () => window.location.href = 'leaderboard.html#prize-hub';
}

function updateCountdown(element, endDate) {
    function update() {
        const now = new Date();
        const diff = endDate - now;
        
        if (diff <= 0) {
            element.textContent = 'Competition Ended';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        element.textContent = `Ends in ${days}d ${hours}h ${minutes}m`;
    }
    
    update();
    setInterval(update, 60000); // Update every minute
}

function startPrizeCountdowns(data) {
    // Start countdowns for any elements that need them
    if (data.current) {
        const endDate = new Date(data.current.end_date);
        const countdownElements = document.querySelectorAll('.countdown-timer');
        countdownElements.forEach(element => {
            updateCountdown(element, endDate);
        });
    }
}

// Compute prize state automatically from dates
function computePrizeState(prize) {
    if (!prize) return prize;
    
    const now = new Date();
    const startDate = new Date(prize.start_date);
    const endDate = new Date(prize.end_date);
    
    // Auto-compute status from dates (ignore manual status)
    if (now >= startDate && now <= endDate) {
        prize.computed_status = 'active';
    } else if (now < startDate) {
        prize.computed_status = 'upcoming';
    } else {
        prize.computed_status = 'ended';
    }
    
    return prize;
}