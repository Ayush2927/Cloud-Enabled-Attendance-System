import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { FiHome, FiBook, FiClock, FiUsers, FiSettings, FiUserPlus, FiUserX, FiBookOpen } from 'react-icons/fi';
import FeatureHub from '@/components/ui/FeatureHub';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ManageSubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', semester: 1 });
  const [selectedTeachers, setSelectedTeachers] = useState({});

  const adminFeatures = [
    { id: 'admin-home', title: 'Admin Dashboard', description: 'Return to the system control center.', icon: <FiHome size={18} />, onClick: () => navigate('/admin') },
    { id: 'admin-subjects', title: 'Manage Subjects', description: 'Create subjects and review teacher assignments.', icon: <FiBook size={18} />, onClick: () => navigate('/admin/subjects') },
    { id: 'admin-lectures', title: 'Manage Lectures', description: 'Build the timetable and assign instructors.', icon: <FiClock size={18} />, onClick: () => navigate('/admin/lectures') },
    { id: 'admin-logs', title: 'System Logs', description: 'Inspect attendance and biometric activity.', icon: <FiUsers size={18} />, onClick: () => navigate('/admin/logs') },
    { id: 'admin-settings', title: 'Settings', description: 'Adjust security and account preferences.', icon: <FiSettings size={18} />, onClick: () => navigate('/settings') }
  ];

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects/all');
      setSubjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/auth/teachers');
      setTeachers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load teachers');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSubjects(), fetchTeachers()]);
    };

    loadData();
  }, []);

  const handleAssignTeacher = async (subjectId) => {
    const teacherId = selectedTeachers[subjectId];
    if (!teacherId) {
      toast.error('Select a teacher first');
      return;
    }

    try {
      setIsSavingAssignment(true);
      await api.patch(`/subjects/${subjectId}/assign-teacher`, { teacherId });
      toast.success('Teacher assigned successfully');
      setSelectedTeachers(prev => ({ ...prev, [subjectId]: '' }));
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const handleRemoveTeacher = async (subjectId, teacherId) => {
    try {
      setIsSavingAssignment(true);
      await api.patch(`/subjects/${subjectId}/remove-teacher`, { teacherId });
      toast.success('Teacher removed successfully');
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove teacher');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects/create', newSubject);
      toast.success('Subject created successfully!');
      setNewSubject({ name: '', code: '', semester: 1 });
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Subjects</h1>
        <p className="text-muted-foreground">Create organizational course curricula and assign registered teachers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Create Form */}
        <Card className="border-primary/20 shadow-lg sticky top-24">
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <FiBookOpen className="text-primary" /> Create New Subject
            </CardTitle>
            <CardDescription>Add a new subject to the curriculum dictionary.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input 
                  id="subjectCode"
                  placeholder="e.g. CS101" 
                  value={newSubject.code} 
                  onChange={e => setNewSubject({...newSubject, code: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input 
                  id="subjectName"
                  placeholder="e.g. Cloud Computing" 
                  value={newSubject.name} 
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input 
                  id="semester"
                  type="number" 
                  min="1" 
                  max="8" 
                  value={newSubject.semester} 
                  onChange={e => setNewSubject({...newSubject, semester: e.target.value})} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" size="lg">Create Subject</Button>
            </form>
          </CardContent>
        </Card>

        {/* Course List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
             Active Subjects
          </h2>
          
          {isLoading ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <FiClock className="animate-spin" size={24} />
                Loading subjects library...
              </CardContent>
            </Card>
          ) : subjects.length === 0 ? (
            <Card className="border-border/50 border-dashed bg-secondary/5">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <FiBook size={32} className="opacity-20" />
                No subjects exist yet in the system.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subjects.map(sub => (
                <Card key={sub._id} className="border-primary/10 overflow-hidden hover:border-primary/30 transition-colors duration-300">
                  <div className="bg-secondary/10 p-4 border-b border-border/50 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{sub.name}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-mono">{sub.code}</Badge>
                        <span>•</span>
                        <span>Semester {sub.semester}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {sub.teachers?.length || 0} Teachers
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <Select 
                        value={selectedTeachers[sub._id] || ''} 
                        onValueChange={(val) => setSelectedTeachers(prev => ({ ...prev, [sub._id]: val }))}
                        disabled={isSavingAssignment || teachers.length === 0}
                      >
                        <SelectTrigger className="w-full sm:flex-1">
                          <SelectValue placeholder="Select teacher to assign..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher._id} value={teacher._id}>
                              {teacher.name} <span className="text-muted-foreground text-xs block truncate w-full max-w-[200px]">{teacher.email}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="default"
                        className="w-full sm:w-auto"
                        onClick={() => handleAssignTeacher(sub._id)}
                        disabled={isSavingAssignment || !selectedTeachers[sub._id]}
                      >
                        <FiUserPlus className="mr-2" /> Assign
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Assigned Faculty</h4>
                      {sub.teachers?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sub.teachers.map((teacher) => (
                            <div key={teacher._id} className="flex justify-between items-center p-2 rounded-md bg-secondary/20 border border-border/40 group">
                              <div className="overflow-hidden pr-2">
                                <div className="text-sm font-medium text-foreground truncate">{teacher.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{teacher.email}</div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-50 group-hover:opacity-100 transition-all shrink-0"
                                onClick={() => handleRemoveTeacher(sub._id, teacher._id)}
                                disabled={isSavingAssignment}
                                title={`Remove ${teacher.name}`}
                              >
                                <FiUserX size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No teachers assigned to {sub.code} yet.</p>
                      )}
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
