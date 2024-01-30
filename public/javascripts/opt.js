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
                if (index !== otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
        
                event.target.classList.add('opt-active');
            }
        
            else if (event.key === 'Backspace' || event.key === 'Delete') {
                if (index !== 0) {
                    otpInputs[index - 1].focus();
                }
        
                event.target.classList.remove('opt-active');
            }
        });
    });
}

window.onsubmit = async (event) => {
    event.preventDefault();

    const eventid = document.getElementById('EventId').innerText;
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const code = document.querySelectorAll('.otp-input')

    const otpInputs = Array.from(code)
    const eventcode = otpInputs.map(input => input.value).join('');

    let value = {};

    if (otpInputs.length > 0){
        value = {
            username: username.value,
            eventcode,
            eventid
        };
    } else {
        value = {
            username: username.value,
            password: password.value,
        };
    }


    const response = await fetch('/api/auth', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(value),
        redirect: 'follow'
    }); const data = await response.json();

    
    setTimeout(() => {
        if (data.statusCode === 200) {
            window.location.href = `/`;
        }
    }, 1000);
    
    event.target.reset();
}

