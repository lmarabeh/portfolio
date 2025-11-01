import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// -------------------------
// Global Variables
// -------------------------
let projects = [];
let projectsContainer;
let projectsTitle;
let selectedIndex = -1;
let pieData = []; 

// Define D3 generators/scales that don't depend on data
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

// -------------------------
// Main load function
// -------------------------
async function loadProjects() {
  projects = await fetchJSON('../lib/projects.json');
  projectsContainer = document.querySelector('.projects');
  projectsTitle = document.querySelector('.projects-title');

  if (projects && projectsContainer) {
    // Render the full list of projects initially
    projectsTitle.textContent = `${projects.length} Projects`;
    projectsContainer.innerHTML = ''; 
    projects.forEach(project => {
      renderProjects(project, projectsContainer, 'h3'); 
    });

    // Call the new plotting function
    renderPieChart(projects);
    
    // Enable the search bar
    enableSearchBar();
  } else {
    console.error('Could not load projects or find container.');
  }
}

// Load
loadProjects();

// -------------------------
// Refactored D3 Pie Chart
// This function can be called with *any* array of projects
// -------------------------
function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);

  // Update the global pieData variable instead of creating a new 'newData'
  pieData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(pieData); 

  // Clear old paths and legends
  const svg = d3.select('svg');
  svg.selectAll('*').remove();
  
  const legend = d3.select('.legend');
  legend.selectAll('*').remove();
  // -------------------------

  // Update paths
  newArcData.forEach((d, idx) => {
    svg.append('path')
      .attr('d', arcGenerator(d)) 
      .attr('fill', colors(idx))  
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        
        // Rerender projects based on new selection
        updateVisualState(); 
      });
  });

  // Update legends
  pieData.forEach((d, idx) => { 
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)      
      .attr('class', 'legend-item')                 
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`) 
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;

        // Rerender projects based on new selection
        updateVisualState();
      });
  });

  updateVisualState(); 
}

// -------------------------
// Master State/Render Function
// -------------------------
function updateVisualState() {

  // Get the search query
  const query = document.querySelector('.searchBar').value.toLowerCase();
  
  // Get the selected year (if any)
  const selectedYear = (selectedIndex === -1) ? null : pieData[selectedIndex].label;
  
  // First filter by search query
  let filteredProjects = projects.filter((project) => {
    if (!query) return true; // If no query, keep all
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });
  
  if (selectedIndex !== -1) {
    // Now, this filter will run for "2023" AND for "undefined"
    // project.year === "2023" (works)
    // project.year === undefined (also works)
    filteredProjects = filteredProjects.filter(project => project.year === selectedYear);
  }

  // Render the filtered projects
  projectsContainer.innerHTML = '';
  filteredProjects.forEach(project => {
    renderProjects(project, projectsContainer, 'h3');
  });

  // Update the title
  let title = `${filteredProjects.length} Projects`;
  if (selectedYear) {
    title += ` in ${selectedYear}`;
  }
  projectsTitle.textContent = title;

  // Update the chart/legend styles
  d3.select('svg').selectAll('path')
    .attr('class', (_, idx) => (
      selectedIndex === -1
        ? null
        : (idx === selectedIndex ? 'selected' : 'faded')
    ));

  d3.select('.legend').selectAll('li')
    .attr('class', (_, idx) => (
      selectedIndex === -1
        ? 'legend-item' 
        : (idx === selectedIndex ? 'legend-item selected' : 'legend-item faded')
    ));
}


// -------------------------
// Search Bar Functionality
// -------------------------
function enableSearchBar() {
  const searchInput = document.querySelector('.searchBar');

  searchInput.addEventListener('input', () => {
    // Reset the pie chart selection
    selectedIndex = -1; 
    
    // Get the new list of projects based on the search
    const query = searchInput.value.toLowerCase();
    const projectsToChart = projects.filter((project) => {
      if (!query) return true;
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });

    // Re-draw the pie chart with ONLY the searched projects
    renderPieChart(projectsToChart);
    
    // Re-draw the project cards
    updateVisualState();
  });
}