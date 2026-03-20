import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, NavbarComponent],
  template: `
    <div class="layout-container">
      <aside class="sidebar glass-panel">
        <div class="menu">
          <a routerLink="/dashboard" routerLinkActive="active" class="menu-item">
            <span>📊</span> Dashboard
          </a>
          <a routerLink="/courses" routerLinkActive="active" class="menu-item">
            <span>📚</span> Courses
          </a>
          <a routerLink="/jobs" routerLinkActive="active" class="menu-item">
            <span>💼</span> Jobs
          </a>
        </div>
      </aside>
      <main class="main-content">
        <app-navbar></app-navbar>
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout-container { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 250px; margin: 10px; display: flex; flex-direction: column; padding: 20px; height: calc(100vh - 20px); }
    .menu { display: flex; flex-direction: column; gap: 10px; margin-top: 50px; }
    .menu-item {
      display: flex; align-items: center; gap: 10px;
      padding: 15px; text-decoration: none; color: var(--text-color);
      border-radius: 12px; transition: all 0.3s ease;
    }
    .menu-item:hover { background: rgba(255,255,255,0.3); transform: translateX(5px); }
    .menu-item.active { background: var(--primary-color); color: white; box-shadow: 0 4px 15px rgba(0,123,255,0.4); }
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .content-wrapper { flex: 1; overflow-y: auto; padding: 0 20px 20px 20px; }
    
    @media (max-width: 768px) {
      .sidebar { display: none; } /* Mobile menu logic would go here */
    }
  `]
})
export class SidebarComponent {}