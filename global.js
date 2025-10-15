console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// var navLinks = $$("nav a");

// const currentPageURL = location.href;

// const currentLink = navLinks.find(link => link.href === currentPageURL);

// currentLink?.classList.add('current');

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'cv_resume/', title: 'CV/Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/lmarabeh', title: 'GitHub' },
];

let nav = document.createElement('nav');
let ul = document.createElement('ul');
nav.append(ul);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  if (url.startsWith('http')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  li.append(a);
  ul.append(li);
}

document.body.prepend(nav);