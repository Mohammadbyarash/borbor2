// Hamburger Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
}

// Photo upload preview
document.getElementById('photoUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        if (file.size > 2 * 1024 * 1024) {
            alert('حجم فایل نباید بیشتر از 2 مگابایت باشد!');
            this.value = '';
            return;
        }

        // Check file type
        if (!file.type.match('image.*')) {
            alert('لطفاً یک فایل تصویری انتخاب کنید!');
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const uploadLabel = document.getElementById('photoUploadLabel');
            const uploadIcon = document.getElementById('uploadIcon');
            
            // Check if preview image already exists
            let previewImg = uploadLabel.querySelector('.photo-preview');
            if (!previewImg) {
                previewImg = document.createElement('img');
                previewImg.className = 'photo-preview';
                uploadLabel.insertBefore(previewImg, uploadIcon);
            }
            
            previewImg.src = event.target.result;
            uploadIcon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// Form submission
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }

    const formData = new FormData(e.target);
    const userData = {};
    
    for (let [key, value] of formData.entries()) {
        if (key !== 'photo') {
            userData[key] = value;
        }
    }

    // Create user info text for modal
    const userInfoText = `
        <strong>نام:</strong> ${userData.firstName} ${userData.lastName}<br>
        <strong>نقش:</strong> ${userData.role}<br>
        <strong>کد ملی:</strong> ${userData.nationalId}<br>
        <strong>شماره موبایل:</strong> ${userData.phone}
    `;

    document.getElementById('userInfoText').innerHTML = userInfoText;
    document.getElementById('successModal').classList.add('active');

    // Here you would typically send the data to your backend
    console.log('User Data:', userData);

    // Save to localStorage (for demo purposes)
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
        ...userData,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));
});

// Validate form
function validateForm() {
    const nationalId = document.querySelector('input[name="nationalId"]').value;
    const phone = document.querySelector('input[name="phone"]').value;
    const birthDate = document.querySelector('input[name="birthDate"]').value.trim();

    // Validate national ID
    if (nationalId.length !== 10) {
        alert('کد ملی باید 10 رقم باشد!');
        return false;
    }

    // Validate phone number
    if (!phone.match(/^09[0-9]{9}$/)) {
        alert('شماره موبایل معتبر نیست! فرمت صحیح: 09xxxxxxxxx');
        return false;
    }

    // Validate birth date - check if not empty
    if (!birthDate || birthDate === '') {
        alert('لطفاً تاریخ تولد را انتخاب کنید!');
        return false;
    }

    // More flexible date validation - accept Persian numbers and various separators
    // Convert Persian numbers to English
    let normalizedDate = birthDate;
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    for (let i = 0; i < persianNumbers.length; i++) {
        normalizedDate = normalizedDate.split(persianNumbers[i]).join(englishNumbers[i]);
    }
    
    // Remove extra spaces
    normalizedDate = normalizedDate.replace(/\s+/g, '');
    
    // Check format (accept both / and - as separator, and 1 or 2 digit months/days)
    if (!normalizedDate.match(/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/)) {
        alert('فرمت تاریخ تولد صحیح نیست! مثال: 1380/05/15');
        return false;
    }

    return true;
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
    resetForm();
    
    // Optionally redirect to users page
    // window.location.href = '../html/users.html';
}

// Reset form
function resetForm() {
    document.getElementById('addUserForm').reset();
    
    // Reset photo preview
    const previewImg = document.querySelector('.photo-preview');
    if (previewImg) {
        previewImg.remove();
    }
    document.getElementById('uploadIcon').style.display = 'block';
}

// Close modal on background click
document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeSuccessModal();
    }
});

// Validate national ID input (only numbers)
document.querySelector('input[name="nationalId"]').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    
    // Real-time validation feedback
    if (this.value.length === 10) {
        this.style.borderColor = '#27AE60';
    } else if (this.value.length > 0) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

// Validate phone number input (only numbers)
document.querySelector('input[name="phone"]').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    
    // Real-time validation feedback
    if (this.value.match(/^09[0-9]{9}$/)) {
        this.style.borderColor = '#27AE60';
    } else if (this.value.length > 0) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

// Initialize Persian Date Picker
$(document).ready(function() {
    $('#birthDateInput').persianDatepicker({
        initialValue: false,
        format: 'YYYY/MM/DD',
        autoClose: true,
        calendar: {
            persian: {
                locale: 'fa',
                showHint: true,
                leapYearMode: 'algorithmic'
            }
        },
        navigator: {
            enabled: true,
            scroll: {
                enabled: true
            },
            text: {
                btnNextText: '<',
                btnPrevText: '>'
            }
        },
        toolbox: {
            enabled: true,
            calendarSwitch: {
                enabled: false
            },
            todayButton: {
                enabled: true,
                text: {
                    fa: 'امروز'
                }
            },
            submitButton: {
                enabled: true,
                text: {
                    fa: 'تایید'
                }
            },
            cancelButton: {
                enabled: true,
                text: {
                    fa: 'انصراف'
                }
            }
        },
        dayPicker: {
            enabled: true,
            titleFormat: 'YYYY MMMM'
        },
        onSelect: function(unix) {
            // Update border color when date is selected
            $('#birthDateInput').css('border-color', '#27AE60');
        }
    });
});

// Birth date validation (removed strict regex check)
document.querySelector('input[name="birthDate"]').addEventListener('change', function(e) {
    // Real-time validation feedback - just check if value exists
    if (this.value && this.value.trim() !== '') {
        this.style.borderColor = '#27AE60';
    } else if (this.value.length > 0) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

// Email validation
document.querySelector('input[name="email"]').addEventListener('blur', function(e) {
    if (this.value && !this.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        this.style.borderColor = '#e74c3c';
        alert('فرمت ایمیل صحیح نیست!');
    } else if (this.value) {
        this.style.borderColor = '#27AE60';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

// Form field animations on focus
document.querySelectorAll('.form-input, .form-select').forEach(field => {
    field.addEventListener('focus', function() {
        this.parentElement.querySelector('.form-label').style.color = '#3498DB';
    });

    field.addEventListener('blur', function() {
        this.parentElement.querySelector('.form-label').style.color = 'white';
    });
});

// Prevent form submission on Enter key (except in textarea)
document.getElementById('addUserForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// Auto-capitalize first letter of name fields
document.querySelectorAll('input[name="firstName"], input[name="lastName"]').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value) {
            this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
        }
    });
});