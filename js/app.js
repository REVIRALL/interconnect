/**
 * INTERCONNECT Main Application JavaScript
 * Consolidated and optimized version
 */

(function() {
    'use strict';

    // DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    /**
     * Initialize all application features
     */
    function initializeApp() {
        // Remove any preloader immediately
        removePreloader();
        
        // Initialize navigation
        initializeNavigation();
        
        // Initialize smooth scrolling
        initializeSmoothScroll();
        
        // Initialize forms
        initializeForms();
        
        // Initialize modals
        initializeModals();
        
        // Initialize video handling
        initializeVideoHandling();
        
        // Initialize animations
        initializeAnimations();
        
        // Initialize theme
        initializeTheme();
    }

    /**
     * Remove preloader
     */
    function removePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
        // Ensure body is visible
        document.body.style.visibility = 'visible';
        document.body.style.overflow = 'auto';
    }

    /**
     * Initialize navigation
     */
    function initializeNavigation() {
        const navToggler = document.querySelector('.navbar-toggler');
        const navMenu = document.querySelector('.navbar-nav');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Mobile menu toggle
        if (navToggler && navMenu) {
            navToggler.addEventListener('click', function() {
                navMenu.classList.toggle('show');
                this.classList.toggle('active');
                
                // Animate hamburger
                const spans = this.querySelectorAll('span');
                if (this.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    spans[0].style.transform = '';
                    spans[1].style.opacity = '';
                    spans[2].style.transform = '';
                }
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggler.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('show');
                navToggler.classList.remove('active');
            }
        });
        
        // Active nav link highlighting
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
        
        // Sticky navigation
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            let lastScroll = 0;
            window.addEventListener('scroll', function() {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 100) {
                    navbar.classList.add('scrolled');
                    
                    if (currentScroll > lastScroll) {
                        navbar.classList.add('hidden');
                    } else {
                        navbar.classList.remove('hidden');
                    }
                } else {
                    navbar.classList.remove('scrolled');
                }
                
                lastScroll = currentScroll;
            });
        }
    }

    /**
     * Initialize smooth scrolling
     */
    function initializeSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const navMenu = document.querySelector('.navbar-nav');
                    if (navMenu) {
                        navMenu.classList.remove('show');
                    }
                }
            });
        });
    }

    /**
     * Initialize forms
     */
    function initializeForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Form validation
            form.addEventListener('submit', function(e) {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                form.classList.add('was-validated');
            });
            
            // Input animations
            const inputs = form.querySelectorAll('.form-input, .form-textarea');
            inputs.forEach(input => {
                // Floating labels
                if (input.value) {
                    input.classList.add('has-value');
                }
                
                input.addEventListener('focus', function() {
                    this.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.classList.remove('focused');
                    if (this.value) {
                        this.classList.add('has-value');
                    } else {
                        this.classList.remove('has-value');
                    }
                });
            });
        });
        
        // Password visibility toggle
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });
    }

    /**
     * Initialize modals
     */
    function initializeModals() {
        // Modal triggers
        const modalTriggers = document.querySelectorAll('[data-modal]');
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal');
                openModal(modalId);
            });
        });
        
        // Close buttons
        const modalCloses = document.querySelectorAll('.modal-close');
        modalCloses.forEach(close => {
            close.addEventListener('click', function() {
                const modal = this.closest('.modal-backdrop');
                closeModal(modal.id);
            });
        });
        
        // Backdrop click
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => {
            backdrop.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this.id);
                }
            });
        });
        
        // ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-backdrop.show');
                if (openModal) {
                    closeModal(openModal.id);
                }
            }
        });
    }

    /**
     * Open modal
     */
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }

    /**
     * Close modal
     */
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * Initialize video handling
     */
    function initializeVideoHandling() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Error handling
            video.addEventListener('error', function() {
                console.error('Video failed to load:', video.src);
                // Hide video and show fallback
                video.style.display = 'none';
                const fallback = video.parentElement.querySelector('.video-fallback');
                if (fallback) {
                    fallback.style.display = 'block';
                }
            });
            
            // Ensure autoplay works
            video.addEventListener('canplay', function() {
                video.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                });
            });
            
            // Optimize for mobile
            if (window.matchMedia('(max-width: 768px)').matches) {
                video.setAttribute('preload', 'none');
            }
        });
    }

    /**
     * Initialize animations
     */
    function initializeAnimations() {
        // Intersection Observer for scroll animations
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const animation = entry.target.getAttribute('data-animate');
                        entry.target.classList.add('animate-' + animation);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            animatedElements.forEach(el => observer.observe(el));
        } else {
            // Fallback for older browsers
            animatedElements.forEach(el => {
                const animation = el.getAttribute('data-animate');
                el.classList.add('animate-' + animation);
            });
        }
        
        // Parallax effect
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach(el => {
                    const speed = el.getAttribute('data-parallax') || 0.5;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
            });
        }
    }

    /**
     * Initialize theme
     */
    function initializeTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Update icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            });
        }
    }

    /**
     * Utility: Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Utility: Throttle function
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Export utilities
    window.appUtils = {
        debounce,
        throttle,
        openModal,
        closeModal
    };

    /**
     * Form Validation Setup
     */
    window.setupContactFormValidation = function() {
        const contactForm = document.querySelector('#contactForm') || document.querySelector('#contact-form');
        if (!contactForm) {
            console.log('Contact form not found');
            return null;
        }

        let submitHandler = null;
        let errorHandler = null;

        // Form validation
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            // Basic validation
            if (!data.name || !data.email || !data.message) {
                if (errorHandler) {
                    errorHandler(new Error('すべての項目を入力してください'));
                }
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                if (errorHandler) {
                    errorHandler(new Error('有効なメールアドレスを入力してください'));
                }
                return;
            }

            // Submit form
            try {
                if (submitHandler) {
                    await submitHandler(data);
                    contactForm.reset();
                }
            } catch (error) {
                if (errorHandler) {
                    errorHandler(error);
                }
            }
        });

        return {
            setSubmitHandler: function(handler) {
                submitHandler = handler;
            },
            setErrorHandler: function(handler) {
                errorHandler = handler;
            }
        };
    };

})();