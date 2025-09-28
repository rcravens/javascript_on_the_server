document.addEventListener("DOMContentLoaded", () => {
    // Greeting on index page
    const greetBtn = document.getElementById("greetBtn");
    if (greetBtn) {
        greetBtn.addEventListener("click", () => {
            const greeting = document.getElementById("greeting");
            greeting.textContent = "Hello there! Welcome to the dark side 🌑";
        });
    }

    // Toggle profile details
    const toggleProfileBtn = document.getElementById("toggleProfileBtn");
    if (toggleProfileBtn) {
        toggleProfileBtn.addEventListener("click", () => {
            const details = document.getElementById("profileDetails");
            details.classList.toggle("hidden");
        });
    }

    // Fun facts on about page
    const factBtn = document.getElementById("factBtn");
    if (factBtn) {
        const facts = [
            "The first website was created in 1991 by Tim Berners-Lee.",
            "JavaScript was created in just 10 days in 1995.",
            "CSS stands for Cascading Style Sheets.",
            "Dark themes can reduce eye strain in low-light conditions."
        ];
        factBtn.addEventListener("click", () => {
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            document.getElementById("factDisplay").textContent = randomFact;
        });
    }
});