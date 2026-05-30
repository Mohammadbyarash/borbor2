    
        // Utility Functions
        const faToEn = (str) => {
            return typeof str === 'string' 
                ? str.replace(/[۰-۹]/g, w => ({
                    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
                    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
                })[w])
                : '';
        };

        // Get phone number from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const phoneNumber = urlParams.get('phone') || localStorage.getItem('otpPhone') || '09123456789';
        document.getElementById('displayPhone').textContent = phoneNumber;

        // Elements
        const inputs = [
            document.getElementById('digit1'),
            document.getElementById('digit2'),
            document.getElementById('digit3'),
            document.getElementById('digit4'),
            document.getElementById('digit5')
        ];
        const otpForm = document.getElementById('otpForm');
        const submitBtn = document.getElementById('submitBtn');
        const resendBtn = document.getElementById('resendBtn');
        const timerDisplay = document.getElementById('timerDisplay');
        const alertError = document.getElementById('alertError');
        const alertSuccess = document.getElementById('alertSuccess');
        const alertInfo = document.getElementById('alertInfo');

        // Timer
        let timeLeft = 120; // 2 minutes in seconds
        let timerInterval;

        function startTimer() {
            timerInterval = setInterval(() => {
                timeLeft--;

                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                if (timeLeft <= 30) {
                    timerDisplay.classList.add('timer-expired');
                }

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerDisplay.textContent = '00:00';
                    resendBtn.disabled = false;
                    showAlert('error', 'زمان کد تایید به پایان رسید. لطفاً کد جدید درخواست کنید.');
                }
            }, 1000);
        }

        // Start timer on page load
        startTimer();

        // OTP Input Handling
        inputs.forEach((input, index) => {
            // Convert Persian/Arabic numbers to English
            input.addEventListener('input', (e) => {
                let val = faToEn(e.target.value);
                val = val.replace(/[^0-9]/g, '');
                e.target.value = val;

                // Add filled class
                if (val) {
                    input.classList.add('filled');
                    input.classList.remove('error');
                } else {
                    input.classList.remove('filled');
                }

                // Auto-focus next input
                if (val && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

                // Auto-submit when all filled
                checkAutoSubmit();
            });

            // Handle backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            // Handle paste
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const cleanData = faToEn(pastedData).replace(/[^0-9]/g, '').slice(0, 5);
                
                cleanData.split('').forEach((char, i) => {
                    if (inputs[i]) {
                        inputs[i].value = char;
                        inputs[i].classList.add('filled');
                    }
                });

                if (cleanData.length > 0) {
                    inputs[Math.min(cleanData.length, inputs.length - 1)].focus();
                }

                checkAutoSubmit();
            });
        });

        function checkAutoSubmit() {
            const allFilled = inputs.every(input => input.value.length === 1);
            if (allFilled) {
                setTimeout(() => {
                    otpForm.dispatchEvent(new Event('submit'));
                }, 300);
            }
        }

        function getOTPValue() {
            return inputs.map(input => input.value).join('');
        }

        function clearOTP() {
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('filled', 'error');
            });
            inputs[0].focus();
        }

        function showErrorOTP() {
            inputs.forEach(input => {
                input.classList.add('error');
            });
        }

        function showAlert(type, message) {
            // Hide all alerts
            alertSuccess.classList.remove('show');
            alertError.classList.remove('show');
            alertInfo.classList.remove('show');

            // Show appropriate alert
            let alert, textElement;
            if (type === 'success') {
                alert = alertSuccess;
                textElement = document.getElementById('alertSuccessText');
            } else if (type === 'error') {
                alert = alertError;
                textElement = document.getElementById('alertErrorText');
            } else {
                alert = alertInfo;
                textElement = document.getElementById('alertInfoText');
            }

            textElement.textContent = message;
            alert.classList.add('show');

            // Auto hide after 5 seconds
            setTimeout(() => {
                alert.classList.remove('show');
            }, 5000);
        }

        // Resend OTP
        resendBtn.addEventListener('click', () => {
            // Reset timer
            clearInterval(timerInterval);
            timeLeft = 120;
            timerDisplay.classList.remove('timer-expired');
            resendBtn.disabled = true;
            startTimer();

            // Clear inputs
            clearOTP();

            // Simulate sending new code
            showAlert('info', 'کد تایید جدید به شماره شما ارسال شد');

            // In real app, call API here
            console.log('Resending OTP to:', phoneNumber);
        });

        // Form Submit
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const otpValue = getOTPValue();

            // Validate
            if (otpValue.length !== 5) {
                showAlert('error', 'لطفاً تمام ۵ رقم کد را وارد کنید');
                showErrorOTP();
                return;
            }

            if (timeLeft <= 0) {
                showAlert('error', 'زمان کد تایید به پایان رسیده است. لطفاً کد جدید درخواست کنید.');
                return;
            }

            // Show loading
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                // In real app, verify OTP with server
                console.log('Verifying OTP:', otpValue);

                // Simulate successful verification
                const isValid = true; // In real app, check server response

                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;

                if (isValid) {
                    showAlert('success', 'کد تایید با موفقیت ثبت شد! در حال انتقال...');
                    clearInterval(timerInterval);

                    // Redirect after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = 'dashbord.html';
                    }, 1500);
                } else {
                    showAlert('error', 'کد وارد شده نامعتبر است. لطفاً دوباره تلاش کنید.');
                    showErrorOTP();
                    clearOTP();
                }
            }, 1500);
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(timerInterval);
        });
    