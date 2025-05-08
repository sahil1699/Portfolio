// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ensure floating resume button is visible on mobile without scrolling
    if (window.innerWidth <= 768) {
        document.querySelector('.floating-resume-btn').style.display = 'block';
    }

    // Initialize experience timeline with collapsible sections
    initExperienceTimeline();
    // Custom background animation with random shapes
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation parameters
    const primaryColor = '#0066cc';
    const accentColor = '#0099ff';
    const secondaryColor = '#00356b';

    // Create animated shapes background
    class ShapesBackground {
        constructor() {
            this.shapes = [];
            this.numShapes = 12; // Fewer shapes for a cleaner look
            this.mouseX = 0;
            this.mouseY = 0;
            this.mouseRadius = 250; // Larger mouse influence radius
            this.mouseInfluence = 0.3; // Stronger mouse influence
            this.time = 0;
            this.lastClick = { x: 0, y: 0, time: 0 };

            // Initialize shapes
            this.initShapes();

            // Add mouse event listeners
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });

            window.addEventListener('click', (e) => {
                this.lastClick = {
                    x: e.clientX,
                    y: e.clientY,
                    time: this.time,
                    radius: 0
                };

                // Add a new shape on click
                this.addShape(e.clientX, e.clientY);
            });
        }

        initShapes() {
            // Create initial shapes
            for (let i = 0; i < this.numShapes; i++) {
                this.addRandomShape();
            }
        }

        addRandomShape() {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            this.addShape(x, y);
        }

        addShape(x, y) {
            // Random shape type (0: circle, 1: square, 2: triangle, 3: pentagon, 4: hexagon)
            const shapeType = Math.floor(Math.random() * 5);

            // Random size between 50 and 150 for larger shapes
            const size = 50 + Math.random() * 100;

            // Random color from our palette
            const colors = [primaryColor, accentColor, secondaryColor];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Random opacity between 0.05 and 0.15 for very subtle appearance
            const opacity = 0.05 + Math.random() * 0.1;

            // Random movement speed and direction (slower for more subtle movement)
            const speedX = (Math.random() - 0.5) * 0.3;
            const speedY = (Math.random() - 0.5) * 0.3;

            // Random rotation
            const rotation = Math.random() * Math.PI * 2;
            const rotationSpeed = (Math.random() - 0.5) * 0.005; // Slower rotation

            // Create shape object
            const shape = {
                x,
                y,
                originX: x,
                originY: y,
                size,
                color,
                opacity,
                speedX,
                speedY,
                rotation,
                rotationSpeed,
                shapeType,
                pulsePhase: Math.random() * Math.PI * 2, // Random starting phase for pulsing
                pulseSpeed: 0.02 + Math.random() * 0.03  // Random pulse speed
            };

            this.shapes.push(shape);

            // Limit the number of shapes
            if (this.shapes.length > 25) {
                this.shapes.shift();
            }
        }

        update() {
            this.time += 0.01;

            // Update each shape
            this.shapes.forEach(shape => {
                // Move shape
                shape.x += shape.speedX;
                shape.y += shape.speedY;

                // Rotate shape
                shape.rotation += shape.rotationSpeed;

                // Pulse size
                const pulseFactor = Math.sin(this.time * shape.pulseSpeed + shape.pulsePhase) * 0.1 + 1;
                shape.currentSize = shape.size * pulseFactor;

                // Bounce off edges
                if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
                if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
                if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
                if (shape.y > canvas.height + shape.size) shape.y = -shape.size;

                // Apply mouse influence
                const dx = this.mouseX - shape.x;
                const dy = this.mouseY - shape.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouseRadius) {
                    const influence = (1 - distance / this.mouseRadius) * this.mouseInfluence;
                    const angle = Math.atan2(dy, dx);

                    // Move shape towards mouse
                    shape.x += Math.cos(angle) * influence * 2;
                    shape.y += Math.sin(angle) * influence * 2;

                    // Increase opacity when near mouse
                    shape.currentOpacity = shape.opacity + influence * 0.3;
                } else {
                    shape.currentOpacity = shape.opacity;
                }

                // Apply click wave effect
                if (this.lastClick.time > 0) {
                    const timeSinceClick = this.time - this.lastClick.time;
                    if (timeSinceClick < 1.5) { // 1.5 seconds of wave effect
                        const clickDx = shape.x - this.lastClick.x;
                        const clickDy = shape.y - this.lastClick.y;
                        const clickDistance = Math.sqrt(clickDx * clickDx + clickDy * clickDy);

                        // Wave speed and radius
                        const waveSpeed = 150; // pixels per second
                        const waveRadius = timeSinceClick * waveSpeed;
                        const waveWidth = 50;

                        // If shape is within the wave radius
                        if (Math.abs(clickDistance - waveRadius) < waveWidth) {
                            const waveEffect = (1 - Math.abs(clickDistance - waveRadius) / waveWidth) * 0.5;
                            const waveAngle = Math.atan2(clickDy, clickDx);
                            shape.x += Math.cos(waveAngle) * waveEffect * 10;
                            shape.y += Math.sin(waveAngle) * waveEffect * 10;
                            shape.rotation += waveEffect * 0.2; // Add some rotation effect
                        }
                    }
                }
            });

            // Update click wave
            if (this.lastClick.time > 0) {
                const timeSinceClick = this.time - this.lastClick.time;
                if (timeSinceClick < 1.5) { // 1.5 seconds of wave effect
                    this.lastClick.radius = timeSinceClick * 150; // 150 pixels per second
                }
            }
        }

        draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw shapes
            this.shapes.forEach(shape => {
                ctx.save();
                ctx.translate(shape.x, shape.y);
                ctx.rotate(shape.rotation);

                // Set fill style with current opacity
                ctx.fillStyle = this.hexToRgba(shape.color, shape.currentOpacity);

                // Add subtle shadow for depth
                ctx.shadowColor = this.hexToRgba(shape.color, 0.2);
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 8;
                ctx.shadowOffsetY = 8;

                // Draw shape based on type
                switch (shape.shapeType) {
                    case 0: // Circle
                        ctx.beginPath();
                        ctx.arc(0, 0, shape.currentSize / 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;

                    case 1: // Square
                        ctx.beginPath();
                        ctx.rect(-shape.currentSize / 2, -shape.currentSize / 2, shape.currentSize, shape.currentSize);
                        ctx.fill();
                        break;

                    case 2: // Triangle
                        ctx.beginPath();
                        ctx.moveTo(0, -shape.currentSize / 2);
                        ctx.lineTo(shape.currentSize / 2, shape.currentSize / 2);
                        ctx.lineTo(-shape.currentSize / 2, shape.currentSize / 2);
                        ctx.closePath();
                        ctx.fill();
                        break;

                    case 3: // Pentagon
                        this.drawPolygon(0, 0, shape.currentSize / 2, 5);
                        break;

                    case 4: // Hexagon
                        this.drawPolygon(0, 0, shape.currentSize / 2, 6);
                        break;
                }

                ctx.restore();
            });

            // Draw click wave
            if (this.lastClick.time > 0) {
                const timeSinceClick = this.time - this.lastClick.time;
                if (timeSinceClick < 1.5) { // 1.5 seconds of wave effect
                    const radius = this.lastClick.radius;
                    const opacity = 0.3 * (1 - timeSinceClick / 1.5); // Fade out over 1.5 seconds

                    // Draw wave circle
                    ctx.beginPath();
                    ctx.arc(this.lastClick.x, this.lastClick.y, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = this.hexToRgba(accentColor, opacity);
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }

        // Helper function to draw regular polygons
        drawPolygon(x, y, radius, sides) {
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = i * 2 * Math.PI / sides - Math.PI / 2;
                const px = x + radius * Math.cos(angle);
                const py = y + radius * Math.sin(angle);

                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
        }

        hexToRgba(hex, opacity) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        animate() {
            this.update();
            this.draw();
            requestAnimationFrame(this.animate.bind(this));
        }
    }

    // Create and start the animation
    const shapesBackground = new ShapesBackground();
    shapesBackground.animate();
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a, .footer-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            if (targetId.startsWith('#')) {
                e.preventDefault();

                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Sticky header
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.hero');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.padding = '15px 0';
            header.style.boxShadow = 'none';
        }

        // Active link highlighting with smooth transitions
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                        // Add a subtle animation to the active link
                        link.style.animation = 'none';
                        setTimeout(() => {
                            link.style.animation = 'pulse 1s ease';
                        }, 10);
                    }
                });
            }
        });
    });

    // Animate skill bars when they come into view
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillSection = document.querySelector('.skills');

    function animateSkillBars() {
        const sectionTop = skillSection.offsetTop;
        const sectionHeight = skillSection.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight;

        if (scrollPosition > sectionTop && window.scrollY < sectionTop + sectionHeight) {
            skillBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
            });

            // Remove the event listener once animation is triggered
            window.removeEventListener('scroll', animateSkillBars);
        }
    }

    window.addEventListener('scroll', animateSkillBars);

    // Initialize project graphics with simple static visuals
    initProjectGraphics();

    // Mobile menu toggle (for smaller screens)
    const setupMobileMenu = () => {
        const nav = document.querySelector('nav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

        if (mobileMenuBtn) {
            // Toggle menu on click
            mobileMenuBtn.addEventListener('click', function() {
                this.classList.toggle('active');
                nav.classList.toggle('active');
            });

            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenuBtn.classList.remove('active');
                    nav.classList.remove('active');
                });
            });
        }
    };

    // Setup mobile menu
    setupMobileMenu();

    // Handle window resize
    window.addEventListener('resize', function() {
        // Toggle floating resume button visibility based on screen width
        const floatingResumeBtn = document.querySelector('.floating-resume-btn');
        if (window.innerWidth <= 768) {
            floatingResumeBtn.style.display = 'block';
        } else {
            floatingResumeBtn.style.display = 'none';
        }
    });
});

// Initialize experience timeline with collapsible sections
function initExperienceTimeline() {
    console.log("Initializing experience timeline");

    // Remove any existing event listeners by cloning and replacing elements
    document.querySelectorAll('.toggle-details').forEach((button) => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });

    document.querySelectorAll('.timeline-header').forEach((header) => {
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });

    // Add event listeners to all toggle buttons
    document.querySelectorAll('.toggle-details').forEach((button, index) => {
        console.log(`Setting up button ${index}`);

        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log(`Button ${index} clicked`);

            // Find the details section (sibling of the parent header)
            const header = this.closest('.timeline-header');
            const details = header.nextElementSibling;

            console.log(`Details found:`, details);

            // Toggle active classes
            if (details.classList.contains('active')) {
                console.log('Closing section');
                details.classList.remove('active');
                this.classList.remove('active');
            } else {
                console.log('Opening section');
                details.classList.add('active');
                this.classList.add('active');
            }
        });
    });

    // Also make the headers clickable (except the button part)
    document.querySelectorAll('.timeline-header').forEach((header, index) => {
        header.addEventListener('click', function(e) {
            // Don't handle if the click was on or inside the button
            if (e.target.closest('.toggle-details')) {
                return;
            }

            console.log(`Header ${index} clicked`);

            // Find the button and details
            const button = this.querySelector('.toggle-details');
            const details = this.nextElementSibling;

            // Toggle active classes
            if (details.classList.contains('active')) {
                details.classList.remove('active');
                button.classList.remove('active');
            } else {
                details.classList.add('active');
                button.classList.add('active');
            }
        });
    });

    // Expand the first position by default
    const firstDetails = document.querySelector('.timeline-details');
    const firstButton = document.querySelector('.toggle-details');

    if (firstDetails && firstButton) {
        console.log("Expanding first position by default");
        firstDetails.classList.add('active');
        firstButton.classList.add('active');
    }
}

// Function to initialize project graphics
function initProjectGraphics() {
    const projectCanvases = document.querySelectorAll('.project-canvas');

    projectCanvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const projectType = canvas.getAttribute('data-project');

        // Set canvas dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Draw project-specific graphics
        switch (projectType) {
            case 'pathfinding':
                drawPathfindingGraphic(ctx, canvas.width, canvas.height);
                break;
            case 'chatbot':
                drawChatbotGraphic(ctx, canvas.width, canvas.height);
                break;
            case 'ecommerce':
                drawEcommerceGraphic(ctx, canvas.width, canvas.height);
                break;
            case 'sorting':
                drawSortingGraphic(ctx, canvas.width, canvas.height);
                break;
        }

        // Add hover effect
        canvas.addEventListener('mousemove', () => {
            // Simple hover effect - just add a subtle glow
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        });

        // Reset on mouse out
        canvas.addEventListener('mouseout', () => {
            // Redraw the graphic
            switch (projectType) {
                case 'pathfinding':
                    drawPathfindingGraphic(ctx, canvas.width, canvas.height);
                    break;
                case 'chatbot':
                    drawChatbotGraphic(ctx, canvas.width, canvas.height);
                    break;
                case 'ecommerce':
                    drawEcommerceGraphic(ctx, canvas.width, canvas.height);
                    break;
                case 'sorting':
                    drawSortingGraphic(ctx, canvas.width, canvas.height);
                    break;
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        projectCanvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const projectType = canvas.getAttribute('data-project');

            // Update canvas dimensions
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Redraw project-specific graphics
            switch (projectType) {
                case 'pathfinding':
                    drawPathfindingGraphic(ctx, canvas.width, canvas.height);
                    break;
                case 'chatbot':
                    drawChatbotGraphic(ctx, canvas.width, canvas.height);
                    break;
                case 'ecommerce':
                    drawEcommerceGraphic(ctx, canvas.width, canvas.height);
                    break;
                case 'sorting':
                    drawSortingGraphic(ctx, canvas.width, canvas.height);
                    break;
            }
        });
    });
}

// Draw a pathfinding visualization graphic
function drawPathfindingGraphic(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    const cellSize = 20;
    const rows = Math.floor(height / cellSize);
    const cols = Math.floor(width / cellSize);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    // Draw grid lines
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
    }

    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();
    }

    // Draw start and end points
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);

    ctx.fillStyle = '#F44336';
    ctx.fillRect(width - cellSize * 2, height - cellSize * 2, cellSize, cellSize);

    // Draw some walls/obstacles
    ctx.fillStyle = '#333';
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * (cols - 2) + 1) * cellSize;
        const y = Math.floor(Math.random() * (rows - 2) + 1) * cellSize;
        ctx.fillRect(x, y, cellSize, cellSize);
    }

    // Draw a simple path
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cellSize * 1.5, cellSize * 1.5);

    // Create a zigzag path
    let currentX = cellSize * 1.5;
    let currentY = cellSize * 1.5;
    const endX = width - cellSize * 1.5;
    const endY = height - cellSize * 1.5;

    while (currentX < endX || currentY < endY) {
        if (currentX < endX) {
            currentX += cellSize;
        } else if (currentY < endY) {
            currentY += cellSize;
        }

        ctx.lineTo(currentX, currentY);
    }

    ctx.stroke();

    // Add a title
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Path Finding Visualizer', 10, 20);
}

// Draw a chatbot visualization graphic
function drawChatbotGraphic(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f5f7fa');
    gradient.addColorStop(1, '#e4e8eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw chat bubbles
    // User bubble
    const bubbleRadius = 10;
    ctx.fillStyle = '#e1ffc7';
    roundRect(ctx, 10, 40, width * 0.6, 50, bubbleRadius, true);

    // Bot bubble
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, width * 0.3, 110, width * 0.65, 60, bubbleRadius, true);

    // Draw text in bubbles
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('Hello, can you help me with my project?', 20, 70);
    ctx.fillText('Of course! I can assist with your coding questions.', width * 0.3 + 10, 140);

    // Draw a simple bot icon
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.arc(width - 30, 30, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw bot face
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(width - 35, 25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width - 25, 25, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw mouth
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width - 30, 35, 8, 0, Math.PI);
    ctx.stroke();

    // Add a title
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('AI ChatBot', 10, 20);
}

// Draw an e-commerce visualization graphic
function drawEcommerceGraphic(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#f9f9f9');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw a simple store layout
    // Header
    ctx.fillStyle = '#343a40';
    ctx.fillRect(0, 0, width, 40);

    // Logo
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Rocky Shop', 10, 25);

    // Search bar
    ctx.fillStyle = '#fff';
    roundRect(ctx, width / 2 - 100, 10, 200, 20, 10, true);

    // Cart icon
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(width - 20, 20, 10, 0, Math.PI * 2);
    ctx.fill();

    // Product grid
    const productSize = 70;
    const margin = 10;
    const startX = (width - (productSize * 2 + margin)) / 2;
    const startY = 60;

    // Draw products
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            const x = startX + col * (productSize + margin);
            const y = startY + row * (productSize + margin);

            // Product box
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            roundRect(ctx, x, y, productSize, productSize, 5, true);
            ctx.shadowColor = 'transparent';

            // Product image placeholder
            ctx.fillStyle = '#e0e0e0';
            roundRect(ctx, x + 5, y + 5, productSize - 10, productSize - 30, 3, true);

            // Product title
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.fillText('Product ' + (row * 2 + col + 1), x + 5, y + productSize - 10);

            // Price
            ctx.fillStyle = '#0066cc';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('$' + (Math.floor(Math.random() * 100) + 10), x + 5, y + productSize - 2);
        }
    }

    // Add a title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('E-Commerce Platform', 10, 25);
}

// Draw a sorting visualization graphic
function drawSortingGraphic(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Draw bars representing an array being sorted
    const numBars = 15;
    const barWidth = Math.floor((width - 20) / numBars);
    const maxHeight = height - 40;

    // Create an array of heights (partially sorted to show the sorting process)
    const heights = [];
    for (let i = 0; i < numBars; i++) {
        // Create a partially sorted array
        if (i < numBars / 2) {
            heights.push(20 + Math.random() * (maxHeight / 2));
        } else {
            heights.push(maxHeight / 2 + Math.random() * (maxHeight / 2));
        }
    }

    // Sort the first few elements to show progress
    heights.sort((a, b) => a - b);

    // Shuffle the rest
    for (let i = 5; i < numBars; i++) {
        const j = 5 + Math.floor(Math.random() * (numBars - 5));
        [heights[i], heights[j]] = [heights[j], heights[i]];
    }

    // Draw the bars
    for (let i = 0; i < numBars; i++) {
        const x = 10 + i * barWidth;
        const barHeight = heights[i];

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);

        // Color based on position (to show sorting progress)
        if (i < 5) {
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#81C784');
        } else {
            gradient.addColorStop(0, '#2196F3');
            gradient.addColorStop(1, '#64B5F6');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
    }

    // Draw a "current position" marker
    ctx.fillStyle = '#F44336';
    const markerX = 10 + 5 * barWidth;
    ctx.fillRect(markerX, 30, barWidth - 2, 5);

    // Add a title
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Sorting Visualizer', 10, 20);
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
        stroke = false;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}
