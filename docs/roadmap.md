---
layout: page
title: Roadmap
description: SpectralLogs development roadmap and future plans
---

<style>
/* Header que llega hasta los bordes */
.roadmap-hero {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 4rem 2rem;
  margin-bottom: 4rem;
  overflow: hidden;
  z-index: 1;
}

.roadmap-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(1px);
}

.roadmap-hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.roadmap-hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.1;
}

.roadmap-hero p {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 700px;
  margin: 0 auto;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1.6;
}

.timeline {
  position: relative;
  padding: 2rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin: 3rem 0;
  display: flex;
  align-items: center;
}

.timeline-item:nth-child(odd) {
  flex-direction: row;
}

.timeline-item:nth-child(even) {
  flex-direction: row-reverse;
}

.timeline-content {
  flex: 1;
  max-width: 45%;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
  position: relative;
}

.timeline-content:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.timeline-content::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  border: 12px solid transparent;
  transform: translateY(-50%);
}

.timeline-item:nth-child(odd) .timeline-content::before {
  right: -24px;
  border-left-color: var(--vp-c-bg-soft);
}

.timeline-item:nth-child(even) .timeline-content::before {
  left: -24px;
  border-right-color: var(--vp-c-bg-soft);
}

.timeline-icon {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.timeline-icon.completed {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  box-shadow: 0 0 0 4px var(--vp-c-bg), 0 0 0 8px #4ade80;
}

.timeline-icon.in-progress {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 0 0 4px var(--vp-c-bg), 0 0 0 8px #f59e0b;
  animation: pulse 2s infinite;
}

.timeline-icon.planned {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  box-shadow: 0 0 0 4px var(--vp-c-bg), 0 0 0 8px #6366f1;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.timeline-icon svg {
  width: 28px;
  height: 28px;
  fill: white;
}

.timeline-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.timeline-version {
  display: inline-block;
  background: var(--vp-c-brand);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.timeline-description {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.timeline-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline-features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider-light);
  display: flex;
  align-items: center;
}

.timeline-features li:last-child {
  border-bottom: none;
}

.timeline-features li::before {
  content: '✓';
  color: #4ade80;
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.timeline-features.planned li::before {
  content: '○';
  color: var(--vp-c-text-3);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 1rem;
}

.status-badge.completed {
  background: rgba(74, 222, 128, 0.1);
  color: #16a34a;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.status-badge.in-progress {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.planned {
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.roadmap-footer {
  text-align: center;
  margin-top: 4rem;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
}

.roadmap-footer h3 {
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.roadmap-footer p {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}

.roadmap-footer .links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.roadmap-footer .links a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.roadmap-footer .links a:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}

/* Mejores estilos de hover para elementos interactivos */
.timeline-icon:hover {
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 0 0 4px var(--vp-c-bg), 0 0 0 12px rgba(102, 126, 234, 0.3);
}

.timeline-icon.completed:hover {
  box-shadow: 0 0 0 4px var(--vp-c-bg), 0 0 0 12px rgba(74, 222, 128, 0.4);
}

.timeline-icon.in-progress:hover {
  box-shadow: 0 0 0 4px var(--vp-c-bg), 0 0 0 12px rgba(245, 158, 11, 0.4);
}

.timeline-version:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-badge:hover {
  transform: scale(1.05);
}

/* Animaciones suaves para elementos */
.timeline-version,
.status-badge {
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .roadmap-hero {
    padding: 3rem 1rem;
  }
  
  .roadmap-hero h1 {
    font-size: 2.5rem;
  }
  
  .roadmap-hero p {
    font-size: 1.1rem;
  }
  
  .timeline::before {
    left: 2rem;
  }
  
  .timeline-item {
    flex-direction: row !important;
    padding-left: 4rem;
  }
  
  .timeline-content {
    max-width: 100%;
  }
  
  .timeline-content::before {
    left: -24px !important;
    right: auto !important;
    border-right-color: var(--vp-c-bg-soft) !important;
    border-left-color: transparent !important;
  }
  
  .timeline-icon {
    left: 2rem;
  }
}
</style>

<div class="roadmap-hero">
  <div class="roadmap-hero-content">
    <h1>Roadmap</h1>
    <p>Discover what's coming next for SpectralLogs. Our journey towards becoming the most powerful and elegant logging solution.</p>
  </div>
</div>

<div class="roadmap-container">
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-icon completed">
        <svg viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <div class="timeline-content">
        <div class="timeline-version">v0.1.7 - Current</div>
        <h3 class="timeline-title">Foundation & Core Features</h3>
        <p class="timeline-description">
          Established the core logging functionality with beautiful colors, TypeScript support, and basic plugin system.
        </p>
        <ul class="timeline-features">
          <li>High-performance buffered output</li>
          <li>Rich color support (HEX, RGB, named)</li>
          <li>TypeScript-first design</li>
          <li>Basic plugin system</li>
          <li>CLI tools and diagnostics</li>
          <li>Node.js and Web support</li>
          <li>Error formatting and stack traces</li>
        </ul>
        <div class="status-badge completed">
          <span>✓</span> Released
        </div>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-icon completed">
        <svg viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <div class="timeline-content">
        <div class="timeline-version">v0.2.0 - Next</div>
        <h3 class="timeline-title">Performance & Stability Improvements</h3>
        <p class="timeline-description">
          Focus on performance optimizations, bug fixes, and enhanced stability for production environments.
        </p>
        <ul class="timeline-features">
          <li>Dynamic buffer optimization</li>
          <li>Improved TypeScript definitions</li>
          <li>Better encoding support</li>
          <li>Enhanced error handling and retry logic</li>
          <li>Race condition fixes</li>
          <li>VS Code extension with snippets, playground and config generator</li>
        </ul>
        <div class="status-badge completed">
          <span>✓</span> Released
        </div>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-icon in-progress">
        <svg viewBox="0 0 24 24">
          <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
      </div>
      <div class="timeline-content">
        <div class="timeline-version">v0.3.0 - Planned</div>
        <h3 class="timeline-title">Advanced Logging Features</h3>
        <p class="timeline-description">
          Introduce structured logging, advanced filtering, and powerful new capabilities for complex applications.
        </p>
        <ul class="timeline-features">
          <li>Structured JSON logging</li>
        </ul>
        <ul class="timeline-features planned">
          <li>Advanced filtering and search</li>
          <li>Conditional logging with predicates</li>
          <li>Log rotation and archiving</li>
          <li>Correlation IDs and distributed tracing</li>
          <li>Custom formatters and serializers</li>
          <li>Log sampling and rate limiting</li>
        </ul>
        <div class="status-badge in-progress">
          <span>•</span> In Progress
        </div>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-icon planned">
        <svg viewBox="0 0 24 24">
          <path d="M20.5,11H19V7C19,5.89 18.1,5 17,5H13V3.5A2.5,2.5 0 0,0 10.5,1A2.5,2.5 0 0,0 8,3.5V5H4A2,2 0 0,0 2,7V10.8H3.5C5,10.8 6.2,12 6.2,13.5C6.2,15 5,16.2 3.5,16.2H2V20A2,2 0 0,0 4,22H7.8V20.5C7.8,19 9,17.8 10.5,17.8C12,17.8 13.2,19 13.2,20.5V22H17A2,2 0 0,0 19,20V16H20.5A2.5,2.5 0 0,0 23,13.5A2.5,2.5 0 0,0 20.5,11Z"/>
        </svg>
      </div>
      <div class="timeline-content">
        <div class="timeline-version">v0.4.0 - Planned</div>
        <h3 class="timeline-title">Rich Plugin Ecosystem</h3>
        <p class="timeline-description">
          Expand the plugin system with a comprehensive collection of integrations and tools.
        </p>
        <ul class="timeline-features planned">
          <li>Analytics and metrics plugins</li>
          <li>Plugin SDK and development tools</li>
          <li>Hot-swappable plugin loading</li>
          <li>Plugin configuration management</li>
        </ul>
        <div class="status-badge planned">
          <span>○</span> Planned
        </div>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-icon planned">
        <svg viewBox="0 0 24 24">
          <path d="M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6Z"/>
        </svg>
      </div>
      <div class="timeline-content">
        <div class="timeline-version">v0.5.0 - Planned</div>
        <h3 class="timeline-title">Enhanced Developer Experience</h3>
        <p class="timeline-description">
          Focus on making SpectralLogs the most developer-friendly logging solution with advanced tooling.
        </p>
        <ul class="timeline-features planned">
          <li>Real-time log analysis dashboard</li>
          <li>Advanced CLI with live monitoring</li>
          <li>Automated migration tools</li>
          <li>Performance profiler and recommendations</li>
        </ul>
        <div class="status-badge planned">
          <span>○</span> Planned
        </div>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-icon planned">
        <svg viewBox="0 0 24 24">
          <path d="M5,16L3,14L5,12L6.4,13.4L4.8,15L6.4,16.6L5,18M19,8L21,10L19,12L17.6,10.6L19.2,9L17.6,7.4L19,6M21,16L19,18L17.6,16.6L19.2,15L17.6,13.4L19,12L21,14M3,8L5,6L6.4,7.4L4.8,9L6.4,10.6L5,12L3,10M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z"/>
        </svg>
      </div>
      <div class="timeline-content">
        <div class="timeline-version">v1.0.0 - Future</div>
        <h3 class="timeline-title">Production Ready & Enterprise Features</h3>
        <p class="timeline-description">
          The stable 1.0 release with enterprise-grade features and comprehensive platform support.
        </p>
        <ul class="timeline-features planned">
          <li>Enterprise security and compliance</li>
          <li>Multi-platform optimization (React Native, Electron)</li>
          <li>Edge computing support (Cloudflare, Vercel)</li>
          <li>Advanced analytics and insights</li>
          <li>Comprehensive documentation</li>
        </ul>
        <div class="status-badge planned">
          <span>○</span> Planned
        </div>
      </div>
    </div>
  </div>
  <div class="roadmap-footer">
    <h3>Get Involved</h3>
    <p>SpectralLogs is an open-source project and we welcome contributions from the community. Help us shape the future of logging!</p>
    <div class="links">
      <a href="https://github.com/ZtaMDev/SpectralLogs" target="_blank" rel="noopener">
        <span></span> Contribute on GitHub
      </a>
      <a href="https://github.com/ZtaMDev/SpectralLogs/issues" target="_blank" rel="noopener">
        <span></span> Report Issues
      </a>
      <a href="https://www.npmjs.com/package/spectrallogs" target="_blank" rel="noopener">
        <span></span> View on npm
      </a>
    </div>
  </div>
</div>
