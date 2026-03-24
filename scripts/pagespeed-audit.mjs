const targetUrl = process.argv[2];
const apiKey = process.env.PAGESPEED_API_KEY;

if (!targetUrl) {
  console.error("Uso: npm run audit:pagespeed -- https://tu-url.com");
  process.exit(1);
}

const strategies = ["mobile", "desktop"];

async function run(strategy) {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", targetUrl);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("category", "PERFORMANCE");
  endpoint.searchParams.set("category", "ACCESSIBILITY");
  endpoint.searchParams.set("category", "BEST_PRACTICES");
  endpoint.searchParams.set("category", "SEO");

  if (apiKey) {
    endpoint.searchParams.set("key", apiKey);
  }

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`PageSpeed fallo para ${strategy}: ${response.status}`);
  }

  const payload = await response.json();
  const categories = payload.lighthouseResult?.categories ?? {};
  const audits = payload.lighthouseResult?.audits ?? {};

  const formatScore = (value) => `${Math.round((value ?? 0) * 100)}`;

  console.log(`\n=== ${strategy.toUpperCase()} ===`);
  console.log(`Performance: ${formatScore(categories.performance?.score)}`);
  console.log(`Accessibility: ${formatScore(categories.accessibility?.score)}`);
  console.log(`Best Practices: ${formatScore(categories["best-practices"]?.score)}`);
  console.log(`SEO: ${formatScore(categories.seo?.score)}`);
  console.log(`LCP: ${audits["largest-contentful-paint"]?.displayValue ?? "n/a"}`);
  console.log(`INP: ${audits["interaction-to-next-paint"]?.displayValue ?? "n/a"}`);
  console.log(`CLS: ${audits["cumulative-layout-shift"]?.displayValue ?? "n/a"}`);
  console.log(`TBT: ${audits["total-blocking-time"]?.displayValue ?? "n/a"}`);
}

for (const strategy of strategies) {
  await run(strategy);
}
