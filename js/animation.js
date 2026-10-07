/* =========================================================
   BOLANI E-COMMERCE WEBSITE
   FILE: js/animation.js
   PURPOSE:
   Advanced visual animations and scroll-based effects
   ========================================================= */

"use strict";

/* =========================================================
   1. DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeAnimations();
});


/* =========================================================
   2. MAIN ANIMATION INITIALIZER
   ========================================================= */

function initializeAnimations() {

    // Initialize all animation modules
    initializeScrollReveal();
    initializeNavbarAnimation();
    initializeCardAnimations();
    initializeHoverAnimations();
    initializePageTransition();

}


/* =========================================================
   3. SCROLL REVEAL ANIMATION
   ---------------------------------------------------------
   Elements with the class:
   .reveal-element

   will become visible when they enter the viewport.
   ========================================================= */

function initializeScrollReveal() {

    const revealElements = document.querySelectorAll(".reveal-element");

    if (!revealElements.length) {
        return;
    }

    // Check if browser supports IntersectionObserver
    if (!("IntersectionObserver" in window)) {

        // Fallback for older browsers
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");

                // Stop observing after animation has started
                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -50px 0px"
        }
    );

    revealElements.forEach((element) => {

        // Mark element as animation-ready
        element.classList.add("reveal-ready");

        revealObserver.observe(element);

    });

}


/* =========================================================
   4. NAVBAR SCROLL ANIMATION
   ---------------------------------------------------------
   Adds .scrolled to .site-header when user scrolls.
   animation.css controls the visual effect.
   ========================================================= */

function initializeNavbarAnimation() {

    const siteHeader = document.querySelector(".site-header");

    if (!siteHeader) {
        return;
    }

    let ticking = false;

    const updateNavbar = () => {

        if (window.scrollY > 30) {
            siteHeader.classList.add("scrolled");
        } else {
            siteHeader.classList.remove("scrolled");
        }

        ticking = false;
    };


    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                window.requestAnimationFrame(updateNavbar);

                ticking = true;
            }

        },
        { passive: true }
    );

    // Run once on page load
    updateNavbar();

}


/* =========================================================
   5. COLLECTION CARD ANIMATION
   ---------------------------------------------------------
   Adds staggered animation timing to collection cards.
   ========================================================= */

function initializeCardAnimations() {

    const collectionCards =
        document.querySelectorAll(".collection-card");

    if (!collectionCards.length) {
        return;
    }

    collectionCards.forEach((card, index) => {

        // Stagger delay for professional entrance animation
        const delay = index * 100;

        card.style.setProperty(
            "--card-animation-delay",
            `${delay}ms`
        );

        // Add reveal class if not already present
        if (!card.classList.contains("reveal-element")) {
            card.classList.add("reveal-element");
        }

    });

}


/* =========================================================
   6. HOVER ANIMATION SUPPORT
   ---------------------------------------------------------
   Adds a lightweight hover state class.
   CSS handles the actual visual transformation.
   ========================================================= */

function initializeHoverAnimations() {

    const animatedCards = document.querySelectorAll(
        ".collection-card, .offer-card, .social-card"
    );

    if (!animatedCards.length) {
        return;
    }

    animatedCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            card.classList.add("is-hovered");

        });

        card.addEventListener("mouseleave", () => {

            card.classList.remove("is-hovered");

        });

        /*
         * Touch devices do not have traditional hover.
         * These events prevent hover classes from becoming stuck.
         */

        card.addEventListener(
            "touchstart",
            () => {

                card.classList.add("is-touching");

            },
            { passive: true }
        );

        card.addEventListener(
            "touchend",
            () => {

                card.classList.remove("is-touching");

            },
            { passive: true }
        );

    });

}


/* =========================================================
   7. HERO SLIDE VISUAL EFFECT
   ---------------------------------------------------------
   Adds an animation class whenever the active hero
   slide changes.
   ========================================================= */

function initializeHeroAnimation() {

    const heroSlides = document.querySelectorAll(".hero-slide");

    if (!heroSlides.length) {
        return;
    }

    heroSlides.forEach((slide) => {

        if (slide.classList.contains("active")) {

            slide.classList.add("hero-animation-active");

        }

    });

}


/* =========================================================
   8. PAGE LOAD TRANSITION
   ---------------------------------------------------------
   Adds page-loaded class to body.

   animation.css uses:
   body.page-loaded
   ========================================================= */

function initializePageTransition() {

    // Small delay allows browser to finish initial rendering
    window.requestAnimationFrame(() => {

        document.body.classList.add("page-loaded");

    });

}


/* =========================================================
   9. FOOTER REVEAL
   ========================================================= */

function initializeFooterAnimation() {

    const footer = document.querySelector(".site-footer");

    if (!footer) {
        return;
    }

    footer.classList.add("reveal-element");

}


/* =========================================================
   10. REDUCED MOTION ACCESSIBILITY
   ---------------------------------------------------------
   Respect user's operating-system animation preference.
   ========================================================= */

function checkReducedMotionPreference() {

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

    if (prefersReducedMotion.matches) {

        document.documentElement.classList.add(
            "reduce-motion"
        );

    }

}


/* =========================================================
   11. WINDOW RESIZE HANDLER
   ---------------------------------------------------------
   Keeps animation-related calculations stable when the
   browser width changes.
   ========================================================= */

function initializeResizeHandler() {

    let resizeTimer;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

            document.dispatchEvent(
                new CustomEvent("bolani:resize")
            );

        }, 200);

    });

}


/* =========================================================
   12. INITIALIZE EXTRA ANIMATION FEATURES
   ========================================================= */

checkReducedMotionPreference();
initializeHeroAnimation();
initializeFooterAnimation();
initializeResizeHandler();


/* =========================================================
   13. PUBLIC ANIMATION API
   ---------------------------------------------------------
   Other JavaScript files can use these functions through:

   window.BolaniAnimations
   ========================================================= */

window.BolaniAnimations = {

    revealElement(element) {

        if (!element) {
            return;
        }

        element.classList.add("is-visible");

    },

    resetElement(element) {

        if (!element) {
            return;
        }

        element.classList.remove("is-visible");

    },

    refresh() {

        initializeScrollReveal();

    }

};


/* =========================================================
   END OF animation.js
   ========================================================= */