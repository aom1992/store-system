import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

export class AlertService {

  constructor() { }

  public message(title: string,mss: string){
    let alert = Swal.fire({
        title: title,
        text: mss,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'ตกลง',
        customClass: {
          confirmButton: 'p-button-text p-button-plain mr-2 mb-2',
        }
      });
    return alert;
  }

  public success(title: string,mss: string){
    let alert = Swal.fire({
        title: title,
        text: mss,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000
      });
    return alert;
  }

  public confirm(title: string,mss: string){
    let alert = Swal.fire({
        title: title,
        text: mss,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        customClass: {
          confirmButton: 'p-button-text p-button-plain mr-2 mb-2',
        }
      });
    return alert;
  }

  public cancel(title: string, mss: string) {
    let alert = Swal.fire({
      title: title,
      text: mss,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่ ลบข้อมูล',
      cancelButtonText: 'ปิด',
      cancelButtonColor: "#d33",
      customClass: {
        confirmButton: 'p-button-text p-button-plain mr-2 mb-2',
      }
    });
  return alert;
  }

  public twoInput(title: string,label1: string,label2: string,type1: string,type2: string,placeholer1: string,placeholer2: string,value1: string,value2: string){
    let alert = Swal.fire({
        title: title,
        html:
          `<label>${label1}</label>`+
          `<input type="${type1}" id="inputField1" class="swal2-input" placeholder="${placeholer1}" value="${value1}">` +
          `<label>${label2}</label>` +
          `<input type="${type2}" id="inputField2" class="swal2-input" placeholder="${placeholer2}" value="${value2}">`,
        showCancelButton: true,
        confirmButtonText: 'Submit'
      });
    return alert;
  }

  public oneInput(title: string,type: string,placeholer: string){
    let alert =     Swal.fire({
        title: title,
        html:
          `<input type="${type}" id="inputField" class="swal2-input" placeholder="${placeholer}">`,
        showCancelButton: true,
        confirmButtonText: 'Submit'
      });
    return alert;
  }

  public loading(title: string){ //สามารถ Cutom CSS ได้
    let alert = Swal.fire({
        title: title,
        showConfirmButton: false,
        showCancelButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    return alert;
  }

  public approve(title: string,mss: string,){
    let alert = Swal.fire({
        title: title,
        text: mss,
        icon: 'warning',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'อนุมัติ',
        denyButtonText: 'ไม่อนุมัติ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#F59E0B',
        customClass: {
          confirmButton: 'p-button-text p-button-plain mr-2 mb-2',
        }
      });
    return alert;
  }

  public dismissLoading(){ //ปิด Loading
    return Swal.close();
  }

  public message_icon(title: string,mss: string,icon: any){ //เพิ่ม icon เข้ามา
    let alert = Swal.fire({
        title: title,
        icon: icon,
        text: mss,
        showCancelButton: false,
        confirmButtonText: 'ตกลง',
        customClass: {
          confirmButton: 'p-button-text p-button-plain mr-2 mb-2',
        }
      });
    return alert;
  }

  public approve_message(type: string,title: string,mss: string,placeholder: string){
    let alert = Swal.fire({
        title: title,
        html: `<input type="${type}" id="tagInput1" class="swal2-input" placeholder="${placeholder}" maxlength="100">`,
        inputPlaceholder: 'ระบุข้อความ(ถ้ามี)',
        text: mss,
        icon: 'warning',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'อนุมัติ',
        denyButtonText: 'ไม่อนุมัติ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#F59E0B',
        customClass: {
          confirmButton: 'p-button-text p-button-plain mr-2 mb-2',
        }
      });
    return alert;
  }
}
