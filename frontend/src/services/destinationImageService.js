const imageCache = new Map();
const queryQueue = [];
let activeQueries = 0;
const MAX_IMAGE_QUERIES = 4;

function runNext() {
  if (activeQueries >= MAX_IMAGE_QUERIES || queryQueue.length === 0) return;
  const task = queryQueue.shift();
  activeQueries += 1;
  task().finally(() => { activeQueries -= 1; runNext(); });
  runNext();
}

function requestImage(destinationName) {
  return new Promise((resolve) => {
    const task = async () => {
      try {
        const query = new URLSearchParams({
          action: "query", generator: "search", gsrsearch: `${destinationName} India`,
          gsrnamespace: "6", gsrlimit: "8", prop: "imageinfo", iiprop: "url|extmetadata",
          iiurlwidth: "1000", format: "json", origin: "*",
        });
        const response = await fetch(`https://commons.wikimedia.org/w/api.php?${query}`);
        if (!response.ok) return resolve(null);
        const data = await response.json();
        const pages = Object.values(data.query?.pages || {});
        const best = pages.find((page) => page.imageinfo?.[0]?.thumburl) || pages[0];
        const image = best?.imageinfo?.[0];
        resolve(image?.thumburl ? {
          src: image.thumburl,
          creditUrl: image.descriptionurl,
          credit: image.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, "").trim() || "Wikimedia Commons contributor",
        } : null);
      } catch { resolve(null); }
    };
    queryQueue.push(task);
    runNext();
  });
}

export function getDestinationImage(destinationName) {
  if (!destinationName) return Promise.resolve(null);
  const cacheKey = destinationName.trim().toLowerCase();
  if (!imageCache.has(cacheKey)) imageCache.set(cacheKey, requestImage(destinationName));
  return imageCache.get(cacheKey);
}
