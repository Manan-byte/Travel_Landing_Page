// Mengimpor 'node-fetch' untuk membuat permintaan HTTP dari server
const fetch = require('node-fetch');

// Ini adalah fungsi utama yang akan dijalankan oleh Netlify
exports.handler = async function(event, context) {
    // 1. Menerima data dari website (index.html)
    // event.body berisi data yang dikirim, yaitu tujuan dan durasi
    try {
        const { destination, duration } = JSON.parse(event.body);
        
        // 2. Mengambil API Key secara aman dari Netlify Environment Variables
        // API Key Anda tidak pernah terlihat di browser pengunjung
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("API Key tidak dikonfigurasi di server.");
        }

        // 3. Mempersiapkan dan mengirim permintaan ke Google Gemini API
        
        const apiUrl = `https://.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;


generativelanguage
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
            throw new Error(`Google API Error: ${response.statusText}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        // 4. Mengirim kembali hasil dari Gemini ke website (index.html)
        if (candidate && candidate.content?.parts?.[0]?.text) {
             let generatedHtml = candidate.content.parts[0].text;
             generatedHtml = generatedHtml.replace(/```html/g, '').replace(/```/g, '');
             return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html: generatedHtml }),
            };
        } else {
            throw new Error("Struktur respons dari API tidak valid.");
        }

    } catch (error) {
        // Jika terjadi error, kirim pesan error kembali ke website
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: error.message }),
        };
    }
};