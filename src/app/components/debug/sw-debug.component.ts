import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sw-debug',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card class="debug-card">
      <mat-card-header>
        <mat-card-title>Service Worker Debug</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p><strong>Service Worker Support:</strong> {{ swSupport ? 'Supported ✅' : 'Not Supported ❌' }}</p>
        <p><strong>Service Worker Status:</strong> {{ swStatus }}</p>
        <p><strong>Cache Storage Support:</strong> {{ cacheSupport ? 'Supported ✅' : 'Not Supported ❌' }}</p>
        <div *ngIf="registrations.length > 0">
          <h3>Registered Service Workers:</h3>
          <div *ngFor="let reg of registrations; let i = index">
            <p><strong>SW {{ i+1 }}:</strong> {{ reg.scope }}</p>
            <p><strong>Status:</strong> {{ getStatus(reg) }}</p>
          </div>
        </div>
        <div *ngIf="registrations.length === 0">
          <p>No Service Workers registered</p>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="registerSW()">Register SW</button>
        <button mat-raised-button color="warn" (click)="unregisterSW()">Unregister All</button>
        <button mat-raised-button (click)="checkSW()">Check Status</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .debug-card {
      margin: 20px;
      max-width: 800px;
    }
    mat-card-actions {
      display: flex;
      gap: 10px;
    }
  `]
})
export class SwDebugComponent implements OnInit {
  swSupport = 'serviceWorker' in navigator;
  cacheSupport = 'caches' in window;
  swStatus = 'Checking...';
  registrations: readonly ServiceWorkerRegistration[] = [];

  ngOnInit() {
    this.checkSW();
  }

  checkSW() {
    if (!this.swSupport) {
      this.swStatus = 'Not Supported';
      return;
    }

    this.swStatus = 'Checking...';
    navigator.serviceWorker.getRegistrations().then(regs => {
      this.registrations = regs;
      if (regs.length === 0) {
        this.swStatus = 'No Service Workers Registered';
      } else if (regs.some(r => r.active)) {
        this.swStatus = 'Active ✅';
      } else if (regs.some(r => r.installing)) {
        this.swStatus = 'Installing...';
      } else if (regs.some(r => r.waiting)) {
        this.swStatus = 'Waiting for Activation';
      } else {
        this.swStatus = 'Registered but Inactive';
      }
    }).catch(err => {
      console.error('Error checking SW:', err);
      this.swStatus = 'Error: ' + err.message;
    });
  }

  registerSW() {
    if (!this.swSupport) return;
    
    navigator.serviceWorker.register('/ngsw-worker.js')
      .then(reg => {
        console.log('SW registered:', reg);
        this.checkSW();
      })
      .catch(err => {
        console.error('SW registration failed:', err);
        this.swStatus = 'Registration Error: ' + err.message;
      });
  }

  unregisterSW() {
    if (!this.swSupport) return;
    
    navigator.serviceWorker.getRegistrations().then(regs => {
      const promises = regs.map(reg => reg.unregister());
      return Promise.all(promises);
    }).then(() => {
      console.log('All SWs unregistered');
      this.checkSW();
    }).catch(err => {
      console.error('Error unregistering SWs:', err);
    });

    // Also clear caches
    if (this.cacheSupport) {
      caches.keys().then(keys => {
        const promises = keys.map(key => caches.delete(key));
        return Promise.all(promises);
      }).then(() => console.log('All caches cleared'));
    }
  }

  getStatus(reg: ServiceWorkerRegistration): string {
    if (reg.active) return 'Active';
    if (reg.installing) return 'Installing';
    if (reg.waiting) return 'Waiting';
    return 'Unknown';
  }
}
