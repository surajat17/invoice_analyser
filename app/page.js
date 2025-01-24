'use client';
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Alert,
  Button,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import axios from "axios";

const DocumentManager = () => {
  const [ruleId, setRuleId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [uploadStatus, setUploadStatus] = useState({
    rule: "",
    invoice: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true); // Start loader
      const response = await axios.post(
        "https://makeathon-vmci.onrender.com/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const handleDownloadReport = async () => {
    if (!ruleId || !invoiceId) {
      alert(
        "Please upload both Rule and Invoice documents before downloading the report."
      );
      return;
    }

    try {
      setLoading(true); // Start loader
      const response = await axios.get(
        `https://makeathon-vmci.onrender.com/download/report/?document_id=${invoiceId}&rule_id=${ruleId}`,
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
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const handleDownloadTable = async () => {
    if (!invoiceId) {
      alert("Please upload the Invoice document before downloading the table.");
      return;
    }

    try {
      setLoading(true); // Start loader
      const response = await axios.get(
        `https://makeathon-vmci.onrender.com/download/table/?document_id=${invoiceId}`,
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
    } finally {
      setLoading(false); // Stop loader
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
      Intelligent Invoice Analyzer
      </Typography>

      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h6">Upload Contract/Rules</Typography>
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
            {invoiceId && <Typography>Document ID: {invoiceId}</Typography>}
          </Grid>
          {/* Upload Rule Document */}
          <Grid item xs={12}>
            <Typography variant="h6">Upload Document to Analyze</Typography>
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
            {ruleId && <Typography>Document ID: {ruleId}</Typography>}
          </Grid>

          {/* Upload Invoice Document */}

        </Grid>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleDownloadReport}>
        Download Analysis Report
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDownloadTable}>
        Download Table Json
        </Button>
      </Box>

      {/* Loader */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default DocumentManager;
