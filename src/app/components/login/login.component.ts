import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/service/rest.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  public username: string = '';
  public password: string = '';
  errorMessage: string = '';
  loginFailed: boolean = false;

  constructor(
    private router: Router,
    private rest: RestService,
    private auth: AuthService,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const type = this.route.snapshot.queryParamMap.get('type');
  
    if (token) {
      this.auth.saveLogin(token).then(() => {  
        if (type === 'store') {
          this.router.navigate(['/user-request-history']);
        } else if (type === 'boss') {
          this.router.navigate(['/boss-approve']);
        } else {
          this.router.navigate(['/user-request']);
        }
      });
    }
  }  
  
  public login() {
    this.rest.login(this.username, this.password).subscribe({
      next: async (feedback) => {
        if (feedback.status) {
          await this.auth.saveLogin(feedback.token);

          const userData = this.auth.getDataLogin();

          if (userData.pp_id === 'PP002') {
            this.router.navigate(['boss-approve']);
          } else {
            this.router.navigate(['user-request']);
          }

        } else {
          console.log('Login failed');
          this.loginFailed = true;
          this.errorMessage = feedback.message;
        }
      },
      error: (error) => {
        console.log('Login error:', error);
        this.loginFailed = true;
        this.errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล';
      },
      complete: () => {
        console.log('Login request complete');
      }
    });
  }
}