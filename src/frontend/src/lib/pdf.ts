import type { Project, DailyLogEntry } from '../backend';

export function generatePDF(project: Project, logs: DailyLogEntry[], date: string) {
  // Create a printable version using browser's print functionality
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  const totalLaborers = logs.reduce((sum, log) => sum + Number(log.laborers), 0);
  const totalSupervisors = logs.reduce((sum, log) => sum + Number(log.supervisors), 0);
  const totalInterruptions = logs.reduce((sum, log) => sum + log.interruptions.length, 0);
  const totalQuantity = logs.reduce((sum, log) => sum + log.actualQuantity, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daily Progress Report - ${project.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        h1 { color: #2563eb; margin-bottom: 10px; }
        h2 { color: #475569; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        h3 { color: #64748b; margin-top: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .summary-card { padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
        .summary-card .label { font-size: 12px; color: #64748b; margin-bottom: 5px; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .activity { margin: 20px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .activity-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .activity-title { font-size: 18px; font-weight: bold; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; background: #e0e7ff; color: #3730a3; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 15px 0; }
        .grid-item { font-size: 14px; }
        .grid-item .label { color: #64748b; margin-bottom: 3px; }
        .grid-item .value { font-weight: 600; }
        .interruption { margin: 10px 0; padding: 10px; background: #fef3c7; border-left: 3px solid #f59e0b; }
        .project-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .info-item { padding: 10px; background: #f8fafc; border-radius: 4px; }
        .info-item .label { font-size: 12px; color: #64748b; }
        .info-item .value { font-weight: 600; margin-top: 3px; }
        @media print {
          body { margin: 20px; }
          .activity { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Daily Progress Report</h1>
          <p style="color: #64748b; margin: 0;">${project.name}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 18px; font-weight: bold; margin: 0;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="label">Activities</div>
          <div class="value">${logs.length}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Quantity</div>
          <div class="value">${totalQuantity.toFixed(1)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Labor</div>
          <div class="value">${totalLaborers}</div>
        </div>
        <div class="summary-card">
          <div class="label">Interruptions</div>
          <div class="value">${totalInterruptions}</div>
        </div>
      </div>

      <h2>Activities Completed</h2>
      ${logs.map(log => `
        <div class="activity">
          <div class="activity-header">
            <div class="activity-title">${log.activityName}</div>
            <div class="badge">${((log.actualQuantity / log.plannedQuantity) * 100).toFixed(0)}% Complete</div>
          </div>
          <div class="grid">
            <div class="grid-item">
              <div class="label">Planned</div>
              <div class="value">${log.plannedQuantity} ${log.unit}</div>
            </div>
            <div class="grid-item">
              <div class="label">Achieved</div>
              <div class="value">${log.actualQuantity} ${log.unit}</div>
            </div>
            <div class="grid-item">
              <div class="label">Working Hours</div>
              <div class="value">${log.netWorkingHours.toFixed(1)} hrs</div>
            </div>
            <div class="grid-item">
              <div class="label">Time</div>
              <div class="value">${log.startTime} - ${log.endTime}</div>
            </div>
          </div>
          <div style="margin: 10px 0; font-size: 14px;">
            <strong>Labor:</strong> ${log.laborers.toString()} Laborers, ${log.supervisors.toString()} Supervisors
          </div>
          ${log.interruptions.length > 0 ? `
            <div style="margin-top: 15px;">
              <strong style="font-size: 14px;">Interruptions (${log.interruptions.length}):</strong>
              ${log.interruptions.map(int => `
                <div class="interruption">
                  ${int.reason}: ${int.startTime} - ${int.endTime} (${int.duration.toFixed(1)} hrs)
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${log.remarks ? `
            <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 4px;">
              <strong style="font-size: 14px;">Remarks:</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px;">${log.remarks}</p>
            </div>
          ` : ''}
        </div>
      `).join('')}

      <h2>Project Information</h2>
      <div class="project-info">
        <div class="info-item">
          <div class="label">Location</div>
          <div class="value">${project.location}</div>
        </div>
        <div class="info-item">
          <div class="label">Project Type</div>
          <div class="value" style="text-transform: capitalize;">${project.projectType}</div>
        </div>
        <div class="info-item">
          <div class="label">Total Laborers Deployed</div>
          <div class="value">${totalLaborers}</div>
        </div>
        <div class="info-item">
          <div class="label">Total Supervisors</div>
          <div class="value">${totalSupervisors}</div>
        </div>
      </div>

      <h2>Productivity Status</h2>
      ${logs.map(log => {
        const productivity = (log.actualQuantity / log.plannedQuantity) * 100;
        const status = productivity >= 90 ? 'On Track' : productivity >= 75 ? 'Slightly Delayed' : 'Critical';
        const color = productivity >= 90 ? '#16a34a' : productivity >= 75 ? '#d97706' : '#dc2626';
        return `
          <div style="display: flex; justify-content: space-between; padding: 10px; margin: 5px 0; background: #f8fafc; border-radius: 4px;">
            <span style="font-weight: 600;">${log.activityName}</span>
            <span style="font-weight: 600; color: ${color};">${status} (${productivity.toFixed(0)}%)</span>
          </div>
        `;
      }).join('')}

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
