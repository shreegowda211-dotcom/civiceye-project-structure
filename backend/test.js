// Use global fetch when available (Node 18+), otherwise dynamically import node-fetch
let fetchFn;
try {
  fetchFn = global.fetch;
} catch (e) {
  fetchFn = undefined;
}

if (!fetchFn) {
  const nf = await import('node-fetch');
  fetchFn = nf.default;
}

const base = 'http://localhost:7000/api';

async function run() {
  try {
    // register
    // register a citizen
    const reg = await fetchFn(`${base}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'TestUser',
        email: 'testuser@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: 'Citizen' // include role for generic endpoint
      })
    });
    const regData = await reg.json();
    console.log('register:', regData);

    // login
    const log = await fetchFn(`${base}/login`, {
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
      const prof = await fetchFn(`${base}/profile`, {
        headers: {'auth-token': logData.token}
      });
      const profData = await prof.json();
      console.log('profile:', profData);
    }

    // now try the same flow as an officer
    const regOff = await fetchFn(`${base}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'OfficerUser',
        email: 'officer@example.com',
        password: 'Off1cerPass!',
        confirmPassword: 'Off1cerPass!',
        role: 'Officer'
      })
    });
    console.log('officer register:', await regOff.json());

    const logOff = await fetchFn(`${base}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'officer@example.com',
        password: 'Off1cerPass!',
        role: 'Officer'
      })
    });
    const logOffData = await logOff.json();
    console.log('officer login:', logOffData);

    if (logOffData.token) {
      const prof2 = await fetchFn(`${base}/profile`, {
        headers: {'auth-token': logOffData.token}
      });
      console.log('officer profile:', await prof2.json());
    }

    // finally, test admin login using static credentials
    const logAdmin = await fetchFn(`${base}/admin/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'shreegowda211@gmail.com',
        password: 'Admin@shree1'
      })
    });
    const adminData = await logAdmin.json();
    console.log('admin login:', adminData);

    if (adminData.token) {
      const profAdmin = await fetchFn(`${base}/admin/profile`, {
        headers: {'auth-token': adminData.token}
      });
      console.log('admin profile:', await profAdmin.json());
    }
  } catch (err) {
    console.error(err);
  }
}

run();
