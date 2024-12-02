import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import './Globe.css'; // Add styles for the modal and highlight

const Globe = () => {
  const svgRef = useRef();
  const [worldData, setWorldData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null); // Track the selected country
  const [projection, setProjection] = useState(() =>
    geoOrthographic().scale(250).translate([400, 300]).clipAngle(90)
  ); // Initialize projection on first render

  useEffect(() => {
    fetch('/exploronomics/data/world-geojson.json') // Update the path as per your deployment
      .then((response) => response.json())
      .then((data) => setWorldData(data))
      .catch((error) => console.error('Error loading GeoJSON data:', error));
  }, []);

  useEffect(() => {
    if (!worldData) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    projection.scale(Math.min(width, height) / 2 - 50).translate([width / 2, height / 2]);

    const path = geoPath().projection(projection);
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove(); // Clear existing elements

    svg.append('g')
      .selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', (d) => (selectedCountry === d ? '#ff9800' : '#ccc'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function (event, d) {
        if (selectedCountry !== d) d3.select(this).attr('fill', '#ff9800'); // Highlight on hover
      })
      .on('mouseout', function (event, d) {
        if (selectedCountry !== d) d3.select(this).attr('fill', '#ccc'); // Remove highlight on hover out
      })
      .on('click', (event, d) => {
        setSelectedCountry(selectedCountry === d ? null : d); // Toggle selection
      });

    const drag = d3.drag()
      .on('drag', (event) => {
        const rotate = projection.rotate();
        const sensitivity = 0.3;
        const deltaX = event.dx * sensitivity;
        const deltaY = event.dy * sensitivity;

        projection.rotate([rotate[0] + deltaX, rotate[1] - deltaY]);
        svg.selectAll('path').attr('d', path);
      });

    svg.call(drag);
  }, [worldData, selectedCountry, projection]);

  const handleCloseModal = () => setSelectedCountry(null);

  return (
    <div>
      <svg ref={svgRef}></svg>
      {selectedCountry && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <h2>{selectedCountry.properties.name}</h2>
            <p>This is information about {selectedCountry.properties.name}.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Globe;
