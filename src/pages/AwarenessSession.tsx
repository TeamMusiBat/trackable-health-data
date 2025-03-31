
// Updating only the EditableEntry section that contains the error:

<EditableEntry
  data={session}
  onSave={(updatedData) => handleUpdateSession(session.id, updatedData)}
  title="Awareness Session"
  fieldConfig={[
    { name: "sessionNumber", label: "Session Number", type: "number" },
    { name: "name", label: "Name", type: "text" },
    { name: "fatherOrHusband", label: "Father/Husband Name", type: "text" },
    { name: "age", label: "Age", type: "number" },
    { name: "underFiveChildren", label: "Under Five Children", type: "number" },
    { name: "contactNumber", label: "Contact Number", type: "text" },
    { name: "villageName", label: "Village", type: "text" },
    { name: "ucName", label: "UC Name", type: "text" },
    { name: "sameUc", label: "Person belongs to same UC", type: "text" },
    { name: "alternateLocation", label: "Alternate Location", type: "text" },
    { name: "images", label: "Images", type: "images" }
  ]}
/>
