const http = require('http');

function sendPostRequest(postData, options) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                if (res.statusCode === 200) {
                    resolve({ success: true, responseTime });
                } else {
                    reject({ success: false, statusCode: res.statusCode, responseTime });
                }
            });
        });

        req.on('error', (e) => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: e.message, responseTime });
        });

        req.write(postData);
        req.end();
    });
}

async function batchRequests(totalRequests, batchSize, delayBetweenBatches) {
    const apiUrl = 'Server_baseUrl';
    const postData = JSON.stringify({
        title: "hello this is 1",
        content: "this is dev"
    });

    const options = {
        hostname: apiUrl,
        port: 4000,
        path: '/create-post',
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    let failureCount = 0;
    let totalResponseTime = 0;

    for (let i = 0; i < totalRequests; i += batchSize) {
        const promises = [];
        const endBatch = Math.min(i + batchSize, totalRequests);

        for (let j = i; j < endBatch; j++) {
            promises.push(sendPostRequest(postData, options));
        }

        try {
            const results = await Promise.allSettled(promises);
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    totalResponseTime += result.value.responseTime;
                    console.log(`Response time for request: ${result.value.responseTime}ms`);
                } else {
                    failureCount += 1;
                    console.error(`Request failed. Response time: ${result.reason.responseTime}ms`);
                }
            });
        } catch (error) {
            console.error('Error processing batch:', error);
        }

        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }

    console.log(`Total requests: ${totalRequests}`);
    console.log(`Total failures: ${failureCount}`);
    console.log(`Average response time: ${totalResponseTime / (totalRequests - failureCount)}ms`);
}

// Running 50,000 requests with batches of 100 and 500ms delay between batches
batchRequests(25000, 1000, 0);
