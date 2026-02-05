// using native fetch (Node 18+)

const BASE_URL = 'http://localhost:5000/api/v1';
const LOGIN_URL = `${BASE_URL}/auth/login`;

async function testLogin() {
    console.log(`Testing Login API: ${LOGIN_URL}`);
    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'buyer@gmail.com',
                password: 'buyer123',
            }),
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ Login Verified Successfully!');
        } else {
            console.error('❌ Login Failed');
        }
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        console.log('Ensure the API server is running on port 5000');
    }
}

testLogin();
