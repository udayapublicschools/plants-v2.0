/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Service Worker for Eco-Planter reminders
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for push notifications / schedule events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_REINDER') {
    const { title, body, icon } = event.data;
    self.registration.showNotification(title, {
      body: body,
      icon: icon || '🌱',
      tag: 'eco-planter-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
    });
  }
});
