let currentMode = 'draw';
let currentColor = '#333333';
let currentBackground = '#DDDDDD';
let gridVisible = true;
let currentGridColor = '#BCB9B9';
let currentGridSize = 25;

function setMode(mode) {
    currentMode = mode;
    document.getElementById('draw').classList.toggle('active', mode === 'draw');
    document.getElementById('eraser').classList.toggle('active', mode === 'erase');
}

function setColor(color) {
    currentColor = color;
    document.getElementById('custom-color').value = color;
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.style.backgroundColor === color);
    });
    setMode('draw');
}

function updateGridColor(color) {
    currentGridColor = color;
    if (gridVisible) {
        document.querySelectorAll('.grid-square').forEach(square => {
            square.style.border = `1px solid ${color}`;
        });
    }
}

function toggleGrid() {
    gridVisible = !gridVisible;
    document.querySelectorAll('.grid-square').forEach(square => {
        square.style.border = gridVisible ? `1px solid ${currentGridColor}` : 'none';
    });
}

function changeBackgroundColor(color) {
    document.getElementById('container').style.backgroundColor = color;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxSize = 1920;
                let width = img.width;
                let height = img.height;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                const highQualityImage = canvas.toDataURL('image/jpeg', 0.9);
                
                currentBackground = highQualityImage;
                document.getElementById('container').style.backgroundImage = `url(${highQualityImage})`;
                
                const preview = document.getElementById('imagePreview');
                preview.src = highQualityImage;
                preview.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function removeBackground() {
    currentBackground = null;
    document.getElementById('container').style.backgroundImage = 'none';
    document.getElementById('imagePreview').style.display = 'none';
}

function createGrid(size) {
    const container = document.getElementById('container');
    container.innerHTML = '';
    currentGridSize = size;
    
    const squareSize = 960 / size;
    
    for (let i = 0; i < size * size; i++) {
        const square = document.createElement('div');
        square.classList.add('grid-square');
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        if (gridVisible) {
            square.style.border = `1px solid ${currentGridColor}`;
        }
        
        square.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1) {
                if (currentMode === 'draw') {
                    square.style.backgroundColor = currentColor;
                    square.classList.remove('erased');
                } else {
                    square.classList.add('erased');
                    square.style.backgroundColor = 'transparent';
                }
            }
        });
        
        square.addEventListener('mousedown', () => {
            if (currentMode === 'draw') {
                square.style.backgroundColor = currentColor;
                square.classList.remove('erased');
            } else {
                square.classList.add('erased');
                square.style.backgroundColor = 'transparent';
            }
        });

        container.appendChild(square);
    }
}

function changeGridSize() {
    let newSize = prompt('Enter number of squares per side (max 100):');
    newSize = parseInt(newSize);
    
    if (newSize && newSize > 0 && newSize <= 100) {
        createGrid(newSize);
    } else {
        alert('Please enter a valid number between 1 and 100');
    }
}

async function downloadAsJPG() {
    const container = document.getElementById('container');
    const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
    });
    
    const link = document.createElement('a');
    link.download = 'sketch.jpg';
    link.href = canvas.toDataURL('image/jpeg', 1.0);
    link.click();
}
// // Grid lines are visible in favicon
// async function downloadAsFavicon() {
//     const container = document.getElementById('container');
//     const canvas = await html2canvas(container, {
//         scale: 1,
//         useCORS: true,
//         backgroundColor: null
//     });
    
//     const faviconCanvas = document.createElement('canvas');
//     const ctx = faviconCanvas.getContext('2d');
//     faviconCanvas.width = 32;
//     faviconCanvas.height = 32;
    
//     ctx.drawImage(canvas, 0, 0, 32, 32);
    
//     const link = document.createElement('a');
//     link.download = 'favicon.ico';
//     link.href = faviconCanvas.toDataURL('image/x-icon');
//     link.click();
// }
async function downloadAsFavicon() {
    const container = document.getElementById('container');
    const squares = container.querySelectorAll('.grid-square');
    
    // Temporarily hide grid lines
    const wasGridVisible = gridVisible;
    if (wasGridVisible) {
        squares.forEach(square => {
            square.style.border = 'none';
        });
    }
    
    // Capture the image at higher resolution
    const canvas = await html2canvas(container, {
        scale: 4, // Increased scale for better quality
        useCORS: true,
        backgroundColor: null,
        logging: false,
        renderScale: 2 // Additional scaling factor
    });
    
    // Restore grid lines if they were visible
    if (wasGridVisible) {
        squares.forEach(square => {
            square.style.border = `1px solid ${currentGridColor}`;
        });
    }
    
    // Create multiple sizes for the favicon (common favicon sizes)
    const sizes = [16, 32, 48];
    const faviconCanvas = document.createElement('canvas');
    const ctx = faviconCanvas.getContext('2d');
    
    // Use the largest size as the base
    faviconCanvas.width = Math.max(...sizes);
    faviconCanvas.height = Math.max(...sizes);
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw with composition mode for better color blending
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(canvas, 0, 0, faviconCanvas.width, faviconCanvas.height);
    
    // final output
    const link = document.createElement('a');
    link.download = 'favicon.ico';
    link.href = faviconCanvas.toDataURL('image/x-icon', 1.0); // Maximum quality
    link.click();
}

createGrid(25);
document.getElementById('container').style.backgroundColor = currentBackground;
document.addEventListener('dragstart', (e) => e.preventDefault());