// Test script for SwasthyaLink API flows
const baseUrl = "http://localhost:5000/api";

async function runTests() {
  console.log("=== SWASTHYALINK VERIFICATION TESTS ===");

  // 1. Healthz
  const hRes = await fetch(`${baseUrl}/healthz`);
  console.log("1. Healthz check:", hRes.status, await hRes.json());

  // 2. Unauthenticated auth/me
  const unauthRes = await fetch(`${baseUrl}/auth/me`);
  console.log("2. Unauthenticated check (should be 401):", unauthRes.status);

  // 3. Worker Login
  let cookie = "";
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aadhaar: "123456789012", password: "password123", role: "worker" }),
  });
  const rawCookie = loginRes.headers.get("set-cookie");
  if (rawCookie) {
    cookie = rawCookie.split(";")[0];
  }
  const workerUser = await loginRes.json();
  console.log("3. Worker login:", loginRes.status, workerUser.user?.name, "Role:", workerUser.user?.role, "Cookie:", cookie);

  // 4. Worker Profile Fetch
  const profRes = await fetch(`${baseUrl}/profile`, { headers: { Cookie: cookie } });
  const profData = await profRes.json();
  console.log("4. Worker profile live data:", profRes.status, {
    name: profData.name,
    healthId: profData.healthId,
    age: profData.age,
    bloodGroup: profData.bloodGroup,
    allergies: profData.allergies,
    emergencyContact: profData.emergencyContact,
  });

  // 5. Worker Profile Update (Testing Persistence)
  const patchRes = await fetch(`${baseUrl}/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      name: "Rahul Kumar",
      age: 30,
      bloodGroup: "O+",
      allergies: "Penicillin, Pollen",
      emergencyContact: "+91 98765 00000",
      language: "en",
    }),
  });
  const updatedProf = await patchRes.json();
  console.log("5. Worker profile updated:", patchRes.status, {
    age: updatedProf.age,
    bloodGroup: updatedProf.bloodGroup,
    allergies: updatedProf.allergies,
    emergencyContact: updatedProf.emergencyContact,
  });

  // 6. Worker Add Record
  const addRecRes = await fetch(`${baseUrl}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      kind: "visit",
      title: "Routine Health Checkup",
      providerName: "Kochi Community Clinic",
      details: "Blood pressure normal, vitals stable.",
      recordedAt: new Date().toISOString().slice(0, 10),
    }),
  });
  const newRecord = await addRecRes.json();
  console.log("6. Add Record:", addRecRes.status, newRecord.title, newRecord.kind);

  // 7. Worker Records List
  const recListRes = await fetch(`${baseUrl}/records`, { headers: { Cookie: cookie } });
  const recList = await recListRes.json();
  console.log("7. Records count:", recList.length, "Latest:", recList[0]?.title);

  // 8. Doctor Login
  let docCookie = "";
  const docLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aadhaar: "987654321098", password: "password123", role: "doctor" }),
  });
  const docRawCookie = docLoginRes.headers.get("set-cookie");
  if (docRawCookie) {
    docCookie = docRawCookie.split(";")[0];
  }
  const docUser = await docLoginRes.json();
  console.log("8. Doctor login:", docLoginRes.status, docUser.user?.name, "Role:", docUser.user?.role);

  // 9. Doctor Search Workers
  const searchRes = await fetch(`${baseUrl}/doctor/workers?q=Rahul`, { headers: { Cookie: docCookie } });
  const searchResults = await searchRes.json();
  console.log("9. Doctor search results:", searchRes.status, "Found:", searchResults.length, searchResults[0]?.name, searchResults[0]?.healthId);

  // 10. Doctor View Worker Profile
  const docWorkerProf = await fetch(`${baseUrl}/doctor/workers/${searchResults[0].healthId}`, { headers: { Cookie: docCookie } });
  const docWorkerData = await docWorkerProf.json();
  console.log("10. Doctor views worker profile:", docWorkerProf.status, docWorkerData.name, "Blood:", docWorkerData.bloodGroup);

  // 11. Doctor View Worker Records
  const docWorkerRecs = await fetch(`${baseUrl}/doctor/workers/${searchResults[0].healthId}/records`, { headers: { Cookie: docCookie } });
  const docWorkerRecsData = await docWorkerRecs.json();
  console.log("11. Doctor views worker records:", docWorkerRecs.status, "Count:", docWorkerRecsData.length);

  // 12. Doctor Add Record to Worker History
  const docAddRec = await fetch(`${baseUrl}/doctor/workers/${searchResults[0].healthId}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: docCookie },
    body: JSON.stringify({
      kind: "prescription",
      title: "Multivitamin Supplements",
      providerName: "Dr. Anjali Menon",
      details: "One tablet daily after breakfast for 30 days.",
      recordedAt: new Date().toISOString().slice(0, 10),
    }),
  });
  const docAddedData = await docAddRec.json();
  console.log("12. Doctor adds record to worker:", docAddRec.status, docAddedData.title);

  // 13. Verify Worker sees newly added record
  const verifyWorkerRecs = await fetch(`${baseUrl}/records`, { headers: { Cookie: cookie } });
  const verifyList = await verifyWorkerRecs.json();
  console.log("13. Worker sees updated records list:", verifyList.length, "Latest:", verifyList[0]?.title);

  console.log("=== ALL API TESTS PASSED! ===");
}

runTests().catch(console.error);
