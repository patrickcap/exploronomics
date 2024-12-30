import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import './Globe.css';

const Globe = () => {
  const svgRef = useRef();
  const [worldData, setWorldData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [economicData, setEconomicData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [years, setYears] = useState([]);

  const [projection] = useState(() =>
    geoOrthographic().scale(250).translate([400, 300]).clipAngle(90)
  );

  // Country name mapping to bridge difference between d3.js and Data Bank
  const countryNameMap = {
    'England': 'United Kingdom',
    'Democratic Republic of the Congo': 'Congo, Dem. Rep.',
    'Republic of the Congo': 'Congo, Rep.',
    'Ivory Coast': 'Cote d\'Ivoire',
    'United States of America': 'United States',
    'United Republic of Tanzania': 'Tanzania',
    'Iran': 'Iran, Islamic Rep.',
    'Russia': 'Russian Federation',
    'Republic of Serbia': 'Serbia',
    'Slovakia': 'Slovak Republic'
  };

  // Normalize the country name
  const normalizeCountryName = (geoName) => {
    return countryNameMap[geoName] || geoName; // Use mapped name or default to geoName
  };

  useEffect(() => {
    fetch('/exploronomics/data/world-geojson.json')
      .then((response) => response.json())
      .then((data) => setWorldData(data))
      .catch((error) => console.error('Error loading GeoJSON data:', error));
  }, []);

  useEffect(() => {
    d3.csv('/exploronomics/data/world_economic_data_2023_1999_formatted_output.csv')
      .then((data) => {
        setEconomicData(data);

        if (data.length > 0) {
          const yearColumns = Object.keys(data[0]).filter((key) =>
            key.match(/\d{4} \[YR\d{4}\]/)
          );
          const formattedYears = yearColumns.map((year) => year.split(' ')[0]);
          setYears(formattedYears.reverse());
        }
      })
      .catch((error) => console.error('Error loading economic data:', error));
  }, []);

  useEffect(() => {
    if (selectedCountry && economicData) {
      const countryName = normalizeCountryName(selectedCountry.properties.name);

      const countryInfo = economicData.filter((row) => row['Country Name'] === countryName);

      if (countryInfo.length > 0) {
        setTableData(countryInfo);
      } else {
        setTableData([]);
      }
    }
  }, [selectedCountry, economicData]);

  useEffect(() => {
    if (!worldData) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    projection.scale(Math.min(width, height) / 2 - 50).translate([width / 2, height / 2]);

    const path = geoPath().projection(projection);
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

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
        if (selectedCountry !== d) d3.select(this).attr('fill', '#ff9800');
      })
      .on('mouseout', function (event, d) {
        if (selectedCountry !== d) d3.select(this).attr('fill', '#ccc');
      })
      .on('click', (event, d) => {
        setSelectedCountry(selectedCountry === d ? null : d);
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
      <button
        className="back-to-website"
        onClick={() => window.open('https://patrickcap.github.io/', '_blank')}
        >
        Patrick Capaldo
      </button>
      <svg ref={svgRef}></svg>
      {selectedCountry && (
        <div className='modal-overlay' onClick={handleCloseModal}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <button className='modal-close' onClick={handleCloseModal}>
              &times;
            </button>
            <h2>{normalizeCountryName(selectedCountry.properties.name)}</h2>
            <div className='modal-content'>
              {tableData.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th className='wide-column'>Series Name</th>
                      {years.map((year) => (
                        <th key={year}>{year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'row-alternate' : ''}>
                        <td className='wide-column'>{row['Series Name']}</td>
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
