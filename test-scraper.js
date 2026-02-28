const fetch = require('node-fetch');

async function testReddit() {
  const query = "beautiful pomeranian dog";
  try {
    const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=all&include_over_18=on&limit=50`);
    const data = await res.json();
    
    if (!data.data || !data.data.children) {
      console.log("No results");
      return;
    }

    const images = [];
    for (const child of data.data.children) {
      const post = child.data;
      if (post.url && (post.url.endsWith('.jpg') || post.url.endsWith('.png') || post.url.endsWith('.gif'))) {
        images.push({
          title: post.title,
          url: post.url,
          permalink: `https://reddit.com${post.permalink}`
        });
      }
    }
    
    console.log("Reddit images:", images.slice(0, 5));
    
  } catch(e) { console.error(e); }
}
testReddit();
