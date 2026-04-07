import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiCheckSquare, FiPieChart, FiSettings, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FeatureHub from '../../components/ui/FeatureHub';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [division, setDivision] = useState('SEM-1'); // Placeholder default
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const studentFeatures = [
    {
      id: 'student-home',
      title: 'Dashboard',
      description: 'Open your live class timeline and session status.',
      icon: <FiHome size={18} />,
      onClick: () => navigate('/student')
    },
    {
      id: 'student-attendance',
      title: 'Mark Attendance',
      description: 'Launch biometric verification for the active lecture.',
      icon: <FiCheckSquare size={18} />,
      onClick: () => navigate('/student/mark-attendance')
    },
    {
      id: 'student-stats',
      title: 'My Stats',
      description: 'Track attendance percentages and at-risk subjects.',
      icon: <FiPieChart size={18} />,
      onClick: () => navigate('/student/stats')
    },
    {
      id: 'student-settings',
      title: 'Settings',
      description: 'Manage account and password preferences.',
      icon: <FiSettings size={18} />,
      onClick: () => navigate('/settings')
    }
  ];

  // Fetch today's lectures for the selected/default division
  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/lectures/today?division=${division}`);
        setLectures(res.data.data);
      } catch (err) {
        toast.error('Failed to load today\'s timetable');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, [division]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">Here is your timeline for today.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg border border-border">
          <span className="text-sm font-medium text-foreground whitespace-nowrap px-2">Division:</span>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger className="w-[120px] h-9 bg-background">
              <SelectValue placeholder="Select Dev" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <SelectItem key={`SEM-${sem}`} value={`SEM-${sem}`}>SEM-{sem}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4">Today's Lectures</h2>
        
        {isLoading ? (
          <Card className="h-40 flex items-center justify-center bg-card/50">
            <div className="animate-pulse flex items-center gap-3 text-muted-foreground">
              <FiClock className="animate-spin" /> Loading timeline...
            </div>
          </Card>
        ) : lectures.length === 0 ? (
          <Card className="h-40 flex flex-col items-center justify-center bg-card/20 border-dashed text-center p-6">
            <h3 className="text-lg font-medium text-foreground mb-1">No lectures scheduled</h3>
            <p className="text-muted-foreground">You have a free day today! Enjoy your off time.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardTitle className="text-xl leading-tight line-clamp-1">{lecture.subject.name}</CardTitle>
                  <CardDescription className="text-sm mt-1 flex items-center gap-2">
                    <span>Prof. {lecture.teacher.name}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                    <span>Div {lecture.division}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-4 border-t border-border/50">
                  {lecture.sessionStatus === 'Active' ? (
                    <Button 
                      onClick={() => navigate(`/student/mark-attendance/${lecture._id}`)}
                      className="w-full gap-2 shadow-lg shadow-primary/20"
                    >
                      <FiCheckSquare size={16} /> Mark Present Now
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      variant="secondary"
                      className="w-full opacity-60"
                    >
                      {lecture.sessionStatus === 'Scheduled' ? 'Waiting to Start' : 'Session Ended'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FeatureHub title="Student Features" items={studentFeatures} />
    </div>
  );
}
