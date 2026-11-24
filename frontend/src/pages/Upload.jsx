import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Upload() {

  /*
  =====================================
  STATES
  =====================================
  */

  const [file, setFile] = useState(null);

  const [progress, setProgress] = useState(0);

  const [message, setMessage] =
    useState("Ready to upload");

  const [dragActive, setDragActive] =
    useState(false);

  /*
  =====================================
  SOCKET LISTENER
  =====================================
  */

  useEffect(() => {

    socket.on("uploadProgress", (data) => {

      setProgress(data.percent);

      setMessage(data.message);
    });

    return () => {

      socket.off("uploadProgress");
    };

  }, []);

  /*
  =====================================
  HANDLE FILE
  =====================================
  */

  const handleFile = (selectedFile) => {

    if (selectedFile) {

      setFile(selectedFile);
    }
  };

  /*
  =====================================
  DRAG DROP
  =====================================
  */

  const handleDragOver = (e) => {

    e.preventDefault();

    setDragActive(true);
  };

  const handleDragLeave = () => {

    setDragActive(false);
  };

  const handleDrop = (e) => {

    e.preventDefault();

    setDragActive(false);

    const droppedFile =
      e.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  /*
  =====================================
  UPLOAD
  =====================================
  */

  const handleUpload = async () => {

    try {

      if (!file) {

        alert("Choose file first");

        return;
      }

      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post(
  `http://localhost:5000/api/upload?socketId=${socket.id}`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }
);
      /*
      ============================
      SAVE RESULT
      ============================
      */

      localStorage.setItem(

        "certificateResult",

        JSON.stringify(response.data)
      );

      /*
      ============================
      REDIRECT
      ============================
      */

      window.location.href = "/result";

    }

    catch (error) {

      console.log(error);

      alert(

        error?.response?.data?.message ||

        "Upload failed"
      );
    }
  };

  /*
  =====================================
  RESET
  =====================================
  */

  const handleReset = () => {

    setFile(null);

    setProgress(0);

    setMessage("Ready to upload");
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right,#EEF2FF,#FDF2F8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "20px"
      }}
    >

      {/* BACK BUTTON */}

      <button
        onClick={() => window.location.href = "/"}
        style={{
          position: "absolute",
          top: "30px",
          left: "30px",
          padding: "14px 24px",
          borderRadius: "999px",
          border: "1px solid #C4B5FD",
          background: "white",
          color: "#6D28D9",
          fontWeight: "700",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        ← Back to Home
      </button>

      {/* MAIN CARD */}

      <div
        style={{
          width: "460px",
          background: "white",
          borderRadius: "24px",
          padding: "30px",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.12)"
        }}
      >

        {/* TITLE */}

        <h1
          style={{
            fontSize: "38px",
            marginBottom: "12px",
            color: "#111827",
            fontWeight: "800"
          }}
        >
          Upload Certificate
        </h1>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "24px"
          }}
        >
          Upload PDF, DOCX, TXT or image files
        </p>

        {/* DROP AREA */}

        <div

          onDragOver={handleDragOver}

          onDragLeave={handleDragLeave}

          onDrop={handleDrop}

          style={{
            border:
              dragActive
                ? "2px solid #6D28D9"
                : "2px dashed #8B5CF6",

            borderRadius: "18px",

            padding: "40px 20px",

            textAlign: "center",

            marginBottom: "20px",

            background:
              dragActive
                ? "#F3E8FF"
                : "#FAF5FF",

            transition: "0.3s"
          }}
        >

          <div
            style={{
              fontSize: "30px",
              marginBottom: "12px"
            }}
          >
            📁
          </div>

          <p
            style={{
              marginBottom: "14px",
              color: "#374151",
              fontWeight: "600"
            }}
          >
            Drag & Drop your certificate
          </p>

          <input
            type="file"

            onChange={(e) =>
              handleFile(e.target.files[0])
            }
          />

        </div>

        {/* FILE DETAILS */}

        {
          file && (

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <p
                style={{
                  color: "#4B5563",
                  fontWeight: "700"
                }}
              >
                {file.name}
              </p>

              <p
                style={{
                  color: "#9CA3AF",
                  fontSize: "14px"
                }}
              >
                {file.type}
              </p>

            </div>
          )
        }

        {/* IMAGE PREVIEW */}

        {
          file &&
          file.type.startsWith("image/") && (

            <img
              src={URL.createObjectURL(file)}

              alt="preview"

              style={{
                width: "100%",
                borderRadius: "16px",
                marginBottom: "20px"
              }}
            />
          )
        }

        {/* PDF PREVIEW */}

        {
          file &&
          file.type === "application/pdf" && (

            <iframe
              src={URL.createObjectURL(file)}

              title="PDF Preview"

              width="100%"

              height="250px"

              style={{
                borderRadius: "16px",
                marginBottom: "20px",
                border: "none"
              }}
            />
          )
        }

        {/* PROGRESS */}

        <div
          style={{
            marginBottom: "24px"
          }}
        >

          <div
            style={{
              width: "100%",
              height: "12px",
              background: "#E5E7EB",
              borderRadius: "999px",
              overflow: "hidden"
            }}
          >

            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg,#7C3AED,#A855F7)",
                transition: "0.4s"
              }}
            />

          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "600",
              color: "#6D28D9"
            }}
          >

            <span>{message}</span>

            <span>{progress}%</span>

          </div>

        </div>

        {/* BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "16px"
          }}
        >

          <button
            onClick={handleReset}

            style={{
              flex: 1,
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background: "#E5E7EB",
              cursor: "pointer",
              fontWeight: "700"
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}

            style={{
              flex: 1,
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background:
                "linear-gradient(90deg,#7C3AED,#8B5CF6)",
              color: "white",
              cursor: "pointer",
              fontWeight: "700"
            }}
          >
            Upload
          </button>

        </div>

      </div>

    </div>
  );
}