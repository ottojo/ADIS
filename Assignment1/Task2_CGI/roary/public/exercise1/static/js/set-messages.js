if (typeof posts !== 'undefined') {
    posts.sort((a, b) => a.time - b.time);
    let postContainer = document.getElementById("posts-container");
    
    for (let msg of posts) {
        let container = document.createElement("div");
        container.classList.add("post-container");

        let content = document.createElement("div");
        content.classList.add("post-content");
        content.textContent = decodeURIComponent(msg.content.replace("+", " "));

        let heading = document.createElement("div");
        heading.classList.add("post-heading");

        let author = document.createElement("span");
        author.classList.add("post-author");
        author.textContent = decodeURIComponent(msg.author.replace("+", " "));

        let date = document.createElement("span");
        date.classList.add("post-date");
        date.textContent = new Date(msg.time).toLocaleString();

        heading.appendChild(author);
        heading.appendChild(date);

        container.appendChild(heading);
        container.appendChild(content);

        postContainer.insertBefore(container, postContainer.childNodes[0]);
    }
}
