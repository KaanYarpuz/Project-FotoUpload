const uploadedFiles = new Set();
let uploadedCount = 0;
const maxUploads = 10;

document.addEventListener('click', (event) => {
  const isImageOrDeleteButton = event.target.closest('.image-container, .delete-button');
  if (!isImageOrDeleteButton) {
    hideAllDeleteButtons();
    removeBlurFromAllImages();
  }
});

function hideAllDeleteButtons() {
  const deleteButtons = document.querySelectorAll('.delete-button');
  deleteButtons.forEach((button) => {
    button.classList.add('hidden');
  });
}

function removeBlurFromAllImages() {
  const images = document.querySelectorAll('.blurred-image');
  images.forEach((image) => {
    image.style.filter = 'none';
  });
}

function handleFileUpload(files) {
  const fileList = document.getElementById('file-list');

  for (const file of files) {
    if (!uploadedFiles.has(file.name) && uploadedCount < maxUploads) {
      const listItem = document.createElement('li');
      listItem.classList.add('w-64', 'relative');
      fileList.style.listStyleType = 'none';

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container', 'relative');

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = 'Preview';
      img.classList.add('w-64', 'h-64', 'object-cover', 'rounded-md', 'mt-2', 'blurred-image');

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('absolute', 'inset-0', 'text-center', 'text-red-500', 'cursor-pointer', 'hidden', 'delete-button');
      deleteButton.onclick = () => deleteImage(listItem, file.name);

      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteButton);
      listItem.appendChild(imgContainer);
      fileList.appendChild(listItem);

      listItem.addEventListener('click', () => {
        // Hide other delete buttons and remove blur from other images
        hideAllDeleteButtons();
        removeBlurFromAllImages();

        deleteButton.classList.toggle('hidden');
        img.style.filter = img.style.filter === 'blur(2px)' ? 'none' : 'blur(2px)';
      });

      uploadedFiles.add(file.name);
      uploadedCount++;
    }
  }
}

function deleteImage(listItem, fileName) {
  listItem.remove();
  uploadedFiles.delete(fileName);
  uploadedCount--;
}

document.getElementById('uploadButton').addEventListener('click', function () {
  const files = document.getElementById('dropzone-file').files;
  const eventid = document.getElementById('eventid').innerText.trim();
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('photos', files[i]);
  }
  fetch(`/api/upload/${eventid}`, {
    method: 'POST', body: formData
  }).then(response => {
    window.location.href = `/`;

    console.log("success")
  }).catch(error => {
    console.log("error")
  });
});
