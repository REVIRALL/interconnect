/**
 * Form Validation Module
 */

window.setupContactFormValidation = function() {
    const contactForm = document.querySelector('#contact-form');
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