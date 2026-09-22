async function check() {
  const res = await fetch('https://fairway-kind-app.vercel.app/dashboard');
  console.log('Status:', res.status);
  const html = await res.text();
  const cssMatches = html.match(/href="(\/_next\/static\/css\/[^"]+)"/g);
  console.log('CSS links in HTML:', cssMatches);
  if (cssMatches) {
    for (const m of cssMatches) {
      const url = 'https://fairway-kind-app.vercel.app' + m.replace('href="', '').replace('"', '');
      const cssRes = await fetch(url);
      console.log(url, cssRes.status, (await cssRes.text()).length);
    }
  }
}
check();
