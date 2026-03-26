import { fetchJSON, renderProjects } from './global.js';

async function init() {
  // 1. Fetch & Render Projects
  const projects = await fetchJSON('./lib/projects.json');
  
  if (projects) {
    // Let's render the first 4 projects or however many are valid for the home page.
    const latestProjects = projects.slice(0, 4);
    const projectsContainer = document.querySelector('.projects_home');

    if (projectsContainer) {
      projectsContainer.innerHTML = ''; 
      latestProjects.forEach((project, index) => {
        // Skip over totally empty mock projects if necessary, 
        // but we'll render whatever is passed from projects.json
        renderProjects(project, projectsContainer, index);
      });
    }
  } else {
    console.error('Could not load projects.json data.');
  }

  // 2. GSAP Animations Initialization
  // Ensure GSAP and ScrollTrigger are loaded via CDN in HTML
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Fade-up hero elements
    gsap.fromTo(".hero-text", 
      { y: 60, opacity: 0 }, 
      { 
        y: 0, 
        opacity: 1, 
        duration: 1.4, 
        stagger: 0.15, 
        ease: "power3.out", 
        delay: 0.2 
      }
    );

    // Manifesto fade up on scroll
    gsap.fromTo(".manifesto-text",
      { y: 50, opacity: 0 },
      {
        y: 0, 
        opacity: 1, 
        duration: 1.2, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#manifesto",
          start: "top 80%",
        }
      }
    );

    // Setup Sticky Stacking Sub-animations 
    // Wait a tiny bit for the DOM to fully populate the project-cards
    setTimeout(() => {
      const cards = document.querySelectorAll('.project-card');
      
      cards.forEach((card, i) => {
        // We only animate the scale down for cards that have something under them
        if (i < cards.length - 1) {
          try {
            gsap.to(card, {
              scale: 0.92,
              opacity: 0.4,
              filter: "blur(4px)",
              scrollTrigger: {
                trigger: cards[i + 1],  // The next card
                start: "top 85%",       // When the next card reaches 85% of viewport
                end: "top 15%",         // When the next card reaches top
                scrub: 1,               // Smooth scrubbing 
              }
            });
          } catch(e) {
            console.error("GSAP ScrollTrigger Error:", e);
          }
        }
      });
    }, 100);
  } else {
    console.warn('GSAP is not loaded. Skipping animations.');
  }
}

init();