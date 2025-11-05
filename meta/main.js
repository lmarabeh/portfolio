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
    });
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


// Drawing the dots
function renderScatterPlot(data, commits) {
  // Define dimensions
  const width = 1000;
  const height = 600;

  // Create SVG using D3
  const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

  // Create both scales
  const xScale = d3
  .scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, width])
  .nice();

const margin = { top: 10, right: 10, bottom: 30, left: 20 };
const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
const dots = svg.append('g').attr('class', 'dots');

dots
  .selectAll('circle')
  .data(commits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', 5)
  .attr('fill', 'steelblue');
}

// Main execution
let data = await loadData();
let commits = processCommits(data);
renderScatterPlot(data, commits);
renderCommitInfo(data, commits);
console.log(commits);