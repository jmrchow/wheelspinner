'use client'

import Image from "next/image";
import styles from "./page.module.css";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Modal from './Modal.tsx';

import React, { useEffect, useRef } from 'react';

export default function Home() {


  const chartContainer = useRef(null); // Ref for chart canvas
  const myChart = useRef(null);
  useEffect(() => {
    // Data and configuration
    const data = {
      labels: ['Prize 1', 'Prize 2', 'Prize 3', 'Price 4', 'Prize 5', 'Prize 6', 'Prize 7'],
      datasets: [{
        label: 'Weekly Sales',
        data: [25, 25, 25, 25, 25, 25, 10],
        backgroundColor: [
          'rgba(255, 26, 104, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(0, 0, 0, 0.2)'
        ],
        borderColor: [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(0, 0, 0, 1)'
        ],
        borderWidth: 10,
        borderAlign: 'inner',
        borderJoinStyle: 'miter',
        rotation: 20

      }]
    };
        const spinPointer = {
      id: 'spinPointer',
      afterDatasetsDraw(chart, args, plugins) {
        const { ctx, chartArea: {top} } = chart;
        const xCenter = chart.getDatasetMeta(0).data[0].x;

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.moveTo(xCenter, top + 30);
        ctx.lineTo(xCenter - 15, top);
        ctx.lineTo(xCenter + 15, top);
        ctx.fill();

      }
    }
     Chart.register(spinPointer);
    Chart.register(ChartDataLabels);

    const config = {
      type: 'pie',
      data,
      plugins: [spinPointer, ChartDataLabels],
      options: {
        plugins: { 
          datalabels: { // Configure datalabels plugin
            display: true,
            formatter: (value, context) => context.chart.data.labels[context.dataIndex], // Show labels from data.labels
            color: 'black',
rotation: function(ctx) {
    const valuesBefore = ctx.dataset.data.slice(0, ctx.dataIndex).reduce((a, b) => a + b, 0); // Sum of values before the current slice
    const sum = ctx.dataset.data.reduce((a, b) => a + b, 0); // Total sum of all values
    const startAngle = ctx.dataset.rotation % 360 || 0; // Start angle of the pie chart

    const sliceValue = ctx.dataset.data[ctx.dataIndex]; // Value of the current slice
    const sliceAngle = (((sliceValue / sum) / 2) + (valuesBefore / sum))*360; // Angle of the current slice
              console.log(sliceAngle);
    const rotation = startAngle + sliceAngle; // Calculate rotation angle for the label

    return rotation;
},
            anchor: 'center',
            align: 'end',
            offset: '10'
            
          }
        }
      }
    };

    // Render chart
    myChart.current = new Chart(chartContainer.current, config);
    

    
    // Return cleanup function
    return () => myChart.current.destroy(); // Destroy chart on unmount
  }, []); 
  function spin(){
    myChart.current.config.data.datasets[0].rotation = Math.random() * 3333;
    myChart.current.update();
  }
  return (
    <main className={styles.main}>
      <Modal></Modal>
      <div className="chartCard">
        <div className="chartBox">
          <canvas ref={chartContainer} id="myChart"></canvas>
        </div>
      </div>

      <button onClick={spin}>Spin</button>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

    </main>
  );
}
