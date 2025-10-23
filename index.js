import { fetchJSON, renderProjects} from './global.js';
const projects = await fetchJSON('./lib/projects.json');

async function loadProjects() {
  // Get the first three projects
  const latestProjects = projects.slice(0, 3);
  
  // Find the container on the page
  const projectsContainer = document.querySelector('.projects_home');

  // Check if we found the data and the container
  if (latestProjects && projectsContainer) {
    
    // Clear the container 
    projectsContainer.innerHTML = ''; 

    // Loop through the projects
    latestProjects.forEach(project => {
      
      // Call helper function for EACH project
      renderProjects(project, projectsContainer, 'h2');
    });
    
  } else {
    console.error('Could not load projects or find container.');
  }
}

// Call the main function to load projects when the page loads
loadProjects();