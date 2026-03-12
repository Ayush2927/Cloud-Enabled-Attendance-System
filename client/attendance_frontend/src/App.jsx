import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AttendancePage from "./pages/AttendancePage"; // We will create this next
// import Login from "./pages/Login"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/attendance" element={<AttendancePage />} />
      </Routes>
    </Router>
  );
}

export default App;