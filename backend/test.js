import fetch from 'node-fetch';

const base = 'http://localhost:7000/api';

async function run() {
  try {
    // register
    const reg = await fetch(`${base}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'TestUser',
        email: 'testuser@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!'
      })
    });
    const regData = await reg.json();
    console.log('register:', regData);

    // login
    const log = await fetch(`${base}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'Password1!'
      })
    });
    const logData = await log.json();
    console.log('login:', logData);

    if (logData.token) {
      const prof = await fetch(`${base}/profile`, {
        headers: {'auth-token': logData.token}
      });
      const profData = await prof.json();
      console.log('profile:', profData);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
