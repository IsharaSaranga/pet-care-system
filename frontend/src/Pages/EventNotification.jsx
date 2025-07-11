import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReportChart from "../Component/EventReportChart";
import Footer from "../Component/EventFooter";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const Notification = () => {
  const [registrationsPerEvent, setRegistrationsPerEvent] = useState([]);
  const [revenuePerEvent, setRevenuePerEvent] = useState([]);
  const [registrationTrends, setRegistrationTrends] = useState([]);
  const [registrationsByLocation, setRegistrationsByLocation] = useState([]);
  const [refundedRegistrations, setRefundedRegistrations] = useState([]);
  const [refundsPerEvent, setRefundsPerEvent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = dateRange.start && dateRange.end ? {
          startDate: dateRange.start,
          endDate: dateRange.end,
        } : {};

        const [
          registrationsRes,
          revenueRes,
          trendsRes,
          locationRes,
          refundsRes,
        ] = await Promise.all([
          api.get("/reports/registrations-per-event"),
          api.get("/reports/revenue-per-event", { params }),
          api.get("/reports/registration-trends", { params }),
          api.get("/reports/registrations-by-location"),
          api.get("/reports/refunded-registrations"),
        ]);

        setRegistrationsPerEvent(registrationsRes.data.data.map(item => ({
          label: item.eventTitle,
          value: item.totalRegistrations,
        })));
        setRevenuePerEvent(revenueRes.data.data.map(item => ({
          label: item.eventTitle,
          value: item.totalRevenue,
        })));
        setRegistrationTrends(trendsRes.data.data.map(item => ({
          label: item._id,
          value: item.totalRegistrations,
        })));
        setRegistrationsByLocation(locationRes.data.data.map(item => ({
          label: item._id,
          value: item.totalRegistrations,
        })));
        setRefundedRegistrations(refundsRes.data.data);

        // Aggregate refunds per event
        const refundsByEvent = refundsRes.data.data.reduce((acc, item) => {
          const eventTitle = item.eventTitle;
          if (!acc[eventTitle]) {
            acc[eventTitle] = 0;
          }
          acc[eventTitle] += item.refundAmount;
          return acc;
        }, {});
        setRefundsPerEvent(Object.entries(refundsByEvent).map(([label, value]) => ({
          label,
          value,
        })));
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange.start, dateRange.end]);

  const handleExportCSV = (data, filename, isRefundReport = false) => {
    if (!data.length) {
      alert("No data available to export.");
      return;
    }
    let csvContent;
    if (isRefundReport) {
      csvContent = "data:text/csv;charset=utf-8," +
        ["Event Title,User Name,User Email,Tickets,Refund Amount,Cancelled At",
         ...data.map(item => 
           `"${item.eventTitle}","${item.userName}","${item.userEmail}",${item.tickets},${item.refundAmount},"${new Date(item.cancelledAt).toLocaleString()}"`
         )].join("\n");
    } else {
      csvContent = "data:text/csv;charset=utf-8," +
        ["Label,Value", ...data.map(item => `"${item.label}",${item.value}`)].join("\n");
    }
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setDateRange({ start: "", end: "" });
  };

  const totalRegistrations = registrationsPerEvent.reduce((sum, item) => sum + item.value, 0);
  const totalRevenue = revenuePerEvent.reduce((sum, item) => sum + item.value, 0);
  const totalRefunds = refundedRegistrations.reduce((sum, item) => sum + item.refundAmount, 0);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] pt-32 pb-20">
      <div className="relative z-10 flex-grow max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#4B2E1A]">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Analytics</span>
          </h1>
          <Link
            to="/admin/redirect/event_manager/events"
            className="flex items-center px-6 py-3 bg-[#FFF8F0] hover:bg-[#FCEFDE] text-[#4B2E1A] rounded-3xl transition-all duration-300 border-2 border-[#D08860]/20 shadow-2xl hover:shadow-3xl transform hover:scale-102"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
        </div>

        {loading ? (
          <div className="bg-[#FFF8F0] rounded-3xl shadow-2xl p-8 border-2 border-[#D08860]/20 hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D08860]"></div>
              <p className="text-[#4B2E1A] text-base mt-4">Loading analytics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-[#FFF8F0] rounded-3xl shadow-2xl p-8 border-2 border-[#D08860]/20 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-500 text-base font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-[#FFF8F0] rounded-3xl shadow-2xl p-8 border-2 border-[#D08860]/20 hover:shadow-3xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-[#4B2E1A] bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-t-3xl p-6 mb-6 -mx-8 -mt-8">
                Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FCEFDE] p-6 rounded-2xl shadow-md transform transition hover:scale-102">
                  <p className="text-base text-[#4B2E1A]">Total Registrations</p>
                  <p className="text-3xl font-bold text-[#D08860]">{totalRegistrations}</p>
                </div>
                <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FCEFDE] p-6 rounded-2xl shadow-md transform transition hover:scale-102">
                  <p className="text-base text-[#4B2E1A]">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#D08860]">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FCEFDE] p-6 rounded-2xl shadow-md transform transition hover:scale-102">
                  <p className="text-base text-[#4B2E1A]">Total Refunds</p>
                  <p className="text-3xl font-bold text-[#D08860]">${totalRefunds.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-[#FFF8F0] rounded-3xl shadow-2xl p-8 border-2 border-[#D08860]/20 hover:shadow-3xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#4B2E1A] bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-t-3xl p-6 mb-6 -mx-8 -mt-8">
                  Filter Reports
                </h2>
                {(dateRange.start || dateRange.end) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#D08860] hover:text-[#B3704D] text-lg font-medium transition duration-300"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-lg font-medium text-[#4B2E1A]">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="mt-2 block w-full rounded-2xl border-gray-300 shadow-sm p-4 focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base text-[#4B2E1A] transition-all duration-300 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-lg font-medium text-[#4B2E1A]">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="mt-2 block w-full rounded-2xl border-gray-300 shadow-sm p-4 focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base text-[#4B2E1A] transition-all duration-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleExportCSV(registrationsPerEvent, "registrations_per_event")}
                className="px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-2xl hover:bg-[#80533b] transition-all duration-300 transform hover:scale-102 shadow-2xl hover:shadow-3xl"
              >
                Export Registrations
              </button>
              <button
                onClick={() => handleExportCSV(revenuePerEvent, "revenue_per_event")}
                className="px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-2xl hover:bg-[#80533b] transition-all duration-300 transform hover:scale-102 shadow-2xl hover:shadow-3xl"
              >
                Export Revenue
              </button>
              <button
                onClick={() => handleExportCSV(registrationTrends, "registration_trends")}
                className="px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-2xl hover:bg-[#80533b] transition-all duration-300 transform hover:scale-102 shadow-2xl hover:shadow-3xl"
              >
                Export Trends
              </button>
              <button
                onClick={() => handleExportCSV(registrationsByLocation, "registrations_by_location")}
                className="px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-2xl hover:bg-[#80533b] transition-all duration-300 transform hover:scale-102 shadow-2xl hover:shadow-3xl"
              >
                Export Locations
              </button>
              <button
                onClick={() => handleExportCSV(refundedRegistrations, "refunded_registrations", true)}
                className="px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-2xl hover:bg-[#80533b] transition-all duration-300 transform hover:scale-102 shadow-2xl hover:shadow-3xl"
              >
                Export Refunds
              </button>
              <button
                onClick={() => handleExportCSV(refundsPerEvent, "refunds_per_event")}
                className="px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-2xl hover:bg-[#80533b] transition-all duration-300 transform hover:scale-102 shadow-2xl hover:shadow-3xl"
              >
                Export Refunds by Event
              </button>
            </div>

            {/* Charts */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <ReportChart
                type="bar"
                data={registrationsPerEvent}
                title="Registrations per Event"
              />
              <ReportChart
                type="bar"
                data={revenuePerEvent}
                title="Revenue per Event"
              />
              <ReportChart
                type="line"
                data={registrationTrends}
                title="Registration Trends Over Time"
              />
              <ReportChart
                type="pie"
                data={registrationsByLocation}
                title="Registrations by Location"
              />
              <ReportChart
                type="bar"
                data={refundsPerEvent}
                title="Total Refunds by Event"
              />
            </div>

            {/* Refunded Registrations Table */}
            <div className="bg-[#FFF8F0] rounded-3xl shadow-2xl p-8 border-2 border-[#D08860]/20 hover:shadow-3xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#4B2E1A] bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-t-3xl p-6 -mx-8 -mt-8 w-full">
                  Refunded Registrations
                </h2>
              </div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleExportCSV(refundedRegistrations, "refunded_registrations", true)}
                  disabled={refundedRegistrations.length === 0}
                  className={`px-6 py-3 rounded-2xl text-white font-medium transition-all duration-300 shadow-2xl ${
                    refundedRegistrations.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#D08860] to-[#B3704D] hover:bg-[#80533b] hover:shadow-3xl transform hover:scale-102"
                  }`}
                >
                  Download Refunded Registrations
                </button>
              </div>
              {refundedRegistrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-[#FFF8F0] to-[#FCEFDE]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#4B2E1A] uppercase tracking-wider">Event</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#4B2E1A] uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#4B2E1A] uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#4B2E1A] uppercase tracking-wider">Tickets</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#4B2E1A] uppercase tracking-wider">Refund Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#4B2E1A] uppercase tracking-wider">Cancelled At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {refundedRegistrations.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-all duration-300">
                          <td className="px-6 py-4 whitespace-nowrap text-base text-[#4B2E1A]">{item.eventTitle}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-[#4B2E1A]">{item.userName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-[#4B2E1A]">{item.userEmail}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-[#4B2E1A]">{item.tickets}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-[#4B2E1A]">
                            {item.refundAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-[#4B2E1A]">
                            {new Date(item.cancelledAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gradient-to-r from-[#FFF8F0] to-[#FCEFDE] rounded-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.47-.62-2.062M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.47.62-2.062M14 14h2.62M5.625 14h2.62m0 0a2.96 2.96 0 00.62 2.062M5.625 14H4a1 1 0 00-.707.293l-2 2a1 1 0 000 1.414l2 2a1 1 0 00.707.293h15a1 1 0 00.707-.293l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-.707-.293H14zm0 0V10a2 2 0 10-4 0v4m0 0a2 2 0 104 0z"
                    />
                  </svg>
                  <p className="text-[#4B2E1A] text-base">No refunded registrations found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="relative z-10 mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Notification;