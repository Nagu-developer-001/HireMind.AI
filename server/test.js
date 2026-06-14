import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const testAnalysis = async () => {
    const form = new FormData();
    // Make sure 'my_resume.pdf' actually exists in your server folder!
    form.append('resume', fs.createReadStream('./resume.pdf')); 
    form.append('jobDescription', 'We need a Java and React expert.');

    try {
        const response = await axios.post('http://localhost:5000/api/analyze', form, {
            headers: form.getHeaders(),
        });
        console.log("✅ AI Response:", response.data);
    } catch (error) {
        console.error("❌ Test Failed:", error.response ? error.response.data : error.message);
    }
};

testAnalysis();