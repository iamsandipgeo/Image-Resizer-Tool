// JavaScript for Image Resizer Tool
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const previewImage = document.getElementById('preview');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const unitSelect = document.getElementById('unit');
const dpiInput = document.getElementById('dpi');
const bgColorInput = document.getElementById('bg-color');
const formatSelect = document.getElementById('format');
const sizeKbInput = document.getElementById('size-kb');
const downloadBtn = document.getElementById('download-btn');
const imageSizeDisplay = document.getElementById('image-size');

let originalImage = null;

// Load image when file is selected
fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            imagePreview.style.display = 'block';
            originalImage = new Image();
            originalImage.src = e.target.result;

            // Display image size
            const fileSize = (file.size / 1024).toFixed(2); // Convert to KB
            imageSizeDisplay.textContent = `Image Size: ${fileSize} KB`;
        };
        reader.readAsDataURL(file);
    }
});

// Function to adjust image quality to match target size
function adjustQualityToTargetSize(canvas, mimeType, targetSizeKB) {
    let quality = 1.0;
    let step = 0.1;
    let dataUrl;

    do {
        dataUrl = canvas.toDataURL(mimeType, quality);
        const fileSizeKB = (dataUrl.length / 1024).toFixed(2);

        if (fileSizeKB <= targetSizeKB) break; // Stop if target size is reached

        quality -= step; // Reduce quality
    } while (quality > 0);

    return dataUrl;
}

// Download resized image
downloadBtn.addEventListener('click', function () {
    if (!originalImage) {
        alert('Please upload an image first.');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate dimensions based on unit
    let width = parseInt(widthInput.value);
    let height = parseInt(heightInput.value);
    const unit = unitSelect.value;
    const dpi = parseInt(dpiInput.value);

    if (unit === 'cm') {
        width = (width * dpi) / 2.54;
        height = (height * dpi) / 2.54;
    } else if (unit === 'in') {
        width = width * dpi;
        height = height * dpi;
    }

    canvas.width = width;
    canvas.height = height;

    // Set background color
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(originalImage, 0, 0, width, height);

    // Get the selected format
    const format = formatSelect.value;
    let mimeType = 'image/png';
    if (format === 'jpeg' || format === 'jpg') mimeType = 'image/jpeg';
    else if (format === 'webp') mimeType = 'image/webp';

    // Adjust image quality to match target size
    let dataUrl;
    if (sizeKbInput.value) {
        const targetSizeKB = parseFloat(sizeKbInput.value);
        dataUrl = adjustQualityToTargetSize(canvas, mimeType, targetSizeKB);
    } else {
        dataUrl = canvas.toDataURL(mimeType);
    }

    // Create a download link
    const link = document.createElement('a');
    link.download = `resized-image.${format}`;
    link.href = dataUrl;
    link.click();

    // Display the size of the downloaded image
    const fileSize = (dataUrl.length / 1024).toFixed(2); // Convert to KB
    imageSizeDisplay.textContent = `Downloaded Image Size: ${fileSize} KB`;
});
