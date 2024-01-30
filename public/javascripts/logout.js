window.onload = () => {

    const button = document.getElementById('logout');
    button.onclick = async () => {
        const response = await fetch('/api/logout', {
            method: 'GET', headers: { 'Content-Type': 'application/json' },
            redirect: 'follow'
        }); const data = await response.json();

        if (data.statusCode === 200) {
            window.location.href = `/login`;
        }
    }
}

