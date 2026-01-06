require("dotenv").config();
const mongoose = require("mongoose");
const Employee = require("./models/employee.model");
const Attendance = require("./models/attendance.model");
const Leave = require("./models/leave.model");

async function createSampleData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create sample employees if they don't exist
    const existingEmployees = await Employee.find();
    if (existingEmployees.length === 0) {
      const employees = [
        {
          employeeId: "EMP001",
          name: "John Doe",
          department: "IT",
          position: "Developer",
          hireDate: "2023-01-15"
        },
        {
          employeeId: "EMP002",
          name: "Jane Smith",
          department: "HR",
          position: "HR Manager",
          hireDate: "2022-06-10"
        },
        {
          employeeId: "EMP003",
          name: "Mike Johnson",
          department: "Finance",
          position: "Accountant",
          hireDate: "2023-03-20"
        }
      ];

      await Employee.insertMany(employees);
      console.log("✅ Created sample employees");
    } else {
      console.log("✅ Employees already exist");
    }

    // Create sample attendance records
    const existingAttendance = await Attendance.find();
    if (existingAttendance.length === 0) {
      const attendanceRecords = [
        {
          employee: "John Doe",
          date: "2024-01-05",
          timeIn: "08:00",
          timeOut: "17:00"
        },
        {
          employee: "Jane Smith",
          date: "2024-01-05",
          timeIn: "09:00",
          timeOut: "18:00"
        },
        {
          employee: "Mike Johnson",
          date: "2024-01-05",
          timeIn: "08:30",
          timeOut: null
        }
      ];

      await Attendance.insertMany(attendanceRecords);
      console.log("✅ Created sample attendance records");
    } else {
      console.log("✅ Attendance records already exist");
    }

    // Create sample leave records
    const existingLeaves = await Leave.find();
    if (existingLeaves.length === 0) {
      const leaveRecords = [
        {
          employee: "John Doe",
          leaveType: "Sick Leave",
          reason: "Medical appointment",
          startDate: "2024-01-10",
          endDate: "2024-01-10"
        },
        {
          employee: "Jane Smith",
          leaveType: "Vacation Leave",
          reason: "Family vacation",
          startDate: "2024-01-15",
          endDate: "2024-01-20"
        }
      ];

      await Leave.insertMany(leaveRecords);
      console.log("✅ Created sample leave records");
    } else {
      console.log("✅ Leave records already exist");
    }

    console.log("\n🎉 Sample data creation completed!");
    
    // Display current data counts
    const empCount = await Employee.countDocuments();
    const attCount = await Attendance.countDocuments();
    const leaveCount = await Leave.countDocuments();
    
    console.log(`\n📊 Current data:
    - Employees: ${empCount}
    - Attendance records: ${attCount}
    - Leave records: ${leaveCount}`);

    process.exit(0);

  } catch (error) {
    console.error("❌ Error creating sample data:", error);
    process.exit(1);
  }
}

createSampleData();