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

