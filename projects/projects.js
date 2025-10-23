// Import from global.js
import { fetchJSON, renderProjects } from '../global.js';

// Create a main function to run all your page logic
async function loadProjects() {
  // Get the data
  const projects = await fetchJSON('../lib/projects.json');
  
  // Find the container on the page
  const projectsContainer = document.querySelector('.projects');

  // Counter for title
  const projectsTitle = document.querySelector('.projects-title');

  // Check if we found the data and the container
  if (projects && projectsContainer) {
    
    // Clear the container 
    projectsContainer.innerHTML = ''; 

    // Update the title with the number of projects
    if (projectsTitle) {
      projectsTitle.textContent = `${projects.length} Projects`;
    }

    // Loop through the projects
    projects.forEach(project => {
      
      // Call helper function for EACH project
            renderProjects(project, projectsContainer, 'h3'); 
    });
    
  } else {
    console.error('Could not load projects or find container.');
  }
}

// Call the main function to load projects when the page loads
loadProjects();