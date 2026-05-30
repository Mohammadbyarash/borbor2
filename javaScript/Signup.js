    
        // Utility Functions
        const faToEn = (str) => {
            return typeof str === 'string' 
                ? str.replace(/[۰-۹]/g, w => ({
                    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
                    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
                })[w])
                : '';
        };

        // Elements
        const fullNameInput = document.getElementById('fullName');
        const phoneNumberInput = document.getElementById('phoneNumber');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const acceptTermsCheckbox = document.getElementById('acceptTerms');
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const signupForm = document.getElementById('signupForm');
        const submitBtn = document.getElementById('submitBtn');
        const alertError = document.getElementById('alertError');
        const alertSuccess = document.getElementById('alertSuccess');
        const passwordStrength = document.getElementById('passwordStrength');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        const termsLink = document.getElementById('termsLink');
        const termsModal = document.getElementById('termsModal');

        // Toggle Password Visibility
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });

        toggleConfirmPassword.addEventListener('click', () => {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            toggleConfirmPassword.classList.toggle('fa-eye');
            toggleConfirmPassword.classList.toggle('fa-eye-slash');
        });

        // Convert Persian numbers to English
        phoneNumberInput.addEventListener('input', (e) => {
            let val = faToEn(e.target.value);
            e.target.value = val.replace(/[^0-9]/g, '');
        });

        // Password Strength Check
        function checkPasswordStrength(password) {
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;

            return strength;
        }

        // Update Password Strength UI
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;

            if (password.length === 0) {
                passwordStrength.classList.remove('show');
                return;
            }

            passwordStrength.classList.add('show');
            const strength = checkPasswordStrength(password);

            strengthFill.className = 'strength-fill';
            strengthText.className = 'strength-text';

            if (strength <= 2) {
                strengthFill.classList.add('strength-weak');
                strengthText.classList.add('text-weak');
                strengthText.textContent = 'ضعیف';
            } else if (strength <= 4) {
                strengthFill.classList.add('strength-medium');
                strengthText.classList.add('text-medium');
                strengthText.textContent = 'متوسط';
            } else {
                strengthFill.classList.add('strength-strong');
                strengthText.classList.add('text-strong');
                strengthText.textContent = 'قوی';
            }

            // Update requirements
            updateRequirement('req-length', password.length >= 8);
            updateRequirement('req-uppercase', /[A-Z]/.test(password));
            updateRequirement('req-lowercase', /[a-z]/.test(password));
            updateRequirement('req-number', /[0-9]/.test(password));

            validatePassword();
        });

        function updateRequirement(id, isValid) {
            const element = document.getElementById(id);
            if (isValid) {
                element.classList.add('valid');
                element.querySelector('i').className = 'fas fa-check-circle';
            } else {
                element.classList.remove('valid');
                element.querySelector('i').className = 'far fa-circle';
            }
        }

        // Real-time Validation
        fullNameInput.addEventListener('blur', () => validateFullName());
        phoneNumberInput.addEventListener('blur', () => validatePhoneNumber());
        passwordInput.addEventListener('blur', () => validatePassword());
        confirmPasswordInput.addEventListener('input', () => validateConfirmPassword());
        confirmPasswordInput.addEventListener('blur', () => validateConfirmPassword());

        // Validation Functions
        function validateFullName() {
            const value = fullNameInput.value.trim();
            const errorDiv = document.getElementById('fullNameError');
            const successDiv = document.getElementById('fullNameSuccess');

            if (!value) {
                showError(fullNameInput, errorDiv, successDiv, 'لطفاً نام و نام خانوادگی را وارد کنید');
                return false;
            }

            if (value.length < 3) {
                showError(fullNameInput, errorDiv, successDiv, 'نام باید حداقل ۳ کاراکتر باشد');
                return false;
            }

            showSuccess(fullNameInput, errorDiv, successDiv);
            return true;
        }

        function validatePhoneNumber() {
            const value = phoneNumberInput.value.trim();
            const errorDiv = document.getElementById('phoneNumberError');
            const successDiv = document.getElementById('phoneNumberSuccess');

            if (!value) {
                showError(phoneNumberInput, errorDiv, successDiv, 'لطفاً شماره موبایل را وارد کنید');
                return false;
            }

            if (!value.startsWith('09')) {
                showError(phoneNumberInput, errorDiv, successDiv, 'شماره موبایل باید با ۰۹ شروع شود');
                return false;
            }

            if (value.length !== 11) {
                showError(phoneNumberInput, errorDiv, successDiv, 'شماره موبایل باید ۱۱ رقم باشد');
                return false;
            }

            if (!/^09\d{9}$/.test(value)) {
                showError(phoneNumberInput, errorDiv, successDiv, 'شماره موبایل معتبر نیست');
                return false;
            }

            showSuccess(phoneNumberInput, errorDiv, successDiv);
            return true;
        }

        function validatePassword() {
            const value = passwordInput.value;
            const errorDiv = document.getElementById('passwordError');
            const successDiv = document.getElementById('passwordSuccess');

            if (!value) {
                showError(passwordInput, errorDiv, successDiv, 'لطفاً رمز عبور را وارد کنید');
                return false;
            }

            if (value.length < 8) {
                showError(passwordInput, errorDiv, successDiv, 'رمز عبور باید حداقل ۸ کاراکتر باشد');
                return false;
            }

            if (!/[A-Z]/.test(value)) {
                showError(passwordInput, errorDiv, successDiv, 'رمز عبور باید شامل حداقل یک حرف بزرگ باشد');
                return false;
            }

            if (!/[a-z]/.test(value)) {
                showError(passwordInput, errorDiv, successDiv, 'رمز عبور باید شامل حداقل یک حرف کوچک باشد');
                return false;
            }

            if (!/[0-9]/.test(value)) {
                showError(passwordInput, errorDiv, successDiv, 'رمز عبور باید شامل حداقل یک عدد باشد');
                return false;
            }

            showSuccess(passwordInput, errorDiv, successDiv);
            return true;
        }

        function validateConfirmPassword() {
            const value = confirmPasswordInput.value;
            const password = passwordInput.value;
            const errorDiv = document.getElementById('confirmPasswordError');
            const successDiv = document.getElementById('confirmPasswordSuccess');

            if (!value) {
                showError(confirmPasswordInput, errorDiv, successDiv, 'لطفاً رمز عبور را مجدداً وارد کنید');
                return false;
            }

            if (value !== password) {
                showError(confirmPasswordInput, errorDiv, successDiv, 'رمزهای عبور مطابقت ندارند');
                return false;
            }

            showSuccess(confirmPasswordInput, errorDiv, successDiv);
            return true;
        }

        function validateTerms() {
            const termsError = document.getElementById('termsError');
            
            if (!acceptTermsCheckbox.checked) {
                termsError.classList.add('show');
                return false;
            }

            termsError.classList.remove('show');
            return true;
        }

        function showError(input, errorDiv, successDiv, message) {
            input.classList.add('error');
            input.classList.remove('success');
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
            successDiv.classList.remove('show');
        }

        function showSuccess(input, errorDiv, successDiv) {
            input.classList.remove('error');
            input.classList.add('success');
            errorDiv.classList.remove('show');
            successDiv.classList.add('show');
        }

        function showAlert(type, message) {
            const alert = type === 'success' ? alertSuccess : alertError;
            const text = type === 'success' ? document.getElementById('alertSuccessText') : document.getElementById('alertErrorText');
            
            alertSuccess.classList.remove('show');
            alertError.classList.remove('show');
            
            text.textContent = message;
            alert.classList.add('show');

            setTimeout(() => {
                alert.classList.remove('show');
            }, 5000);
        }

        // Terms Modal
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.classList.add('active');
        });

        function closeTermsModal() {
            termsModal.classList.remove('active');
        }

        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) {
                closeTermsModal();
            }
        });

        // Form Submit
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all fields
            const isFullNameValid = validateFullName();
            const isPhoneNumberValid = validatePhoneNumber();
            const isPasswordValid = validatePassword();
            const isConfirmPasswordValid = validateConfirmPassword();
            const areTermsAccepted = validateTerms();

            if (!isFullNameValid || !isPhoneNumberValid || !isPasswordValid || !isConfirmPasswordValid || !areTermsAccepted) {
                showAlert('error', 'لطفاً تمام فیلدها را به درستی پر کنید و شرایط را بپذیرید');
                return;
            }

            // Show loading
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                const fullName = fullNameInput.value.trim();
                const phoneNumber = phoneNumberInput.value.trim();
                const password = passwordInput.value;

                console.log('Signup Data:', {
                    fullName,
                    phoneNumber,
                    password
                });

                // Simulate successful signup
                showAlert('success', 'ثبت‌نام با موفقیت انجام شد! در حال انتقال...');

                // Save phone for OTP page
                localStorage.setItem('otpPhone', phoneNumber);

                // Redirect to OTP page after 2 seconds
                setTimeout(() => {
                    window.location.href = `otp-verification.html?phone=${phoneNumber}`;
                }, 2000);

            }, 1500);
        });
    