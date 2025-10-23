// Import from global.js
import { fetchJSON, renderProjects } from '../global.js';

// Create a main function to run all your page logic
async function loadProjects() {
  // Get the data
  const projects = await fetchJSON('../lib/projects.json');
  
  // Find the container on the page
  const projectsContainer = document.querySelector('.projects');

  // Check if we found the data and the container
  if (projects && projectsContainer) {
    
    // Clear the container (Step 2 from your instructions)
    projectsContainer.innerHTML = ''; 

    // Loop through the projects (This is your loop!)
    projects.forEach(project => {
      
      // 8. Call your helper function for EACH project
            renderProjects(project, projectsContainer, 'h3'); // Using 'h3' as an example
    });
    
  } else {
    console.error('Could not load projects or find container.');
  }
}

// 9. Run your main function to start everything
loadProjects();