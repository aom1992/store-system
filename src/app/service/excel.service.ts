import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  generateExcel(data: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('รายการแจ้งซ่อม');

    // เพิ่มหัวข้อของตาราง
    const header = ['เลขที่แจ้ง', 'ชื่อผู้แจ้ง', 'แผนก', 'หัวข้องานซ่อม', 'สถานที่', 'ปัญหา', 'วิธีแก้ไข', 'สถานะดำเนินงาน', 'สถานะงานซ่อม', 'คะแนนประเมิน', 'ความคิดเห็น', 'วันที่แจ้งซ่อม', 'วันที่ปิดงาน'];
    worksheet.addRow(header);

    // กำหนดสไตล์สำหรับหัวข้อ
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, index) => {
      cell.font = { bold: true};
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C4E4FF' } }; // กำหนดสีพื้นหลังของเซลล์
      headerRow.height = 30;
    });

    worksheet.columns.forEach((column, index) => {
      if (index === 1) {
        column.width = 20;
      } else if (index === 2 || index === 3 || index === 4 || index === 5 || index === 6) {
        column.width = 25;
      } else {
        column.width = 15;
      }
    });

    // เพิ่มข้อมูลลงในตาราง
    data.forEach(item => {
      worksheet.addRow([
        item.job_id, item.full_name, item.division, item.topic_name, item.position_repair, item.problem, item.solve, item.status_name, item.sr_name, item.score, item.comment_score, item.date_input, item.dateEnd
      ]);
    });

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // บันทึกไฟล์ Excel
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'รายงานการแจ้งซ่อมทั้งหมด.xlsx');
    });
  }
}