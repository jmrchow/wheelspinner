"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Modal from "./Modal.tsx";
import randomColor from "randomcolor";
import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { useSwipeable } from "react-swipeable";

export const revalidate = 0;
export default function Home() {
  const chartContainer = useRef(null); // Ref for chart canvas
  const myChart = useRef(null);
  const testdata = useRef([
    { prizeName: "Wheel of Fortune", size: 100, probability: 100 },
  ]);
  const [wheelDataFetched, setWheelDataFetched] = useState(false);
  const [showPrizeScreen, setShowPrizeScreen] = useState(-1);
  const [email, setEmail] = useState("");
  const [eventId, setEventId] = useState("");

  const handlers = useSwipeable({
    onSwipedDown: (eventData) => spin(),
  });

  useEffect(() => {
    async function getWheelData() {
      const { data, error } = await supabase
        .from("ActiveEvent")
        .select(`id (id, data)`)
        .single();
      testdata.current = data.id.data;
      setEventId(data.id.id);
      setWheelDataFetched(true);
    }
    getWheelData();
  }, []);
  useEffect(() => {
    // Data and configuration

    let fetchedData = testdata.current;
    let colors = ["#F1AF04", "#64CBF3", "#82B11D"];
    let labels = [];
    let sizes = [];
    let segmentColors = [];
    let segmentBordersColor = [];
    let segmentBordersWidth = [];

    for (let i = 0; i < fetchedData.length; i++) {
      labels.push(fetchedData[i].prizeName);
      sizes.push(fetchedData[i].size);
      if (fetchedData[i].isGrandPrize) {
        segmentColors.push("#F14886");
        segmentBordersColor.push("gold");
        segmentBordersWidth.push(5);
      } else {
        let color = colors[i % colors.length];
        if (i === fetchedData.length - 1 && color === segmentColors[0]) {
          // Generate a random index that's not the first or last index
          let randomIndex = Math.floor(Math.random() * (colors.length - 2)) + 1;
          color = colors[randomIndex];
        }
        segmentColors.push(color);
        segmentBordersColor.push("rgba(0, 0, 0, 0.1)");
        segmentBordersWidth.push(1);
      }
    }

    const data = {
      labels: labels,
      datasets: [
        {
          label: "Weekly Sales",
          data: sizes,
          backgroundColor: segmentColors,
          borderColor: segmentBordersColor, // Border color with some transparency
          borderWidth: segmentBordersWidth, // Set the border width
          borderAlign: "inner",
          borderJoinStyle: "miter",
          rotation: 0,
        },
      ],
    };
    const spinPointer = {
      id: "spinPointer",
      afterDatasetsDraw(chart, args, plugins) {
        const {
          ctx,
          chartArea: { top },
        } = chart;
        const xCenter = chart.getDatasetMeta(0).data[0].x;

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.moveTo(xCenter, top + 30);
        ctx.lineTo(xCenter - 15, top);
        ctx.lineTo(xCenter + 15, top);
        ctx.fill();
      },
    };
    Chart.register(spinPointer);

    const config = {
      type: "pie",
      data,
      plugins: [spinPointer],
      options: {
        animation: {
          onProgress: function (animation) {
            const chartInstance = animation.chart;
            const ctx = chartInstance.ctx;
            const meta = chartInstance.getDatasetMeta(0);
            const dataset = meta.data;
            const startAngle = meta.controller.chart.options.rotation || 0;
            const labels = chartInstance.data.labels;
            dataset.forEach((element) => {
              const model = element;
              if (model) {
                const value = labels[model.$context.index];
                const angle =
                  startAngle + (model.startAngle + model.endAngle) / 2;

                const posX =
                  model.x + ((model.outerRadius * 2) / 3) * Math.cos(angle);
                const posY =
                  model.y + ((model.outerRadius * 2) / 3) * Math.sin(angle);

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.translate(posX, posY);
                ctx.rotate(angle + Math.PI / 2);
                ctx.font = "bold normal 16px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(value, 0, 0);
                ctx.restore();
              }
            });
          },
          duration: 10000,
          easing: "easeOutQuart",
        },

        events: [],
        plugins: {
          legend: { display: false },
        },
      },
    };

    // Render chart
    myChart.current = new Chart(chartContainer.current, config);

    // Return cleanup function
    return () => myChart.current.destroy(); // Destroy chart on unmount
  }, [wheelDataFetched]);
  async function countEmails() {
    const { data, error, count } = await supabase
      .from("Emails")
      .select("*", { count: "exact" })
      .eq("event", eventId);
    return count;
  }

  async function getRigData() {
    const { data, error } = await supabase
      .from("Wheels")
      .select("rigNumber")
      .eq("id", eventId)
      .single();
    return data.rigNumber;
  }
  async function pickItemByProbability(data) {
    let emailCount = await countEmails();
    let rigNumber = await getRigData();
    if (rigNumber > 0 && emailCount % rigNumber === 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].isGrandPrize) {
          return i;
        }
      }
    }
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
  async function spin() {
    let winnerIndex = await pickItemByProbability(testdata.current);
    console.log(winnerIndex + 1);
    let totalSizes = testdata.current.reduce((acc, item) => acc + item.size, 0);
    let prevSizes = testdata.current
      .slice(0, winnerIndex)
      .reduce((acc, item) => acc + item.size, 0);
    console.log(testdata.current);
    let rotation =
      ((prevSizes + testdata.current[winnerIndex].size / 2) / totalSizes) * 360;
    myChart.current.config.data.datasets[0].rotation =
      360 * 20 + 360 - rotation;
    myChart.current.update();

    postPrizeData(email, testdata.current[winnerIndex].prizeName);

    setTimeout(() => {
      setShowPrizeScreen(winnerIndex);
    }, 10000); // 10000 milliseconds = 10 seconds
  }

  async function postPrizeData(winnerEmail, prizeName) {
    const { error } = await supabase
      .from("Emails")
      .update({ prize: prizeName })
      .eq("email", winnerEmail);
  }

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
  };
  return (
    <>
      <style>
        {"body, html{ overflow: hidden; overscroll-behavior:none; }"}
      </style>
      <main className={styles.main}>
        <Modal
          className={styles.modalOverlay}
          onEmailSubmit={handleEmailChange}
          eventId={eventId}
        ></Modal>
        <div className={styles.headerContainer}>
          <Image
            className={styles.rewardedPlay}
            src="/rewarded-play.svg"
            width={300}
            height={300}
            alt="Picture of the author"
          />
          <h1>SPIN TO WIN</h1>
        </div>
        <div className={styles.wheelContainer}>
          <div className={styles.swipeBox} {...handlers}></div>
          <Image
            className={styles.wheelBorder}
            src="/wheel-border.svg"
            fill={true}
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
            <canvas
              className={styles.myChart}
              ref={chartContainer}
              id="myChart"
            ></canvas>
          </div>
        </div>
        {showPrizeScreen >= 0 && (
          <div className={styles.prizeScreen}>
            <Image
              className={styles.rewardedPlayDone}
              src="/rewarded-play.svg"
              width={150}
              height={150}
              alt="Picture of the author"
            />
            <h2> CONGRATULATIONS!</h2>
            <h2>
              {testdata.current[showPrizeScreen].isGrandPrize
                ? "YOU WON THE GRAND PRIZE, "
                : "YOU WON A "}
              <span className={styles.prize}>
                {testdata.current[showPrizeScreen].isGrandPrize ? (
                  <>
                    <br />A HERSCHEL BAG
                  </>
                ) : (
                  testdata.current[showPrizeScreen].prizeName
                )}
              </span>
            </h2>
            <button
              className={styles.doneButton}
              onClick={() => window.location.reload()}
            >
              Ok!
            </button>
          </div>
        )}
      </main>
    </>
  );
}
