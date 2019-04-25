/* Name: Jonah Little & Cade Marks
Course: CSC 337, Spring 2019
Description: Loads all character names and images from server to display on page. When one is
clicked, displays that character's stats. */

(function() {
    "use strict";
    window.onload = function() {
        displayAll();
        document.getElementById("button").onclick = sendComment;
        document.getElementById("home").onclick = changeDisplay;
    };

    /** Displays on the page the cover and title of each book on server. **/
    function displayAll() {
        let allchars = document.getElementById("all_characters");
        let singlechar = document.getElementById("single_character");
        singlechar.style.display = "none";
        allchars.style.display = "";
        let url = "http://smash-stats.herokuapp.com/?mode=all";
        fetch(url)
            .then(checkStatus)
            .then(function(responseText) {
                let json = JSON.parse(responseText);
                for(let i = 0; i < json["characters"].length; i++) {
                    let name = json["characters"][i]["name"];
                    let image = json["characters"][i]["imageURL"];
                    let thumbnail = document.createElement("div");
                    thumbnail.className = "character_box";
                    let title = document.createElement("h2");
                    title.innerHTML = name;
                    let picture = document.createElement("img");
                    picture.src = image;
                    thumbnail.appendChild(picture);
                    thumbnail.appendChild(title);
                    thumbnail.onclick = displayOne;
                    thumbnail.value = name;
                    allchars.appendChild(thumbnail);
                }
            });
    }

    /**Returns display to show all characters rather than single character information**/
    function changeDisplay() {
        let allchars = document.getElementById("all_characters");
        let singlechar = document.getElementById("single_character");
        singlechar.style.display = "none";
        allchars.style.display = "";
    }

    /** Temporarily hides display of all characters and displays the info for the clicked
    character. **/
    function displayOne() {
        let allchars = document.getElementById("all_characters");
        let singlechar = document.getElementById("single_character");
        singlechar.style.display = "";
        allchars.style.display = "none";
        let url = "http://smash-stats.herokuapp.com/?mode=single&name=" + this.value;
        fetch(url)
            .then(checkStatus)
            .then(function(responseText) {
                let json = JSON.parse(responseText);
                let name = json["name"];
                document.getElementById("name").innerHTML = name;
                document.getElementById("weight").innerHTML = json["weight"];
                document.getElementById("runSpeed").innerHTML = json["runspeed"];
                document.getElementById("walkSpeed").innerHTML = json["walkspeed"];
                document.getElementById("fallSpeed").innerHTML = json["fallspeed"];
                document.getElementById("charImage").src = json["imageURL"];
                loadComments(name);
            });
    }

    /** Loads all comments on server for the given character. **/
    function loadComments(character) {
        let url = "http://smash-stats.herokuapp.com/?mode=comments&name=" + character;
        fetch(url)
            .then(checkStatus)
            .then(function(responseText) {
                let json = JSON.parse(responseText);
                let messageArea = document.getElementById("messageArea");
                messageArea.innerHTML = "";
                for(let i = 0; i < json["comments"].length; i++) {
                    let comment = document.createElement("p");
                    comment.id = "comment";
                    comment.innerHTML = json["comments"][i]["comment"];
                    comment.appendChild(document.createElement("br"));
                    messageArea.appendChild(comment);
                }
            });
    }

    /** Posts a comment and it's associated character to the server. **/
    function sendComment() {
        let message = {};
        let character = document.getElementById("name").innerHTML;
        message["name"] = character;
        let commentBox = document.getElementById("commentBox");
        let comment = document.getElementById("commentBox").value;
        if(comment.includes("|||")) {
            comment = comment.replace(/\|\|\|/g, "III");
        }
        if(comment.includes("\n")) {
            comment = comment.replace(/\n/g, " ");
        }
        message["comment"] = comment;
        commentBox.value = "";
        let sending = {
            method : "POST",
            headers : {
                "Accept": "application/json",
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(message)
        };
        fetch("http://smash-stats.herokuapp.com/?mode=comments", sending)
            .then(checkStatus)
            .then(function(responseText) {
                let json = JSON.parse(responseText);
                let confirmation = document.getElementById("confirmation");
                if(json === "Message saved") {
                    confirmation.innerHTML = "Comment saved";
                } else {
                    confirmation.innerHTML = "Comment failed to send";
                }
                loadComments(character);
            });
    }

    /** Returns the response from the server, checking for errors. **/
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else if (response.status === 404) {
            document.getElementById("errors").innerHTML = "File not found";
            return Promise.reject(new Error("No file found"));
        } else if (response.status === 400) {
            document.getElementById("errors").innerHTML = "Missing parameter";
            return Promise.reject(new Error("Missing parameter"));
        } else if (response.status === 410) {
            document.getElementById("errors").innerHTML = "Unknown parameter/has no data";
            return Promise.reject(new Error("Unknown parameter/has no data"));
        } else {
            return Promise.reject(new Error(response.status+": "+response.statusText));
        }
    }
})();