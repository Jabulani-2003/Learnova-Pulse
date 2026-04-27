import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
function ClassDetails() {
  const { id } = useParams(); // ✅ get class id
  const [activeTab, setActiveTab] = useState("attendance");

  const [learners, setLearners] = useState([]);
  const [newLearner, setNewLearner] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [tests, setTests] = useState([
  { name: "Test 1", total: 100 }
]);
const [lastReminder, setLastReminder] = useState(null);
const [selectedTest, setSelectedTest] = useState("Test 1");
const [marksData, setMarksData] = useState({});
const [newTestName, setNewTestName] = useState("");
const [newTestTotal, setNewTestTotal] = useState("");
const [teacherComment, setTeacherComment] = useState("");
const [schedule, setSchedule] = useState([]);
const [day, setDay] = useState("Monday");
const [subject, setSubject] = useState("");
const [time, setTime] = useState("");
const [teacher, setTeacher] = useState("");
const [room, setRoom] = useState("");
const [viewMode, setViewMode] = useState(
  localStorage.getItem("viewMode") || "list"
);
useEffect(() => {
  localStorage.setItem("viewMode", viewMode);
}, [viewMode]);
const [teacherName, setTeacherName] = useState("");
const [files, setFiles] = useState(
  JSON.parse(localStorage.getItem(`files-${id}`)) || []
);
const [schoolName, setSchoolName] = useState("");
const [theme, setTheme] = useState("light");
const [remindersEnabled, setRemindersEnabled] = useState(
  JSON.parse(localStorage.getItem("remindersEnabled")) || false
);
useEffect(() => {
  const savedTeacher = localStorage.getItem("teacherName") || "";
  const savedSchool = localStorage.getItem("schoolName") || "";
  const savedTheme = localStorage.getItem("theme") || "light";

  setTeacherName(savedTeacher);
  setSchoolName(savedSchool);
  setTheme(savedTheme);
}, []);
useEffect(() => {
  localStorage.setItem("teacherName", teacherName);
  localStorage.setItem("schoolName", schoolName);
  localStorage.setItem("theme", theme);
  localStorage.setItem("remindersEnabled", JSON.stringify(remindersEnabled));
}, [teacherName, schoolName, theme, remindersEnabled]);
useEffect(() => {
  localStorage.setItem(`files-${id}`, JSON.stringify(files));
}, [files, id]);

  /* =========================
     LOAD DATA (PER CLASS)
  ========================= */
  useEffect(() => {
    const savedSchedule =
  JSON.parse(localStorage.getItem(`schedule-${id}`)) || [];

setSchedule(savedSchedule);
    const savedLearners =
      JSON.parse(localStorage.getItem(`learners-${id}`)) || [];

    const savedHistory =
      JSON.parse(localStorage.getItem(`attendanceHistory-${id}`)) || [];

    setLearners(savedLearners);
    setHistory(savedHistory);
    const savedMarks =
  JSON.parse(localStorage.getItem(`marks-${id}`)) || {};

setMarksData(savedMarks);

// generate tests list
const savedTests =
  JSON.parse(localStorage.getItem(`tests-${id}`)) || [
    { name: "Test 1", total: 100 }
  ];

setTests(savedTests);
setSelectedTest(savedTests[0]?.name || "");
  }, [id]);
useEffect(() => {
  const savedComment =
    localStorage.getItem(`comment-${id}-${selectedTest}`) || "";

  setTeacherComment(savedComment);
}, [id, selectedTest]);
useEffect(() => {
  localStorage.setItem(
    `comment-${id}-${selectedTest}`,
    teacherComment
  );
}, [teacherComment, id, selectedTest]);
  /* =========================
   AUTO SAVE ATTENDANCE
========================= */
useEffect(() => {
  localStorage.setItem(
    `attendance-${id}-${date}`,
    JSON.stringify(attendance)
  );
}, [attendance, id, date]);
useEffect(() => {
  document.body.className = theme; // "light" or "dark"
}, [theme]);
useEffect(() => {
  const autoBackup = setInterval(() => {
    const data = {
      learners,
      history,
      marksData,
      schedule,
      tests,
      teacherName,
      schoolName
    };

    localStorage.setItem(`auto-backup-${id}`, JSON.stringify(data));
  }, 300000); // every 5 minutes

  return () => clearInterval(autoBackup);
}, [learners, history, marksData, schedule, tests, teacherName, schoolName, id]);
  /* =========================
     LOAD ATTENDANCE PER DATE (PER CLASS)
  ========================= */
  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem(`attendance-${id}-${date}`)) || {};

    setAttendance(saved);
  }, [date, id]);
  useEffect(() => {
  localStorage.setItem(
    `schedule-${id}`,
    JSON.stringify(schedule)
  );
}, [schedule, id]);
  /* =========================
     ADD LEARNER
  ========================= */
 const addLearner = () => {
  if (!newLearner.trim()) return;

  const nameExists = learners.some(
    (l) => l.toLowerCase() === newLearner.trim().toLowerCase()
  );

  // ✅ If duplicate → warn teacher
  if (nameExists) {
    const confirmAdd = window.confirm(
      "This learner already exists.\nDo you want to add them again?"
    );

    if (!confirmAdd) return; // stop if teacher cancels
  }

  const updated = [...learners, newLearner.trim()];
  setLearners(updated);

  localStorage.setItem(`learners-${id}`, JSON.stringify(updated));

  setNewLearner("");
};

  /* =========================
     DELETE LEARNER
  ========================= */
  const deleteLearner = (name) => {
    const updated = learners.filter((l) => l !== name);

    setLearners(updated);
    localStorage.setItem(`learners-${id}`, JSON.stringify(updated));
  };

  /* =========================
     EDIT LEARNER
  ========================= */
  const editLearner = (oldName) => {
    const newName = prompt("Edit learner name:", oldName);
    if (!newName || newName === oldName) return;

    const updated = learners.map((l) =>
      l === oldName ? newName : l
    );

    setLearners(updated);
    localStorage.setItem(`learners-${id}`, JSON.stringify(updated));
  };

  /* =========================
     MARK ATTENDANCE
  ========================= */
  const markAttendance = (name, status) => {
    setAttendance((prev) => ({
      ...prev,
      [name]: status,
    }));
  };
const updateMarks = (learner, value) => {
  setMarksData((prev) => {
    const updated = {
      ...prev,
      [selectedTest]: {
        ...(prev[selectedTest] || {}),
        [learner]: value,
      },
    };

    localStorage.setItem(`marks-${id}`, JSON.stringify(updated));
    return updated;
  });
  
};const addSchedule = () => {
  if (!subject.trim() || !time.trim()) {
    alert("Please fill in subject and time");
    return;
  }

  const overlap = schedule.some(item => {
    if (item.day !== day) return false;

    const [newStart, newEnd] = time.split("-").map(t => t.trim());
    const [start, end] = item.time.split("-").map(t => t.trim());

    return !(newEnd <= start || newStart >= end);
  });

  if (overlap) {
    alert("Time conflict with another lesson!");
    return;
  }

  const newItem = {
    id: Date.now(),
    subject,
    time,
    teacher,
    room,
    day
  };

  setSchedule([...schedule, newItem]);

  setSubject("");
  setTime("");
  setTeacher("");
  setRoom("");
};
const clearSchedule = () => {
  if (!window.confirm("Clear entire schedule?")) return;
  setSchedule([]);
};

const deleteSchedule = (id) => {
  const updated = schedule.filter(item => item.id !== id);
  setSchedule(updated);
};
const deleteTest = () => {
  if (!selectedTest) return;

  const confirmDelete = window.confirm(
    `Delete "${selectedTest}" assessment?`
  );
  if (!confirmDelete) return;

  // remove test from list
  const updatedTests = tests.filter(
    (t) => t.name !== selectedTest
  );
  setTests(updatedTests);

  // remove marks for that test
  const updatedMarks = { ...marksData };
  delete updatedMarks[selectedTest];

  setMarksData(updatedMarks);

  // save to localStorage
  localStorage.setItem(`tests-${id}`, JSON.stringify(updatedTests));
  localStorage.setItem(`marks-${id}`, JSON.stringify(updatedMarks));

  // switch to another test (if exists)
  setSelectedTest(updatedTests[0]?.name || "");
};
  /* =========================
     SAVE ATTENDANCE (PER CLASS)
  ========================= */
  const saveAttendance = () => {
    localStorage.setItem(
      `attendance-${id}-${date}`,
      JSON.stringify(attendance)
    );

    const present = Object.values(attendance).filter(
      (v) => v === "present"
    ).length;

    const total = learners.length;

    const percent = total
      ? Math.round((present / total) * 100)
      : 0;

    const newRecord = { date, percent };

    const updatedHistory = [
      ...history.filter((h) => h.date !== date),
      newRecord,
    ];

    setHistory(updatedHistory);

    localStorage.setItem(
      `attendanceHistory-${id}`,
      JSON.stringify(updatedHistory)
    );

    alert("Attendance saved ✅");
  };

  /* =========================
     SUMMARY
  ========================= */
  const presentCount = Object.values(attendance).filter(
    (v) => v === "present"
  ).length;

  const absentCount = Object.values(attendance).filter(
    (v) => v === "absent"
  ).length;

  const total = learners.length;

  const percentage = total
    ? Math.round((presentCount / total) * 100)
    : 0;
// ================= MARKS ANALYTICS =================
const getTeacherComment = () => {
  const avg = getClassAverage();
  const pass = getPassRate();

  if (avg >= 75 && pass >= 80) {
    return "Excellent performance overall. The class is doing very well.";
  }

  if (avg >= 60) {
    return "Good performance, but there is room for improvement.";
  }

  if (avg >= 50) {
    return "Average performance. Focus on helping struggling learners.";
  }

  return "Performance is below expectations. Intervention is required.";
};
// ================= CHART DATA =================

const getClassAverage = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const testTotal = currentTest?.total || 0;

  const values = Object.values(marksData[selectedTest] || {})
    .map(Number)
    .filter(v => !isNaN(v));

  if (!values.length || !testTotal) return 0;

  const avg =
    values.reduce((a, b) => a + b, 0) / values.length;

  return Math.round((avg / testTotal) * 100);
};const getSubjectColor = (subject) => {
  const map = {
    maths: "#ffe082",
    english: "#80deea",
    science: "#a5d6a7",
    history: "#ef9a9a",
    geography: "#ce93d8",
    physics: "#90caf9",
    life: "#ffcc80"
  };

  return map[subject.toLowerCase()] || "#e0e0e0";
};
const sortByTime = (lessons) => {
  return [...lessons].sort((a, b) => {
    const getStart = (t) => t.split("-")[0].trim();
    return getStart(a.time).localeCompare(getStart(b.time));
  });
};
const getTimeSlots = () => {
  const times = schedule.map(item => item.time);
  const unique = [...new Set(times)];

  return unique.sort((a, b) => {
    const getStart = (t) => t.split("-")[0].trim();
    return getStart(a).localeCompare(getStart(b));
  });
};
// ✅ ADD THIS RIGHT ABOVE renderGridView
const cellStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  minWidth: "100px"
};
const renderGridView = () => {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const timeSlots = getTimeSlots();

  return (
    <div style={{ overflowX: "auto", marginTop: "20px" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center"
      }}>
        <thead>
          <tr>
            <th style={cellStyle}>Time</th>
            {days.map(day => (
              <th key={day} style={cellStyle}>{day}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td style={cellStyle}><strong>{time}</strong></td>

              {days.map(day => {
                const lesson = schedule.find(
                  item => item.day === day && item.time === time
                );

                return (
                  <td
                    key={day}
                    style={{
                      ...cellStyle,
                      background: lesson
                        ? getSubjectColor(lesson.subject)
                        : "#fafafa"
                    }}
                  >
                    {lesson ? (
                      <>
                        <div><strong>{lesson.subject}</strong></div>
                        <div style={{ fontSize: "12px" }}>
                          {lesson.teacher}
                        </div>
                      </>
                    ) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const editSchedule = (item) => {
  const newSubject = prompt("Subject:", item.subject);
  if (!newSubject) return;

  const newTime = prompt("Time (e.g 08:00 - 09:00):", item.time);
  if (!newTime) return;

  const newTeacher = prompt("Teacher:", item.teacher || "");
  const newRoom = prompt("Room:", item.room || "");

  const updated = schedule.map(s =>
    s.id === item.id
      ? {
          ...s,
          subject: newSubject,
          time: newTime,
          teacher: newTeacher,
          room: newRoom
        }
      : s
  );

  setSchedule(updated);
};

const getCurrentLesson = () => {
  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = now.toTimeString().slice(0,5);

  return schedule.find(item => {
    if (item.day !== currentDay) return false;

    const [start, end] = item.time.split("-").map(t => t.trim());

    return currentTime >= start && currentTime <= end;
  });
};
const getNextLesson = () => {
  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = now.toTimeString().slice(0,5);

  const todayLessons = sortByTime(
    schedule.filter(item => item.day === currentDay)
  );

  return todayLessons.find(item => {
    const [start] = item.time.split("-").map(t => t.trim());
    return start > currentTime;
  });
};
useEffect(() => {
  if (!remindersEnabled) return;

  const interval = setInterval(() => {
    const next = getNextLesson();
    if (!next) return;

    const now = new Date();
    const [start] = next.time.split("-").map(t => t.trim());

    const lessonTime = new Date();
    const [h, m] = start.split(":");
    lessonTime.setHours(Number(h), Number(m), 0);

    const diff = (lessonTime - now) / 1000 / 60; // minutes

    // 🔔 Trigger reminder 5 minutes before
    if (diff > 0 && diff <= 5 && lastReminder !== next.id) {
  if (Notification.permission === "granted") {
    new Notification("⏰ Upcoming Lesson", {
      body: `${next.subject} starts at ${next.time}`
    });
  } else {
    alert(`Reminder: ${next.subject} starts at ${next.time}`);
  }

  setLastReminder(next.id); // ✅ prevent repeats
}
  }, 60000); // check every 1 min

  return () => clearInterval(interval);
}, [schedule, remindersEnabled]);
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("Browser does not support notifications");
    return;
  }

  if (Notification.permission === "denied") {
    alert("⚠️ Notifications are blocked.\nPlease enable them in browser settings.");
    return;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Notifications not enabled.");
    }
  }
};

const nextLesson = getNextLesson();

const currentLesson = getCurrentLesson();
const getPerformanceStats = () => {
  const testMarks = marksData[selectedTest] || {};
  const entries = Object.entries(testMarks);

  if (!entries.length) return { top: [], lowest: [] };

  const scores = entries.map(([_, s]) => Number(s));

  const max = Math.max(...scores);
  const min = Math.min(...scores);

  const top = entries
    .filter(([_, s]) => Number(s) === max)
    .map(([name]) => name);

  const lowest = entries
    .filter(([_, s]) => Number(s) === min)
    .map(([name]) => name);

  return { top, lowest };
};
// ================= RANKING SYSTEM =================
const getRankings = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const total = currentTest?.total || 0;

  const data = learners.map(l => {
    const mark = marksData[selectedTest]?.[l] || 0;
    const percent = total ? (mark / total) * 100 : 0;

    return {
      name: l,
      percent
    };
  });

  // sort highest → lowest
  data.sort((a, b) => b.percent - a.percent);

  // assign ranks
  return data.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
};
const getPassRate = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const totalMarks = currentTest?.total || 0;

  const values = Object.values(marksData[selectedTest] || {})
    .map(Number)
    .filter(v => !isNaN(v));

  if (!values.length || !totalMarks) return 0;

  const passes = values.filter(v => (v / totalMarks) * 100 >= 50).length;

  return Math.round((passes / values.length) * 100);
};

const getFailRate = () => {
  return 100 - getPassRate();
};

const getDistributionStats = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const totalMarks = currentTest?.total || 0;

  const values = Object.values(marksData[selectedTest] || {})
    .map(Number)
    .filter(v => !isNaN(v));

  let above75 = 0;
  let below40 = 0;

  values.forEach(v => {
    const percent = (v / totalMarks) * 100;

    if (percent >= 75) above75++;
    if (percent < 40) below40++;
  });

  return { above75, below40 };
};
// ================= DISTINCTIONS =================
const getDistinctions = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const total = currentTest?.total || 0;

  const distinctions = learners.filter(l => {
    const mark = marksData[selectedTest]?.[l];
    if (mark === undefined || total === 0) return false;

    const percent = (Number(mark) / total) * 100;
    return percent >= 80;
  });

  return distinctions;
};

const getDistinctionCount = () => {
  return getDistinctions().length;
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const newFile = {
      name: file.name,
      type: file.type,
      data: reader.result
    };

    setFiles(prev => [...prev, newFile]);
  };

  reader.readAsDataURL(file);
};
const downloadFile = (file) => {
  const a = document.createElement("a");
  a.href = file.data;
  a.download = file.name;
  a.click();
};
const deleteFile = (index) => {
  const updated = files.filter((_, i) => i !== index);
  setFiles(updated);
};
/* =========================
   RESTORE DATA
========================= */

  /* =========================
     EXPORT CSV
  ========================= */
  const exportCSV = () => {
    /* =========================
   BACKUP DATA
========================= */

    let csv = "Name,Status\n";

    learners.forEach((l) => {
      csv += `${l},${attendance[l] || "Not Marked"}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${date}.csv`;
    a.click();
  };
  const exportExcel = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const total = currentTest?.total || 0;

  const data = learners.map(l => {
    const mark = marksData[selectedTest]?.[l] || 0;
    const percent = total
      ? Math.round((mark / total) * 100)
      : 0;

    return {
      Name: l,
      Marks: mark,
      Percentage: percent + "%"
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");

  XLSX.writeFile(workbook, `${selectedTest}-marks.xlsx`);
};
const exportInsightsExcel = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const total = currentTest?.total || 0;

  const data = learners.map(l => {
    const mark = marksData[selectedTest]?.[l] || 0;
    const percent = total
      ? Math.round((mark / total) * 100)
      : 0;

    return {
      Name: l,
      Marks: mark,
      Percentage: percent + "%"
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  XLSX.writeFile(workbook, `${selectedTest}-results.xlsx`);
};
const exportPDF = () => {
  const input = document.querySelector(".marks-table");

  if (!input) {
    alert("Marks table not found!");
    return;
  }

  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 0);

    pdf.save(`${selectedTest}-marks.pdf`);
  });
};
const exportAttendancePDF = () => {
  const input = document.getElementById("attendance-report");

  if (!input) {
    alert("Attendance report not found!");
    return;
  }

  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`attendance-${date}.pdf`);
  });
};
  const exportMarksCSV = () => {
  const currentTest = tests.find(t => t.name === selectedTest);
  const total = currentTest?.total || 0;

  let csv = "Name,Marks,Percentage\n";

  learners.forEach(l => {
    const mark = marksData[selectedTest]?.[l] || 0;
    const percent = total
      ? Math.round((mark / total) * 100)
      : 0;

    csv += `${l},${mark},${percent}%\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${selectedTest}-marks.csv`;
  a.click();
};
const exportFullReportPDF = () => {
  const input = document.getElementById("pdf-report");

  if (!input) {
    alert("Report not found!");
    return;
  }

  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${selectedTest}-full-report.pdf`);
  });
};
const exportSchedulePDF = () => {
  const input = document.getElementById("schedule-report");

  if (!input) {
    alert("Schedule not found!");
    return;
  }

  html2canvas(input).then(canvas => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 0);

    pdf.save("schedule.pdf");
  });
};
  /* =========================
     FILTER
  ========================= */
  const filteredLearners = learners.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="header">
  Class Learners ({learners.length})
  <div style={{ fontSize: "14px", marginTop: "5px" }}>
    👨‍🏫 {teacherName || "No Teacher"} | 🏫 {schoolName || "No School"}
  </div>
</div>
      <div className="tabs">
  <button
    className={activeTab === "learners" ? "tab active" : "tab"}
    onClick={() => setActiveTab("learners")}
  >
    👨‍🎓 Learners
  </button>

  <button
    className={activeTab === "attendance" ? "tab active" : "tab"}
    onClick={() => setActiveTab("attendance")}
  >
    📊 Attendance
  </button>

  <button
    className={activeTab === "marks" ? "tab active" : "tab"}
    onClick={() => setActiveTab("marks")}
  >
    📝 Marks
  </button>

  <button
    className={activeTab === "insights" ? "tab active" : "tab"}
    onClick={() => setActiveTab("insights")}
  >
    📈 Insights
  </button>

  <button
    className={activeTab === "schedule" ? "tab active" : "tab"}
    onClick={() => setActiveTab("schedule")}
  >
    📅 Schedule
  </button>
  <button
  className={activeTab === "settings" ? "tab active" : "tab"}
  onClick={() => setActiveTab("settings")}
>
  ⚙️ Settings
</button>
</div>
{activeTab === "learners" && (
  <div className="container">
    <h3>👨‍🎓 Learners</h3>

    {filteredLearners.map((learner) => (
      <div key={learner} className="learner-card">
        <span>{learner}</span>

        <div className="button-group">
          <button
            className="edit-button"
            onClick={() => editLearner(learner)}
          >
            Edit
          </button>

          <button
            className="delete-button"
            onClick={() =>
              deleteLearner(learner)
            }
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
)}  
      {activeTab === "attendance" && (
  <div className="container">
        <div className="controls-row">
          <input
            className="input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <input
            className="input"
            placeholder="Add learner..."
            value={newLearner}
            onChange={(e) => setNewLearner(e.target.value)}
          />

          <button className="add-button" onClick={addLearner}>
            + Add
          </button>

          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button className="add-button" onClick={saveAttendance}>
            💾 Save
          </button>

          <button className="add-button">📅 History</button>

          <button className="add-button" onClick={exportCSV}>
            📤 Export
          </button>
          <button className="add-button" onClick={exportAttendancePDF}>
  📄 Export Attendance PDF
</button>

        </div>
         
        {/* ================= LEARNERS TAB ================= */}

        {
  filteredLearners.map((learner) => {
          const status = attendance[learner];

          return (
            <div key={learner} className="learner-card">
              <span>{learner}</span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  className="attendance-group"
                  style={{ gap: "6px" }}
                >
                  <button
                    className={`toggle-btn present ${
                      status === "present"
                        ? "active"
                        : "inactive"
                    }`}
                    onClick={() =>
                      markAttendance(learner, "present")
                    }
                  >
                    Present
                  </button>

                  <button
                    className={`toggle-btn absent ${
                      status === "absent"
                        ? "active"
                        : "inactive"
                    }`}
                    onClick={() =>
                      markAttendance(learner, "absent")
                    }
                  >
                    Absent
                  </button>
                </div>

                <div className="button-group">
                  <button
                    className="edit-button"
                    onClick={() => editLearner(learner)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteLearner(learner)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        




        <div className="history-panel">
         {/* ================= MARKS TAB ================= */}

          {/* ================= INSIGHTS TAB ================= */}

          <h3>📊 Today Summary</h3>
          <p>Present: {presentCount}</p>
          <p>Absent: {absentCount}</p>
          <p>Attendance: {percentage}%</p>
        </div>

        <div className="history-panel">
          <h3>📅 Attendance History</h3>
          {history.map((h) => (
            <div key={h.date} className="history-item">
              {h.date} → {h.percent}%
            </div>
          ))}
          
        </div>
      </div>
      )}
      {/* ================= SCHEDULE TAB ================= */}
{activeTab === "schedule" && (
  <div className="container">
    <h3>📅 Class Schedule</h3>

<div style={{ marginBottom: "10px" }}>
  <button
    className={`add-button ${viewMode === "list" ? "active" : ""}`}
    onClick={() => setViewMode("list")}
  >
    📋 List View
  </button>

  <button
    className={`add-button ${viewMode === "grid" ? "active" : ""}`}
    onClick={() => setViewMode("grid")}
    style={{ marginLeft: "10px" }}
  >
    🗓 Grid View
  </button>
</div>
    
{currentLesson && (
  
  <div className="highlight-card">
    🔥 Current: {currentLesson.subject} ({currentLesson.time})
  </div>
)
}
{nextLesson && (
  <div className="highlight-card" style={{ background: "#e3f2fd" }}>
    ⏭ Next: {nextLesson.subject} ({nextLesson.time})
  </div>
)}

    {/* ===== INPUTS ===== */}
    <div className="controls-row" style={{ gap: "10px", flexWrap: "wrap" }}>
      <input
        className="input"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <input
        className="input"
        placeholder="Time (e.g 08:00 - 09:00)"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <input
        className="input"
        placeholder="Teacher (optional)"
        value={teacher}
        onChange={(e) => setTeacher(e.target.value)}
      />

      <select
  className="input"
  value={day}
  onChange={(e) => setDay(e.target.value)}
>
  <option>Monday</option>
  <option>Tuesday</option>
  <option>Wednesday</option>
  <option>Thursday</option>
  <option>Friday</option>
</select>

      <button className="add-button" onClick={addSchedule}>
        ➕ Add Lesson
      </button>
      <button className="add-button" onClick={exportSchedulePDF}>
  📄 Export Timetable
</button>

<button className="delete-button" onClick={clearSchedule}>
  🗑 Clear All
</button>
    </div>

    {/* ===== SCHEDULE LIST ===== */}
    <div id="schedule-report" style={{ marginTop: "20px" }}>
  {viewMode === "grid" ? (
    renderGridView()
  ) : (
    schedule.length === 0 ? (
      <p>No lessons added yet.</p>
    ) : (
      ["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d => {
        const dayLessons = sortByTime(
          schedule.filter(item => item.day === d)
        );

        if (!dayLessons.length) return null;

        return (
          <div key={d} style={{ marginBottom: "20px" }}>
            <h4>📅 {d}</h4>

            {dayLessons.map(item => (
              <div
                key={item.id}
                className="learner-card"
                style={{
                  borderLeft: `6px solid ${getSubjectColor(item.subject)}`
                }}
              >
                <div>
                  {/* ✅ KEEP YOUR ORIGINAL DESIGN */}
                  <strong>{item.subject}</strong>

                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    🕒 {item.time}
                  </div>

                  <div style={{ fontSize: "12px", color: "#555" }}>
                    {item.teacher && <>👨‍🏫 {item.teacher} </>}
                    {item.room && <>| 🏫 {item.room}</>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    className="edit-button"
                    onClick={() => editSchedule(item)}
                  >
                    ✏️
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteSchedule(item.id)}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })
    )
  )}
</div>
  </div>
)}
      
      {/* ================= MARKS ================= */}
{activeTab === "marks" && (
  <div className="container">
    <h3>📝 Marks</h3>

    {/* INPUTS */}
    
    <div className="controls-row" style={{ gap: "10px", flexWrap: "wrap" }}>
  
  <input
    className="input"
    placeholder="Assessment Name (e.g Test 1)"
    value={newTestName}
    onChange={(e) => setNewTestName(e.target.value)}
  />

  <input
    type="number"
    className="input"
    placeholder="Total Marks (e.g 30)"
    value={newTestTotal}
    onChange={(e) => setNewTestTotal(e.target.value)}
  />

  {/* ADD BUTTON */}
  <button
    className="add-button"
    onClick={() => {
      if (!newTestName || !newTestTotal) {
        alert("Enter assessment name and total marks");
        return;
      }

      const exists = tests.some((t) => t.name === newTestName);
      if (exists) {
        alert("Assessment already exists");
        return;
      }

      const updated = [
        ...tests,
        { name: newTestName, total: Number(newTestTotal) }
      ];

      setTests(updated);
      setSelectedTest(newTestName);
      localStorage.setItem(`tests-${id}`, JSON.stringify(updated));

      setNewTestName("");
      setNewTestTotal("");
    }}
  >
    ➕ Add Assessment
  </button>

  {/* EXPORT BUTTONS */}
  <button className="add-button" onClick={exportExcel}>
    📊 Export Excel
  </button>
   
  <button className="add-button" onClick={exportPDF}>
    📄 Export PDF
    
  </button>

  <button className="add-button" onClick={exportMarksCSV}>
    📤 Export CSV
  </button>

</div>
<div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

<select
  className="input"
  value={selectedTest}
  onChange={(e) => setSelectedTest(e.target.value)}
>
  {tests.map((t) => (
    <option key={t.name} value={t.name}>
      {t.name} (/{t.total})
    </option>
  ))}
</select>

<button
  className="delete-button"
  onClick={deleteTest}
>
  ❌ Delete Test
</button>

</div>
    {/* TABLE */}
    <div className="marks-table">
      <div className="marks-header">
  <span>Name</span>
  <span>Marks</span>
  <span>%</span>
</div>


      {learners.map((learner) => {
        const { top, lowest } = getPerformanceStats();
        const currentTest = tests.find(t => t.name === selectedTest);
        const testTotal = currentTest?.total || 0;

        const value =
          marksData[selectedTest]?.[learner] || "";

        const percent =
  value !== "" && testTotal > 0
    ? Math.round((Number(value) / testTotal) * 100)
    : "";

const pass = percent >= 50;
        
      
          return (
    <div
      key={learner}
      className="marks-row"

      style={{
  border: top.includes(learner)
    ? "2px solid gold"
    : lowest.includes(learner)
    ? "2px solid red"
    : ""
}}
      
      
    >
            
            
<span>{learner}</span>

            <input
              type="number"
              className="marks-input"
              value={value}
              onChange={(e) => {
  const val = Number(e.target.value);
  if (val > testTotal) return; // ❌ prevent invalid marks
  updateMarks(learner, val);
  
}}
              placeholder="0"
            />

            <input
  className="marks-input"
  style={{
    backgroundColor:
      percent === "" ? "" : pass ? "#d4edda" : "#f8d7da"
  }}
  value={percent !== "" ? percent + "%" : ""}
  readOnly
/>
          </div>
        );
      })}
    </div>
  </div>
)}

{activeTab === "insights" && (
  <div className="container">
    <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
  className="add-button"
  style={{ marginBottom: "15px" }}
  onClick={exportInsightsExcel}
>
  📊 Export Results (Excel)
</button>
      <button
  className="add-button"
  style={{ marginBottom: "15px", width: "100%" }}
  onClick={exportFullReportPDF}
>
  🏫 Download Full Report (PDF)
</button>
  📈 Marks Insights
</h3>

    {/* ===== STATS CARDS ===== */}
    <div className="insights-grid">
      <div className="stat-card">
        <h2>{getClassAverage()}%</h2>
        <p>Class Average</p>
      </div>

      <div className="stat-card">
        <h2>{getPassRate()}%</h2>
        <p>Pass Rate</p>
      </div>

      <div className="stat-card">
        <h2>{getFailRate()}%</h2>
        <p>Fail Rate</p>
      </div>

      <div className="stat-card">
        <h2>{getDistinctionCount()}</h2>
        <p>Distinctions</p>
      </div>
    </div>

    {/* ===== TOP + LOWEST ===== */}
    <div className="history-panel">
      <h4>🏆 Top Performers</h4>
      {getPerformanceStats().top.map(name => (
        <div key={name}>
          <span className="badge top">TOP</span> {name}
        </div>
      ))}

      <h4 style={{ marginTop: "15px" }}>⚠️ Needs Attention</h4>
      {getPerformanceStats().lowest.map(name => (
        <div key={name}>
          <span className="badge low">LOW</span> {name}
        </div>
      ))}
    </div>

    {/* ===== RANKING ===== */}
    <div className="history-panel">
      <h4>🏅 Class Ranking</h4>
      {getRankings().map(r => (
        <div key={r.name}>
          #{r.rank} - {r.name} ({Math.round(r.percent)}%)
        </div>
      ))}
    </div>


<div className="history-panel">
  <h4>🧠 Teacher Comment</h4>

  <textarea
    className="input"
    style={{ width: "100%", minHeight: "100px" }}
    placeholder="Write your comment about the class performance..."
    value={teacherComment}
    onChange={(e) => setTeacherComment(e.target.value)}
  />

  <button
    className="add-button"
    style={{ marginTop: "10px" }}
    onClick={() => setTeacherComment(getTeacherComment())}
  >
    ✨ Use Suggested Comment
  </button>

  <div style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
    💡 Suggested: {getTeacherComment()}
  </div>
</div>
    {/* ===== DISTRIBUTION ===== */}
    <div className="history-panel">
      <h4>📊 Performance Distribution</h4>
      <p>Above 75%: {getDistributionStats().above75}</p>
      <p>Below 40%: {getDistributionStats().below40}</p>
    </div>
  </div>
)}
{activeTab === "settings" && (
  <div className="container">
    <h3>⚙️ Settings</h3>

    {/* Teacher Info */}
    <div className="history-panel">
      <h4>👨‍🏫 Teacher Info</h4>

      <input
        className="input"
        placeholder="Teacher Name"
        value={teacherName}
        onChange={(e) => setTeacherName(e.target.value)}
      />

      <input
        className="input"
        placeholder="School Name"
        value={schoolName}
        onChange={(e) => setSchoolName(e.target.value)}
        style={{ marginTop: "10px" }}
      />
    </div>

    {/* Theme */}
    {/* 🔔 Notifications */}
<div className="history-panel">
  <h4>🔔 Lesson Reminders</h4>

  <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <input
      type="checkbox"
      checked={remindersEnabled}
      onChange={(e) => {
        setRemindersEnabled(e.target.checked);
        if (e.target.checked) {
          requestNotificationPermission();
        }
      }}
    />
    Enable lesson reminders (5 mins before)
  </label>
</div>
<button
  className="add-button"
  onClick={requestNotificationPermission}
>
  🔔 Test Notifications
</button>
    <div className="history-panel">
      <h4>🎨 Theme</h4>

      <select
        className="input"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>

    {/* Backup */}
    <div className="history-panel">
  <h4>💾 Backup & Restore</h4>

  {/* Upload Files */}
  <h5 style={{ marginTop: "15px" }}>📂 Upload Teaching Files</h5>

  <input
    type="file"
    accept=".pdf,.doc,.docx,.xls,.xlsx"
    onChange={handleFileUpload}
  />

  <div style={{ marginTop: "10px" }}>
    {files.map((file, index) => (
  <div key={index} className="learner-card">
    <span>{file.name}</span>

    <div style={{ display: "flex", gap: "10px" }}>
      <button
        className="add-button"
        onClick={() => downloadFile(file)}
      >
        ⬇ Download
      </button>

      <button
        className="delete-button"
        onClick={() => deleteFile(index)}
      >
        🗑 Delete
      </button>
    </div>
  </div>
))}
  </div>

  {/* ONE BUTTON ONLY */}
  <button
    className="add-button"
    style={{ marginTop: "10px" }}
    onClick={() => {
      const dataStr = JSON.stringify(localStorage, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "full-app-backup.json";
      a.click();
    }}
  >
    📦 Export Everything
  </button>
</div>

    {/* Danger Zone */}
    <div className="history-panel">
      <h4 style={{ color: "red" }}>⚠️ Danger Zone</h4>

      <button
        className="delete-button"
        onClick={() => {
          if (window.confirm("Delete ALL data?")) {
            localStorage.clear();
            window.location.reload();
          }
        }}
      >
        🗑 Reset App
      </button>
    </div>
  </div>
)}
<button
  className="add-button"
  style={{ marginTop: "10px" }}
  onClick={() => {
  const data = {
    learners,
    history,
    marksData,
    schedule,
    tests,
    files,
    teacherName,
    schoolName,
    theme
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `class-${id}-backup.json`;
  a.click();
}}
>
  ♻️ Restore Auto Backup
</button>
  {/* ===== PDF REPORT (HIDDEN) ===== */}
<div
  id="pdf-report"
  style={{
    position: "absolute",
    left: "-9999px",
    top: 0,
    width: "800px",
    padding: "20px",
    background: "white",
    color: "black",
    fontFamily: "Arial"
  }}
><div
  id="attendance-report"
  style={{
    position: "absolute",
    left: "-9999px",
    width: "800px",
    padding: "20px",
    background: "white",
    color: "black",
    fontFamily: "Times New Roman"
  }}
>
  <h2>📊 Attendance Report</h2>
  <p><strong>Date:</strong> {date}</p>
  <p><strong>Teacher:</strong> {teacherName}</p>
<p><strong>School:</strong> {schoolName}</p>
  <hr />

  <h3>Summary</h3>
  <p>Present: {presentCount}</p>
  <p>Absent: {absentCount}</p>
  <p>Attendance: {percentage}%</p>

  <hr />

  <h3>Learner Attendance</h3>

  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th style={{ border: "1px solid black" }}>Name</th>
        <th style={{ border: "1px solid black" }}>Status</th>
      </tr>
    </thead>
    <tbody>
      {learners.map((l) => (
        <tr key={l}>
          <td style={{ border: "1px solid black" }}>{l}</td>
          <td style={{ border: "1px solid black" }}>
            {attendance[l] || "Not Marked"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  <h2>Class Report</h2>
  <p><strong>Teacher:</strong> {teacherName}</p>
<p><strong>School:</strong> {schoolName}</p>
  <p><strong>Test:</strong> {selectedTest}</p>

  <hr />

  {/* ===== STATS ===== */}
  <h3>📊 Class Statistics</h3>
  <p>Average: {getClassAverage()}%</p>
  <p>Pass Rate: {getPassRate()}%</p>
  <p>Fail Rate: {getFailRate()}%</p>
  <p>Distinctions: {getDistinctionCount()}</p>

  <hr />

  {/* ===== TEACHER COMMENT ===== */}
  <h3>🧠 Teacher Comment</h3>
  <p>{teacherComment || "No comment provided."}</p>

  <hr />

  {/* ===== RANKING ===== */}
  <h3>🏅 Class Ranking</h3>
  {getRankings().map(r => (
    <p key={r.name}>
      #{r.rank} - {r.name} ({Math.round(r.percent)}%)
    </p>
  ))}

  <hr />

  {/* ===== MARKS TABLE ===== */}
  <h3>📋 Learner Marks</h3>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th style={{ border: "1px solid black" }}>Name</th>
        <th style={{ border: "1px solid black" }}>Marks</th>
        <th style={{ border: "1px solid black" }}>%</th>
      </tr>
    </thead>
    <tbody>
      {learners.map(l => {
        const currentTest = tests.find(t => t.name === selectedTest);
        const total = currentTest?.total || 0;

        const mark = marksData[selectedTest]?.[l] || 0;
        const percent = total
          ? Math.round((mark / total) * 100)
          : 0;

        return (
          <tr key={l}>
            <td style={{ border: "1px solid black" }}>{l}</td>
            <td style={{ border: "1px solid black" }}>{mark}</td>
            <td style={{ border: "1px solid black" }}>{percent}%</td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
    </>
  );
}

export default ClassDetails;