document.getElementById('UploadAdmin').addEventListener('click', function () {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const photo = document.getElementById('photo').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('photo', photo);

    fetch('/api/events', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                console.log('Event created successfully');
                window.location.href = '/';
            } else {
                console.error('Failed to create event');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
