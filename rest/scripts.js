// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    let currentActiveSectionId = window.location.hash || '#introduction';

    function setActiveLink(targetId) {
        sidebarLinks.forEach(link => {
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    function smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update hash without adding to history to avoid jumpy behavior on multiple clicks
            // and to allow for bookmarking/sharing the current section.
            if(history.pushState) {
                history.pushState(null, null, targetId);
            } else {
                window.location.hash = targetId;
            }
            currentActiveSectionId = targetId; // Update after successful scroll and hash update
            setActiveLink(targetId);
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            smoothScrollTo(targetId);
        });
    });

    // Set initial active link based on hash or default
    const initialTargetElement = document.querySelector(currentActiveSectionId);
    if (initialTargetElement) {
        // No scroll on initial load, just set active state
        setActiveLink(currentActiveSectionId);
         // If there's a hash, scroll to it on load, but only if it's not the default intro
        if (window.location.hash && window.location.hash !== '#introduction') {
            setTimeout(() => { // Timeout to ensure layout is stable
                 initialTargetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
            }, 100);
        }
    } else if (sidebarLinks.length > 0) { // Fallback if hash is invalid
        currentActiveSectionId = sidebarLinks[0].getAttribute('href');
        setActiveLink(currentActiveSectionId);
    }

    // Intersection Observer for highlighting active link on scroll
    const observerOptions = {
        root: null, // viewport
        rootMargin: '-70px 0px -50% 0px', // Adjust top margin for sticky header, bottom margin to prefer top sections
        threshold: 0.01 // Trigger when even a small part of the section is visible within the rootMargin
    };

    let manualNavigation = false; // Flag to track if navigation was triggered by click

    const observerCallback = (entries) => {
        if (manualNavigation) return; // Don't interfere if user clicked a link

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = '#' + entry.target.id;
                // Update hash and active link if it's different from the current one
                if (targetId !== currentActiveSectionId) {
                    if(history.pushState) {
                        // Use replaceState to avoid polluting history during scroll
                        history.replaceState(null, null, targetId);
                    } else {
                        window.location.hash = targetId;
                    }
                    setActiveLink(targetId);
                    currentActiveSectionId = targetId; // Update current active section based on scroll
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    contentSections.forEach(section => observer.observe(section));

    // Add listeners to sidebar links to set manualNavigation flag
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            manualNavigation = true;
            // Reset flag after a short delay to allow scroll-based updates again
            setTimeout(() => {
                manualNavigation = false;
            }, 1000); // Adjust delay as needed
        });
    });
    
    // Stop checkbox click from propagating to summary (which would toggle details)
    // This makes the checkbox purely visual/interactive for the user without affecting expand/collapse
    const checkboxes = document.querySelectorAll('details > summary > input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', (event) => {
            event.stopPropagation(); 
        });
    });
});
