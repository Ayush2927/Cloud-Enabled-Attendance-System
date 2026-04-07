import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiHome, FiBook, FiClock, FiUsers, FiSettings, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import FeatureHub from '@/components/ui/FeatureHub';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ManageLectures() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '', // Requires a valid Teacher MongoDB ObjectId
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    division: 'SEM-1'
  });

  const adminFeatures = [
    { id: 'admin-home', title: 'Admin Dashboard', description: 'Return to the system control center.', icon: <FiHome size={18} />, onClick: () => navigate('/admin') },
    { id: 'admin-subjects', title: 'Manage Subjects', description: 'Create subjects and review teacher assignments.', icon: <FiBook size={18} />, onClick: () => navigate('/admin/subjects') },
    { id: 'admin-lectures', title: 'Manage Lectures', description: 'Build the timetable and assign instructors.', icon: <FiClock size={18} />, onClick: () => navigate('/admin/lectures') },
    { id: 'admin-logs', title: 'System Logs', description: 'Inspect attendance and biometric activity.', icon: <FiUsers size={18} />, onClick: () => navigate('/admin/logs') },
    { id: 'admin-settings', title: 'Settings', description: 'Adjust security and account preferences.', icon: <FiSettings size={18} />, onClick: () => navigate('/settings') }
  ];

  const fetchData = async () => {
    try {
      const [lecRes, subRes, teachRes] = await Promise.all([
        api.get('/lectures/all'),
        api.get('/subjects/all'),
        api.get('/auth/teachers')
      ]);
      setLectures(lecRes.data.data);
      setSubjects(subRes.data.data);
      setTeachers(teachRes.data.data);
      
      if (subRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, subject: subRes.data.data[0]._id }));
      }
      if (teachRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, teacher: teachRes.data.data[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load data from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.teacher) {
        toast.error('Please select a teacher from the dropdown. If none, register a teacher first.');
        return;
      }
      await api.post('/lectures/create', formData);
      toast.success('Lecture explicitly scheduled!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Warning: Failed to create lecture');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this lecture from the timetable?')) return;
    try {
      await api.delete(`/lectures/${id}`);
      toast.success('Lecture successfully wiped from schedule');
      setLectures(lectures.filter(l => l._id !== id));
    } catch (error) {
      toast.error('Failed to delete lecture');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Timetable Configuration</h1>
        <p className="text-muted-foreground">Master schedule planning interface. Assign instructors dynamically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Creator Panel */}
        <Card className="border-primary/20 shadow-lg sticky top-24">
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <FiCalendar className="text-primary" /> Schedule New Session
            </CardTitle>
            <CardDescription>Configure a new lecture slot for the master timetable.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-6">
              
              <div className="space-y-2 focus-within:text-primary transition-colors">
                <Label htmlFor="subjectSelect">Attached Subject</Label>
                <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})} required>
                  <SelectTrigger id="subjectSelect">
                    <SelectValue placeholder="-- Choose Subject --" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.code})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 focus-within:text-primary transition-colors">
                <Label htmlFor="teacherSelect">Instructor (Teacher)</Label>
                <Select value={formData.teacher} onValueChange={(val) => setFormData({...formData, teacher: val})} required>
                  <SelectTrigger id="teacherSelect">
                    <SelectValue placeholder="-- Choose Instructor --" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name} ({t.email})</SelectItem>)}
                  </SelectContent>
                </Select>
{teachers.length === 0 && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
                    <FiAlertCircle size={16} /> <span>No teachers found. You must register a Teacher account before scheduling.</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 focus-within:text-primary transition-colors">
                <Label htmlFor="divisionSelect">Target Division</Label>
                <Select value={formData.division} onValueChange={(val) => setFormData({...formData, division: val})}>
                  <SelectTrigger id="divisionSelect">
                    <SelectValue placeholder="-- Select Semester --" />
                  </SelectTrigger>
                  <SelectContent>
                    {['SEM-1', 'SEM-2', 'SEM-3', 'SEM-4', 'SEM-5', 'SEM-6', 'SEM-7', 'SEM-8'].map(sem => (
                      <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 focus-within:text-primary transition-colors">
                <Label htmlFor="sessionDate">Session Date</Label>
                <Input 
                  id="sessionDate"
                  type="date" 
                  min={new Date().toISOString().split('T')[0]} 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  required 
                />
              </div>            

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 focus-within:text-primary transition-colors">
                  <Label htmlFor="startTime">Starts At</Label>
                  <Input 
                    id="startTime"
                    type="time" 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    required 
                  />
                </div>

                <div className="space-y-2 focus-within:text-primary transition-colors">
                  <Label htmlFor="endTime">Ends At</Label>
                  <Input 
                    id="endTime"
                    type="time" 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-4" size="lg">Publish to Timetable</Button>
            </form>
          </CardContent>
        </Card>

        {/* Global Timetable */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
             Master System Timetable
          </h2>
          
          {isLoading ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <FiClock className="animate-spin" size={24} />
                Pulling system timetable...
              </CardContent>
            </Card>
          ) : lectures.length === 0 ? (
            <Card className="border-border/50 border-dashed bg-secondary/5">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <FiCalendar className="opacity-20" size={32} />
                No scheduled infrastructure found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lectures.map(lec => (
                <Card 
                  key={lec._id} 
                  className={`overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${lec.sessionStatus === 'Ended' ? 'border-l-muted hover:border-muted/80 bg-secondary/5' : 'border-l-primary hover:border-primary/80 bg-secondary/10'}`}
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 opacity-90 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">{lec.subject?.name}</h3>
                        <Badge variant="outline" className="text-xs shrink-0">Div {lec.division}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <FiClock size={14} />
                        {lec.date.substring(0, 10)} | {lec.startTime} - {lec.endTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                      <Badge 
                        variant={lec.sessionStatus === 'Active' ? 'default' : 'secondary'} 
                        className={`w-full sm:w-auto text-center justify-center shrink-0 ${lec.sessionStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'}`}
                      >
                        {lec.sessionStatus}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 outline-none focus:ring-1 focus:ring-destructive/50"
                        onClick={() => handleDelete(lec._id)}
                        title="Delete Lecture"
                      >
                        <FiTrash2 size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>

      <FeatureHub title="Admin Features" items={adminFeatures} />
    </div>
  );
}
