import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';

const Globe = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [worldData, setWorldData] = useState(null);

  // Function to handle resizing of the window
  const getSize = () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  // Set the size on initial render and window resize
  const [size, setSize] = useState(getSize());

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch the GeoJSON file from the public folder
    fetch('/data/world-geojson.json')  // Correct path to the file in the public folder
      .then((response) => response.json())
      .then((data) => {
        setWorldData(data);  // Set the GeoJSON data
      })
      .catch((error) => console.error('Error loading GeoJSON data:', error));
  }, []);

  useEffect(() => {
    if (!worldData) return; // Wait until the worldData is loaded

    // Initialize the projection and path generator
    const projection = geoOrthographic()
      .scale(Math.min(size.width, size.height) / 2)  // Ensure the globe scales to fit
      .translate([size.width / 2, size.height / 2])
      .clipAngle(90);

    const path = geoPath().projection(projection);
    const svg = d3.select(svgRef.current)
      .attr('width', size.width)
      .attr('height', size.height)
      .attr('viewBox', `0 0 ${size.width} ${size.height}`)  // Set viewBox for scaling
      .attr('preserveAspectRatio', 'xMidYMid meet'); // Ensure aspect ratio is maintained

    // Use the features array directly from the GeoJSON data
    const countries = svg.selectAll('path')
      .data(worldData.features)  // Data comes from the features array in the GeoJSON
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5);

    // Create and style the tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.7)')
      .style('color', '#fff')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('font-size', '12px');

    // Add interactivity (dragging to rotate the globe)
    const drag = d3.drag()
      .on('drag', (event) => {
        const rotate = projection.rotate();
        
        // Reduce sensitivity and smooth the movement by scaling the delta values
        const sensitivity = 0.3;  // Adjust this value for smoothness
        const deltaX = event.dx * sensitivity;
        const deltaY = event.dy * sensitivity;
        
        // Apply smooth rotation
        projection.rotate([rotate[0] + deltaX, rotate[1] - deltaY]); // Adjust direction

        svg.selectAll('path').attr('d', path); // Re-render the paths
      });

    svg.call(drag);

    // Hover effect: Highlight country on hover and display tooltip
    countries
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('fill', 'orange');  // Change color to highlight on hover

        // Show the tooltip and update its position
        tooltip.style('visibility', 'visible')
          .text(d.properties.name);  // Set the tooltip text to the country's name

        // Position the tooltip to the left of the cursor
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        tooltip.style('left', `${mouseX - tooltip.node().offsetWidth - 10}px`)
          .style('top', `${mouseY - tooltip.node().offsetHeight / 2}px`);
      })
      .on('mousemove', function (event) {
        // Keep the tooltip updated when the mouse moves over the country
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        tooltip.style('left', `${mouseX - tooltip.node().offsetWidth - 10}px`)
          .style('top', `${mouseY - tooltip.node().offsetHeight / 2}px`);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition().duration(200)
          .attr('fill', '#ccc');  // Reset color when hover ends

        // Hide the tooltip when mouse leaves the country
        tooltip.style('visibility', 'hidden');
      });

    svg.selectAll('path').attr('d', path);
  }, [worldData, size]);

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100vh', width: '100vw' }}>
      <svg ref={svgRef}></svg>
      {/* Tooltip is positioned absolutely within the body */}
      <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
};

export default Globe;
