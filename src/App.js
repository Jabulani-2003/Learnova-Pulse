import { db, auth } from "./firebase"; // ✅ combine this
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import ClassDetails from "./ClassDetails.js";
import Login from "./Login";

import "./App.css";

function App() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 📚 Class options
  const classOptions = [
    { name: "Grade 8 Maths", subject: "Mathematics" },
    { name: "Grade 9 Maths", subject: "Mathematics" },
    { name: "Grade 10 Maths", subject: "Mathematics" },
    { name: "Grade 11 Maths", subject: "Mathematics" },
    { name: "Grade 12 Maths", subject: "Mathematics" },
    { name: "Grade 8 Science", subject: "Physical Sciences" },
    { name: "Grade 9 Science", subject: "Physical Sciences" },
    { name: "Grade 10 Science", subject: "Physical Sciences" },
    { name: "Grade 11 Science", subject: "Physical Sciences" },
    { name: "Grade 12 Science", subject: "Physical Sciences" }
  ];

  // 📥 Fetch classes
  const fetchClasses = async () => {
  setLoading(true);

  const snapshot = await getDocs(collection(db, "classes"));
  const list = snapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
  .filter((cls) => user && cls.userId === user.uid);

  setClasses(list);
  setLoading(false);
};

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (user) {
    fetchClasses();
  }
}, [user]);
  // ➕ Add class
  const addClass = async () => {
    if (!user) {
    alert("Please login first");
    return;
  }
    let newClass;

    if (selectedClass === "custom") {
      if (!customName.trim()) return;

      newClass = {
        name: customName.trim(),
        subject: "Custom"
      };
    } else if (selectedClass !== "") {
      newClass = JSON.parse(selectedClass);
    } else {
      return;
    }

    // Prevent duplicates
    const exists = classes.some(
      (cls) =>
        cls.name.toLowerCase() === newClass.name.toLowerCase()
    );

    if (exists) {
      alert("⚠️ This class already exists!");
      return;
    }

    await addDoc(collection(db, "classes"), {
      ...newClass,
      userId: user.uid, // ✅ attach to user
      createdAt: new Date()
    });

    setSelectedClass("");
    setCustomName("");
    fetchClasses();
  };

  // ❌ Delete class
  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;

    await deleteDoc(doc(db, "classes", id));
    fetchClasses();
  };

  return (
    <Routes>

      {/* HOME */}
      <Route
        path="/"
        element={
    user ? (
      <div>
        <div
  className="header"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px"
  }}
>
  Learnova Pulse

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <span style={{ color: "#facc15", fontWeight: "bold", fontSize: "14px" }}>
      👤 {user?.displayName || user?.email}
    </span>

    <button
      style={{
        background: "#e74c3c",
        color: "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer"
      }}
      onClick={() => signOut(auth)}
    >
      Logout
    </button>
  </div>
</div>

        <div className="container">
          {loading && <div>Loading classes...</div>}
          <h3>📚 Total Classes: {classes.length}</h3>
              <div className="controls-row">
              <input
  className="input"
  placeholder="Search classes..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
                <select
                  className="input"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select a class</option>

                  {classOptions.map((cls, i) => (
                    <option key={i} value={JSON.stringify(cls)}>
                      {cls.name}
                    </option>
                  ))}

                  <option value="custom">Other (Create New)</option>
                </select>

                {selectedClass === "custom" && (
                  <input
                    className="input"
                    placeholder="Enter custom class"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                )}

                <button className="add-button" onClick={addClass}>
                  + Add Class
                </button>

              </div>

              {/* CLASS LIST */}
              {classes.length === 0 && (
  <div className="empty-state">
    🚫 No classes yet. Add your first class above.
  </div>
)}
             
             {classes
  .filter((cls) =>
    cls.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((cls) => (
                <div key={cls.id} className="class-card">

                  <div style={{ flex: 1 }}>
  <div className="class-name">{cls.name}</div>
  <div className="class-subject">{cls.subject}</div>

  <button
  className="open-button"
  onClick={() => navigate(`/class/${cls.id}`)}
>
  📂 Open Class
</button>
</div>

                  <button
                    className="delete-button"
                    onClick={() => deleteClass(cls.id)}
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>
            {/* ✅ FOOTER (ADD HERE) */}
              <div className="footer">
          © 2026 Learnova Pulse • Built by Jabulani Pepenene
        </div>
          </div>
          
              ) : (
      <Login />
    )
        }
      />

      {/* CLASS DETAILS */}
      <Route path="/class/:id" element={<ClassDetails />} />
        <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
