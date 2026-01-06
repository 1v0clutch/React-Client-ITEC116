const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:8000/api';

async function run() {
  try {
    console.log('1) Fetching employees...');
    const employeesRes = await axios.get(`${API_BASE}/employees`);
    const employees = employeesRes.data || [];
    if (!employees.length) {
      console.error('No employees found. Aborting test.');
      return;
    }

    const emp = employees[0];
    console.log('Using employee:', emp.employeeId, emp.name);

    // Create attendance (time in)
    console.log('\n2) Creating attendance (time in)...');
    const now = new Date();
    const attRes = await axios.post(`${API_BASE}/attendance`, {
      empId: emp.employeeId,
      name: emp.name,
      employee: emp.name,
      timeIn: now,
      timeOut: null,
      overtime: '0 hours',
    });
    console.log('Attendance created:', attRes.data);

    // Patch attendance (time out)
    console.log('\n3) Patching attendance (time out)...');
    const created = attRes.data;
    const later = new Date(Date.now() + 1000 * 60 * 60 * 9); // +9 hours
    const patchRes = await axios.patch(`${API_BASE}/attendance/${created._id}`, {
      timeOut: later,
      overtime: '1.0 hours',
    });
    console.log('Attendance patched:', patchRes.data);

    // Create leave
    console.log('\n4) Creating leave application...');
    const leaveRes = await axios.post(`${API_BASE}/leaves`, {
      empId: emp.employeeId,
      name: emp.name,
      employee: emp.name,
      type: 'Sick Leave',
      leaveType: 'Sick Leave',
      reason: 'Test leave',
      startDate: '2026-01-10',
      endDate: '2026-01-12',
      status: 'Pending',
    });
    console.log('Leave created:', leaveRes.data);

    // Approve leave
    console.log('\n5) Approving leave...');
    const leaveCreated = leaveRes.data;
    const approveRes = await axios.patch(`${API_BASE}/leaves/${leaveCreated._id}`, {
      status: 'Approved',
    });
    console.log('Leave approved:', approveRes.data);

    // Delete leave
    console.log('\n6) Deleting leave...');
    const delRes = await axios.delete(`${API_BASE}/leaves/${leaveCreated._id}`);
    console.log('Leave delete response:', delRes.data);

    console.log('\nSmoke test completed successfully.');
  } catch (err) {
    console.error('Smoke test error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    }
    if (err.toJSON) {
      try { console.error('Axios error JSON:', JSON.stringify(err.toJSON(), null, 2)); } catch(e){}
    }
    console.error(err.stack || err);
  }
}

run();
