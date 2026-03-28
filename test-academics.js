// /tmp/test.js
const http = require('http');

const test = async () => {
    try {
        const responseList = await fetch('http://localhost:5000/api/courses');
        const dataList = await responseList.json();
        console.log("courses get:", dataList);

        const responseDept = await fetch('http://localhost:5000/api/departments');
        const deptList = await responseDept.json();
        console.log("depts get:", deptList);
        
        const responseBatch = await fetch('http://localhost:5000/api/batches');
        const batchList = await responseBatch.json();
        console.log("batches get:", batchList);

    } catch (e) {
        console.error(e);
    }
}
test();
