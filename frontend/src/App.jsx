import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from 'papaparse';

const base = "http://localhost:5050/api";
const dbApiUrl = `${base}/scraper/wishlist-db`;
const amazonApiUrl = `${base}/scraper/wishlist-amazon`;


function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortAsc, setSortAsc] = useState(true);
  const [refresh, setRefresh]= useState([])
  // const [amazon,setAmazon] = useState([])
  const [columnFilters, setColumnFilters] = useState({
    title: "",
    price: "",
    availability: "",
    delivery_location: "",
    delivery_time: "",
    product_url: "",
  });
  const [itemsPerPage, setItemsPerPage] = useState(50); // Default items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  //  For Refresh Automaticly 

  // const [refreshInterval,setRefreshInterval] = useState(null)
  // const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    axios.get(dbApiUrl, {
      params: {
        page: currentPage,
        limit: itemsPerPage
      }
    })
      .then((res) => {
        console.log("API response:", res.data.items); // Log the raw data from API
        setData(res.data.items);
        setTotal(res.data.total);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, []);


  const fetchRefreshDataAmazon = async () => {
    setIsLoading(true);
    axios.get(amazonApiUrl, {
      params: {
        page: currentPage,
        limit: itemsPerPage
      }
    })
      .then((res) => {
        console.log("API response:", res.data.items); // Log the raw data from API
        setData(res.data.items);
        setTotal(res.data.total);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  };


  const fetchRefreshDataDb = async (pageNumber, itemCount) => {
    setIsLoading(true);
    axios.get(dbApiUrl || "http://localhost:5000/api/scraper/wishlist-db", {
      params: {
        page: pageNumber || currentPage,
        limit: itemCount || itemsPerPage
      }
    })
      .then((res) => {
        console.log("API response:", res.data.items); // Log the raw data from API
        setData(res.data.items);
        setTotal(res.data.total);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);

      });
  };

  // For  Auto Refresh


  // useEffect(() => {
  //   if (!refreshInterval) return;
  //   const intervalMs =  refreshInterval * 60 * 1000;
  //   const intervalId = setInterval(() => {
  //     setRefresh(prev => prev + 1);  
  //   }, intervalMs);
  //   setRefresh(prev => prev + 1);
  
  //   return () => clearInterval(intervalId);
  // }, [refreshInterval]);

  // Manual refresh handler


  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const value = event.target.value;
    if (value === "all") {
      fetchRefreshDataDb(1, 'all');
      setItemsPerPage(data.length); // Show all items if "All" is selected
      setCurrentPage(1); // Reset to page 1
    } else {
      setItemsPerPage(Number(value));
      setCurrentPage(1); // Reset to page 1 when items per page is changed
      fetchRefreshDataDb(1, Number(value));
    }
  };

  const filteredData = data
    .filter((item) => item.title?.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => {
      return Object.entries(columnFilters).every(([key, value]) => {
        if(!value){
          return true
        }
        return key !== "product_url" && (value === "" || item[key]?.toLowerCase().includes(value.toLowerCase()))
      }
        
      );
    })
    .sort((a, b) => {
      const fieldA = a[sortBy] || "";
      const fieldB = b[sortBy] || "";
      return sortAsc
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    fetchRefreshDataDb();
  };

  // CSV export function
  const handleExportCSV = () => {
    // Define the CSV columns
    const columns = ["title", "price", "availability", "delivery_location", "delivery_time", "product_url"];
    // Map filtered data to an array of values
    const rows = filteredData.map((item) => columns.map((column) => item[column] || ""));
    
    // Add headers to the rows
    const dataForCSV = [columns, ...rows];
    
    // Use papaparse to convert data to CSV
    const csv = Papa.unparse(dataForCSV);

    // Create a downloadable file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.target = "_blank";
    link.download = "wishlist.csv"; // Set the download file name
    link.click(); // Trigger download
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 w-full overflow-x-auto shadow-md sm:rounded-lg">
      <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          {/* Logo before title */}
          {/* <img src="/logo.png" alt="Logo" className="w-8 h-8" /> Add your logo here */}
          Amazon Wishlist Sortner
        </h1>

        <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title..."
            className="border border-gray-300 px-4 py-2 rounded-md w-full sm:w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} item(s) of {total}
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <select
            value={itemsPerPage === data.length ? "all" : itemsPerPage} // If "All" selected, display "all"
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 px-4 py-2 rounded-md"
          >
            {[50, 100, 150, 200, 300, 500, 1000, "all"].map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All" : option}
              </option>
            ))}
          </select>
        </div>

        {/* CSV Export Button */}
        <div className="flex justify-end mb-4 gap-5">
        {/* <div className="flex items-center gap-2">
        <label htmlFor="refreshInterval" className="text-sm font-medium">
          Auto-refresh:
        </label>
        <select
          id="refreshInterval"
          value={refreshInterval || ''}
          onChange={(e) => setRefreshInterval(Number(e.target.value) || null)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Off</option>
          <option value="1">1 minute</option>
          <option value="2">2 minutes</option>
          <option value="3">3 minutes</option>
          <option value="5">5 minutes</option>
          <option value="8">8 minutes</option>
          <option value="10">10 minutes</option>
        </select>
      </div> */}
        <button
          onClick={fetchRefreshDataAmazon} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
          Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Export to CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-left table-auto">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                {["title", "price", "availability", "delivery_location", "delivery_time"].map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-300 transition"
                    onClick={() => handleSort(key)}
                  >
                    {key.replace("_", " ").toUpperCase()}
                    {sortBy === key && <span>{sortAsc ? " ▲" : " ▼"}</span>}
                  </th>
                ))}
                <th className="px-4 py-3">Product</th>
              </tr>
             
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">Loading...</td>
                </tr>
              ) : (
                currentItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">
                      {item.product_url ? (
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.title || "N/A"}
                        </a>
                      ) : (
                        item.title || "N/A"
                      )}
                    </td>
                    <td className="px-4 py-2">{item.price || "N/A"}</td>
                    <td className="px-4 py-2">{item.availability || "N/A"}</td>
                    <td className="px-4 py-2">{item.delivery_location || "N/A"}</td>
                    <td className="px-4 py-2">{item.delivery_time || "N/A"}</td>
                    <td className="px-4 py-2 break-all">
                      {item.product_url ? (
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 underline"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              )}
              {filteredData.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 px-4 py-6">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {/* {filteredData.length > itemsPerPage && !isLoading && itemsPerPage !== data.length && ( */}
            <div className="flex justify-center mt-4">
              <div>
                {[...Array(pageCount)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 mx-1 border rounded ${currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          {/* // )} */}
        </div>
      </div>
    </div>
  );
}

export default App;
