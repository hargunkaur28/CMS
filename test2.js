const test = async () => {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: "POST", headers: { "Content-Type": "application/json" },
        // using the super admin from seed
        body: JSON.stringify({ email: "admin@git.edu", password: "password123" })
    });
    const loginData = await loginRes.json();
    console.log("LOGIN:", loginData);

    if (!loginData.token) {
        console.log("Could not get token, aborting course creation test.");
        return;
    }

    const token = loginData.token;

    // 2. Try creating a course
    const courseRes = await fetch('http://localhost:5000/api/courses', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            name: "Test Course Node 1",
            code: "TC-01" + Math.random().toString().slice(2, 6),
            duration: 4,
            description: "Testing API",
            collegeId: "60b8d295f13a3c1a488c0b71" // fallback 
        })
    });
    
    const courseData = await courseRes.json();
    console.log("CREATE COURSE RESPONSE:", courseData);

    if (!courseData._id) {
        console.log("Could not create course. Aborting batch creation.");
        return;
    }

    const batchesRes = await fetch('http://localhost:5000/api/batches', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            name: "Test Batch 1",
            courseId: courseData._id,
            startYear: 2024,
            endYear: 2028,
            collegeId: "60b8d295f13a3c1a488c0b71"
        })
    });
    
    const batchData = await batchesRes.json();
    console.log("CREATE BATCH RESPONSE:", batchData);
}

test();
