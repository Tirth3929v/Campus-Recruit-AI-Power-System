import { Component, OnInit } from '@angular/core';
import { Job } from '../../shared/models/job.model';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jobs-container" @listAnimation>
      <h2>Available Jobs</h2>
      <div class="jobs-list">
        <div class="glass-panel job-card" *ngFor="let job of jobs">
          <h3>{{ job.title }}</h3>
          <p>{{ job.company }}</p>
          <p>{{ job.description }}</p>
          <div class="meta">
            <span>📍 {{ job.location }}</span>
            <span>💰 {{ job.salary }}</span>
          </div>
          <button class="btn-primary" (click)="apply(job)">Apply Now</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jobs-container { padding: 20px; }
    .jobs-list { display: flex; flex-direction: column; gap: 20px; }
    .job-card { padding: 25px; display: flex; flex-direction: column; gap: 10px; position: relative; overflow: hidden; }
    .job-card::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; background: var(--primary-color); }
    .meta { display: flex; gap: 20px; font-size: 0.9rem; color: var(--secondary-color); margin: 10px 0; }
  `],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('.job-card', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(100, [animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' }))])
        ])
      ])
    ])
  ]
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];

  constructor() {}

  ngOnInit(): void {
    // Fetch jobs from service (placeholder)
    this.jobs = [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'Tech Corp',
        description: 'Develop user interfaces using Angular',
        location: 'Remote',
        salary: '$80,000 - $100,000'
      },
      {
        id: 2,
        title: 'Full Stack Developer',
        company: 'Startup Inc',
        description: 'Work on both frontend and backend',
        location: 'New York',
        salary: '$90,000 - $120,000'
      }
    ];
  }

  apply(job: Job): void {
    // Implement application logic
    alert(`Applied for ${job.title} at ${job.company}`);
  }
}
