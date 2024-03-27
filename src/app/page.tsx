'use client'

import Image from "next/image";
import styles from "./page.module.css";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Modal from './Modal.tsx';
import randomColor from "randomcolor";
import React, { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'
export default function Home() {


  const chartContainer = useRef(null); // Ref for chart canvas
  const myChart = useRef(null);
  const supabase = useRef(null)
  const test = "red";

  useEffect(() => {
    // Create a single supabase client for interacting with your database
  supabase.current = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
  })
  useEffect(() => {
    // Data and configuration
    let colors = []
    for (let i = 0; i < 3; i++){
      colors.push(randomColor());
    }
    const data = { 
      labels: ['Prize 1', 'Prize 2', 'Prize 3'],
      datasets: [{
        label: 'Weekly Sales',
        data: [25, 25, 25],
        backgroundColor: colors, 
        borderColor: test, 
        borderWidth: 3,
        borderAlign: 'inner',
        borderJoinStyle: 'miter',
        rotation: 0

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
        animation: {
            onProgress: function(animation) {
                const chartInstance = animation.chart;
                const ctx = chartInstance.ctx;
                const meta = chartInstance.getDatasetMeta(0);
                const dataset = meta.data;
                const startAngle = meta.controller.chart.options.rotation || 0; 

                dataset.forEach((element) => {
                    const model = element;
                    if (model) {
                        const value = element.$datalabels[0]._model.lines[0] || '';
                        const angle = startAngle + (model.startAngle + model.endAngle) / 2;

                        const posX = model.x + (model.outerRadius -60) * Math.cos(angle);
                        const posY = model.y + (model.outerRadius - 60) * Math.sin(angle);

                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.translate(posX, posY);
                        ctx.rotate(angle + Math.PI / 2);
                        ctx.fillText(value, 0, 0);
                        ctx.restore();
                    }
                });

            
            
            },duration: 10000,
        },
    
        events: [],
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
    const rotation = startAngle + sliceAngle; // Calculate rotation angle for the label
    console.log("test");
    return rotation;
},
            anchor: 'center',
            align: 'end',
            offset: '4'
            
          },
          legend:{display:false},

        }
      }
    };

    // Render chart
    myChart.current = new Chart(chartContainer.current, config);
    

    
    // Return cleanup function
    return () => myChart.current.destroy(); // Destroy chart on unmount
  }, []); 
  function spin(){
    myChart.current.config.data.datasets[0].rotation = 720;
    myChart.current.update();
  }
  return (
    <main className={styles.main}>
      <Modal className={styles.modalOverlay}></Modal>   
<div className={styles.wheelContainer}>
      <Image
          className={styles.wheelBorder}
      src="/wheel-border.svg"
      fill={true}
      alt="Picture of the author"
    />
                                <Image
          className={styles.wheelPointer}
      src="/wheel-pointer.svg"
      width={150}
      height={150}
      alt="Picture of the author"
    />
     <div className={styles.chartBox}>

          <canvas ref={chartContainer} id="myChart"></canvas>
        </div>
      </div>

      <button className={styles.spinButton} onClick={spin}>Spin</button>



    </main>
  );
}
