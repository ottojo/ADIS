# Roary with server-push for new roars using WebSockets

## Problem

In the previous exercise we discovered that for the Django implementation of Roary, the fetching of new roars is not
very performant, especially when many users are accessing the service concurrently. This periodic fetching of new roars
runs in the background as long as the index page is open. The API was designed in a very simple way, so the fetching
consisted of downloading of all the recent roars, even if they are already present on the page. Also, the implementation
using polling means constant server load even if no roars are getting posted.

Additionally, the long polling interval results in poor interactivity for the user, as new roars appear delayed, and
many new roars may appear at once.

## Solution

On the index page a WebSocket connection should be established with the server. This allows the server to push updates
to the clients, which is done whenever a new roar is posted. The update contains the full roar data to enable the client
to render the roar without any further requests.

## Implementation

The Django [channels library](https://channels.readthedocs.io/en/stable/) is used, which allows Django to manage
websocket clients ("consumers") and routing between channels, groups and server instances.
The `action/post` API endpoint is extended to send every newly posted roar to all connected websocket clients.

The `action/post` API call from the index page is modified to call the API in the background using AJAX, as the new
websocket feature displays the newly added roar almost instantly. This removes the need to visit the poll endpoint
directly, resulting in a redirect to the index page and an additional request.

## Evaluation

Initial loading of roars is unchanged, but the previously slow polling request is eliminated entirely.

Site interactivity is successfully improved, as new roars get pushed to the client immediately, without needing to
wait for the polling interval.
