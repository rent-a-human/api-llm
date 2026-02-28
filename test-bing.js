const fetch = require('node-fetch');

async function test() {
  const query = "beautiful pomeranian dog";
  const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`);
  const text = await res.text();
  const murls = [...text.matchAll(/murl&quot;:&quot;(.*?)&quot;/gi)].map(m => m[1]);
  console.log(murls.slice(0, 5));
}
test();
