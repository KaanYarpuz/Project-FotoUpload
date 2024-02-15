let page = 1;
let isLoading = false;
let images = [];

const LOAD_DELAY = 400;
const LOAD_TIMEOUT = 4000;
const imageContainer = document.getElementById('imageContainer');

const loadImages = () => {
    isLoading = true;
    const eventId = document.getElementById("EventId").innerText.trim()

    fetch(`/api/map/${eventId}?page=${page}`)
        .then(response => response.json())
        .then(event => {
            let delay = 0;

            event.data.forEach((image, index) => {
                const img = document.createElement('img');
                const div = document.createElement('div');

                div.classList.add('bg-gray-200', 'h-full', 'w-full', 'animate-pulse', 'rounded-xl');
                imageContainer.appendChild(div);

                setTimeout(() => {
                    img.classList.add('snap-center', 'h-full', 'w-full', 'object-cover', 'rounded-xl');
                    img.src = image.path;
                    img.onload = function () {
                        div.classList.remove('animate-pulse');
                        div.appendChild(img);
                    }
                }, delay += LOAD_DELAY);
            })

            images = imageContainer.querySelectorAll('div');

            setLoadEvent(images[images.length - 2]);
            setLoadEvent(images[images.length - 1]);

            setTimeout(() => isLoading = false, LOAD_TIMEOUT);

        }).catch(error => {
            console.error('Error:', error);
        });
}

const setLoadEvent = (element) => {
    element.onmouseover = loadMoreImages;
    element.ontouchstart = loadMoreImages;
}

const loadMoreImages = () => {
    if (!isLoading) {
        page++;
        loadImages();
    }
}
loadImages();

document.getElementById('downloadZip').addEventListener('click', async () => {
    const eventId = document.getElementById('EventId').innerText.trim();
    window.location.href = `/api/downloadZip/${eventId}`;
});
