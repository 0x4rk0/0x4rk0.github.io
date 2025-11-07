var margin = [20, 120, 20, 140],
    width = 1280 - margin[1] - margin[3],
    height = 800 - margin[0] - margin[2],
    viewerWidth = getViewportDimension(width + margin[1] + margin[3], 'width'),
    viewerHeight = getViewportDimension(height + margin[0] + margin[2], 'height'),
    depthSpacing = 220,
    verticalSpacing = 1.35,
    i = 0,
    duration = 1250,
    root;

var tree = d3.layout.tree()
    .size([height, width])
    .separation(function(a, b) {
      return (a.parent === b.parent ? 1.4 : 1.8);
    });

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var zoom = d3.behavior.zoom()
    .scaleExtent([0.2, 4])
    .on("zoom", zoomed);

var svg = d3.select("#body").append("svg:svg")
    .attr("width", viewerWidth)
    .attr("height", viewerHeight)
    .call(zoom);

var viewport = svg.append("svg:g");

var vis = viewport.append("svg:g")
    .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

resizeCanvas();

if (typeof window !== 'undefined') {
  d3.select(window).on('resize', resizeCanvas);
}

d3.json("arf.json", function(json) {
  root = json;
  root.x0 = height / 2;
  root.y0 = 0;

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

/*  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  } */
  root.children.forEach(collapse);
  update(root);
  centerNode(root);
});

function update(source) {
  // var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * depthSpacing;
    d.x = d.x * verticalSpacing;
  });

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", handleNodeClick);

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append('a')
      .attr("target", "_blank")
      .attr('xlink:href', function(d) { return d.url; })
      .append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill: rgb(0, 0, 0)", function(d) { return d.free ? 'black' : '#999'; })
      .style("fill-opacity", 1e-6);

  nodeEnter.append("svg:title")
    .text(function(d) {
      return d.description;
    });

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function centerNode(source) {
  var scale = zoom.scale();
  var x = -(source.y0 || source.y || 0);
  var y = -(source.x0 || source.x || 0);

  x = x * scale + viewerWidth / 2;
  y = y * scale + viewerHeight / 2;

  zoom.translate([x, y]);
  viewport.transition()
      .duration(duration)
      .attr("transform", "translate(" + x + "," + y + ") scale(" + scale + ")");
}

function zoomed() {
  viewport.attr("transform", "translate(" + d3.event.translate[0] + "," + d3.event.translate[1] + ") scale(" + d3.event.scale + ")");
}

function handleNodeClick(d) {
  if (d.type === 'link' && d.url) {
    if (typeof window !== 'undefined' && window.open) {
      window.open(d.url, '_blank');
    }
    if (d3.event) {
      d3.event.stopPropagation();
    }
    return;
  }

  toggle(d);
  update(d);
  centerNode(d);
}

function resizeCanvas() {
  viewerWidth = getViewportDimension(width + margin[1] + margin[3], 'width');
  viewerHeight = getViewportDimension(height + margin[0] + margin[2], 'height');

  svg.attr("width", viewerWidth).attr("height", viewerHeight);

  if (root) {
    centerNode(root);
  }
}

function getViewportDimension(base, axis) {
  var win = typeof window !== 'undefined' ? window : null;
  var inner = win ? (axis === 'width' ? win.innerWidth : win.innerHeight) : 0;
  var docSize = (typeof document !== 'undefined' && document.documentElement) ?
      (axis === 'width' ? document.documentElement.clientWidth : document.documentElement.clientHeight) : 0;

  return Math.max(base, inner || 0, docSize || 0);
}

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}
