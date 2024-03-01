document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function () {
        const eventId = this.getAttribute('data-event-id');
        const confirmation = confirm('Weet je zeker dat je dit evenement wilt verwijderen?');
        
        if (confirmation) {
            fetch(`/api/events/${eventId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Event deleted successfully');
                        window.location.reload();
                    } else {
                        console.error('Failed to delete event');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
});

const data = () => {
    const button = document.getElementById("share")
    const url = button.getAttribute('data-event-id').replace("//", "")
    const eventcode = document.getElementById('eventcode').innerText.trim()
    alert(`Deel je link\ ${url}?code=${eventcode}`);
}
