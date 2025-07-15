// "use client";
// import { motion, AnimatePresence } from "framer-motion";
// import { useState, useRef, useEffect } from "react";
// import * as XLSX from "xlsx";
// import axios from "axios";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Upload,
//   Download,
//   File,
//   X,
//   CheckCircle,
//   AlertTriangle,
//   LogOut,
// } from "lucide-react";

// export default function RoomImportPage() {
//   const [excelData, setExcelData] = useState([]);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState(""); // 'success' or 'error'
//   const [showModal, setShowModal] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [fileName, setFileName] = useState("");
//   const fileInputRef = useRef(null);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     setFileName(file.name);

//     const reader = new FileReader();

//     reader.onload = (event) => {
//       try {
//         const data = new Uint8Array(event.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const json = XLSX.utils.sheet_to_json(sheet);

//         if (json.length === 0) {
//           setMessageType("error");
//           setMessage("The uploaded file contains no data.");
//         } else {
//           setExcelData(json);
//           setShowModal(true);
//           setMessage("");
//         }
//       } catch (error) {
//         setMessageType("error");
//         setMessage(
//           "Failed to read the Excel file. Please make sure it is a valid Excel file."
//         );
//         console.error(error);
//       }

//       setIsUploading(false);
//     };

//     reader.onerror = () => {
//       setMessageType("error");
//       setMessage("There was an error reading the file.");
//       setIsUploading(false);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const handleDownloadTemplate = () => {
//     const headers = [
//       [
//         "roomId",
//         "name",
//         "description",
//         "category",
//          "noOfRoom",
//         "location",
//         "images",
//         "amenities",
//         "price",
//         "bed",
//         "isAvailable",
//       ],
//     ];

//     // Sample data row with explanations
//     const sampleRow = [
//       "ROOM001", // roomId
//       "deluxe suite", // name (will be converted to lowercase)
//       "Spacious deluxe suite with ocean view and modern amenities", // description
//       "Deluxe", // category (will match with Category collection)
//       5, // noOfRoom (number of rooms available)
//       "Ocean Drive, Miami", // location
//       "room1.jpg,room2.jpg,room3.jpg", // images (comma separated URLs)
//       "WiFi,Air Conditioning,Pool", // amenities (comma separated)
//       5000, // price
//       2, // bed (number of beds)
//       "TRUE", // isAvailable
//     ];

//     const worksheet = XLSX.utils.aoa_to_sheet([...headers, sampleRow]);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
//     XLSX.writeFile(workbook, "Room_Import_Template.xlsx");
//   };

//   const handleSubmit = async () => {
//     if (!excelData || excelData.length === 0) {
//       setMessageType("error");
//       setMessage("Please upload a valid Excel file.");
//       return;
//     }

//     try {
//       setIsUploading(true);
//       const res = await axios.post("/api/room/import", {
//         rooms: excelData,
//       });
//       setMessageType("success");
//       setMessage(res.data.message || "Rooms imported successfully!");
//       setExcelData([]);
//       setShowModal(false);
//       setFileName("");
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } catch (err) {
//       console.error(err);
//       setMessageType("error");
//       setMessage(
//         err.response?.data?.error ||
//           "Something went wrong during import. Please check the file format and data."
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const resetFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//     setFileName("");
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
//       <div className="max-w-5xl mx-auto">
//         <header className="flex flex-col md:flex-row md:items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">
//               Import Rooms
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Bulk import rooms from Excel file
//             </p>
//           </div>

//           <Link href="/room" className="mt-4 md:mt-0">
//             <button className="flex items-center cursor-pointer px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
//               <ArrowLeft size={18} className="mr-2" />
//               Back to Rooms
//             </button>
//           </Link>
//         </header>

//         {/* Message Display */}
//         {message && (
//           <div
//             className={`mb-6 p-4 flex items-start rounded-lg ${
//               messageType === "error"
//                 ? "bg-red-50 text-red-700 border-l-4 border-red-500"
//                 : "bg-green-50 text-green-700 border-l-4 border-green-500"
//             }`}
//           >
//             <div className="mr-3 flex-shrink-0 mt-0.5">
//               {messageType === "error" ? (
//                 <AlertTriangle size={20} />
//               ) : (
//                 <CheckCircle size={20} />
//               )}
//             </div>
//             <div>{message}</div>
//           </div>
//         )}

//         {/* Main Card */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <div className="mb-6">
//             <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
//             <p className="text-gray-600 mb-4">
//               Select an Excel file containing room data to import. Make sure
//               your file follows the required format or download our template
//               below.
//             </p>

//             {/* File Upload Section */}
//             <div className="mt-6 space-y-6">
//               {!fileName ? (
//                 <div
//                   className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100 mb-4">
//                     <Upload size={24} />
//                   </div>
//                   <p className="text-gray-600">
//                     Click to browse or drag and drop
//                   </p>
//                   <p className="text-gray-500 text-sm mt-1">
//                     Excel files (.xlsx, .xls)
//                   </p>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
//                   <div className="flex items-center">
//                     <div className="bg-blue-100 rounded-full p-2 mr-3">
//                       <File size={20} className="text-blue-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium text-gray-900">{fileName}</p>
//                       <p className="text-sm text-gray-500">
//                         {excelData.length} rooms found
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={resetFileInput}
//                     className="p-1.5 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
//                   >
//                     <X size={16} className="text-gray-600" />
//                   </button>
//                 </div>
//               )}

//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".xlsx, .xls"
//                 onChange={handleFileUpload}
//                 className="hidden"
//               />

//               <div className="flex flex-col sm:flex-row gap-4 mt-6">
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="flex items-center justify-center cursor-pointer px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors sm:flex-1 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
//                   disabled={isUploading}
//                 >
//                   <Upload size={18} className="mr-2" />
//                   {isUploading ? "Uploading..." : "Select File"}
//                 </button>

//                 <button
//                   onClick={handleDownloadTemplate}
//                   className="flex items-center cursor-pointer justify-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors sm:flex-1 shadow-sm"
//                 >
//                   <Download size={18} className="mr-2" />
//                   Download Template
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Import Tips */}
//         <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
//           <h3 className="text-lg font-medium text-blue-800 mb-3">
//             Import Tips
//           </h3>
//           <ul className="space-y-2 text-blue-800">
//             <li className="flex items-start">
//               <span className="mr-2">•</span> Make sure your Excel file has all
//               required columns: roomId, name, category, images, price, bed.
//             </li>
//             <li className="flex items-start">
//               <span className="mr-2">•</span> For multiple images, separate URLs
//               with commas (no spaces).
//             </li>
//             <li className="flex items-start">
//               <span className="mr-2">•</span> Room names will be automatically
//               converted to lowercase.
//             </li>
//             <li className="flex items-start">
//               <span className="mr-2">•</span> Category should match existing
//               categories in your database or will be created if it doesn't exist.
//             </li>
//             <li className="flex items-start">
//               <span className="mr-2">•</span> Set isAvailable to TRUE or FALSE
//               (case insensitive).
//             </li>
//             <li className="flex items-start">
//               <span className="mr-2">•</span> amenities should be a comma-separated list
//               of strings (e.g., "WiFi,Air Conditioning,Pool").
//             </li>
//             <li className="flex items-start">
//               <span className="mr-2">•</span> Price should be a number and bed
//               count should be a positive integer.
//             </li>
//             <li className="flex items-start">
//               <span className="mr-2">•</span> For best results, use our template
//               file.
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Confirm Import
//               </h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
//               >
//                 <X size={16} className="text-gray-600" />
//               </button>
//             </div>

//             <p className="text-gray-600 mb-4">
//               Please review the data before importing. We found{" "}
//               {excelData.length} rooms in your file.
//             </p>

//             <div className="flex-1 overflow-hidden mb-6">
//               <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
//                 <pre className="whitespace-pre-wrap">
//                   {JSON.stringify(excelData, null, 2)}
//                 </pre>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={isUploading}
//                 className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
//               >
//                 {isUploading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Importing...
//                   </>
//                 ) : (
//                   <>Import Data</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }