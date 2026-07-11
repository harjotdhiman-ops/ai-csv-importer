"use client";

import React, { useRef, useState } from "react";
import Papa from "papaparse";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const UploadBox = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [crmData, setCrmData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadCSV = () => {
    if (crmData.length === 0) return;

    const headers = Object.keys(crmData[0]);

    const rows = crmData.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? "");
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "parsed_crm_records.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  
  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a valid CSV file.");
      return;
    }
    setSelectedFile(file);
    console.log("Dropped/Selected:", file.name);
    setError(null);
    setSuccess(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data as any[]);
      },
    });
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }
    setUploading(true);

    setProgress(10);
    setStatus("Uploading CSV...");
    setProgress(30);
    setStatus("Sending file to server...");
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await axios.post(
        `${API_URL}/api/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProgress(90);
      setStatus("Processing AI response...");
      console.log(response.data);
      setCrmData(response.data.records || []);
      setProgress(100);
      setStatus("Import Complete");
      setSuccess("File uploaded and data imported successfully!");
    } catch (err: any) {
        setProgress(0);
        setStatus("Import Failed");
      setError(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl transition-colors dark:bg-slate-900">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Upload CSV File</h2>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
          isDragging
            ? "border-green-500 bg-green-100 dark:border-green-500 dark:bg-green-900/30 scale-[1.01] shadow-lg"
            : "border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        }`}
      >
        <div className="text-7xl">📁</div>
        <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Drag & Drop CSV Here
        </h3>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          or click to browse your files
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Supports Facebook, Google Ads, Excel and any valid CSV.
        </p>
      </div>
      <input
        ref={fileInputRef}
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile && (
        <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4">
          <p className="font-semibold text-slate-900">Selected File</p>
          <p className="text-slate-800">{selectedFile.name}</p>
          <p className="text-slate-700">{(selectedFile.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {csvData && csvData.length > 0 && (
        <>
          <div className="mb-3 rounded-lg bg-gray-50 p-4 border">
            <p className="font-semibold text-slate-900">CSV Parsed Successfully</p>
            <p className="text-slate-700">Total Rows: {csvData.length}</p>
          </div>
          <div className="mt-6 max-h-[400px] overflow-auto rounded-lg border bg-white">
            <table className="min-w-full text-left text-sm text-slate-800 bg-white">
              <thead className="bg-gray-100 text-slate-900">
                <tr>
                  {Object.keys(csvData[0]).map((header) => (
                    <th key={header} className="px-4 py-2 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {csvData.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="bg-white px-4 py-2 text-slate-700">{String(val ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
{uploading && (
  <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">

    <div className="mb-2 flex justify-between">

      <span className="font-semibold text-slate-800">
        {status}
      </span>

      <span className="font-bold text-blue-700">
        {progress}%
      </span>

    </div>

    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">

      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />

    </div>

  </div>
)}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Confirm Import"}
      </button>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {success && <div className="mt-4 text-green-600">{success}</div>}

      {crmData.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-3">
            <div className="rounded-lg bg-green-100 p-4">
              <h3 className="font-semibold text-slate-900">Imported</h3>
              <p className="text-3xl font-bold text-green-700">{crmData.length}</p>
            </div>

            <div className="rounded-lg bg-blue-100 p-4">
              <h3 className="font-semibold text-slate-900">Preview Rows</h3>
              <p className="text-3xl font-bold text-blue-700">{csvData.length}</p>
            </div>

            <div className="rounded-lg bg-red-100 p-4">
              <h3 className="font-semibold text-slate-900">Skipped</h3>
              <p className="text-3xl font-bold text-red-700">{Math.max(csvData.length - crmData.length, 0)}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={downloadCSV}
              className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              Download Parsed CSV
            </button>
          </div>

          <h2 className="mt-10 mb-4 text-2xl font-bold text-slate-900">
            AI Parsed CRM Records
          </h2>

          <div className="max-h-[500px] overflow-auto rounded-lg border bg-white">
            <table className="min-w-full text-sm text-slate-800 bg-white">
              <thead className="sticky top-0 bg-blue-100 text-slate-900">
                <tr>
                  {Object.keys(crmData[0]).map((key) => (
                    <th key={key} className="border px-3 py-2 text-left">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {crmData.map((row, i) => (
                  <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="border bg-white px-3 py-2 text-slate-700">{String(value ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadBox;