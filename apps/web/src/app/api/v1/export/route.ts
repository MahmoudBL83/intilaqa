import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@intilaqa/auth';
import { prisma } from '@intilaqa/db';
import { ExportService } from '@/server/services/export-service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'csv';
    const companyId = searchParams.get('companyId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!type) {
      return NextResponse.json({ error: 'Type required' }, { status: 400 });
    }

    let data: any[] = [];
    let filename = '';
    let mimeType = 'text/csv';
    let exportData: any = null;

    switch (type) {
      case 'employees': {
        const employees = await prisma.employee.findMany({
          where: companyId ? { companyId } : undefined,
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        });

        data = employees.map((emp) => ({
          'Employee ID': emp.employeeId,
          'Full Name': emp.user.name,
          Email: emp.user.email,
          Position: emp.position,
          Department: emp.department?.name,
          Salary: emp.salary,
          'Is Saudi': emp.isSaudi ? 'Yes' : 'No',
          Nationality: emp.nationality,
          'Join Date': emp.joinDate?.toLocaleDateString(),
          Active: emp.isActive ? 'Yes' : 'No',
        }));

        filename = `employees-${new Date().toISOString().split('T')[0]}`;
        break;
      }

      case 'payroll': {
        if (!companyId || !month || !year) {
          return NextResponse.json(
            { error: 'Company, month, and year required' },
            { status: 400 }
          );
        }

        const payrollRecords = await prisma.payrollRecord.findMany({
          where: {
            companyId,
            month: parseInt(month),
            year: parseInt(year),
          },
        });

        data = payrollRecords.map((p) => ({
          'Base Salary': p.baseSalary,
          Allowances: p.allowances,
          Deductions: p.deductions,
          'Net Pay': p.netPay,
          Status: p.status,
          'Month/Year': `${month}/${year}`,
        }));

        filename = `payroll-${month}-${year}`;
        break;
      }

      case 'documents': {
        if (!companyId) {
          return NextResponse.json(
            { error: 'Company ID required' },
            { status: 400 }
          );
        }

        const documents = await prisma.document.findMany({
          where: { companyId },
          include: {
            employee: {
              select: { user: { select: { name: true } } },
            },
          },
        });

        data = documents.map((doc) => ({
          'Document Name': doc.name,
          Type: doc.type,
          Status: doc.status,
          'Owner': doc.employee?.user.name || 'Company',
          'Expiry Date': doc.expiryDate?.toLocaleDateString(),
          'Uploaded': doc.createdAt.toLocaleDateString(),
        }));

        filename = `documents-${new Date().toISOString().split('T')[0]}`;
        break;
      }

      case 'attendance': {
        if (!companyId || !month || !year) {
          return NextResponse.json(
            { error: 'Company, month, and year required' },
            { status: 400 }
          );
        }

        const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
        const lastDay = new Date(parseInt(year), parseInt(month), 0);

        const records = await prisma.attendanceRecord.findMany({
          where: {
            employee: { companyId },
            date: { gte: firstDay, lte: lastDay },
          },
          include: {
            employee: { select: { employeeId: true, user: { select: { name: true } } } },
          },
        });

        data = records.map((r) => ({
          'Employee ID': r.employee.employeeId,
          'Employee Name': r.employee.user.name,
          Date: r.date.toLocaleDateString(),
          'Check In': r.checkIn?.toLocaleTimeString() || '-',
          'Check Out': r.checkOut?.toLocaleTimeString() || '-',
          Status: r.status,
        }));

        filename = `attendance-${month}-${year}`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Export to requested format
    if (format === 'xlsx') {
      const buf = await ExportService.toExcel(data, filename);
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    } else if (format === 'pdf') {
      const buf = await ExportService.toPdf(data, filename);
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      });
    } else if (format === 'csv') {
      exportData = ExportService.toCsv(data, filename);
    } else if (format === 'json') {
      exportData = ExportService.toJson(data, filename, { pretty: true });
    } else if (format === 'tsv') {
      exportData = ExportService.toTsv(data, filename);
    } else if (format === 'html') {
      exportData = ExportService.toHtml(data, filename);
    } else if (format === 'markdown') {
      exportData = ExportService.toMarkdown(data, filename);
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    // Return file for text-based formats
    return new NextResponse(exportData.content, {
      status: 200,
      headers: {
        'Content-Type': exportData.mimeType,
        'Content-Disposition': `attachment; filename="${exportData.filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}
