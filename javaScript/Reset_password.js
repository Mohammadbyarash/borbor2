    
        // Elements
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const toggleNewPassword = document.getElementById('toggleNewPassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const resetForm = document.getElementById('resetForm');
        const submitBtn = document.getElementById('submitBtn');
        const alertError = document.getElementById('alertError');
        const alertSuccess = document.getElementById('alertSuccess');
        const passwordStrength = document.getElementById('passwordStrength');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        // Toggle Password Visibility
        toggleNewPassword.addEventListener('click', () => {
            const type = newPasswordInput.type === 'password' ? 'text' : 'password';
            newPasswordInput.type = type;
            toggleNewPassword.classList.toggle('fa-eye');
            toggleNewPassword.classList.toggle('fa-eye-slash');
        });

        toggleConfirmPassword.addEventListener('click', () => {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            toggleConfirmPassword.classList.toggle('fa-eye');
            toggleConfirmPassword.classList.toggle('fa-eye-slash');
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
        newPasswordInput.addEventListener('input', () => {
            const password = newPasswordInput.value;

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

            // Validate
            validateNewPassword();
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
        newPasswordInput.addEventListener('blur', () => validateNewPassword());
        confirmPasswordInput.addEventListener('input', () => validateConfirmPassword());
        confirmPasswordInput.addEventListener('blur', () => validateConfirmPassword());

        // Validation Functions
        function validateNewPassword() {
            const value = newPasswordInput.value;
            const errorDiv = document.getElementById('newPasswordError');
            const successDiv = document.getElementById('newPasswordSuccess');

            if (!value) {
                showError(newPasswordInput, errorDiv, successDiv, 'لطفاً رمز عبور جدید را وارد کنید');
                return false;
            }

            if (value.length < 8) {
                showError(newPasswordInput, errorDiv, successDiv, 'رمز عبور باید حداقل ۸ کاراکتر باشد');
                return false;
            }

            if (!/[A-Z]/.test(value)) {
                showError(newPasswordInput, errorDiv, successDiv, 'رمز عبور باید شامل حداقل یک حرف بزرگ انگلیسی باشد');
                return false;
            }

            if (!/[a-z]/.test(value)) {
                showError(newPasswordInput, errorDiv, successDiv, 'رمز عبور باید شامل حداقل یک حرف کوچک انگلیسی باشد');
                return false;
            }

            if (!/[0-9]/.test(value)) {
                showError(newPasswordInput, errorDiv, successDiv, 'رمز عبور باید شامل حداقل یک عدد باشد');
                return false;
            }

            showSuccess(newPasswordInput, errorDiv, successDiv);
            return true;
        }

        function validateConfirmPassword() {
            const value = confirmPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const errorDiv = document.getElementById('confirmPasswordError');
            const successDiv = document.getElementById('confirmPasswordSuccess');

            if (!value) {
                showError(confirmPasswordInput, errorDiv, successDiv, 'لطفاً رمز عبور را مجدداً وارد کنید');
                return false;
            }

            if (value !== newPassword) {
                showError(confirmPasswordInput, errorDiv, successDiv, 'رمزهای عبور مطابقت ندارند');
                return false;
            }

            showSuccess(confirmPasswordInput, errorDiv, successDiv);
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
            
            // Hide both alerts first
            alertSuccess.classList.remove('show');
            alertError.classList.remove('show');
            
            // Show the appropriate alert
            text.textContent = message;
            alert.classList.add('show');

            // Auto hide after 5 seconds
            setTimeout(() => {
                alert.classList.remove('show');
            }, 5000);
        }

        // Form Submit
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate both fields
            const isNewPasswordValid = validateNewPassword();
            const isConfirmPasswordValid = validateConfirmPassword();

            if (!isNewPasswordValid || !isConfirmPasswordValid) {
                showAlert('error', 'لطفاً تمام فیلدها را به درستی پر کنید');
                return;
            }

            // Show loading
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;

                // Here you would normally send data to server
                console.log('Reset Password Data:', {
                    newPassword,
                    confirmPassword
                });

                // Simulate successful reset
                showAlert('success', 'رمز عبور با موفقیت تغییر کرد! در حال انتقال به صفحه ورود...');

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            }, 1500);
        });
    