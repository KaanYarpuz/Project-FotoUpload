document.getElementById('UploadAdmin').onclick = async () => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const photo = document.getElementById('photo').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('photo', photo);

    const request = await fetch('/api/events', {
        method: 'POST',
        body: formData,
    }); const response = await request.json();

    if (response.statusCode === 200) {
        window.location.href = '/';
    } else {
        console.error('Failed to create event');
    }

};
