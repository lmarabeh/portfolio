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

// Import D3.js for data visualization
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});
d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// Draw a static pie chart with D3
let data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' },
];
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
})

// Create legend
// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//   legend
//     .append('li')
//     .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//     .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// });



// how you add class name as attributes using D3
let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`)
          .attr('class', 'legend-item')
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
})

