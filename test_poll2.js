import axios from "axios";
async function test() {
  try {
    console.log("Fetching pollinations...");
    const res = await axios.get("https://image.pollinations.ai/prompt/Professional%20modern%20article%20header%20about%20artificial%20intelligence?width=1200&height=600&nologo=true", { responseType: 'arraybuffer' });
    console.log("Success! Status:", res.status);
    console.log("Length:", res.data.length);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
