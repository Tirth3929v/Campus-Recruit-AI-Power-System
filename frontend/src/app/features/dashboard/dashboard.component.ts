import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
  template: `
    <div class="dashboard-container" @listAnimation>
      <div class="glass-panel welcome-card">
        <h1>Hello, Developer! 🚀</h1>
        <p>Track your progress and land your dream job.</p>
      </div>

      <div class="stats-grid">
        <div class="glass-panel stat-card">
          <h3>Courses</h3>
          <div class="number">12</div>
          <app-progress-bar [progress]="75"></app-progress-bar>
        </div>
        <div class="glass-panel stat-card">
          <h3>Applications</h3>
          <div class="number">5</div>
          <small>2 Interviews scheduled</small>
        </div>
        <div class="glass-panel stat-card">
          <h3>Skills</h3>
          <div class="tags">
            <span>Angular</span><span>Node.js</span><span>MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; flex-direction: column; gap: 20px; }
    .welcome-card { padding: 30px; background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(200,230,255,0.5)); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .stat-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .number { font-size: 3rem; font-weight: bold; color: var(--primary-color); }
    .tags span { background: rgba(0,123,255,0.1); padding: 5px 10px; border-radius: 15px; margin-right: 5px; font-size: 0.8rem; }
  `],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('.glass-panel', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])
        ])
      ])
    ])
  ]
})
export class DashboardComponent {}