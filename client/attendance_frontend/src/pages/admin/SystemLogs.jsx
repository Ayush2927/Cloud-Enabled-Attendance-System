import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { FiHome, FiBook, FiClock, FiUsers, FiSettings, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import FeatureHub from '@/components/ui/FeatureHub';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const adminFeatures = [
    { id: 'admin-home', title: 'Admin Dashboard', description: 'Return to the system control center.', icon: <FiHome size={18} />, onClick: () => navigate('/admin') },
    { id: 'admin-subjects', title: 'Manage Subjects', description: 'Create subjects and review teacher assignments.', icon: <FiBook size={18} />, onClick: () => navigate('/admin/subjects') },
    { id: 'admin-lectures', title: 'Manage Lectures', description: 'Build the timetable and assign instructors.', icon: <FiClock size={18} />, onClick: () => navigate('/admin/lectures') },
    { id: 'admin-logs', title: 'System Logs', description: 'Inspect attendance and biometric activity.', icon: <FiUsers size={18} />, onClick: () => navigate('/admin/logs') },
    { id: 'admin-settings', title: 'Settings', description: 'Adjust security and account preferences.', icon: <FiSettings size={18} />, onClick: () => navigate('/settings') }
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/attendance/admin/all-logs');
        setLogs(res.data.data);
      } catch (err) {
        toast.error('Failed to load system logs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen pt-24 px-4 flex justify-center items-center">Loading audit logs...</div>;
  }

  return (
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Master Attendance Logs</h1>
        <p className="text-muted-foreground">Security audit trail of all biometric verifications and automated absence triggers.</p>
      </div>

      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b border-border/50">
          <CardTitle>System Activity</CardTitle>
          <CardDescription>Recent attendance events across all subjects and lectures.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead className="font-semibold w-[180px]">Timestamp (IST)</TableHead>
                  <TableHead className="font-semibold">Student</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Biometric Proof</TableHead>
                  <TableHead className="font-semibold text-right">Check-Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No system logs recorded yet.</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-secondary/10 transition-colors">
                      <TableCell className="font-medium text-xs whitespace-nowrap">{log.dateIST}</TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{log.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-foreground">{log.subject?.name}</div>
                        <div className="text-xs text-muted-foreground">Div {log.lecture?.division}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'Present' ? 'default' : 'destructive'} 
                          className={log.status === 'Present' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.status === 'Present' ? (
                          log.hasFaceProof ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                              <FiCheckCircle size={14} /> Captured
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                              <FiXCircle size={14} /> Missing
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">{log.checkOutIST}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FeatureHub title="Admin Features" items={adminFeatures} />
    </div>
  );
}
