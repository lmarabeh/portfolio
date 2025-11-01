// // Import from global.js
// import { fetchJSON, renderProjects } from '../global.js';

// // Create a main function to run all your page logic
// async function loadProjects() {
//   // Get the data
//   const projects = await fetchJSON('../lib/projects.json');
  
//   // Find the container on the page
//   const projectsContainer = document.querySelector('.projects');

//   // Counter for title
//   const projectsTitle = document.querySelector('.projects-title');

//   // Check if we found the data and the container
//   if (projects && projectsContainer) {
    
//     // Clear the container 
//     projectsContainer.innerHTML = ''; 

//     // Update the title with the number of projects
//     if (projectsTitle) {
//       projectsTitle.textContent = `${projects.length} Projects`;
//     }

//     // Loop through the projects
//     projects.forEach(project => {
      
//       // Call helper function for EACH project
//             renderProjects(project, projectsContainer, 'h3'); 
//     });
    
//   } else {
//     console.error('Could not load projects or find container.');
//   }
// }

// // Call the main function to load projects when the page loads
// loadProjects();

// // Import D3.js for data visualization
// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// // Draw a static pie chart with D3
// // let data = [
// //   { value: 1, label: 'apples' },
// //   { value: 2, label: 'oranges' },
// //   { value: 3, label: 'mangos' },
// //   { value: 4, label: 'pears' },
// //   { value: 5, label: 'limes' },
// //   { value: 5, label: 'cherries' },
// // ];
// // let sliceGenerator = d3.pie().value((d) => d.value);
// // let arcData = sliceGenerator(data);
// // let arcs = arcData.map((d) => arcGenerator(d));

// // let colors = d3.scaleOrdinal(d3.schemeTableau10);
// // arcs.forEach((arc, idx) => {
// //     d3.select('svg')
// //       .append('path')
// //       .attr('d', arc)
// //       .attr('fill', colors(idx));
// // })

// // Create legend
// // let legend = d3.select('.legend');
// // data.forEach((d, idx) => {
// //   legend
// //     .append('li')
// //     .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
// //     .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// // });





// // Plotting actual data from projects.json
// let projects = await fetchJSON('../lib/projects.json');
// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );


// let data = rolledData.map(([year, count]) => {
//   return { value: count, label: year };
// });

// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));

// let colors = d3.scaleOrdinal(d3.schemeTableau10);
// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx));
// })

// // how you add class name as attributes using D3
// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//     legend.append('li')
//           .attr('style', `--color:${colors(idx)}`)
//           .attr('class', 'legend-item')
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
// })

// // Search bar functionality
// let query = '';

// let searchInput = document.querySelector('.searchBar');

// searchInput.addEventListener('input', (event) => {  
//   // update query value
//   query = event.target.value;
//   // filter the projects
//   let filteredProjects = projects.filter((project) =>
//     project.title.includes(query),
//   );

//   // Render updated projects
//   projectsContainer.innerHTML = '';
//   filteredProjects.forEach(project => {
//     renderProjects(project, projectsContainer, 'h3');
//   });
// });

import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let projects = [];
let projectsContainer;
let projectsTitle;

// -------------------------
// Main load function
// -------------------------
async function loadProjects() {
  projects = await fetchJSON('../lib/projects.json');
  projectsContainer = document.querySelector('.projects');
  projectsTitle = document.querySelector('.projects-title');

  if (projects && projectsContainer) {
    projectsContainer.innerHTML = '';
    projectsTitle.textContent = `${projects.length} Projects`;

    projects.forEach(project => {
      renderProjects(project, projectsContainer, 'h3'); 
    });

    // Only run after projects are loaded
    drawChart();
    enableSearchBar();
  } else {
    console.error('Could not load projects or find container.');
  }
}

loadProjects();

// -------------------------
// D3 Pie Chart
// -------------------------
function drawChart() {
  const rolledData = d3.rollups(projects, (v) => v.length, (d) => d.year);
  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('svg');
  svg.selectAll('*').remove();

  arcData.forEach((d, idx) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(idx));
  });

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// -------------------------
// Search Bar Functionality
// -------------------------
function enableSearchBar() {
  const searchInput = document.querySelector('.searchBar');

  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();

    const filteredProjects = projects.filter((project) => {
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });

    // Re-render filtered projects
    projectsContainer.innerHTML = '';
    filteredProjects.forEach(project => {
      renderProjects(project, projectsContainer, 'h3');
    });

    // Update title
    projectsTitle.textContent = `${filteredProjects.length} Projects`;
  });
}