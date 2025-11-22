import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Fetch loc.csv data with Row conversion function
async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

// Process commits from loaded data
function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false,
        enumerable: true,
        configurable: false
      });

      return ret;
    })
    .sort((a, b) => a.datetime - b.datetime);
}

// Render commit info in a definition list
function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add file count
  const fileCount = d3.rollup(
    data,
    (v) => v.length,
    (d) => d.file
  ).size;

  dl.append('dt').text('Files');
  dl.append('dd').text(fileCount);

  // Add Max depth
  const maxDepth = d3.max(data, (d) => d.depth);
  dl.append('dt').text('Max depth');
  dl.append('dd').text(maxDepth);

  // Add longest line
  const longestLine = d3.max(data, (d) => d.length);
  dl.append('dt').text('Longest line');
  dl.append('dd').text(longestLine);

  // Add max lines
  const maxLines = d3.max(commits, (d) => d.totalLines); 
  dl.append('dt').text('Max lines');
  dl.append('dd').text(maxLines);
}


let xScale, yScale;

// Drawing the dots
function renderScatterPlot(data, commits) {
  // ... (All your setup: width, height, svg, margins, scales, axes) ...
  const width = 1000;
  const height = 600;

  // Create SVG using D3
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');


  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Create axes
  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
  yScale = d3
    .scaleLinear()
    .domain([14, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Add Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis')
    .call(xAxis);
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis')
    .call(yAxis);
    
  // Draw dots
  const dots = svg.append('g').attr('class', 'dots');
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('class', 'dot') 
    .on('mouseenter', (event, commit) => {
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      updateTooltipVisibility(false);
    });
  
  // Brushing functions

  function brushed(event) {
    const selection = event.selection;
    d3.selectAll('circle').classed('selected', (d) =>
      isCommitSelected(selection, d)
    );
    renderSelectionCount(selection);
    renderLanguageBreakdown(selection);
  }

  function isCommitSelected(selection, commit) {
    if (!selection) return false;
    const [x0, y0] = selection[0];
    const [x1, y1] = selection[1];
    const commitX = xScale(commit.datetime);
    const commitY = yScale(commit.hourFrac);
    return (
      commitX >= x0 &&
      commitX <= x1 &&
      commitY >= y0 &&
      commitY <= y1
    );
  }

  function renderSelectionCount(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
    const countElement = document.querySelector('#selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  }

  function renderLanguageBreakdown(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
    const container = document.getElementById('language-breakdown');
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const lines = selectedCommits.flatMap((d) => d.lines);
    if (lines.length === 0) {
      container.innerHTML = '';
      return;
    }
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type,
    );
    container.innerHTML = '';
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  }

  // Create brush
  svg.call(d3.brush().on('start brush end', brushed));

  // Raise dots
  dots.raise();
}
// Main execution
let data = await loadData();
let commits = processCommits(data);
renderScatterPlot(data, commits);
renderCommitInfo(data, commits);
console.log(commits);

// Render tooltip content
function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

// Animation
let commitProgress = 100;
let timeScale = d3
  .scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);

let filteredCommits = commits;
// Event Listener for slider
function onTimeSliderChange() {
  const slider = document.getElementById('commit-progress');
  const timeDisplay = document.getElementById('commit-time');
  
  commitProgress = Number(slider.value);
  commitMaxTime = timeScale.invert(commitProgress);
  
  if (timeDisplay) {
    timeDisplay.textContent = commitMaxTime.toLocaleString(undefined, {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  updateScatterPlot(filteredCommits);
  updateFileDisplay(filteredCommits);
}

function updateFileDisplay(filteredCommits) {
  let lines = filteredCommits.flatMap((d) => d.lines);
  let files = d3
  .groups(lines, (d) => d.file)
  .map(([name, lines]) => {
    return { name, lines };
  })
  .sort((a, b) => b.lines.length - a.lines.length);

  d3.select('.files').selectAll('div').remove();
  
  
  let filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(
      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt').append('code');
          div.append('dd');
        }),
    );

  // Create the color scale
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

  filesContainer.select('dt > code').text((d) => d.name);
  
  filesContainer
    .select('dd')
    .selectAll('div')
    .data((d) => d.lines)
    .join('div')
    .attr('class', 'loc')
    .style('background', (d) => colorScale(d.type));
}

const slider = document.getElementById('commit-progress');
if (slider) {
  slider.addEventListener('input', onTimeSliderChange);
  onTimeSliderChange(); // Initialize
}

// Update scatter plot
function updateScatterPlot(commits) {
  const svg = d3.select('#chart').select('svg');

  if (commits.length === 0) return;

  xScale.domain(d3.extent(commits, (d) => d.datetime));
  const xAxis = d3.axisBottom(xScale);

  svg.select('.x-axis').transition().duration(1000).call(xAxis);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const dots = svg.select('g.dots');

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  
  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join(
      (enter) => enter.append('circle'),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}

d3.select('#scatter-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
		On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
		I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
    }</a>.
		I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
		Then I looked over all I had made, and I saw that it was very good.
	`,
  );

import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
function onStepEnter(response) {
  const commit = response.element.__data__;
  const filteredCommits = commits.filter((d) => d.datetime <= commit.datetime);
  updateScatterPlot(filteredCommits);
  updateFileDisplay(filteredCommits);
}
const scroller = scrollama();
scroller
  .setup({
    container: '#scrolly-1',
    step: '#scrolly-1 .step',
  })
  .onStepEnter(onStepEnter);
// // Brush event handler
// function brushed(event) {
//   const selection = event.selection; 

//   // Update the dots' appearance
//   d3.selectAll('circle').classed('selected', (d) =>
//     isCommitSelected(selection, d)
//   );

//   // Update the text/DOM
//   renderSelectionCount(selection);
//   renderLanguageBreakdown(selection);
// }

// function isCommitSelected(selection, commit) {
//   // If there is no selection, return false
//   if (!selection) {
//     return false;
//   }

//   // Get the pixel boundaries from the selection
//   const [x0, y0] = selection[0];
//   const [x1, y1] = selection[1];

//   // Get the commit's position in pixels
//   const commitX = xScale(commit.datetime);
//   const commitY = yScale(commit.hourFrac);

//   // Check if the commit's pixel coordinates are inside
//   // the selection's pixel boundaries
//   return (
//     commitX >= x0 &&
//     commitX <= x1 &&
//     commitY >= y0 &&
//     commitY <= y1
//   );
// }

// // Update the selection count display
// function renderSelectionCount(selection) {
//   const selectedCommits = selection
//     ? commits.filter((d) => isCommitSelected(selection, d))
//     : [];

//   const countElement = document.querySelector('#selection-count');
//   countElement.textContent = `${
//     selectedCommits.length || 'No'
//   } commits selected`;
// }

// // Render language breakdown for selected commits
// function renderLanguageBreakdown(selection) {
//   const selectedCommits = selection
//     ? commits.filter((d) => isCommitSelected(selection, d))
//     : [];
//   const container = document.getElementById('language-breakdown');

//   // If no commits are selected, clear the container
//   if (selectedCommits.length === 0) {
//     container.innerHTML = '';
//     return;
//   }
  
//   const lines = selectedCommits.flatMap((d) => d.lines);

//   // If the selected commits have no lines of code, clear the container
//   if (lines.length === 0) {
//     container.innerHTML = '';
//     return;
//   }

//   // Count lines per language
//   const breakdown = d3.rollup(
//     lines,
//     (v) => v.length,
//     (d) => d.type,
//   );

//   // Update DOM with breakdown
//   container.innerHTML = '';
//   for (const [language, count] of breakdown) {
//     const proportion = count / lines.length;
//     const formatted = d3.format('.1~%')(proportion);

//     container.innerHTML += `
//             <dt>${language}</dt>
//             <dd>${count} lines (${formatted})</dd>
//         `;
//   }
// }


// // Call the 'brushed' function on 'start', 'brush', and 'end' events
// svg.call(d3.brush().on('start brush end', brushed));

// // Raise dots
// svg.selectAll('.dots, .overlay ~ *').raise();