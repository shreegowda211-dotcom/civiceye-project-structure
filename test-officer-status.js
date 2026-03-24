(async () => {
  const base = 'http://localhost:7000/api/officer';
  try {
    // First, login as officer
    console.log('🔐 Logging in as officer...');
    const loginRes = await fetch('http://localhost:7000/api/officer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'road.officer@example.com',
        password: 'Officer@123',
        department: 'Road Damage'
      })
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN RESPONSE:', loginRes.status, loginJson);
    
    if (!loginJson?.token) {
      console.error('❌ No token received from login');
      process.exit(1);
    }
    
    const token = loginJson.token;
    console.log('✅ Token received:', token.substring(0, 20) + '...');
    
    // Get officer's complaints
    console.log('\n🔍 Fetching officer complaints...');
    const complaintRes = await fetch(base + '/complaints', {
      headers: { 'auth-token': token }
    });
    const complaintJson = await complaintRes.json();
    console.log('COMPLAINTS RESPONSE:', complaintRes.status);
    console.log('DATA:', JSON.stringify(complaintJson, null, 2));
    
    if (complaintJson?.data?.length > 0) {
      const complaintId = complaintJson.data[0]._id || complaintJson.data[0].issueId;
      console.log('\n📝 About to update complaint:', complaintId);
      
      // Try to update status
      console.log('🔄 Updating complaint status...');
      const updateRes = await fetch(base + `/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ status: 'In Progress' })
      });
      
      const updateText = await updateRes.text();
      console.log('UPDATE RESPONSE STATUS:', updateRes.status);
      console.log('UPDATE RESPONSE BODY:', updateText);
      
      if (updateRes.status === 500) {
        console.error('❌ 500 ERROR RECEIVED!');
        try {
          const updateJson = JSON.parse(updateText);
          console.error('Error details:', JSON.stringify(updateJson, null, 2));
        } catch (e) {
          console.error('Response:', updateText);
        }
      }
    } else {
      console.log('⚠️  No complaints found. Creating test data...');
    }
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
})();
