import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useDispatch } from "react-redux";

interface MyEditorProps {
  id?: number;
  value: string;
  onChange: (value: string) => void;
}

const CkEditor: React.FC<MyEditorProps> = ({ id, value, onChange }) => {
  const dispatch = useDispatch();
  const [memoryDescription, setMemoryDescription] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const handleReady = (editor: any) => {
    editor.editing.view.change((writer: any) => {
      writer.setStyle(
        "height",
        `${window.innerHeight - 45}px`,
        editor.editing.view.document.getRoot()
      );
      writer.setStyle(
        "color",
        "#000",
        editor.editing.view.document.getRoot()
      );
      writer.setStyle(
        "background-color",
        "#fff",
        editor.editing.view.document.getRoot()
      );
    });
  };

  const handleAlertMessage = (isSuccess: boolean) => {
    if (isSuccess) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
    } else {
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 4000);
    }
  };

  const cleanHtml = (htmlString: string) => {
    var doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const updateContextMemories = () => {
    fetch("http://localhost:3001/memories/list", {
      method: "GET",
    }).then(async (response: any) => {
      const memories = await response.json();
      dispatch({ type: "UPDATE_MEMORIES", payload: memories });
    });
  };

  // Inserting or updating]
  const handleSave = () => {
    if (!memoryDescription.length) {
      handleAlertMessage(false);
      return;
    }
    const cleanedDescription = cleanHtml(memoryDescription);
    let url, method;
    if (id) {
      // updating
      url = `http://localhost:3001/memories/${id}`;
      method = "PUT";
    } else {
      // inserting
      url = "http://localhost:3001/memories/add";
      method = "POST";
    }

    fetch(url, {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        user_id: 1,
        title: cleanedDescription.length
          ? cleanedDescription.substring(0, 45)
          : "Untitled Note",
        description: memoryDescription,
        updated_by: 1,
      }),
    })
      .then((response) => {
        if (response.ok) {
          handleAlertMessage(true);
          updateContextMemories();
        } else {
          handleAlertMessage(false);
        }
      })
      .catch((error) => {
        handleAlertMessage(false);
      });
  };

  return (
    <div style={{ position: "relative" }}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onReady={handleReady}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
          setMemoryDescription(data);
        }}
      />
      {/* Success message */}
      {showSuccessMessage && (
        <div className={`success-message ${showSuccessMessage ? "show" : ""}`}>
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            Successfully saved the note
          </Alert>
        </div>
      )}
      {/* Error message */}
      {showErrorMessage && (
        <div className={`error-message ${showErrorMessage ? "show" : ""}`}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            Something went wrong — <strong>Please contact support</strong>
          </Alert>
        </div>
      )}
      <div className="save-button">
        <Button
          variant="contained"
          endIcon={<SaveIcon />}
          onClick={() => handleSave()}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default CkEditor;
