// Simple test to check if the server endpoints work
const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing backend endpoints...\n');

  try {
    // Test main endpoint
    console.log('1. Testing main endpoint /');
    const mainTest = await testEndpoint('/');
    console.log(`Status: ${mainTest.status}`);
    console.log(`Response: ${mainTest.data}\n`);

    // Test employees endpoint
    console.log('2. Testing /api/employees');
    const employeesTest = await testEndpoint('/api/employees');
    console.log(`Status: ${employeesTest.status}`);
    console.log(`Response: ${employeesTest.data}\n`);

    // Test attendance endpoint
    console.log('3. Testing /api/attendance');
    const attendanceTest = await testEndpoint('/api/attendance');
    console.log(`Status: ${attendanceTest.status}`);
    console.log(`Response: ${attendanceTest.data}\n`);

    // Test leaves endpoint
    console.log('4. Testing /api/leaves');
    const leavesTest = await testEndpoint('/api/leaves');
    console.log(`Status: ${leavesTest.status}`);
    console.log(`Response: ${leavesTest.data}\n`);

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    console.log('\n💡 Make sure your backend server is running on port 8000');
    console.log('Run: cd backend && npm start');
  }
}

runTests();