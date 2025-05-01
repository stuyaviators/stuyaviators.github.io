// Function to load the header and footer
function loadHeaderFooter() {
    // Check if 'header' div exists, otherwise create one
    let headerDiv = document.getElementById('header');
    if (!headerDiv) {
        headerDiv = document.createElement('div');
        headerDiv.id = 'header';
        document.body.insertBefore(headerDiv, document.body.firstChild); // Insert header at the top
    }

    // Fetch and insert the header content
    fetch('/assets/templates/header.html')
        .then(res => res.text())
        .then(data => {
            headerDiv.innerHTML = data;
        })
        .catch(err => console.error('Header load error:', err));

    // Check if 'footer' div exists, otherwise create one
    let footerDiv = document.getElementById('footer');
    if (!footerDiv) {
        footerDiv = document.createElement('div');
        footerDiv.id = 'footer';
        document.body.appendChild(footerDiv); // Insert footer at the bottom
    }

    // Fetch and insert the footer content
    fetch('/assets/templates/footer.html')
        .then(res => res.text())
        .then(data => {
            footerDiv.innerHTML = data;
        })
        .catch(err => console.error('Footer load error:', err));
}

// Load header and footer when the page is ready
loadHeaderFooter();
