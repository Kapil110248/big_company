// Test login endpoint
const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:9000/store/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: '250788100001',
                password: '1234'
            })
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};

testLogin();
