import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiUsers, FiPlayCircle, FiStopCircle, FiHome, FiSettings, FiEye, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FeatureHub from '../../components/ui/FeatureHub';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New state for attendance modal
  const [selectedLectureInfo, setSelectedLectureInfo] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  const teacherFeatures = [
    {
      id: 'teacher-home',
      title: 'Dashboard & Sessions',
      description: 'Manage scheduled sessions and attendance shifts.',
      icon: <FiHome size={18} />,
      onClick: () => navigate('/teacher')
    },
    {
      id: 'teacher-settings',
      title: 'Settings',
      description: 'Update account security and profile preferences.',
      icon: <FiSettings size={18} />,
      onClick: () => navigate('/settings')
    }
  ];

  const fetchMyLectures = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/lectures/my-today');
      setLectures(res.data.data);
    } catch (err) {
      toast.error('Failed to load today\'s lectures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLectures();
  }, []);

  const handleShiftChange = async (lectureId, newStatus) => {
    try {
      await api.post('/attendance/teacher/shift', {
        lectureId,
        status: newStatus
      });
      toast.success(`Session ${newStatus === 'Active' ? 'started' : 'ended'} successfully`);
      fetchMyLectures(); // Refresh the list
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update session status';
      toast.error(msg);
    }
  };

  const fetchLectureAttendance = async (lecture) => {
    setSelectedLectureInfo(lecture);
    setIsLoadingAttendance(true);
    setAttendanceRecords([]);
    try {
      const res = await api.get(`/attendance/teacher/lecture/${lecture._id}`);
      setAttendanceRecords(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch attendance');
      setSelectedLectureInfo(null);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const closeAttendanceModal = () => {
    setSelectedLectureInfo(null);
    setAttendanceRecords([]);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, Prof. {user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Manage your sessions and track student attendance.</p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4">Your Schedule for Today</h2>
        
        {isLoading ? (
          <Card className="h-40 flex items-center justify-center bg-card/50">
            <div className="animate-pulse flex items-center gap-3 text-muted-foreground">
              <FiClock className="animate-spin" /> Loading schedule...
            </div>
          </Card>
        ) : lectures.length === 0 ? (
          <Card className="h-40 flex flex-col items-center justify-center bg-card/20 border-dashed text-center p-6">
            <h3 className="text-lg font-medium text-foreground mb-1">No lectures assigned today</h3>
            <p className="text-muted-foreground">You have a free schedule! Use your time well.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lectures.map((lecture) => (
              <Card key={lecture._id} className="flex flex-col bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant={
                      lecture.sessionStatus === 'Active' ? 'default' : 
                      lecture.sessionStatus === 'Ended' ? 'secondary' : 'outline'
                    }>
                      {lecture.sessionStatus}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                      <FiClock size={14} className="text-primary" /> {lecture.startTime} - {lecture.endTime}
                    </div>
                  </div>

                  <CardTitle className="text-xl leading-tight line-clamp-1">
                    {lecture.subject.name} ({lecture.subject.code})
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Division {lecture.division} &bull; Room: TBA
                  </CardDescription>
                </CardHeader>

                <CardFooter className="flex gap-3 mt-auto pt-4 border-t border-border/50">
                  {lecture.sessionStatus === 'Scheduled' && (
                    <Button 
                      onClick={() => handleShiftChange(lecture._id, 'Active')}
                      className="flex-1 gap-2"
                    >
                      <FiPlayCircle size={18} /> Start Session
                    </Button>
                  )}
                  {lecture.sessionStatus === 'Active' && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleShiftChange(lecture._id, 'Ended')}
                      className="flex-1 gap-2 shadow-lg shadow-destructive/20"
                    >
                      <FiStopCircle size={18} /> End Session & Lock
                    </Button>
                  )}
                  {lecture.sessionStatus === 'Ended' && (
                    <Button 
                      disabled
                      variant="secondary"
                      className="flex-1 opacity-60"
                    >
                      Session Ended
                    </Button>
                  )}
                  
                  {/* Attendance View Button */}
                  <Button 
                    variant="outline"
                    onClick={() => fetchLectureAttendance(lecture)}
                    className="flex-1 gap-2"
                  >
                    <FiUsers size={18} /> View Attendance
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-8">
        <Card className="border-primary/20 bg-secondary/10">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FiInfo className="text-primary" /> Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Click <strong className="text-foreground">Start Session</strong> when you enter the physical classroom.</li>
              <li>Once started, students will see the 'Mark Present' button on their dashboards.</li>
              <li>Click <strong className="text-foreground">End Session</strong> right before leaving. Any student who didn't biometric-scan will be auto-marked absent.</li>
            </ul>
          </CardContent>
        </Card>
        
        <FeatureHub title="Teacher Features" items={teacherFeatures} />
      </div>

      {selectedLectureInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={closeAttendanceModal}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[85vh]">
            <Card className="w-full flex flex-col shadow-2xl border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <CardTitle>{selectedLectureInfo.subject.name} Attendance</CardTitle>
                  <CardDescription>
                    Div {selectedLectureInfo.division}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={closeAttendanceModal}>
                  &times;
                </Button>
              </CardHeader>
              
              <CardContent className="overflow-y-auto p-4 md:p-6 space-y-4 min-h-[300px]">
                {isLoadingAttendance ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    <FiClock className="animate-spin mr-2" /> Loading records...
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">
                    <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No students marked present yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {attendanceRecords.map((record, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                        <div>
                          <div className="font-medium text-foreground">{record.user?.name || 'Unknown Student'}</div>
                          <div className="text-xs text-muted-foreground">{record.user?.email || 'No email provided'}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="gap-1 px-3 mb-1 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
                            <FiCheckCircle size={12} /> Present
                          </Badge>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(record.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t border-border/50">
                <Button variant="outline" className="w-full" onClick={closeAttendanceModal}>
                  Close
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
