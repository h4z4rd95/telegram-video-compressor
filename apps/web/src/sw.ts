type ServiceWorkerFetchEvent = Event & {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
};

self.addEventListener("fetch", (event) => {
  const fetchEvent = event as ServiceWorkerFetchEvent;
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((cached) => cached ?? fetch(fetchEvent.request))
  );
});
