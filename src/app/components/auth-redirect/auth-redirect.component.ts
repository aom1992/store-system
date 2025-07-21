import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrl: './auth-redirect.component.scss'
})
export class AuthRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const requestId = params['request_id'];

      if (token) {
        localStorage.setItem('token', token);
        this.router.navigate(['/user-request'], { queryParams: { request_id: requestId } });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
