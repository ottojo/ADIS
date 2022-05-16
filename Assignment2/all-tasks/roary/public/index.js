// Roar ID of last displayed Roar
var last_rid = 0;
// Time ID of the running timer to refresh the message list
var current_timer = -1;

window.onload = () => {
    // on submit button click, catch submit event and fetch new messages
    document.getElementById("submit-btn").addEventListener("click", evt => {
        evt.preventDefault();
        postMessage(document.getElementById("message").value);
    });

    // Refresh initial messages
    refreshMessages();
};

// Helper function to escape a string with html entities to avoid XSS
function escapeHtml(html){
  var text = document.createTextNode(html);
  var p = document.createElement('p');
  p.appendChild(text);
  return p.innerHTML;
}

// Retrieves new messages from the server and inserts them into the DOM
function refreshMessages() {
    // If a refresh timer is running, cancel it and do refresh now
    if (current_timer >= 0) {
        clearTimeout(current_timer);
        current_timer = -1;
    }
    
    fetch("/api/getMessages.php?sinceRID=" + last_rid)
    .then(response => response.json())
    .then(data => {
        let container = document.getElementById("posts-container");

        for (let msg of data) {
            // msg.name is the author, msg.message is the Roar content and
            // msg.time is he ECMASCript epoch when the Roar was created
            // The server returns the Roars sorted ascending by time

            let postContainer = document.createElement("div");
            postContainer.classList.add("post-container");

            postContainer.innerHTML = '' +
                '<div class="post-heading">' +
                    '<span class="post-author">' + escapeHtml(msg.name) + '</span>' +
                    '<span class="post-date">' + new Date(msg.time).toLocaleString() + '</span>' +
                '</div>' +
                '<div class="post-content">' + escapeHtml(msg.message) + '</div>';

            container.insertBefore(postContainer, container.firstChild);
        }

        // Last index is newest Roar and has highest Roar ID (= sequence number)
        if (data.length > 0)
            last_rid = data[data.length-1].RID;

        // Schedule next refresh in 10s
        if (current_timer < 0)
            current_timer = setTimeout(refreshMessages, 10000);
    })
    .catch(err => console.error("Error fetching messages", err));
}

// Sends a new Roar to the server and refreshes the messages
function postMessage(msg) {
    fetch("/api/postMessage.php", {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: "message=" + encodeURIComponent(msg)
    })
    .then(data => {
        document.getElementById("status-message").setAttribute("class", "status-success");
        document.getElementById("status-message").innerHTML = "Roar posted successfully";
        refreshMessages()
    })
    .catch(err => {
        document.getElementById("status-message").setAttribute("class", "status-err");
        document.getElementById("status-message").innerHTML = "Error posting Roar";
        console.error("Error posting messages", err)
    });
}
