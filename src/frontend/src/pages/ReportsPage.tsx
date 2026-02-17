import { useState } from 'react';
import { useGetAllProjects, useGetDailyLogsByProject } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download } from 'lucide-react';
import DprViewer from '../components/reports/DprViewer';
import { generatePDF } from '../lib/pdf';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { data: projects } = useGetAllProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<bigint | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: logs } = useGetDailyLogsByProject(selectedProjectId);

  const filteredLogs = logs?.filter((log) => {
    const logDate = new Date(Number(log.date) / 1000000).toISOString().split('T')[0];
    return logDate === selectedDate;
  });

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  const handleDownloadPDF = () => {
    if (!selectedProject || !filteredLogs) {
      toast.error('No data to generate PDF');
      return;
    }

    try {
      generatePDF(selectedProject, filteredLogs, selectedDate);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Daily Progress Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate and download comprehensive DPRs
          </p>
        </div>
        {filteredLogs && filteredLogs.length > 0 && (
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Select project and date for the report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={selectedProjectId?.toString() || ''}
                onValueChange={(value) => setSelectedProjectId(BigInt(value))}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id.toString()} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProjectId && selectedProject && filteredLogs ? (
        filteredLogs.length > 0 ? (
          <DprViewer project={selectedProject} logs={filteredLogs} date={selectedDate} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-center">
                No logs found for the selected date. Try a different date or add logs first.
              </p>
            </CardContent>
          </Card>
        )
      ) : null}
    </div>
  );
}
