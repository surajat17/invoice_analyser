'use client'
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Alert,
  Button,
} from "@mui/material";
import axios from "axios";

const DocumentManager = () => {
  const [ruleId, setRuleId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [uploadStatus, setUploadStatus] = useState({
    rule: "",
    invoice: "",
  });

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { file_id, status } = response.data;

      if (type === "rule") {
        setRuleId(file_id);
        setUploadStatus((prev) => ({ ...prev, rule: status }));
      } else if (type === "invoice") {
        setInvoiceId(file_id);
        setUploadStatus((prev) => ({ ...prev, invoice: status }));
      }
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        [type]: "File upload failed. Please try again.",
      }));
    }
  };

  const handleDownloadReport = async () => {
    if (!ruleId || !invoiceId) {
      alert("Please upload both Rule and Invoice documents before downloading the report.");
      return;
    }

    try {
      const response = await axios.get(
        `/download/report/?document_id=${invoiceId}&rule_id=${ruleId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.txt");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading the report:", error);
    }
  };

  const handleDownloadTable = async () => {
    if (!invoiceId) {
      alert("Please upload the Invoice document before downloading the table.");
      return;
    }

    try {
      const response = await axios.get(
        `/download/table/?document_id=${invoiceId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "table.json");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading the table:", error);
    }
  };

  return (
    <Box
      sx={{
        padding: 4,
        fontFamily: "Arial, sans-serif",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Document Upload and Report/Table Download
      </Typography>

      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Grid container spacing={3}>
          {/* Upload Rule Document */}
          <Grid item xs={12}>
            <Typography variant="h6">Upload Rule Document</Typography>
            <TextField
              type="file"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleFileUpload(e.target.files[0], "rule")}
            />
            {uploadStatus.rule && (
              <Alert severity={ruleId ? "success" : "error"} sx={{ marginTop: 2 }}>
                {uploadStatus.rule}
              </Alert>
            )}
            {ruleId && <Typography>Rule Document ID: {ruleId}</Typography>}
          </Grid>

          {/* Upload Invoice Document */}
          <Grid item xs={12}>
            <Typography variant="h6">Upload Invoice Document</Typography>
            <TextField
              type="file"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleFileUpload(e.target.files[0], "invoice")}
            />
            {uploadStatus.invoice && (
              <Alert
                severity={invoiceId ? "success" : "error"}
                sx={{ marginTop: 2 }}
              >
                {uploadStatus.invoice}
              </Alert>
            )}
            {invoiceId && <Typography>Invoice Document ID: {invoiceId}</Typography>}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleDownloadReport}>
          Download Report
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDownloadTable}>
          Download Table
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentManager;
