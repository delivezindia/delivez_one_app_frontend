import { mergeServiceCatalog } from './src/features/services/serviceCatalog.js';

async function verify() {
  const res = await fetch('http://localhost:4000/api/v1/services');
  const json = await res.json();
  console.log('API Total Services:', json.data.services.length);
  const merged = mergeServiceCatalog(json.data.services);
  console.log('Merged Services Count:', merged.length);
  merged.slice(0, 6).forEach((s, i) => {
    console.log(`[Card ${i + 1}] Name: "${s.name}" | Subtitle: "${s.subtitle}" | Slug: "${s.slug}" | Image: ${s.imageUrl ? 'LIVE URL (' + s.imageUrl + ')' : 'NONE'}`);
  });
}

verify().catch(console.error);
