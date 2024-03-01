const unregister = async () => {
    const userid = document.getElementById('userid').innerText;

    const confirmed = confirm(`Weet je zeker dat je je account wilt verwijderen? Alle gegevens worden verwijderd en kunnen niet worden hersteld, inclusief aangemaate evenementen en geüploade foto's. Dit kan niet ongedaan worden gemaakt.`);
    if (!confirmed) {
        return;
    }

    const request = await fetch('/api/register', {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid })
    });
    const response = await request.json();

    if (response.statusCode == 200) {
        window.location.href = '/';
    }
};

const unregisterButton = document.getElementById('unregister');
unregisterButton.onclick = unregister;
