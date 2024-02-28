window.onload = () => {
    const otpInputs = Array.from(document.querySelectorAll('.otp-input'));
    otpInputs.forEach((input, index) => {
        input.addEventListener('paste', (event) => {
            event.preventDefault();
            const pasteData = event.clipboardData.getData('text');
            for (let i = 0; i < otpInputs.length; i++) {
                otpInputs[i].value = pasteData[i] || '';
                otpInputs[i].classList.add('opt-active');
            }
        });

        input.addEventListener('keyup', (event) => {
            if (event.target.value.length === 1) {
                if (index !== otpInputs.length - 1) otpInputs[index + 1].focus();
                event.target.classList.add('opt-active');
            }

            else if (event.key === 'Backspace' || event.key === 'Delete') {
                if (index !== 0) otpInputs[index - 1].focus();
                event.target.classList.remove('opt-active');
            }
        });
    });
}

window.onsubmit = async (event) => {
    event.preventDefault();
    document.getElementById('error').innerText = '';

    const eventid = document.getElementById('EventId').innerText;
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const code = document.querySelectorAll('.otp-input')

    const otpInputs = Array.from(code)
    const eventcode = otpInputs.map(input => input.value).join('');

    let value = {};
    if (otpInputs.length > 0) value = { username: username.value, eventcode, eventid };
    else value = { username: username.value, password: password.value };
    
    const error = document.getElementById('error');
    const response = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
        redirect: 'follow'
    }); const data = await response.json();

    username.classList.replace('border-red-500', 'border-gray-300');
    if (password) password.classList.replace('border-red-500', 'border-gray-300');
    else otpInputs.forEach(input => input.classList.replace('border-red-500', 'border-gray-300'));
    error.innerText = "";

    setTimeout(() => {
        if (data.statusCode !== 200) {

            username.classList.add('border-red-500');
            if (password) password.classList.add('border-red-500');
            else otpInputs.forEach(input => input.classList.add('border-red-500'));
            error.innerText = data.message;

            setTimeout(() => {
                username.classList.replace('border-red-500', 'border-gray-300');
                if (password) password.classList.replace('border-red-500', 'border-gray-300');
                else otpInputs.forEach(input => input.classList.replace('border-red-500', 'border-gray-300'));
                event.target.reset();
                error.innerText = '';
            }, 10000);

        } else {
            error.innerText = '';
            username.classList.replace('border-red-500', 'border-green-300');
            if (password) password.classList.replace('border-red-500', 'border-green-300');
            else otpInputs.forEach(input => input.classList.replace('border-red-500', 'border-green-300'));

            if (data.statusCode === 200) {
                event.target.reset();
                window.location.href = `/`;
            }
        }
    }, 500);
}

