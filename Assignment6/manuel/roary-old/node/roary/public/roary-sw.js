/*
Caching strategy:

* The general caching strategy is network first, cache second.
  When the network is available, the data is requested from the server. The cache acts as a fallback.
* The index.html file is cached right on installation of the service worker since it won't change that often.
* Additionally, response data for retrieval of Roars is stored. The approach is the following:
    On initial page load, the application will request all Roars up to the first one (limited to a fixed maximum),
    subsequent fetches will only yield roars up to the last on returned. This is implemented via the "upTo" URL
    parameter.

    When the network goes offline, this will result in no new Roars being added. However, if the page is refreshed this
    will result in a "playback" of the Roars in the exact same way as when the page was online. To display all of
    them at once the Roars would have to be cached directly instead of the responses or the individual responses
    would have to be merged somehow into a single one.
*/

const CACHE_VERSION = 1;
const CACHE_NAME = 'offline' + CACHE_VERSION;

// Installation listener for the main HTML page
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(new Request("/", {cache: 'reload'})); // network first!
    })());
});

// Listener for all network fetches
self.addEventListener('fetch', event => {
  // Type 1: Fetch the root path => the main page / HTML document
  if (event.request.mode === 'navigate') {
      event.respondWith((async () => {
            try {
                // Simply try fetching from the network
                const response = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);

                // cache the new response
                cache.put(event.request, response.clone());
                return response;
            } catch (error) {
                // if offline, try returning the cached response
                const cache = await caches.open(CACHE_NAME);
                return await cache.match("/");
            }
      })());
  }
  // Type 2: fetching the Roar objects
  else if (event.request.url.includes("/api/getRoars")) {
    event.respondWith((async () => {
      try {
          // Same as before, try fetching from the network first and cache response
          const response = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());

          // If the "upTo" url parameter is 0, the is a completey new page reload
          // we can evict the getRoars responses since the roars they contained
          // will be older than the ones in the new response.
          const urlParams = new URLSearchParams(event.request.url.split("?")[1]);
          if (urlParams.get("upTo") === "0") {
              const keys = await cache.keys();
              keys.forEach((req, idx, arr) => {
                  if (req.url.includes("/api/getRoars")) 
                    cache.delete(req);
            });
          }

          // return the new response
          return response;
      } catch (error) {
        // try getting a cached response
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(event.request);
        
        if (!response) {
            // if no response is cached, return a response with an empty Roar list as data
            // => no new roars will be added
            return new Response(
                new Blob(["[]"], {type: "application/json"}),
                {
                    "status": 200, 
                    "statusText": "OK",
                    "headers": {"Content-Type": "application/json"}
                }
            );
        } else {
            // Otherwise return the cached response
            return response;
        }
      }
    })());
  }
});
