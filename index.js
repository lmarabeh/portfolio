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

// Fetch GitHub profile data
const githubData = await fetchGitHubData('lmarabeh');
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
  profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}