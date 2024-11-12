import { useState } from 'react';
import { Bar } from 'react-chartjs-2'; // For displaying the chart
import 'chart.js/auto'; // Necessary for Chart.js 3.x

// For Testing 
// const reportsController = {
//     async get_product_usage(startDate, endDate) {
//         console.log(`Fetching usage from ${startDate} to ${endDate}...`);
//         return new Promise((resolve) =>
//             setTimeout(() => {
//                 resolve({
//                     data: {
//                         ingredients: ['Sugar', 'Flour', 'Butter', 'Eggs'],
//                         usage: [50, 75, 30, 45],
//                     },
//                 });
//             }, 1000)
//         );
//     },
//     loadXReport: () => console.log('X-report loaded'),
//     loadZReport: () => console.log('Z-report loaded'),
// };

const ReportsView = () => {
    const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const [loadXDisabled, setLoadXDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for product usage
    const [startDate, setStartDate] = useState(''); // Start date for product usage
    const [endDate, setEndDate] = useState(''); // End date for product usage
    // const [employeeSales, setEmployeeSales] = useState([]); // Employee sales data
    
    // To keep track of which report to be shown
    // const [activeReport, setActiveReport] = useState(null); // Track the active report
    const [chartData, setChartData] = useState(null); // For chart data
    const [isChartVisible, setIsChartVisible] = useState(true);

    // New state for sales report modal
    const [isSalesReportModalOpen, setIsSalesReportModalOpen] = useState(false);
    const [salesStartDate, setSalesStartDate] = useState('');
    const [salesEndDate, setSalesEndDate] = useState('');
    const [salesReportData, setSalesReportData] = useState([]);

    // States for Popularity Analysis
    const [isPopularityModalOpen, setIsPopularityModalOpen] = useState(false);
    const [popularityStartDate, setPopularityStartDate] = useState('');
    const [popularityEndDate, setPopularityEndDate] = useState('');
    const [popularityLimit, setPopularityLimit] = useState(0);
    const [popularityData, setPopularityData] = useState([]);



    function hideOthers(reportToShow) {
        if (!(reportToShow == 1 || reportToShow == 2 || reportToShow == 3)) {
            setIsChartVisible(false); // Set visibility to false, effectively deleting the chart
        }
        
        if (reportToShow != 4) {
            salesReportData.length = 0;
        }

        if (reportToShow != 5) {
            popularityData.length = 0;
        }
    }

    // Handle opening the modal for product usage report
    const handleLoadProductUsageReport = () => {
        setIsModalOpen(true);
    };

    // Handle submission of the date range for product usage
    const handleProductUsageSubmitDates = async () => {
        // setActiveReport('ProductUsage');

        try {
            const response = await fetch(
                `http://${VITE_SERVER_URL}/api/reports/productUsage?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
            );


            if (!response.ok) {
                throw new Error('Failed to fetch product usage');
            }

            const data = await response.json();

            // Ensure that data is a dictionary and process each key-value pair
            if (typeof data === 'object' && !Array.isArray(data)) {
                Object.entries(data).forEach(([product, quantity]) => {
                    console.log(`Product: ${product}, Quantity: ${quantity}`);
                    // Handle each product and quantity as needed
                    
                    // Extract ingredients and usage values
                    const ingredients = Object.keys(data);
                    const usage = Object.values(data);
                    
                    // Update the chart with the new data
                    setChartData({
                        labels: ingredients, // Y-axis: Ingredients
                        datasets: [
                            {
                                label: 'Usage',
                                data: usage, // X-axis: Usage values
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                            },
                        ],
                        });
            
                    setIsChartVisible(true);
                    hideOthers(1);


                setIsModalOpen(false); // Close the modal
            });
            } else {
                throw new Error('Unexpected JSON structure');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    // Handle X-report to load sales data
    const handleLoadXReport = async () => {
        // setActiveReport('XReport');
        try {
            const response = await fetch(`http://${VITE_SERVER_URL}/api/reports/salesByHour`); // Call sales report API

            if (!response.ok) {
                throw new Error('Failed to fetch sales report');
            }

            const data = await response.json(); // JSON object with hour-sales pairs

            const hours = Object.keys(data).map(Number); // X-axis: Hours of the day
            const sales = Object.values(data); // Y-axis: Sales values

            // Update chart with sales data
            setChartData({
                labels: hours,
                datasets: [
                    {
                        label: 'Sales',
                        data: sales,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            setIsChartVisible(true);
            hideOthers(2);
            setLoadXDisabled(true); // Disable button after use
        } catch (error) {
            console.error('Error loading X Report:', error);
        }
    };

    // Handle fetching Z-report with two API calls
    const handleLoadZReport = async () => {
        // setActiveReport('ZReport');
        try {
            // First API call: Get hourly sales data
            const salesResponse = await fetch(`http://${VITE_SERVER_URL}/api/reports/salesByHour`);

            if (!salesResponse.ok) {
                throw new Error('Failed to fetch sales report');
            }

            const salesData = await salesResponse.json();
            const hours = Object.keys(salesData).map(Number); // X-axis: Hours
            const sales = Object.values(salesData); // Y-axis: Sales

            // Update chart with sales data
            setChartData({
                labels: hours,
                datasets: [
                    {
                        label: 'Sales',
                        data: sales,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            setIsChartVisible(true);
            hideOthers(3);

            // Second API call: Get total sales by employee
            const employeeSalesResponse = await fetch(`http://${VITE_SERVER_URL}/api/reports/salesByEmployee`);

            if (!employeeSalesResponse.ok) {
                throw new Error('Failed to fetch total sales by employee');
            }

            // const employeeData = await employeeSalesResponse.json();
            // setEmployeeSales(employeeData); // Store employee sales data

            setLoadXDisabled(true); // Disable button
        } catch (error) {
            console.error('Error loading Z Report:', error);
        }
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Handle opening the sales report modal
    const handleLoadSalesReport = () => {
        setIsSalesReportModalOpen(true);
    };

    // Handle submission of the sales report date range
    const handleSubmitSalesReportDates = async () => {
        // setActiveReport('SalesReport');
        try {
            const response = await fetch(
                `http://${VITE_SERVER_URL}/api/reports/salesReport?start_date=${encodeURIComponent(salesStartDate)}&end_date=${encodeURIComponent(salesEndDate)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch sales report');
            }
            
            const data = await response.json();
            // console.log(data);  

            // Update the sales report data
            setSalesReportData(data); // Assuming data is an array of objects with product, quantity sold, and total sales
            hideOthers(4);
            setIsSalesReportModalOpen(false); // Close the modal
        } catch (error) {
            console.error('Error fetching sales report:', error);
        }
    };

    // Handle closing the sales report modal
    const handleCloseSalesReportModal = () => {
        setIsSalesReportModalOpen(false);
    };


    // Handle opening the popularity analysis modal
    const handleLoadPopularityAnalysisReport = () => {
        setIsPopularityModalOpen(true);
    };

    // Handle submission of popularity analysis data
    const handleSubmitPopularityAnalysis = async () => {
        // setActiveReport('popularityAnalysis');
        try {
            const response = await fetch(
                `http://${VITE_SERVER_URL}/api/reports/popularityAnalysis?start_date=${encodeURIComponent(
                    popularityStartDate
                )}&end_date=${encodeURIComponent(popularityEndDate)}&limit=${encodeURIComponent(popularityLimit)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch popularity analysis');
            }

            const data = await response.json();
            console.log(data);  

            setPopularityData(data);

            // Get rid of previous reports
            hideOthers(5);
            setIsPopularityModalOpen(false);
        } catch (error) {
            console.error('Error fetching popularity analysis:', error);
        }
    };


    // Handle closing the sales report modal
    const handleClosePopularityModal = () => {
        setIsPopularityModalOpen(false);
    };


    return (
        <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-red-600 mb-5">Reports</h1>
            <div className="flex space-x-4 mb-4">

                {/* Product Usage Button */}
                <button
                    onClick={handleLoadProductUsageReport}
                    className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                >
                    Product Usage
                </button>

                {/* X-report Button */}
                <button
                    onClick={handleLoadXReport}
                    className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                    disabled={loadXDisabled}
                >
                    X-report
                </button>

                {/* Z-report Button */}
                <button
                    onClick={handleLoadZReport}
                    className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                    disabled={loadXDisabled}
                >
                    Z-report
                </button>

                {/* Sales Report Button */}
                <button
                    onClick={handleLoadSalesReport}
                    className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                >
                    Sales Report
                </button>

                <div className="flex space-x-4 mb-4">
                    {/* Popularity Analysis Button */}
                    <button
                        onClick={handleLoadPopularityAnalysisReport}
                        className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                    >
                        Popularity Analysis Report
                    </button>
                </div>
            </div>

            {/* Modal for entering date range for product usage */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Enter Date Range</h2>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="Start Date"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="End Date"
                        />
                        <button
                            onClick={handleProductUsageSubmitDates}
                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                        <button
                            onClick={handleCloseModal}
                            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 ml-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Modal for sales report */}
            {isSalesReportModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Sales Report</h2>
                        <input
                            type="date"
                            value={salesStartDate}
                            onChange={(e) => setSalesStartDate(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="Start Date"
                        />
                        <input
                            type="date"
                            value={salesEndDate}
                            onChange={(e) => setSalesEndDate(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="End Date"
                        />
                        <button
                            onClick={handleSubmitSalesReportDates}
                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                        <button
                            onClick={handleCloseSalesReportModal}
                            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 ml-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Display the chart */}
            {chartData && isChartVisible && (
                <div className="mt-8 w-full max-w-2xl">
                    <Bar data={chartData} options={{ responsive: true }} />
                </div>
            )}

            {/* Display Sales Report Data */}
            {salesReportData.length > 0 && (
                <div className="mt-8 w-full max-w-2xl overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 border-b">Product Name</th>
                                <th className="py-2 border-b">Quantity Sold</th>
                                <th className="py-2 border-b">Total Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesReportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 border-b text-center">{item.menu_item_name}</td>
                                    <td className="py-2 border-b text-center">{item.quantity_sold}</td>
                                    <td className="py-2 border-b text-center">${item.total_sales.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Popularity Analysis Modal */}
            {isPopularityModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Popularity Analysis</h2>
                        <input
                            type="date"
                            value={popularityStartDate}
                            onChange={(e) => setPopularityStartDate(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="Start Date"
                        />
                        <input
                            type="date"
                            value={popularityEndDate}
                            onChange={(e) => setPopularityEndDate(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="End Date"
                        />
                        <input
                            type="number"
                            value={popularityLimit}
                            onChange={(e) => setPopularityLimit(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="Enter Limit"
                        />
                        <button
                            onClick={handleSubmitPopularityAnalysis}
                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                        <button
                            onClick={handleClosePopularityModal}
                            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 ml-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Display Popularity Analysis Data */}
            {popularityData.length > 0 && (
                <div className="mt-8 w-full max-w-2xl overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 border-b">Position</th>
                                <th className="py-2 border-b">Item Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularityData.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 border-b text-center">{index + 1}</td>
                                    <td className="py-2 border-b text-center">{item}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReportsView;
