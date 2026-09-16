const http = require('http');
const UripGetContact = require('urip-getcontact');

const server = http.createServer(async (req, res) => {
    // Header agar output dibaca sebagai JSON
    res.setHeader('Content-Type', 'application/json');

    // Contoh: Mengambil nomor telepon dari parameter URL (misal: /api?phone=081218111154)
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    const phoneNumber = urlParams.searchParams.get('phone') || "081218111154";

    const getContact = new UripGetContact(
        "bezQlo44aa7aa10a94d7477ff23827e230497ed83e74317005a0cf0a81",
        "ee1869a18df98108e4adf7f65613c1df672764cb9b950dd5acef2f366a07045a"
    );

    try {
        const data = await getContact.checkNumber(phoneNumber);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data: data }, null, 2));
    } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: err.message || err }, null, 2));
    }
});

// Vercel akan otomatis mengatur port melalui process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
