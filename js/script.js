/* =========================================================
   BOLANI E-COMMERCE WEBSITE
   FILE: js/script.js
   PURPOSE: Main website functionality & Live API Syncing
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL BACKEND API CONFIGURATION
   ========================================================= */
const API_BASE_URL = "https://backend-amin.vercel.app/api"; // Production: "https://bolani-backend.vercel.app/api"


/* =========================================================
   1. DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMobileMenu();
    initializeSmoothNavigation();
    initializeHeroSlider();
    initializeOffersSlider();
    initializeActiveNavigation();
    initializeWhatsAppLinks();
    initializeCurrentYear();
    initializeImageFallback();

    // Fetch Live Dynamic Data from Backend API
    fetchLiveOffersFromAPI();

});


/* =========================================================
   FETCH LIVE OFFERS FROM BACKEND / CLOUDINARY
   ========================================================= */
async function fetchLiveOffersFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/offers`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            // Map MongoDB API structure to Offers Slider
            const formattedOffers = result.data.map(offer => ({
                image: offer.imageUrl,
                link: offer.link || "#",
                alt: "Bolani Special Offer"
            }));

            if (window.BolaniOffers && typeof window.BolaniOffers.render === "function") {
                window.BolaniOffers.render(formattedOffers);
            }
        }
    } catch (error) {
        console.warn("[Bolani Sync]: Backend offline or using default static fallback offers.");
    }
}


/* =========================================================
   2. MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const navigation = document.querySelector(".main-navigation");

    if (!menuToggle || !navigation) {
        return;
    }

    function openMenu() {
        menuToggle.classList.add("active");
        navigation.classList.add("active");
        menuToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
    }

    function closeMenu() {
        menuToggle.classList.remove("active");
        navigation.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    }

    function toggleMenu() {
        const isOpen = navigation.classList.contains("active");
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    menuToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    const navLinks = navigation.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu();
        });
    });

    document.addEventListener("click", (event) => {
        const clickedInsideMenu = navigation.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle && navigation.classList.contains("active")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navigation.classList.contains("active")) {
            closeMenu();
            menuToggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 991) {
            closeMenu();
        }
    });
}


/* =========================================================
   3. SMOOTH NAVIGATION
   ========================================================= */

function initializeSmoothNavigation() {

    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    if (!anchorLinks.length) {
        return;
    }

    anchorLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetID = link.getAttribute("href");

            if (!targetID || targetID === "#") {
                return;
            }

            const target = document.querySelector(targetID);

            if (!target) {
                return;
            }

            event.preventDefault();

            const header = document.querySelector(".site-header");
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: "smooth"
            });

            if (history.pushState && window.location.hash !== targetID) {
                history.pushState(null, "", targetID);
            }
        });
    });
}


/* =========================================================
   4. HERO SLIDER
   ========================================================= */

function initializeHeroSlider() {

    const heroSlider = document.querySelector(".hero-slider");

    if (!heroSlider) {
        return;
    }

    const slides = heroSlider.querySelectorAll(".hero-slide");

    if (slides.length <= 1) {
        return;
    }

    let currentSlide = 0;
    let heroTimer = null;
    let isPaused = false;

    function showSlide(index) {
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === index);
        });
        currentSlide = index;
    }

    function nextSlide() {
        if (isPaused) {
            return;
        }
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    function startSlider() {
        stopSlider();
        heroTimer = setInterval(nextSlide, 5000);
    }

    function stopSlider() {
        if (heroTimer) {
            clearInterval(heroTimer);
            heroTimer = null;
        }
    }

    function pauseSlider() {
        isPaused = true;
    }

    function resumeSlider() {
        isPaused = false;
    }

    showSlide(0);
    startSlider();

    heroSlider.addEventListener("mouseenter", pauseSlider);
    heroSlider.addEventListener("mouseleave", resumeSlider);
    heroSlider.addEventListener("touchstart", pauseSlider, { passive: true });
    heroSlider.addEventListener("touchend", resumeSlider, { passive: true });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            pauseSlider();
        } else {
            resumeSlider();
        }
    });
}


/* =========================================================
   5. OFFERS SLIDER
   ========================================================= */

function initializeOffersSlider() {

    const track = document.querySelector(".offers-slider-track");
    const previousButton = document.querySelector(".offers-prev");
    const nextButton = document.querySelector(".offers-next");

    if (!track) {
        return;
    }

    let autoScrollTimer = null;
    let isUserInteracting = false;

    function getScrollAmount() {
        const card = track.querySelector(".offer-card");

        if (!card) {
            return track.clientWidth;
        }

        const cardWidth = card.getBoundingClientRect().width;
        const trackStyle = window.getComputedStyle(track);
        const gap = parseFloat(trackStyle.columnGap) || parseFloat(trackStyle.gap) || 20;

        return cardWidth + gap;
    }

    function scrollNext() {
        if (isUserInteracting) {
            return;
        }

        const maxScroll = track.scrollWidth - track.clientWidth;
        const currentScroll = track.scrollLeft;

        if (maxScroll <= 5 || currentScroll >= maxScroll - 5) {
            track.scrollTo({ left: 0, behavior: "smooth" });
            return;
        }

        track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
    }

    function scrollPrevious() {
        track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            isUserInteracting = true;
            scrollNext();
            restartAutoScroll();
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            isUserInteracting = true;
            scrollPrevious();
            restartAutoScroll();
        });
    }

    function startAutoScroll() {
        stopAutoScroll();
        autoScrollTimer = setInterval(scrollNext, 4500);
    }

    function stopAutoScroll() {
        if (autoScrollTimer) {
            clearInterval(autoScrollTimer);
            autoScrollTimer = null;
        }
    }

    function restartAutoScroll() {
        stopAutoScroll();
        setTimeout(() => {
            isUserInteracting = false;
            startAutoScroll();
        }, 1500);
    }

    track.addEventListener("mouseenter", () => { isUserInteracting = true; });
    track.addEventListener("mouseleave", () => { isUserInteracting = false; });

    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener("touchstart", (event) => {
        isUserInteracting = true;
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener("touchend", (event) => {
        touchEndX = event.changedTouches[0].screenX;
        const swipeDistance = touchStartX - touchEndX;
        const minimumSwipe = 50;

        if (Math.abs(swipeDistance) >= minimumSwipe) {
            if (swipeDistance > 0) {
                scrollNext();
            } else {
                scrollPrevious();
            }
        }
        restartAutoScroll();
    }, { passive: true });

    let isDragging = false;
    let dragStartX = 0;
    let initialScrollLeft = 0;

    track.addEventListener("mousedown", (event) => {
        isDragging = true;
        isUserInteracting = true;
        dragStartX = event.pageX;
        initialScrollLeft = track.scrollLeft;
        track.classList.add("is-dragging");
    });

    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        const distance = event.pageX - dragStartX;
        track.scrollLeft = initialScrollLeft - distance;
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove("is-dragging");
        restartAutoScroll();
    });

    track.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollNext();
        }
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollPrevious();
        }
    });

    startAutoScroll();

    window.BolaniOffers = {
        render(offers) {
            if (!Array.isArray(offers)) return;
            track.innerHTML = "";

            offers.forEach((offer) => {
                if (!offer || !offer.image) return;

                const card = document.createElement("a");
                card.className = "offer-card";
                card.href = offer.link || "#";
                card.setAttribute("aria-label", offer.alt || "View offer");

                const image = document.createElement("img");
                image.src = offer.image;
                image.alt = offer.alt || "Bolani offer";
                image.loading = "lazy";

                card.appendChild(image);
                track.appendChild(card);
            });
        }
    };
}


/* =========================================================
   6. ACTIVE NAVIGATION
   ========================================================= */

function initializeActiveNavigation() {

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (!sections.length || !navLinks.length) {
        return;
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const sectionID = entry.target.id;
            navLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${sectionID}`;
                link.classList.toggle("active", isActive);
            });
        });
    }, {
        threshold: 0.35,
        rootMargin: "-80px 0px -35% 0px"
    });

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });
}


/* =========================================================
   7. WHATSAPP LINKS
   ========================================================= */

function initializeWhatsAppLinks() {

    const whatsappElements = document.querySelectorAll("[data-whatsapp-url]");

    whatsappElements.forEach((element) => {
        const whatsappURL = element.dataset.whatsappUrl;

        if (whatsappURL && whatsappURL.trim() !== "") {
            element.setAttribute("href", whatsappURL);
            element.setAttribute("target", "_blank");
            element.setAttribute("rel", "noopener noreferrer");
        }
    });
}


/* =========================================================
   8. CURRENT YEAR
   ========================================================= */

function initializeCurrentYear() {

    const yearElements = document.querySelectorAll(".current-year");
    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
        element.textContent = currentYear;
    });
}


/* =========================================================
   9. IMAGE ERROR HANDLING
   ========================================================= */

function initializeImageFallback() {

    const images = document.querySelectorAll("img");

    images.forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("image-load-error");
        });
    });
}


/* =========================================================
   10. BROWSER TAB PERFORMANCE
   ========================================================= */

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.body.classList.add("page-hidden");
    } else {
        document.body.classList.remove("page-hidden");
    }
});


/* =========================================================
   11. GLOBAL BOLANI CONFIGURATION
   ========================================================= */

window.BolaniConfig = {
    siteName: "Bolani",
    api: {
        offers: `${API_BASE_URL}/offers`,
        products: `${API_BASE_URL}/products`,
        filters: `${API_BASE_URL}/filters`,
        orders: `${API_BASE_URL}/orders`
    }
};
