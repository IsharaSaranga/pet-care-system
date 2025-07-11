'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { js2xml } from 'xml-js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportPageOne() {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  // Fetch default report (daily) on component mount
  useEffect(() => {
    const fetchDefaultReport = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching default daily report');
        const response = await axios.get('http://localhost:5000/api/appointments/reports/generate', {
          params: { period: 'daily' },
        });
        console.log('Default report response:', response.data);
        setReportData(response.data.data);
      } catch (err) {
        console.error('Error fetching default report:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultReport();
  }, []);

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault(); // Handle form submission if triggered manually
    setLoading(true);
    setError(null);

    try {
      console.log('Making API request to generate report with period:', period);
      const response = await axios.get('http://localhost:5000/api/appointments/reports/generate', {
        params: { period, startDate: period === 'custom' ? startDate : undefined, endDate: period === 'custom' ? endDate : undefined },
      });
      console.log('API response received:', response.data);
      setReportData(response.data.data);
    } catch (err) {
      console.error('Error making API request:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) {
      console.error('Report element not found for PDF generation');
      return;
    }
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Appointment-Manager-Report.pdf');
  };

  const handleDownloadXML = () => {
    if (!reportData) {
      console.error('No report data available for XML download');
      return;
    }

    const xmlData = {
      declaration: { attributes: { version: '1.0', encoding: 'utf-8' } },
      elements: [
        {
          type: 'element',
          name: 'Report',
          elements: [
            {
              type: 'element',
              name: 'Period',
              elements: [{ type: 'text', text: period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : `${startDate} to ${endDate}` }],
            },
            {
              type: 'element',
              name: 'RevenueByCategory',
              elements: reportData.revenueByCategory.map(item => ({
                type: 'element',
                name: 'Category',
                elements: [
                  { type: 'element', name: 'Name', elements: [{ type: 'text', text: item.category }] },
                  { type: 'element', name: 'Appointments', elements: [{ type: 'text', text: item.appointmentCount.toString() }] },
                  { type: 'element', name: 'Revenue', elements: [{ type: 'text', text: item.totalRevenue.toFixed(2) }] },
                ],
              })),
            },
            {
              type: 'element',
              name: 'ScheduledVsCancelled',
              elements: reportData.scheduledVsCancelled.map(item => ({
                type: 'element',
                name: 'AppointmentType',
                elements: [
                  { type: 'element', name: 'Type', elements: [{ type: 'text', text: item.appointmentType }] },
                  { type: 'element', name: 'ScheduledOrCompleted', elements: [{ type: 'text', text: item.scheduledOrCompleted.toString() }] },
                  { type: 'element', name: 'Cancelled', elements: [{ type: 'text', text: item.cancelled.toString() }] },
                ],
              })),
            },
            {
              type: 'element',
              name: 'CustomerFrequency',
              elements: reportData.customerFrequency.map(item => ({
                type: 'element',
                name: 'Frequency',
                elements: [
                  { type: 'element', name: 'AppointmentCount', elements: [{ type: 'text', text: item.appointmentCount.toString() }] },
                  { type: 'element', name: 'CustomerCount', elements: [{ type: 'text', text: item.customerCount.toString() }] },
                ],
              })),
            },
          ],
        },
      ],
    };

    const xmlString = js2xml(xmlData, { compact: false, spaces: 2 });
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Appointment-Manager-Report.xml';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart Data Preparation with Fallbacks
  const revenueByCategoryChartData = reportData?.revenueByCategory?.length
    ? {
        labels: reportData.revenueByCategory.map((item) => item.category),
        datasets: [
          {
            label: 'Revenue ($)',
            data: reportData.revenueByCategory.map((item) => item.totalRevenue),
            backgroundColor: '#FBBF24', // Amber-400
          },
          {
            label: 'Appointment Count',
            data: reportData.revenueByCategory.map((item) => item.appointmentCount),
            backgroundColor: '#D97706', // Amber-600
          },
        ],
      }
    : null;

  const scheduledVsCancelledChartData = reportData?.scheduledVsCancelled?.length
    ? {
        labels: reportData.scheduledVsCancelled.map((item) => item.appointmentType),
        datasets: [
          {
            label: 'Scheduled/Completed',
            data: reportData.scheduledVsCancelled.map((item) => item.scheduledOrCompleted),
            backgroundColor: '#FBBF24', // Amber-400
          },
          {
            label: 'Cancelled',
            data: reportData.scheduledVsCancelled.map((item) => item.cancelled),
            backgroundColor: '#D97706', // Amber-600
          },
        ],
      }
    : null;

  const customerFrequencyChartData = reportData?.customerFrequency?.length
    ? {
        labels: reportData.customerFrequency.map((item) => item.appointmentCount),
        datasets: [
          {
            label: 'Number of Customers',
            data: reportData.customerFrequency.map((item) => item.customerCount),
            backgroundColor: '#FBBF24', // Amber-400
            borderColor: '#D97706', // Amber-600
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] px-6 py-12 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl text-center animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-semibold text-amber-600 tracking-wider">Appointment Manager Dashboard</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-amber-950 sm:text-5xl">
          Insights for Your Pet Care Business
        </p>
      </div>

      {/* Time Period Selector */}
      <div className="mx-auto mt-8 max-w-lg animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <form onSubmit={handleGenerateReport} className="bg-white shadow-lg rounded-xl p-8 border border-amber-200">
          <div className="mb-6">
            <label className="block text-amber-950 font-medium mb-2 text-lg">Select Time Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-950"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-amber-950 font-medium mb-2 text-lg">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-950"
                  required
                />
              </div>
              <div>
                <label className="block text-amber-950 font-medium mb-2 text-lg">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-950"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-300 disabled:opacity-50 text-lg font-medium"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
      </div>

      {/* Report Display */}
      {error && (
        <div className="mx-auto mt-6 max-w-5xl text-center p-4 bg-red-50 text-red-500 rounded-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p>{error}</p>
        </div>
      )}

      {reportData ? (
        <div ref={reportRef} className="mx-auto mt-12 max-w-5xl">
          <div className="text-center mb-10 animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-3xl font-bold text-amber-950 tracking-tight">Pet Care Appointment Insights</h3>
            <p className="text-amber-950 mt-2 text-lg">
              Period: {period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : `${startDate} to ${endDate}`}
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-amber-600 text-white py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors duration-300 text-lg font-medium shadow-sm hover:shadow-md"
              >
                Download PDF
              </button>
              <button
                onClick={handleDownloadXML}
                className="bg-amber-600 text-white py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors duration-300 text-lg font-medium shadow-sm hover:shadow-md"
              >
                Download XML
              </button>
            </div>
          </div>

          {/* 1. Revenue by Appointment Category (Payment Status: Paid) */}
          <div className="bg-white shadow-lg rounded-xl p-8 border border-amber-200 mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-amber-600 text-white rounded-t-lg p-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3v2c0 1.657 1.343 3 3 3s3-1.343 3-3v-2c0-1.657-1.343-3-3-3zm0 0V6m0 8v2"></path>
              </svg>
              <h4 className="text-xl font-semibold">Revenue by Appointment Category (Paid)</h4>
            </div>
            {revenueByCategoryChartData ? (
              <div className="mt-6">
                <Bar
                  data={revenueByCategoryChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Revenue and Appointments by Category' },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Value' },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="mt-6 text-amber-950 text-center">No data available for this period.</p>
            )}
            {reportData.revenueByCategory.length > 0 ? (
              <table className="w-full text-left mt-6 border-collapse">
                <thead>
                  <tr className="bg-amber-100 text-amber-950">
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Category</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Appointments</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Revenue ($)</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Avg. Revenue per Appointment ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.revenueByCategory.map((item, index) => (
                    <tr key={index} className="border-b border-amber-200 hover:bg-amber-50">
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3">{item.appointmentCount}</td>
                      <td className="px-4 py-3">{item.totalRevenue.toFixed(2)}</td>
                      <td className="px-4 py-3">{(item.totalRevenue / item.appointmentCount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-6 text-amber-950 text-center">No data available for this period.</p>
            )}
          </div>

          {/* 2. Scheduled vs. Cancelled Appointments Breakdown */}
          <div className="bg-white shadow-lg rounded-xl p-8 border border-amber-200 mb-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="bg-amber-600 text-white rounded-t-lg p-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <h4 className="text-xl font-semibold">Scheduled vs. Cancelled Appointments</h4>
            </div>
            {scheduledVsCancelledChartData ? (
              <div className="mt-6">
                <Bar
                  data={scheduledVsCancelledChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Scheduled vs. Cancelled Appointments by Category' },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Appointments' },
                        stacked: true,
                      },
                      x: {
                        stacked: true,
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="mt-6 text-amber-950 text-center">No data available for this period.</p>
            )}
            {reportData.scheduledVsCancelled.length > 0 ? (
              <table className="w-full text-left mt-6 border-collapse">
                <thead>
                  <tr className="bg-amber-100 text-amber-950">
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Appointment Type</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Scheduled/Completed</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Cancelled</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Cancellation Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.scheduledVsCancelled.map((item, index) => {
                    const total = item.scheduledOrCompleted + item.cancelled;
                    const cancellationRate = total > 0 ? ((item.cancelled / total) * 100).toFixed(2) : 0;
                    return (
                      <tr key={index} className="border-b border-amber-200 hover:bg-amber-50">
                        <td className="px-4 py-3">{item.appointmentType}</td>
                        <td className="px-4 py-3">{item.scheduledOrCompleted}</td>
                        <td className="px-4 py-3">{item.cancelled}</td>
                        <td className="px-4 py-3">{cancellationRate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="mt-6 text-amber-950 text-center">No data available for this period.</p>
            )}
          </div>

          {/* 3. Customer Appointment Frequency */}
          <div className="bg-white shadow-lg rounded-xl p-8 border border-amber-200 mb-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="bg-amber-600 text-white rounded-t-lg p-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h4 className="text-xl font-semibold">Customer Appointment Frequency</h4>
            </div>
            {customerFrequencyChartData ? (
              <div className="mt-6">
                <Bar
                  data={customerFrequencyChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Customer Appointment Frequency Distribution' },
                    },
                    scales: {
                      x: {
                        title: { display: true, text: 'Number of Appointments' },
                      },
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Number of Customers' },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="mt-6 text-amber-950 text-center">No data available for this period.</p>
            )}
            {reportData.customerFrequency.length > 0 ? (
              <table className="w-full text-left mt-6 border-collapse">
                <thead>
                  <tr className="bg-amber-100 text-amber-950">
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Appointments per Customer</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Number of Customers</th>
                    <th className="px-4 py-3 font-medium border-b border-amber-200">Percentage of Total (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const totalCustomers = reportData.customerFrequency.reduce((sum, item) => sum + item.customerCount, 0);
                    return reportData.customerFrequency.map((item, index) => {
                      const percentage = totalCustomers > 0 ? ((item.customerCount / totalCustomers) * 100).toFixed(2) : 0;
                      return (
                        <tr key={index} className="border-b border-amber-200 hover:bg-amber-50">
                          <td className="px-4 py-3">{item.appointmentCount}</td>
                          <td className="px-4 py-3">{item.customerCount}</td>
                          <td className="px-4 py-3">{percentage}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            ) : (
              <p className="mt-6 text-amber-950 text-center">No data available for this period.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mx-auto mt-12 max-w-5xl text-center text-amber-950 animate-fade-in">Loading report...</p>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}