const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function debugAPI() {
    const accessKey = process.env.ONSHAPE_ACCESS_KEY;
    const secretKey = process.env.ONSHAPE_SECRET_KEY;
    
    if (!accessKey || !secretKey) {
        console.error("Missing keys in .env!");
        return;
    }

    const auth = Buffer.from(`${accessKey}:${secretKey}`).toString('base64');
    console.log("Using Basic Auth:", `Basic ${auth.substring(0, 10)}...`);

    const documentId = '69ac7368013efc4f64891644';
    
    try {
        console.log("1. Creating document...");
        const createDoc = await axios.post('https://cad.onshape.com/api/v3/documents', {
            name: `Test_Sketch_${Date.now()}`,
            isPublic: true
        }, { headers: { 'Authorization': `Basic ${auth}` } });
        
        const did = createDoc.data.id;
        const wid = createDoc.data.defaultWorkspace.id;
        console.log(`Doc created: ${did}`);

        console.log("2. Getting Part Studio...");
        const elements = await axios.get(`https://cad.onshape.com/api/v3/documents/d/${did}/w/${wid}/elements`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        const eid = elements.data.find(e => e.elementType === 'PARTSTUDIO').id;
        console.log(`Part Studio: ${eid}`);

        console.log("3. Creating Sketch...");
        const sketchData = {
            feature: {
                btType: "BTMSketch-151",
                featureType: "newSketch",
                name: `Sketch_${Date.now()}`,
                namespace: "",
                suppressed: false,
                nodeId: "",
                returnAfterSubfeatures: false,
                subFeatures: [],
                parameters: [
                    {
                        btType: "BTMParameterQueryList-148",
                        parameterId: "sketchPlane",
                        queries: [
                            {
                                btType: "BTMIndividualQuery-138",
                                geometryIds: ["Top"]
                            }
                        ]
                    }
                ]
            }
        };

        const sketchResponse = await axios.post(`https://cad.onshape.com/api/v3/partstudios/d/${did}/w/${wid}/e/${eid}/features`, sketchData, {
            headers: { 
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        const sketchId = sketchResponse.data.feature.featureId;

        console.log("4. Creating Extrusion...");
        const extrudeData = {
            feature: {
                btType: "BTMFeature-134",
                featureType: "extrude",
                name: `Extrude_${Date.now()}`,
                namespace: "",
                suppressed: false,
                nodeId: "",
                returnAfterSubfeatures: false,
                subFeatures: [],
                parameters: [
                    {
                        btType: "BTMParameterQueryList-148",
                        parameterId: "entities",
                        queries: [
                            {
                                btType: "BTMIndividualCreatedByQuery-137",
                                featureId: sketchId,
                                bodyType: "WIRE",
                                entityType: "EDGE"
                            }
                        ]
                    },
                    {
                        btType: "BTMParameterEnum-145",
                        parameterId: "operationType",
                        enumName: "NewBodyOperationType",
                        value: "NEW"
                    },
                    {
                        btType: "BTMParameterEnum-145",
                        parameterId: "bodyType",
                        enumName: "ExtendedToolBodyType",
                        value: "SOLID"
                    },
                    {
                        btType: "BTMParameterQuantity-147",
                        parameterId: "depth",
                        expression: "50 mm"
                    }
                ]
            }
        };

        const extrudeResponse = await axios.post(`https://cad.onshape.com/api/v3/partstudios/d/${did}/w/${wid}/e/${eid}/features`, extrudeData, {
            headers: { 
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Extrude Response SUCCESS!");
        console.log(`Extrude Feature ID: ${extrudeResponse.data.feature.featureId}`);
        console.log("Sketch Response SUCCESS!");
        console.log("Feature ID:", sketchResponse.data.feature.featureId);

    } catch (error) {
        console.log("ERROR:");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log(error.message);
        }
    }
}

debugAPI();
