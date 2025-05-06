// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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

    // Project image placeholders
    const projectImages = document.querySelectorAll('.project-image img');

    // Set placeholder images for projects
    projectImages.forEach((img, index) => {
        // Fix image paths with direct assignments
        if (img.getAttribute('src') === 'assets/Imgs/path-finding.jpg') {
            img.setAttribute('src', 'assets/Imgs/IMG-20230916-WA0058.jpg');
        } else if (img.getAttribute('src') === 'assets/Imgs/chatbot.jpg') {
            img.setAttribute('src', 'assets/Imgs/IMG-20240122-WA0004.jpg');
        } else if (img.getAttribute('src') === 'assets/Imgs/ecommerce.jpg') {
            img.setAttribute('src', 'assets/Imgs/WhatsApp Image 2025-05-04 at 21.58.32.jpeg');
        } else if (img.getAttribute('src') === 'assets/Imgs/sorting.jpg') {
            img.setAttribute('src', 'assets/Imgs/WhatsApp Image 2025-05-04 at 21.59.27.jpeg');
        }
    });

    // Mobile menu toggle (for smaller screens)
    const createMobileMenu = () => {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');

        // Create mobile menu button
        const mobileMenuBtn = document.createElement('div');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';

        // Insert before nav
        header.insertBefore(mobileMenuBtn, nav);

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
    };

    // Only create mobile menu for smaller screens
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            createMobileMenu();
        }
    });
});
