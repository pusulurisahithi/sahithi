
const icons = {
    Books: "📚",
    Supplies: "✏️",
    Tutoring: "🎓",
    Other: "🤝"
};

let listings = [
    {
        id: 1,
        type: "offer",
        title: "Engineering Mathematics Books",
        category: "Books",
        description: "Sharing my previous-semester mathematics textbooks with students who need them.",
        contact: "Demo contact — replace with a safe contact workflow",
        fulfilled: false,
        demo: true
    },
    {
        id: 2,
        type: "request",
        title: "Need Drawing Supplies",
        category: "Supplies",
        description: "Looking for spare drawing sheets and basic engineering drawing supplies.",
        contact: "Demo contact — replace with a safe contact workflow",
        fulfilled: false,
        demo: true
    },
    {
        id: 3,
        type: "offer",
        title: "Free Maths Tutoring",
        category: "Tutoring",
        description: "I can help beginners understand algebra and basic mathematics concepts.",
        contact: "Demo contact — replace with a safe contact workflow",
        fulfilled: false,
        demo: true
    },
    {
        id: 4,
        type: "request",
        title: "Looking for Used Storybooks",
        category: "Books",
        description: "Requesting gently used storybooks for a small community reading group.",
        contact: "Demo contact — replace with a safe contact workflow",
        fulfilled: true,
        demo: true
    },
    {
        id: 5,
        type: "offer",
        title: "Extra Stationery Available",
        category: "Supplies",
        description: "I have spare notebooks and pens that another student could use.",
        contact: "Demo contact — replace with a safe contact workflow",
        fulfilled: false,
        demo: true
    },
    {
        id: 6,
        type: "offer",
        title: "Computer Basics Help",
        category: "Other",
        description: "Happy to help beginners learn basic computer skills and file management.",
        contact: "Demo contact — replace with a safe contact workflow",
        fulfilled: false,
        demo: true
    }
];

const grid = document.getElementById("listingGrid");
const form = document.getElementById("listingForm");
const modal = document.getElementById("listingModal");
const contactModal = document.getElementById("contactModal");

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderListings() {
    const search = document.getElementById("searchInput").value
        .trim().toLowerCase();

    const type = document.getElementById("typeFilter").value;
    const category = document.getElementById("categoryFilter").value;

    const filtered = listings.filter(item => {
        const matchesSearch =
            `${item.title} ${item.description} ${item.category}`
                .toLowerCase().includes(search);

        const matchesType = type === "all" || item.type === type;
        const matchesCategory =
            category === "all" || item.category === category;

        return matchesSearch && matchesType && matchesCategory;
    });

    grid.innerHTML = filtered.map(item => `
        <article class="listing-card">
            <div class="card-top">
                <span class="pill ${item.type === "request" ? "request" : ""}">
                    ${item.type === "offer" ? "Offering Help" : "Requesting Help"}
                </span>
                <span class="pill ${item.fulfilled ? "fulfilled" : ""}">
                    ${item.fulfilled ? "Fulfilled" : "Available"}
                </span>
            </div>

            <div class="category-icon">
                ${icons[item.category] || icons.Other}
            </div>

            <h3>${escapeHTML(item.title)}</h3>
            <p class="description">${escapeHTML(item.description)}</p>

            <div class="listing-meta">
                Category: ${escapeHTML(item.category)}
            </div>

            <div class="card-actions">
                <button class="contact-btn"
                    onclick="openContact(${item.id})"
                    ${item.fulfilled ? "disabled" : ""}>
                    Contact
                </button>

                ${item.type === "request" && !item.fulfilled ? `
                    <button onclick="markFulfilled(${item.id})">
                        Mark Fulfilled
                    </button>` : ""}
            </div>
        </article>
    `).join("");

    document.getElementById("emptyMessage").hidden = filtered.length !== 0;

    document.getElementById("totalListings").textContent = listings.length;

    document.getElementById("helpOffers").textContent =
        listings.filter(item => item.type === "offer").length;

    document.getElementById("fulfilledCount").textContent =
        listings.filter(item => item.type === "request" && item.fulfilled).length;
}

function openForm() {
    form.reset();
    modal.classList.add("show");
    document.getElementById("listingTitle").focus();
}

function closeForm() {
    modal.classList.remove("show");
}

function markFulfilled(id) {
    const item = listings.find(listing => listing.id === id);

    if (!item || item.type !== "request" || item.fulfilled) return;

    if (confirm("Mark this request as fulfilled?")) {
        item.fulfilled = true;
        renderListings();
    }
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("listingTitle").value.trim();
    const description = document.getElementById("listingDescription").value.trim();
    const contact = document.getElementById("listingContact").value.trim();

    if (!title || !description || !contact) {
        alert("Please fill in all fields.");
        return;
    }

    listings.unshift({
        id: Date.now(),
        type: document.getElementById("listingType").value,
        title,
        category: document.getElementById("listingCategory").value,
        description,
        contact,
        fulfilled: false,
        demo: false
    });

    closeForm();
    renderListings();

    document.getElementById("searchInput").value = "";
    document.getElementById("typeFilter").value = "all";
    document.getElementById("categoryFilter").value = "all";

    renderListings();
    document.getElementById("listings").scrollIntoView({
        behavior: "smooth"
    });

    alert("Listing created successfully!");
});

function openContact(id) {
    const item = listings.find(listing => listing.id === id);

    if (!item || item.fulfilled) return;

    document.getElementById("contactListingTitle").textContent =
        `Listing: ${item.title}`;

    document.getElementById("contactMessage").value = "";
    document.getElementById("messagePreview").hidden = true;
    document.getElementById("contactForm").dataset.listingId = id;

    contactModal.classList.add("show");
}

function closeContact() {
    contactModal.classList.remove("show");
}

document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const message = document.getElementById("contactMessage").value.trim();
    if (!message) return;

    const item = listings.find(
        listing => listing.id === Number(this.dataset.listingId)
    );

    if (!item || item.fulfilled) {
        alert("This listing is no longer available.");
        closeContact();
        return;
    }

    const preview = document.getElementById("messagePreview");

    preview.innerHTML = `
        <strong>Message Preview</strong>
        <p>${escapeHTML(message)}</p>
        <p><small>This message has not been sent. A secure messaging
        backend is required to contact the listing owner.</small></p>
    `;

    preview.hidden = false;
});

[modal, contactModal].forEach(element => {
    element.addEventListener("click", event => {
        if (event.target === element) {
            element.classList.remove("show");
        }
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeForm();
        closeContact();
    }
});

renderListings();
