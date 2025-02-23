document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    
    if (name && email) {
        document.getElementById("formMessage").innerText = `Thanks for signing up, ${name}! ✈️`;
        document.getElementById("formMessage").style.color = "green";
    } else {
        document.getElementById("formMessage").innerText = "Please fill in all fields!";
        document.getElementById("formMessage").style.color = "red";
    }
});
