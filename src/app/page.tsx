'use client'

import Image from "next/image";
import styles from "./page.module.css";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Modal from './Modal.tsx';
import randomColor from "randomcolor";
import React, { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
export default function Home() {


  const chartContainer = useRef(null); // Ref for chart canvas
  const myChart = useRef(null);
  const testdata = useRef([]);
  const test = "red";

  useEffect(() => {
    // Create a single supabase client for interacting with your database


          testdata.current = [{prizeName: "Prize 1", size: 25, probability: 25},
      //       {prizeName: "Prize 2", size: 25, probability: 25},
      //       {prizeName: "Prize 3", size: 25, probability: 25},
      //       {prizeName: "Prize 4", size: 50, probability: 25},
      //     {prizeName: "Prize 5", size: 25, probability: 25},
      // {prizeName: "Prize 6", size: 25, probability: 25},
    ]
    async function getWheelData() {
      const { wheelData, error } = await supabase
        .from('ActiveEvent')
        .select('data')
      


      testdata.current.push(wheelData);
}
    getWheelData()

    // testdata.current = [
    //   {prizeName: "Prize 1", size: 25, probability: 25},
    //   //       {prizeName: "Prize 2", size: 25, probability: 25},
    //   //       {prizeName: "Prize 3", size: 25, probability: 25},
    //   //       {prizeName: "Prize 4", size: 50, probability: 25},
    //   //     {prizeName: "Prize 5", size: 25, probability: 25},
    //   // {prizeName: "Prize 6", size: 25, probability: 25},
    // ]
      

  })
  useEffect(() => {
    // Data and configuration

    let fetchedData = testdata.current;
        let colors = []
    let labels = [];
    let sizes = [];
    for ( let i = 0; i < fetchedData.length; i++){
      labels.push(fetchedData[i].prizeName)
      sizes.push(fetchedData[i].size)
            colors.push(randomColor());
    }
    const data = { 
      labels: labels,
      datasets: [{
        label: 'Weekly Sales',
        data: sizes,
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

    const config = {
      type: 'pie',
      data,
      plugins: [spinPointer],
      options: {
        animation: {
            onProgress: function(animation) {
                const chartInstance = animation.chart;
                const ctx = chartInstance.ctx;
                const meta = chartInstance.getDatasetMeta(0);
                const dataset = meta.data;
                const startAngle = meta.controller.chart.options.rotation || 0; 
                const labels = chartInstance.data.labels;
                dataset.forEach((element) => {
                    const model = element;
                    if (model) {
                        const value = labels[model.$context.index] 
                        const angle = startAngle + (model.startAngle + model.endAngle) / 2;

                        const posX = model.x + (model.outerRadius -60) * Math.cos(angle);
                        const posY = model.y + (model.outerRadius - 60) * Math.sin(angle);

                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.translate(posX, posY);
                        ctx.rotate(angle + Math.PI / 2);
                        ctx.font = "bold normal 16px Arial";
                        ctx.fillText(value, 0, 0);
                        ctx.restore();
                    }
                });

            
            
            },duration: 10000,
        },
    
        events: [],
        plugins: { 

          legend:{display:false},

        }
      }
    };

    // Render chart
    myChart.current = new Chart(chartContainer.current, config);
    

    
    // Return cleanup function
    return () => myChart.current.destroy(); // Destroy chart on unmount
  }, []);

  function pickItemByProbability(data) {
    // Calculate the total weight
    let totalWeight = data.reduce((acc, item) => acc + item.probability, 0);

    // Generate a random number between 0 and totalWeight
    let randomNumber = Math.random() * totalWeight;

    // Iterate through the items and find the one that matches the random number
    let cumulativeWeight = 0;
    for (let i = 0; i < data.length; i++) {
        cumulativeWeight += data[i].probability;
        if (randomNumber < cumulativeWeight) {
            // Return the index of the chosen item
            return i;
        }
    }

    // If no item was chosen (which should not happen if totalWeight > 0),
    // return the index of the last item as a fallback
    return data.length - 1;
}
  function spin(){
              console.log(testdata.current);
    let winnerIndex = pickItemByProbability(testdata.current);
    console.log(winnerIndex + 1);
    let totalSizes = testdata.current.reduce((acc, item) => acc + item.size, 0);
    let prevSizes = testdata.current.slice(0,winnerIndex).reduce((acc,item) => acc + item.size, 0);
    let rotation = ((prevSizes + (testdata.current[winnerIndex].size / 2)) / totalSizes) * 360
    myChart.current.config.data.datasets[0].rotation = (360 * 20) + 360 - rotation;
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
                                        <Image
          className={styles.wheelCenter}
      src="/wheel-center.svg"
      width={500}
      height={500}
      alt="Picture of the author"
    />
                                        <Image
          className={styles.wheelSmallCenter}
      src="/wheel-smallcenter.svg"
      width={500}
      height={500}
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
