const fs = require('fs');
const en = JSON.parse(fs.readFileSync('./src/messages/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('./src/messages/ar.json', 'utf8'));

// Add common keys
const commonKeys = { prev: ['Prev', 'السابق'], previous: ['Previous', 'السابق'], next: ['Next', 'التالي'], advancedFilters: ['Advanced Filters', 'الفلاتر المتقدمة'], allDepartments: ['All Departments', 'جميع الأقسام'], allTypes: ['All Types', 'جميع الأنواع'], allStatus: ['All Status', 'جميع الحالات'] };
for (const k in commonKeys) { en.common[k] = commonKeys[k][0]; ar.common[k] = commonKeys[k][1]; }

// Add overtime keys
const overtimeKeys = { title: ['Overtime', 'الإضافي'], addOvertime: ['Add Overtime', 'إضافة إضافي'], hours: ['Hours', 'ساعات'], searchPlaceholder: ['Search by employee name...', 'البحث باسم الموظف...'], emptyDescription: ['No overtime records found', 'لا توجد سجلات إضافي'] };
for (const k in overtimeKeys) { en.overtime[k] = overtimeKeys[k][0]; ar.overtime[k] = overtimeKeys[k][1]; }

// Add employees filter keys
const empKeys = { joinDateFrom: ['Join Date From', 'تاريخ الالتحاق من'], joinDateTo: ['Join Date To', 'تاريخ الالتحاق إلى'], minSalary: ['Min Salary', 'الحد الأدنى للراتب'], maxSalary: ['Max Salary', 'الحد الأقصى للراتب'], docExpiryMonth: ['Doc Expiry Month', 'شهر انتهاء المستند'] };
for (const k in empKeys) { en.common[k] = empKeys[k][0]; ar.common[k] = empKeys[k][1]; }

// Add settings page keys
const settingsKeys = { companyProfile: ['Company Profile', 'الملف الشخصي للشركة'], notificationChannels: ['Notification Channels', 'قنوات الإشعارات'] };
for (const k in settingsKeys) { en.settings[k] = settingsKeys[k][0]; ar.settings[k] = settingsKeys[k][1]; }

// Add payslips keys  
en.payslips.totalNet = 'Total Net'; ar.payslips.totalNet = 'صافي الإجمالي';
en.payslips.average = 'Average'; ar.payslips.average = 'المتوسط';
en.payslips.pdf = 'PDF'; ar.payslips.pdf = 'PDF';

// Add requests page title
en.requests.pageTitle = 'Requests'; ar.requests.pageTitle = 'الطلبات';
en.requests.start = 'Start'; ar.requests.start = 'البداية';

// Add noTasksAssigned
en.tasks.noTasksAssigned = 'No tasks assigned'; ar.tasks.noTasksAssigned = 'لا توجد مهام مسندة';

// Add to payrollExport
en.payrollExport.prev = 'Prev'; ar.payrollExport.prev = 'السابق';
en.payrollExport.next = 'Next'; ar.payrollExport.next = 'التالي';

// Add to attendance
en.attendance.employee = 'Employee'; ar.attendance.employee = 'الموظف';
en.attendance.department = 'Department'; ar.attendance.department = 'القسم';
en.attendance.present = 'Present'; ar.attendance.present = 'حاضر';
en.attendance.late = 'Late'; ar.attendance.late = 'متأخر';
en.attendance.absent = 'Absent'; ar.attendance.absent = 'غائب';
en.attendance.checkIn = 'Check In'; ar.attendance.checkIn = 'تسجيل دخول';
en.attendance.checkOut = 'Check Out'; ar.attendance.checkOut = 'تسجيل خروج';
en.attendance.status = 'Status'; ar.attendance.status = 'الحالة';
en.attendance.noRecords = 'No records'; ar.attendance.noRecords = 'لا توجد سجلات';
en.attendance.allDepartments = 'All Departments'; ar.attendance.allDepartments = 'جميع الأقسام';

// Add dashboard missing keys
const dashNew = {
  start: ['Start', 'البداية'], status: ['Status', 'الحالة'],
  filter: ['Filter', 'تصفية'], noRequestsFound: ['No requests found', 'لا توجد طلبات'],
  noPayslips: ['No payslips', 'لا توجد كشوف رواتب'],
  noTasks: ['No tasks', 'لا توجد مهام'],
  saudi: ['Saudi', 'سعودي'], expat: ['Expat', 'وافد'],
  prev: ['Prev', 'السابق'], next: ['Next', 'التالي'],
};
for (const k in dashNew) { en.dashboard[k] = dashNew[k][0]; ar.dashboard[k] = dashNew[k][1]; }

fs.writeFileSync('./src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('./src/messages/ar.json', JSON.stringify(ar, null, 2) + '\n');
console.log('Done! Added all missing keys.');
console.log('EN overtime:', Object.keys(en.overtime).length, 'AR overtime:', Object.keys(ar.overtime).length);
console.log('EN common:', Object.keys(en.common).length, 'AR common:', Object.keys(ar.common).length);
