document.addEventListener("DOMContentLoaded", () => {
  // Enhanced validation patterns
  const VALIDATION_PATTERNS = {
    name: /^[a-zA-Z\s.'-]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[6-9]\d{9}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    pincode: /^[1-9]\d{5}$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    username: /^[a-zA-Z0-9_]{4,20}$/
  };

  // Custom validation messages
  const VALIDATION_MESSAGES = {
    required: field => `${field} is required`,
    invalid: (field, type) => {
      const messages = {
        name: 'Name should contain 2-50 letters, spaces, hyphens, and apostrophes only',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid 10-digit phone number starting with 6-9',
        password: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
        pincode: 'Please enter a valid 6-digit pincode',
        url: 'Please enter a valid URL',
        username: 'Username must be 4-20 characters long and can only contain letters, numbers, and underscores'
      };
      return messages[type] || `Please enter a valid ${field}`;
    },
    minLength: (field, min) => `${field} must be at least ${min} characters long`,
    maxLength: (field, max) => `${field} cannot exceed ${max} characters`,
    minValue: (field, min) => `${field} must be at least ${min}`,
    maxValue: (field, max) => `${field} cannot be greater than ${max}`,
    fileType: types => `Invalid file type. Allowed: ${types.join(', ')}`,
    futureDate: field => `${field} cannot be in the past`
  };

  // Show error message
  function showError(input, message) {
    removeError(input);
    input.classList.add('error');
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff4d6d';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '4px';
    input.parentNode.insertBefore(errorElement, input.nextSibling);
    input.focus();
  }

  // Remove error
  function removeError(input) {
    input.classList.remove('error');
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) errorElement.remove();
  }

  // Validate individual field
  function validateField(input) {
    const value = input.value.trim();
    const type = input.dataset.validate || input.type;
    const required = input.hasAttribute('required');
    removeError(input);

    if (required && !value) {
      showError(input, VALIDATION_MESSAGES.required(input.placeholder || input.name));
      return false;
    }
    if (!value && !required) return true;

    switch (type) {
      case 'text':
        if (input.dataset.pattern && !new RegExp(input.dataset.pattern).test(value)) {
          showError(input, input.dataset.message || 'Invalid format');
          return false;
        }
        if (input.name.toLowerCase().includes('name') && !VALIDATION_PATTERNS.name.test(value)) {
          showError(input, VALIDATION_MESSAGES.invalid('Name', 'name'));
          return false;
        }
        break;
      case 'email':
        if (!VALIDATION_PATTERNS.email.test(value)) {
          showError(input, VALIDATION_MESSAGES.invalid('Email', 'email'));
          return false;
        }
        break;
      case 'tel':
        if (!VALIDATION_PATTERNS.phone.test(value)) {
          showError(input, VALIDATION_MESSAGES.invalid('Phone', 'phone'));
          return false;
        }
        break;
      case 'password':
        if (!VALIDATION_PATTERNS.password.test(value)) {
          showError(input, VALIDATION_MESSAGES.invalid('Password', 'password'));
          return false;
        }
        break;
      case 'url':
        if (!VALIDATION_PATTERNS.url.test(value)) {
          showError(input, VALIDATION_MESSAGES.invalid('URL', 'url'));
          return false;
        }
        break;
      case 'date':
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (input.hasAttribute('data-future-date') && selectedDate < today) {
          showError(input, VALIDATION_MESSAGES.futureDate(input.placeholder || 'Date'));
          return false;
        }
        break;
      case 'file':
        if (input.files.length > 0) {
          const allowedTypes = input.dataset.fileTypes ? input.dataset.fileTypes.split(',').map(t => t.trim().toLowerCase()) : ['pdf','doc','docx','txt'];
          const fileExt = input.files[0].name.split('.').pop().toLowerCase();
          if (!allowedTypes.includes(fileExt)) {
            showError(input, VALIDATION_MESSAGES.fileType(allowedTypes));
            input.value = '';
            return false;
          }
        }
        break;
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          showError(input, 'Please enter a valid number');
          return false;
        }
        if (input.hasAttribute('min') && num < parseFloat(input.min)) {
          showError(input, VALIDATION_MESSAGES.minValue(input.placeholder || 'Value', input.min));
          return false;
        }
        if (input.hasAttribute('max') && num > parseFloat(input.max)) {
          showError(input, VALIDATION_MESSAGES.maxValue(input.placeholder || 'Value', input.max));
          return false;
        }
        break;
      case 'select-one':
        if (required && value === '') {
          showError(input, `Please select a ${input.name || 'value'}`);
          return false;
        }
        break;
      case 'textarea':
        if (required && value.length < 10) {
          showError(input, VALIDATION_MESSAGES.minLength('Message', 10));
          return false;
        }
        break;
    }

    if (input.hasAttribute('minlength') && value.length < parseInt(input.minLength)) {
      showError(input, VALIDATION_MESSAGES.minLength(input.placeholder || 'Field', input.minLength));
      return false;
    }
    if (input.hasAttribute('maxlength') && value.length > parseInt(input.maxLength)) {
      showError(input, VALIDATION_MESSAGES.maxLength(input.placeholder || 'Field', input.maxLength));
      return false;
    }

    return true;
  }

  // Validate entire form
  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => { if (!validateField(input)) isValid = false; });
    return isValid;
  }

  // Initialize forms
  const forms = ['writerForm','contactForm','orderForm','requestForm'].map(id => document.getElementById(id));

  forms.forEach(form => {
    if (!form) return;
    form.setAttribute('novalidate','');

    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      if (input.type !== 'file') {
        input.addEventListener('input', () => {
          input.value.trim() ? validateField(input) : removeError(input);
        });
      }
      input.addEventListener('blur', () => validateField(input));
    });

    form.addEventListener('submit', e => {
  if (!validateForm(form)) {
    e.preventDefault();
    return;
  }
});

  });

  // Auto-format phone numbers
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g,'').slice(0,10);
      e.target.value = val;
      val ? validateField(e.target) : removeError(e.target);
    });
  });

  // Add visual asterisk for required fields
  document.querySelectorAll('[required]').forEach(field => {
    if (!field.labels) return;
    const label = field.labels[0];
    if (label && !label.querySelector('.required-asterisk')) {
      const asterisk = document.createElement('span');
      asterisk.className = 'required-asterisk';
      asterisk.textContent = ' *';
      asterisk.style.color = '#ff4d6d';
      label.appendChild(asterisk);
    }
  });
});
