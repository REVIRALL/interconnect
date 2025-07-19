/**
 * Authentication JavaScript
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initPasswordToggle();
        initLoginForm();
        initRegisterForm();
    });

    /**
     * Initialize password visibility toggle
     */
    function initPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    /**
     * Initialize login form
     */
    function initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(loginForm);
                const email = formData.get('email');
                const password = formData.get('password');
                const remember = formData.get('remember');
                
                // Basic validation
                if (!email || !password) {
                    showMessage('すべての項目を入力してください。', 'error');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showMessage('有効なメールアドレスを入力してください。', 'error');
                    return;
                }
                
                // Here you would normally send login request to server
                // Login attempt
                
                // Simulate successful login
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                
                showMessage('ログインしました。ダッシュボードに移動します...', 'success');
                
                setTimeout(function() {
                    window.location.href = 'dashboard.html';
                }, 1500);
            });
        }
    }

    /**
     * Initialize register form
     */
    function initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(registerForm);
                const name = formData.get('name');
                const company = formData.get('company');
                const email = formData.get('email');
                const password = formData.get('password');
                const passwordConfirm = formData.get('password-confirm');
                const agree = formData.get('agree');
                
                // Validation
                if (!name || !company || !email || !password || !passwordConfirm) {
                    showMessage('すべての項目を入力してください。', 'error');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showMessage('有効なメールアドレスを入力してください。', 'error');
                    return;
                }
                
                // Password match
                if (password !== passwordConfirm) {
                    showMessage('パスワードが一致しません。', 'error');
                    return;
                }
                
                // Password strength
                if (password.length < 8) {
                    showMessage('パスワードは8文字以上で設定してください。', 'error');
                    return;
                }
                
                // Terms agreement
                if (!agree) {
                    showMessage('利用規約に同意してください。', 'error');
                    return;
                }
                
                // Get business challenges
                const challenges = formData.getAll('challenges');
                const budget = formData.get('budget');
                const phone = formData.get('phone');
                const lineId = formData.get('line-id');
                const position = formData.get('position');
                const newsletter = formData.get('newsletter');
                
                // Here you would normally send registration request to server
                console.log('Registration data:', { 
                    name, company, email, position,
                    challenges, budget,
                    phone, lineId,
                    newsletter
                });
                
                showMessage('登録が完了しました。ログインページに移動します...', 'success');
                
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 2000);
            });
        }
    }

    /**
     * Show message
     */
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;
        
        // Insert message
        const form = document.querySelector('.auth-form');
        form.parentElement.insertBefore(messageDiv, form);
        
        // Auto remove after 5 seconds
        setTimeout(function() {
            messageDiv.remove();
        }, 5000);
    }

    /**
     * Multi-step form navigation
     */
    window.nextStep = function() {
        const currentStep = document.querySelector('.form-step.active');
        const currentStepNum = parseInt(currentStep.dataset.step);
        
        // Validate current step
        if (!validateStep(currentStepNum)) {
            return;
        }
        
        // Move to next step
        if (currentStepNum < 3) {
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show next step
            const nextStep = document.querySelector(`.form-step[data-step="${currentStepNum + 1}"]`);
            nextStep.classList.add('active');
            
            // Update progress
            updateProgress(currentStepNum + 1);
        }
    };
    
    window.prevStep = function() {
        const currentStep = document.querySelector('.form-step.active');
        const currentStepNum = parseInt(currentStep.dataset.step);
        
        if (currentStepNum > 1) {
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show previous step
            const prevStep = document.querySelector(`.form-step[data-step="${currentStepNum - 1}"]`);
            prevStep.classList.add('active');
            
            // Update progress
            updateProgress(currentStepNum - 1);
        }
    };
    
    function validateStep(stepNum) {
        switch(stepNum) {
            case 1:
                // Validate basic information
                const name = document.getElementById('name').value;
                const company = document.getElementById('company').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const passwordConfirm = document.getElementById('password-confirm').value;
                
                if (!name || !company || !email || !password || !passwordConfirm) {
                    showMessage('すべての項目を入力してください。', 'error');
                    return false;
                }
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showMessage('有効なメールアドレスを入力してください。', 'error');
                    return false;
                }
                
                if (password !== passwordConfirm) {
                    showMessage('パスワードが一致しません。', 'error');
                    return false;
                }
                
                if (password.length < 8) {
                    showMessage('パスワードは8文字以上で設定してください。', 'error');
                    return false;
                }
                break;
                
            case 2:
                // Validate business challenges
                const challenges = document.querySelectorAll('input[name="challenges"]:checked');
                const budget = document.getElementById('budget').value;
                
                if (challenges.length === 0) {
                    showMessage('少なくとも1つの事業課題を選択してください。', 'error');
                    return false;
                }
                
                if (!budget) {
                    showMessage('予算規模を選択してください。', 'error');
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    function updateProgress(stepNum) {
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index + 1 < stepNum) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === stepNum) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

})();