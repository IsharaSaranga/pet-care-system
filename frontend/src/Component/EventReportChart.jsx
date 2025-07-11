import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportChart = ({ type, data, title }) => {
  const chartData = {
    labels: data.map(item => item.label || item._id || item.eventTitle),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value || item.totalRegistrations || item.count || item.totalRevenue || item.refundAmount),
        backgroundColor: [
          "rgba(208, 136, 96, 0.9)",
          "rgba(179, 112, 77, 0.9)",
          "rgba(245, 203, 167, 0.9)",
          "rgba(229, 152, 102, 0.9)",
          "rgba(160, 64, 0, 0.9)",
        ],
        borderColor: [
          "#D08860",
          "#B3704D",
          "#F5CBA7",
          "#E59866",
          "#A04000",
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(192, 122, 80, 0.9)",
          "rgba(160, 96, 64, 0.9)",
          "rgba(229, 184, 151, 0.9)",
          "rgba(213, 136, 86, 0.9)",
          "rgba(144, 48, 0, 0.9)",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4B2E1A",
          font: { size: 16 },
          padding: 25,
        },
      },
      title: {
        display: true,
        text: title,
        color: "#4B2E1A",
        font: { size: 20, weight: "bold" },
        padding: { top: 15, bottom: 25 },
      },
      tooltip: {
        backgroundColor: "#FFF8F0",
        titleColor: "#4B2E1A",
        bodyColor: "#4B2E1A",
        borderColor: "#D08860",
        borderWidth: 2,
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
      },
    },
    scales: type !== "pie" ? {
      y: {
        beginAtZero: true,
        ticks: { color: "#4B2E1A", font: { size: 14 } },
        grid: { color: "rgba(208, 136, 96, 0.2)" },
      },
      x: {
        ticks: { color: "#4B2E1A", font: { size: 14 } },
        grid: { display: false },
      },
    } : {},
  };

  return (
    <div className="bg-[#FFF8F0] rounded-3xl shadow-2xl p-8 border-2 border-[#D08860]/20 hover:shadow-3xl transition-all duration-300">
      {type === "bar" && <Bar data={chartData} options={options} />}
      {type === "line" && <Line data={chartData} options={options} />}
      {type === "pie" && <Pie data={chartData} options={options} />}
    </div>
  );
};

export default ReportChart;