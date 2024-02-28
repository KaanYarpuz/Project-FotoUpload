window.onsubmit = async (event) => {
    event.preventDefault();
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const error = document.getElementById("error")

    const value = { username: username.value, password: password.value };

    const request = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
    });
    const response = await request.json();

    setTimeout(() => {
        if (response.statusCode == 200) {

            error.innerText = '';
            username.classList.replace('border-red-500', 'border-green-300');
            password.classList.replace('border-red-500', 'border-green-300');

            event.target.reset();
            window.location.href = '/';
        } else {

            error.innerText = response.message;
            username.classList.add('border-red-500');
            if (password) password.classList.add('border-red-500');

            setTimeout(() => {
                username.classList.replace('border-red-500', 'border-gray-300');
                if (password) password.classList.replace('border-red-500', 'border-gray-300');
                error.innerText = '';
                event.target.reset();
            }, 10000);
        }
    }, 500);


}