// ExerciseChart.js
import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const ExerciseChart = ({ pastExercises }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const chartData = pastExercises.map((exercise) => exercise.count);
    const chartLabels = pastExercises.map((exercise) => exercise.exerciseType);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar", // You can also use "line", "pie", etc.
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Past Reps",
            data: chartData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }, [pastExercises]);

  return <canvas ref={chartRef} width="400" height="200"></canvas>;
};

export default ExerciseChart;
