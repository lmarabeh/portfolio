console.log('SYSTEM INITIALIZED');

// Dynamically inject Tailwind CSS for pages that don't have it directly in HTML
if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
  const twScript = document.createElement('script');
  twScript.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(twScript);
  
  const twConfig = document.createElement('script');
  twConfig.innerHTML = `
    tailwind.config = {
      theme: {
        extend: {
          colors: { brandDark: '#0D0D12', brandAccent: '#C9A84C', brandLight: '#FAF8F5' },
          fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Playfair Display', 'serif'], mono: ['JetBrains Mono', 'monospace'] }
        }
      }
    }
  `;
  document.head.appendChild(twConfig);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'cv_resume/', title: 'Resume' },
  { url: 'meta/', title: 'Meta' }
];

const BASE_PATH = location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? '/' : '/portfolio/';

function initializeNavbar() {
  const currentPath = location.pathname;
  
  const navContainer = document.createElement('div');
  navContainer.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 w-full md:w-auto px-4 md:px-0';
  
  navContainer.innerHTML = `
    <nav id="floating-nav" class="flex items-center justify-between gap-4 md:gap-12 px-6 py-4 rounded-full bg-transparent text-[#FAF8F5]/80 transition-all duration-500 mx-auto w-full md:w-auto border border-transparent">
      <a href="${BASE_PATH}" class="font-serif italic font-bold text-2xl text-white mr-2 shrink-0">L.M.</a>
      <ul class="flex items-center gap-4 md:gap-8 font-sans text-xs md:text-sm font-medium uppercase tracking-wider">
        ${pages.map(p => {
          let url = p.url.startsWith('http') ? p.url : BASE_PATH + p.url;
          let isCurrent;
          if (p.url === 'index.html') {
            isCurrent = currentPath === BASE_PATH || currentPath === BASE_PATH + 'index.html';
          } else {
            isCurrent = currentPath.endsWith(p.url) || currentPath.endsWith(p.url.slice(0, -1));
          }
          return `<li><a href="${url}" class="${isCurrent ? 'text-[#C9A84C]' : 'hover:text-[#C9A84C]'} transition-colors relative group block py-2">
            ${p.title}
            <span class="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A84C] transition-all origin-left ${isCurrent ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"></span>
          </a></li>`;
        }).join('')}
      </ul>
    </nav>
  `;
  document.body.prepend(navContainer);

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('floating-nav');
    if (!nav) return;
    if (window.scrollY > 30) {
      nav.classList.remove('bg-transparent', 'border-transparent');
      nav.classList.add('bg-[#101015]/90', 'backdrop-blur-md', 'border-white/10', 'shadow-2xl');
    } else {
      nav.classList.add('bg-transparent', 'border-transparent');
      nav.classList.remove('bg-[#101015]/90', 'backdrop-blur-md', 'border-white/10', 'shadow-2xl');
    }
  });
}

function initMagneticButtons() {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px) scale(1)`;
    });
  });
}

// Data Fetching Helpers
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(project, containerElement, index) {
  const article = document.createElement('article');
  
  // Tailwind classes for the Sticky Stacking Archive
  article.className = 'project-card sticky top-28 md:top-36 w-full bg-[#181822] rounded-[2.5rem] md:rounded-[3rem] border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.5)] origin-top mb-12';
  
  // Number formatting
  const idxString = String(index + 1).padStart(2, '0');
  
  article.innerHTML = `
    <div class="p-8 md:p-14 lg:p-16 flex flex-col justify-center flex-1 z-10">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-[#C9A84C] font-mono tracking-widest text-sm bg-black/40 px-3 py-1 rounded-full border border-white/5">${project.year || '2025'} // ${idxString}</span>
      </div>
      <h3 class="text-3xl md:text-5xl lg:text-6xl font-sans font-bold text-white mb-6 leading-tight tracking-tight">${project.title}</h3>
      <p class="text-gray-400 font-sans text-base md:text-xl max-w-xl mb-10 leading-relaxed">${project.description || 'Details coming soon.'}</p>
      <a href="#" class="inline-flex w-max items-center gap-3 text-white font-mono uppercase text-xs tracking-[0.2em] group">
        Explore Project
        <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#C9A84C] group-hover:border-[#C9A84C] group-hover:text-black transition-all">
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" class="transition-transform group-hover:rotate-45"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
        </div>
      </a>
    </div>
    <div class="w-full md:w-[45%] h-[300px] md:h-auto bg-[#0a0a0f] relative overflow-hidden group border-l border-white/5 shrink-0">
      ${project.image 
        ? `<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
           <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110">`
        : `<div class="w-full h-full flex flex-col items-center justify-center text-[#2A2A35] font-mono tracking-widest gap-2">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="opacity-50"><path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
             <span>IMAGE NO. ${idxString}</span>
           </div>`
      }
    </div>
  `;
  containerElement.appendChild(article);
}

export async function fetchGithubData(username) {
  try {
    return await fetchJSON(`https://api.github.com/users/${username}`);
  } catch (err) {
    console.error(err);
  }
}

// Initializing things
document.addEventListener("DOMContentLoaded", () => {
  initializeNavbar();
  initMagneticButtons();
});