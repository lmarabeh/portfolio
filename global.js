console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// var navLinks = $$("nav a");

// const currentPageURL = location.href;

// const currentLink = navLinks.find(link => link.href === currentPageURL);

// currentLink?.classList.add('current');

// global.js

// Define pages with paths 
let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'cv_resume/', title: 'CV/Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/lmarabeh', title: 'GitHub' },
];

// Define the correct BASE_PATH
const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server root
    : '/portfolio/'; // Your GitHub Pages repo name

// Create the nav and ul elements
let nav = document.createElement('nav');
let ul = document.createElement('ul');
nav.append(ul);

// Loop through each page to create the links
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Prepend the BASE_PATH to all internal links
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }
  
  const li = document.createElement('li');
  const a = document.createElement('a');
  
  a.href = url;
  a.textContent = title;

  // Add attributes for external links (this check is now redundant but harmless)
  if (url.startsWith('http')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  li.append(a);
  ul.append(li);
}

// Attach the finished navigation menu to the webpage
document.body.prepend(nav);

// Theme switcher
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <div class="theme-switcher">
    <label for="theme">Theme:</label>
    <select id="theme">
      <option value="auto">Auto</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>
  `
);

// Get the elements *after* they are on the page
const themeSelect = document.getElementById('theme');
const htmlElement = document.documentElement; // This is the <html> tag

// Apply theme 
function applyTheme(theme) {
  if (theme === 'auto') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      htmlElement.dataset.theme = 'dark';
    } else {
      htmlElement.removeAttribute('data-theme');
    }
  } else if (theme === 'dark') {
    // Set the data-theme attribute to "dark"
    htmlElement.dataset.theme = 'dark';
  } else {
    // 'light'
    htmlElement.removeAttribute('data-theme');
  }
}

// Save user input
function saveTheme(theme) {
  localStorage.setItem('theme', theme);
}

// Listen for a change on the dropdown
themeSelect.addEventListener('change', () => {
  const selectedTheme = themeSelect.value;
  applyTheme(selectedTheme);
  saveTheme(selectedTheme);
});

// Apply the saved theme when the page loads
const savedTheme = localStorage.getItem('theme') || 'auto';
themeSelect.value = savedTheme;
applyTheme(savedTheme);

// Projects helper functions
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
  throw new Error(`Failed to fetch projects: ${response.statusText}`);
}
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// Create a renderProjects function 
export function renderProjects(project, containerElement, headingLevel = 'h2') {
  const article = document.createElement('article');
  article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
  `;
  containerElement.appendChild(article);
}

// Github API function
export async function fetchGithubData(username) {
  try {
    const data = await fetchJSON(`https://api.github.com/users/${username}`);
    
    // Return data
    return data;
    
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
  }
}