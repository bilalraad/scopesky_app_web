'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "3342bc80ca3e2de9ac401a3f2b445568",
"index.html": "3daac4ae0727c661cd43af63a71f1fb5",
"/": "3daac4ae0727c661cd43af63a71f1fb5",
"main.dart.js": "26e39d6aa0f56c6f86c2e9cbb81d88e5",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"favicon.png": "4c169e9ad5b3b8416eee0bc192fde4fd",
"icons/Icon-192.png": "ea844c10002cf95b6a6eafcc8bc6c689",
"icons/Icon-maskable-192.png": "ea844c10002cf95b6a6eafcc8bc6c689",
"icons/Icon-maskable-512.png": "b040fb3df49abef34c16e2f883ff8d69",
"icons/Icon-512.png": "b040fb3df49abef34c16e2f883ff8d69",
"manifest.json": "53764f8213104b9db665d92463803a15",
"assets/AssetManifest.json": "04762d7344e9957b891629535236cd7c",
"assets/NOTICES": "354af8dde80d01af1950c8d67bac0d78",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/assets/images/logo.png": "b040fb3df49abef34c16e2f883ff8d69",
"assets/assets/images/support_image.png": "81bfa5c0fad63ba7a2ceb15548b467b2",
"assets/assets/images/star_mask.png": "e8d28d4adbe45c09adab85158e01769d",
"assets/assets/images/Star.png": "c9bdd57a00629a1d77b4554fe6108266",
"assets/assets/icons/newspaper.png": "7b4471c417203de440ce98776582b2c9",
"assets/assets/icons/support.png": "5b830c5934fc3d700082ffd73bc7f88c",
"assets/assets/icons/newspaper_list.png": "2f9b801a865d688b67ed2a92abd36ae9",
"assets/assets/icons/package.png": "1fd6457dc9906f5cb8584041ea633363",
"assets/assets/icons/headset.png": "3a3d6f5256fc1581ae84503a4b8bb607",
"assets/assets/icons/services.png": "7206174c8b28beb170b85ebfcccfbb54",
"assets/assets/icons/home.png": "7c784563919f590991e8b8427cfda3eb",
"assets/assets/icons/toolbox.png": "004e597a99caed83e6974920ad7e33d1",
"assets/assets/icons/envelope_open.png": "957f03d0f578eff3283272c390edaa78",
"assets/assets/icons/jobs.png": "0e4b6614de3c465423bb536b5f0b55ef",
"assets/assets/icons/device.png": "e578146151d6490616e0aef14817c791",
"assets/assets/icons/clockwise.png": "e099bb6b96e3915b3ad6d2c3c6673c23",
"assets/assets/google_fonts/Cairo-ExtraBold.ttf": "461a6eeaed7944175bd3b03209b6015a",
"assets/assets/google_fonts/Cairo-ExtraLight.ttf": "c78a99987273c45c6f7c6d7bcd2f7f76",
"assets/assets/google_fonts/Cairo-SemiBold.ttf": "a29aa6689e17cc4920f865b1e2f206fd",
"assets/assets/google_fonts/Cairo-Medium.ttf": "76f957349a6defbef1b6980bc4c8892a",
"assets/assets/google_fonts/Cairo-Regular.ttf": "94c4feb516a9bd22a5ee417f6e099c93",
"assets/assets/google_fonts/Cairo-Light.ttf": "a6793d94c6568946c4755901ef0f04ed",
"assets/assets/google_fonts/Cairo-Black.ttf": "2374c281704270d2e3008b421ed80885",
"assets/assets/google_fonts/Cairo-Bold.ttf": "19a30f18e32cf8dbb9d0cfcee9e2c01e",
"assets/assets/google_fonts/OFL.txt": "a81af1f762d65aae385547bc9d408788",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
