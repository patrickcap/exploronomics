import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import './Globe.css'; // Add styles for the modal and highlight

const Globe = () => {
  const svgRef = useRef();
  const [worldData, setWorldData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null); // Track the selected country
  const [economicData, setEconomicData] = useState(null); // Store economic data
  const [tableData, setTableData] = useState([]); // Store table data for modal
  const [years, setYears] = useState([]); // Store years for table columns

  const [projection, setProjection] = useState(() =>
    geoOrthographic().scale(250).translate([400, 300]).clipAngle(90)
  ); // Initialize projection on first render

  // Load GeoJSON data
  useEffect(() => {
    fetch('/exploronomics/data/world-geojson.json') // Update the path as per your deployment
      .then((response) => response.json())
      .then((data) => setWorldData(data))
      .catch((error) => console.error('Error loading GeoJSON data:', error));
  }, []);

  // Load economic CSV data
  useEffect(() => {
    d3.csv('/exploronomics/data/world_economic_data_2023_1999.csv')
      .then((data) => {
        setEconomicData(data);

        // Extract year columns from the first row of the data
        if (data.length > 0) {
          const yearColumns = Object.keys(data[0]).filter((key) =>
            key.match(/\d{4} \[YR\d{4}\]/)
          );
          const formattedYears = yearColumns.map((year) => year.split(' ')[0]); // Extract years
          setYears(formattedYears.reverse()); // Reverse the order for descending years
        }
      })
      .catch((error) => console.error('Error loading economic data:', error));
  }, []);

  // Update the table data for the modal
  useEffect(() => {
    if (selectedCountry && economicData) {
      const countryName = selectedCountry.properties.name;

      // Filter economic data for the selected country
      const countryInfo = economicData.filter((row) => row['Country Name'] === countryName);

      if (countryInfo.length > 0) {
        setTableData(countryInfo);
      } else {
        setTableData([]);
      }
    }
  }, [selectedCountry, economicData]);

  // Update the globe rendering
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
            <div className="modal-content">
              {tableData.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Series Name</th>
                      {years.map((year) => (
                        <th key={year}>{year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td>{row['Series Name']}</td>
                        {years.map((year) => (
                          <td key={year}>
                            {row[`${year} [YR${year}]`] !== '..'
                              ? row[`${year} [YR${year}]`]
                              : 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No data available for this country.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Globe;
