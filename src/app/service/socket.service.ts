import { Injectable, OnDestroy } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket: any;

  constructor() {  
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const socketUrl = environment.apiUrl.replace('http', 'ws').replace('https', 'wss');
    // console.log("Connecting to socket at: ", socketUrl);
    this.socket = io(socketUrl, {
      transports: ['websocket'],
    });
  
    this.socket.on('connect_error', (err: Error) => {
      console.error('Socket connection error:', err.message);
    });
  }  

  newSumBoss(): Observable<number> {
    return new Observable<number>((observer) => {
      this.socket.on('sumbossapr', (sumbossapr: number) => {
        observer.next(sumbossapr);
      });
    });
  }

  newSumStore(): Observable<number> {
    return new Observable<number>((observer) => {
      this.socket.on('sumstore', (sumstore: number) => {
        observer.next(sumstore);
      });
    });
  }

  newSumBossApr(): Observable<number> {
    return new Observable<number>((observer) => {
      this.socket.on('sumstoreviwe', (sumstoreviwe: number) => {
        observer.next(sumstoreviwe);
      });
    });
  }

  newSumBossAprMn(): Observable<number> {
    return new Observable<number>((observer) => {
      this.socket.on('sumstoreviwemn', (sumstoreviwemn: number) => {
        observer.next(sumstoreviwemn);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}