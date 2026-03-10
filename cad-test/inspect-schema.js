const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function inspectFeatures() {
    const accessKey = process.env.ONSHAPE_ACCESS_KEY;
    const secretKey = process.env.ONSHAPE_SECRET_KEY;
    const auth = Buffer.from(`${accessKey}:${secretKey}`).toString('base64');

    try {
    const did = '85333270b6ec216eeb0394e0';
    const wid = 'abc0cac81d63d54480ebba61';
    const eid = 'eab4cdbd2be8b97a921c818b';
        
        // 3. Get Features
        const url = `https://cad.onshape.com/api/partstudios/d/${did}/w/${wid}/e/${eid}/features`;
        console.log(`Getting features from: ${url}`);
        const features = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        console.log("FEATURE SCHEMA INSPECTION:");
        console.log(JSON.stringify(features.data, null, 2));

    } catch (error) {
        console.error("Inspection failed:", error.response?.data || error.message);
    }
}

inspectFeatures();
