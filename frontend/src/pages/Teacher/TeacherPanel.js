import React, { useEffect, useState } from "react";
import api from "../../api";

export default function TeacherPanel() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeData, setGradeData] = useState({
    subject: "",
    score: "",
    grade: "",
  });

  const [scores, setScores] = useState({});
  const [assessment, setAssessment] = useState({ name: "", max_score: "" });
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [assessmentOptions, setAssessmentOptions] = useState([]);

  const fetchAssessments = async () => {
    const res = await api.get("teacher-assessments/");
    setAssessmentOptions(res.data);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAssessments();
      const res = await api.get("teacher-students/");
      setStudents(res.data);
    };
    fetchData();
  }, []);

  const submitGrade = async () => {
    await api.post("submit-result/", {
      enrollment_id: selectedStudent.id,
      ...gradeData,
    });
    alert("Grade saved!");
    setSelectedStudent(null);
  };

  const submitBulk = async () => {
    if (!selectedAssessmentId) return alert("Select an assessment first!");
    const payload = Object.keys(scores).map((id) => ({
      enrollment_id: id,
      score: scores[id],
    }));
    await api.post("bulk-grade/", {
      assessment_id: selectedAssessmentId,
      scores: payload,
    });
    alert("Bulk grades submitted!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Class List</h2>

      {/* Assessment Section */}
      <div
        style={{ background: "#f4f4f4", padding: "15px", marginBottom: "20px" }}
      >
        <h4>Setup Assessment</h4>
        <input
          placeholder="Name"
          onChange={(e) =>
            setAssessment({ ...assessment, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Max Score"
          onChange={(e) =>
            setAssessment({ ...assessment, max_score: e.target.value })
          }
        />
        <button
          onClick={async () => {
            await api.post("create-assessment/", assessment);
            fetchAssessments();
            alert("Created!");
          }}
        >
          Save
        </button>

        <select
          onChange={(e) => setSelectedAssessmentId(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="">-- Select Assessment --</option>
          {assessmentOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} (Max: {a.max_score})
            </option>
          ))}
        </select>
      </div>

      {/* Grading Content */}
      {selectedStudent ? (
        <div>
          <h3>Grading: {selectedStudent.first_name}</h3>
          {/* ... inputs remain same ... */}
          <button onClick={submitGrade}>Save Result</button>
          <button onClick={() => setSelectedStudent(null)}>Back</button>
        </div>
      ) : (
        <table border="1" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>Bulk Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.first_name}</td>
                <td>{s.grade}</td>
                <td>
                  <input
                    type="number"
                    onChange={(e) =>
                      setScores({ ...scores, [s.id]: e.target.value })
                    }
                  />
                </td>
                <td>
                  <button onClick={() => setSelectedStudent(s)}>Grade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={submitBulk} style={{ marginTop: "20px" }}>
        Submit Bulk Scores
      </button>
    </div>
  );
}
