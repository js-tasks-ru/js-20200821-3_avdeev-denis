import fetchJson from './fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';

export default class ImageUploader {
    async upload(file) {
        const formData = new FormData();

        formData.append('image', file);

        try {
            return await fetchJson('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    'authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                },
                body: formData,
            });
        } catch(err) {
            throw new Error(err);
        }
    }
}
