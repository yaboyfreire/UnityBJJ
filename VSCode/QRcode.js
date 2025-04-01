function generateNumber() {
    let randomNumber = Math.floor(100000 + Math.random() * 900000);
    
    // Format number with spaces (e.g., "1 2 3 4 5 6")
    let formattedNumber = randomNumber.toString().split("").join(" ");
    
    // Display the formatted number
    document.getElementById("randomNumber").innerText = formattedNumber;
    
    // Generate QR Code using the plain number (without spaces)
    generateQRCode(randomNumber.toString());
}

function generateQRCode(text) {
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: text,
        width: 150,
        height: 150
    });
}

// Generate a new QR code and number every X seconds
const REFRESH_INTERVAL = 5000; // Change this to set the time (milliseconds)
setInterval(generateNumber, REFRESH_INTERVAL);

// Initial generation when the page loads
generateNumber();
