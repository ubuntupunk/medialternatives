import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartDataset {
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  label?: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface D3ChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  data: ChartData;
  width?: number;
  height?: number;
}

export default function D3Chart({ type, data, width = 640, height = 400 }: D3ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    switch (type) {
      case 'bar':
        renderBarChart(g, data, innerWidth, innerHeight);
        break;
      case 'line':
        renderLineChart(g, data, innerWidth, innerHeight);
        break;
      case 'pie':
        renderPieChart(svg, data, width, height);
        break;
      case 'doughnut':
        renderDoughnutChart(svg, data, width, height);
        break;
      case 'radar':
        renderRadarChart(svg, data, width, height);
        break;
      default:
        console.error('Unsupported chart type:', type);
    }
  }, [type, data, width, height]);

  const renderBarChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: ChartData, width: number, height: number) => {
    if (!data.labels || !data.datasets) return;

    const x = d3.scaleBand()
      .domain(data.labels)
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data.datasets[0].data as number[], d => d) || 0])
      .nice()
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y));

    g.selectAll('.bar')
      .data(data.datasets[0].data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (_, i) => x(data.labels[i])!)
      .attr('y', (d) => y(d as number))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d as number))
      .attr('fill', data.datasets[0].backgroundColor || '#36A2EB');
  };

  const renderLineChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: ChartData, width: number, height: number) => {
    if (!data.labels || !data.datasets) return;

    const x = d3.scaleLinear()
      .domain([0, data.labels.length - 1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data.datasets[0].data as number[], d => d) as [number, number])
      .nice()
      .range([height, 0]);

    const line = d3.line<number>()
      .x((d, i) => x(i))
      .y(d => y(d));

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d, i) => data.labels[i]));

    g.append('g')
      .call(d3.axisLeft(y));

    g.append('path')
      .datum(data.datasets[0].data)
      .attr('fill', 'none')
      .attr('stroke', data.datasets[0].borderColor || 'currentColor')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    g.selectAll('.dot')
      .data(data.datasets[0].data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (_, i) => x(i))
      .attr('cy', (d) => y(d as number))
      .attr('r', 2.5)
      .attr('fill', 'white')
      .attr('stroke', data.datasets[0].borderColor || 'currentColor')
      .attr('stroke-width', 1.5);
  };

  const renderPieChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: ChartData, width: number, height: number) => {
    if (!data.labels || !data.datasets) return;

    const radius = Math.min(width, height) / 2;
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.labels)
      .range(data.datasets[0].backgroundColor || d3.schemeCategory10);

    const pie = d3.pie<number>()
      .value(d => d);

    const arc = d3.arc<d3.PieArcDatum<number>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(data.datasets[0].data))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(data.labels[i]) as string);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .text((d, i) => data.labels[i]);
  };

  const renderDoughnutChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: ChartData, width: number, height: number) => {
    if (!data.labels || !data.datasets) return;

    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.labels)
      .range(data.datasets[0].backgroundColor || d3.schemeCategory10);

    const pie = d3.pie<number>()
      .value(d => d);

    const arc = d3.arc<d3.PieArcDatum<number>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(data.datasets[0].data))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(data.labels[i]) as string);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .text((d, i) => data.labels[i]);
  };

  const renderRadarChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: ChartData, width: number, height: number) => {
    if (!data.labels || !data.datasets) return;

    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const angleSlice = (Math.PI * 2) / data.labels.length;

    const rScale = d3.scaleLinear()
      .domain([0, d3.max(data.datasets.flatMap((d: ChartDataset) => d.data), d => d) || 0])
      .range([0, radius]);

    // Draw axes
    data.labels.forEach((label: string, i: number) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);

      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dy', i === 0 ? '-0.5em' : i === data.labels.length / 2 ? '1em' : '0.35em')
        .text(label);
    });

    // Draw data
    data.datasets.forEach((dataset: ChartDataset) => {
      const points: [number, number][] = data.labels.map((_: string, i: number) => {
        const angle = i * angleSlice - Math.PI / 2;
        const r = rScale(dataset.data[i]);
        return [centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r];
      });

      const line = d3.line<[number, number]>()
        .x(d => d[0])
        .y(d => d[1]);

      svg.append('path')
        .datum(points)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', dataset.borderColor || 'currentColor')
        .attr('stroke-width', 2);

      // Draw points
      points.forEach((point: number[]) => {
        svg.append('circle')
          .attr('cx', point[0])
          .attr('cy', point[1])
          .attr('r', 3)
          .attr('fill', dataset.borderColor || 'currentColor');
      });
    });
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ccc', borderRadius: '4px' }}
    />
  );
}