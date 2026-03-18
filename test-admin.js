(async ()=>{
  const base = 'http://localhost:7000/api/admin';
  try {
    const loginRes = await fetch(base + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shreegowda211@gmail.com', password: 'Admin@shree1' })
    });
    const loginJson = await loginRes.json().catch(()=>null);
    console.log('LOGIN', loginRes.status, loginJson);
    const token = loginJson?.token;
    if(!token){ console.error('No token returned'); process.exit(1); }

    const getRes = await fetch(base + '/areas', { headers: { 'auth-token': token } });
    console.log('GET /areas', getRes.status, await getRes.text());

    const createRes = await fetch(base + '/areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'auth-token': token },
      body: JSON.stringify({ name: 'Smoke Area', code: 'SMK-01', description: 'Created by smoke test' })
    });
    const createText = await createRes.text();
    console.log('POST /areas', createRes.status, createText);
    let createdId = null;
    try { const createJson = JSON.parse(createText); createdId = createJson?.data?._id || createJson?._id || createJson?.data?.id; } catch(e){}

    if(createdId){
      const delRes = await fetch(base + '/areas/' + createdId, { method: 'DELETE', headers: { 'auth-token': token } });
      console.log('DELETE /areas/' + createdId, delRes.status, await delRes.text());
    } else {
      console.log('No createdId to delete');
    }
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
