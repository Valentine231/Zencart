const axios = require('axios');

async function test() {
  try {
    const start = Date.now();
    const res = await axios.get("https://fakestoreapi.com/products", { timeout: 10000 });
    console.log("Success:", res.status, "in", Date.now() - start, "ms");
  } catch (e) {
    console.log("Error:", e.message);
  }
}

test();
