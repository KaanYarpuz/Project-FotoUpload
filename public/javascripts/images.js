
let page = 1;
let isLoading = false;
let images = [];

const LOAD_DELAY = 200;
const LOAD_TIMEOUT = 1600;
const imageContainer = document.getElementById('imageContainer');
let imageCount = 0;

const loadImages = () => {
    isLoading = true;
    const eventId = document.getElementById("EventId").innerText.trim()

    fetch(`/api/map/${eventId}?page=${page}`).then(response => response.json()).then(event => {
        if (event.statusCode !== 200) return;
        let delay = 0;
        event.data.forEach((image, index) => {
            const div = document.createElement('div');
            imageCount++;
            div.id = `div-${imageCount}`;
            div.classList.add('bg-gray-200', 'h-[10rem]', 'md:h-[19rem]', 'animate-pulse', 'rounded-xl', 'overflow-hidden', 'flex', 'items-center', 'justify-center', 'text-center');
            imageContainer.appendChild(div);

            setTimeout(() => {
                const img = document.createElement('img');
                img.src = image.path;
                div.classList.remove('animate-pulse');
                img.classList.add('snap-center', 'h-full', 'w-full', 'object-cover', 'rounded-xl');
                div.appendChild(img);
            }, delay += LOAD_DELAY);

            setTimeout(() => {
                isLoading = false;
                const images = imageContainer.querySelectorAll('img')
                images.forEach(image => image.onclick = () => window.open(image.src, '_blank'))

                location.href = `#div-${imageCount}`;
                setLoadEvent(images[images.length - 1])
                setLoadEvent(images[images.length - 2])
            }, LOAD_TIMEOUT);
        })
    }).catch(() => console.error('Error:', "Er is iets fout gegaan bij het ophalen van de foto's"));
}

const setLoadEvent = (element) => {
    element.addEventListener('mouseover', loadMoreImages, { passive: true, });
    element.addEventListener('touchstart', loadMoreImages, { passive: true, });
}

const removeLoadEvents = (element) => {
    element.removeEventListener('mouseover', loadMoreImages);
    element.removeEventListener('touchstart', loadMoreImages);
}

const loadMoreImages = (event) => {
    const images = imageContainer.querySelectorAll('img')
    images.forEach(removeLoadEvents);
    if (!isLoading) {
        page++;
        loadImages();
    }
}
loadImages();

document.getElementById('downloadZip').addEventListener('click', async () => {
    alert('Het downloaden van de foto\'s is gestart. Dit kan enkele seconden duren.');
    const eventId = document.getElementById('EventId').innerText.trim();
    window.location.href = `/api/downloadZip/${eventId}`;
});
