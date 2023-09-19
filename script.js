document.addEventListener("DOMContentLoaded", function() {
    const emojiInput = document.getElementById('emojiInput');
    const bgColorInput = document.getElementById('bgColorInput');
    const exportBtn = document.getElementById('exportBtn');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const sizeInput = document.getElementById('sizeInput');

    function getBrightness(hexColor) {
        let rgb = [parseInt(hexColor.substr(1, 2), 16),
            parseInt(hexColor.substr(3, 2), 16),
            parseInt(hexColor.substr(5, 2), 16)];
        return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    }

    function adjustLuminance(hexColor, lum) {
        let rgb = [parseInt(hexColor.substr(1, 2), 16),
            parseInt(hexColor.substr(3, 2), 16),
            parseInt(hexColor.substr(5, 2), 16)];

        for (let i = 0; i < 3; i++) {
            rgb[i] = Math.min(255, Math.max(0, rgb[i] + Math.round(255 * lum)));
            rgb[i] = rgb[i].toString(16);
            if (rgb[i].length < 2) {
                rgb[i] = "0" + rgb[i];
            }
        }

        return "#" + rgb.join("");
    }

    // Function to convert RGB to HSL
    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, l];
    }

    function updateCanvas() {
        const oldCanvas = document.getElementById('dynamicCanvas');
        if (oldCanvas) {
            oldCanvas.remove();
        }

        // Create a new canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'dynamicCanvas';
        const size = parseInt(sizeInput.value);
        canvas.classList.add("rounded", "mx-auto", "d-block");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvasWrapper.appendChild(canvas);

        // Validate input
        const emoji = emojiInput.value;
        if (emoji.length > 4) {
            alert('Please enter an emoji or up to 4 symbols');
            return;
        }

        let mainColor = bgColorInput.value || '#FFFFFF';
        let brightness = getBrightness(mainColor);

        let lumFactor = brightness > 128 ? -0.15 : 0.15;  // Darken if bright, lighten if dark
        let adjustedColor = adjustLuminance(mainColor, lumFactor);

        // Create the gradient
        let grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grd.addColorStop(0, mainColor);
        grd.addColorStop(1, adjustedColor);

        // Fill the background
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const r = parseInt(mainColor.slice(1, 3), 16);
        const g = parseInt(mainColor.slice(3, 5), 16);
        const b = parseInt(mainColor.slice(5, 7), 16);

        // Convert background color to HSL
        const [h, s, l] = rgbToHsl(r, g, b);

        // Adjust lightness for contrast
        const newL = l > 0.5 ? l - 0.4 : l + 0.4;

        // Create the new text color
        // Draw background
        ctx.fillStyle = `hsl(${h * 360}, ${s * 100}%, ${newL * 100}%)`;
        ctx.font = `${size / 2}px Inter`;
        const textMetrics = ctx.measureText(emoji);
        const xCenter = (canvas.width - textMetrics.width) / 2;
        const yCenter = (canvas.height + size / 4) / 2;
        ctx.fillText(emoji, xCenter, yCenter);
        canvas.classList.add("img-fluid", "w-100");
    }

    exportBtn.addEventListener('click', function() {
        // Export to PNG
        const canvas = document.getElementById("dynamicCanvas")
        const imgURL = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = imgURL;
        link.download = 'emoji_image.png';
        link.click();
        canvas.classList.add("img-fluid", "w-100");
    });

    emojiInput.addEventListener('input', updateCanvas);
    bgColorInput.addEventListener('input', updateCanvas);
    sizeInput.addEventListener('input', updateCanvas);

    updateCanvas()
});
