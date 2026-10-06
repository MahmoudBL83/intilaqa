const fs = require('fs');
const en = JSON.parse(fs.readFileSync('./src/messages/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('./src/messages/ar.json', 'utf8'));

const keys = [
  ['attendanceRate', 'Attendance Rate', 'نسبة الحضور'],
  ['checkedIn', 'Checked In', 'تم التسجيل'],
  ['late', 'Late', 'متأخر'],
  ['absent', 'Absent', 'غائب'],
  ['onLeave', 'On Leave', 'في إجازة'],
  ['todaysAttendance', "Today's Attendance", 'حضور اليوم'],
  ['expiredDocuments', 'Expired & Expiring Documents', 'المستندات المنتهية والقريبة الانتهاء'],
  ['expiredDocsDesc', 'Commercial registration, licenses, Iqamas, and passports', 'السجلات التجارية والرخص والإقامات وجوازات السفر'],
  ['noComplianceDocs', 'No compliance documents found', 'لا توجد مستندات امتثال'],
  ['totalCount', 'Total:', 'الإجمالي:'],
  ['expiredCount', 'expired', 'منتهي'],
  ['soonCount', 'soon', 'قريباً'],
  ['userAccounts', 'User Accounts', 'حسابات المستخدمين'],
  ['userAccountsDesc', 'Manage company user roles and approvals', 'إدارة أدوار وموافقات مستخدمي الشركة'],
  ['addUser', 'Add User', 'إضافة مستخدم'],
  ['totalUsers', 'Total Users', 'إجمالي المستخدمين'],
  ['activeUsers', 'Active', 'نشط'],
  ['pendingApproval', 'Pending Approval', 'قيد الموافقة'],
  ['remainingSlots', 'Remaining Slots', 'الأماكن المتبقية'],
  ['noUserAccounts', 'No user accounts yet', 'لا توجد حسابات مستخدمين بعد'],
  ['name', 'Name', 'الاسم'],
  ['email', 'Email', 'البريد الإلكتروني'],
  ['role', 'Role', 'الدور'],
  ['created', 'Created', 'تاريخ الإنشاء'],
  ['approval', 'Approval', 'الموافقة'],
  ['pendingLabel', 'Pending', 'قيد الانتظار'],
  ['approvedLabel', 'Approved', 'موافق عليه'],
  ['approveUser', 'Approve', 'موافقة'],
  ['packageLimit', 'Package limit:', 'حد الباقة:'],
  ['upgradePackage', 'Upgrade package to add more users', 'ترقية الباقة لإضافة المزيد من المستخدمين'],
  ['users', 'users', 'مستخدم'],
  ['last', 'Last', 'آخر'],
  ['ofTotal', 'of total', 'من الإجمالي'],
  ['department', 'Department', 'القسم'],
];
keys.forEach(p => { en.dashboard[p[0]] = p[1]; ar.dashboard[p[0]] = p[2]; });

const docTypes = {
  cr: ['Commercial Registration', 'السجل التجاري'],
  municipality: ['Municipality License', 'رخصة البلدية'],
  zakat: ['Zakat Certificate', 'شهادة الزكاة'],
  chamber: ['Chamber Subscription', 'اشتراك الغرفة التجارية'],
  iqama: ['Employee Iqama', 'إقامة الموظف'],
  passport: ['Employee Passport', 'جواز سفر الموظف'],
  work_license: ['Employee Work License', 'رخصة عمل الموظف'],
};
for (const d in docTypes) {
  en.dashboard['docType_' + d] = docTypes[d][0];
  ar.dashboard['docType_' + d] = docTypes[d][1];
}

fs.writeFileSync('./src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('./src/messages/ar.json', JSON.stringify(ar, null, 2) + '\n');
console.log('Done. EN dashboard:', Object.keys(en.dashboard).length, 'AR dashboard:', Object.keys(ar.dashboard).length);
