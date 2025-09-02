// Import fetch jika Anda menggunakan versi Node.js yang lebih lama di Netlify
// Untuk versi terbaru, fetch sudah built-in.
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Hanya izinkan metode POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { destination, duration } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY; // Ambil API key dari environment variable

        if (!apiKey) {
            throw new Error("API Key tidak ditemukan.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const prompt = `
            Anda adalah seorang ahli travel di Indonesia. Buatkan rencana perjalanan wisata di "${destination}" selama ${duration} hari.
            Tolong berikan jawaban dalam format HTML yang rapi dan menarik.
            Struktur jawaban harus seperti ini:
            - Gunakan <h3> untuk judul utama seperti "Rencana Perjalanan ${duration} Hari di ${destination}".
            - Gunakan <h4> untuk setiap judul hari (contoh: "Hari 1: Eksplorasi Kota").
            - Gunakan <ul> untuk daftar kegiatan dan <li> untuk setiap item kegiatan.
            - Setiap item kegiatan harus menyertakan nama tempat dalam format <strong>Nama Tempat</strong> dan diikuti deskripsi singkat tentang apa yang bisa dilakukan di sana.
            - Fokus pada tempat wisata populer, kuliner khas yang wajib dicoba, dan aktivitas menarik yang relevan dengan budaya lokal.
            - Berikan saran praktis jika ada, seperti waktu terbaik untuk berkunjung.
            - Pastikan outputnya hanya kode HTML, tanpa markdown seperti \`\`\`html atau \`\`\`.
        `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return { statusCode: response.status, body: response.statusText };
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
             let generatedHtml = candidate.content.parts[0].text;
             generatedHtml = generatedHtml.replace(/```html/g, '').replace(/```/g, '');
             return {
                statusCode: 200,
                body: JSON.stringify({ html: generatedHtml }),
            };
        } else {
            throw new Error("Struktur respons dari API tidak valid.");
        }

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
