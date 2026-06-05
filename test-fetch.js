export const fetchAndLog = async () => {
    const res = await fetch('https://tech-nova-iota.vercel.app/blog/generative-ai-personalized-outreach');
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log(html.substring(0, 1000));
}
fetchAndLog();
