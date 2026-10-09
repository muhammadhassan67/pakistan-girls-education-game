/**
 * Interactive 3D Town Roadmap with Buildings & Character Advancement
 */

class Roadmap3D {
  constructor(containerId, stages, currentStageIndex = 0) {
    this.container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    this.stages = stages || [];
    this.currentIndex = currentStageIndex;

    this.buildings = [
      { name: "Bookshop", icon: "🏪", desc: "Kit & Books" },
      { name: "Tailor Shop", icon: "👗", desc: "Uniform" },
      { name: "School Gate", icon: "🏫", desc: "School Charges" },
      { name: "Exam Hall", icon: "📜", desc: "Board Fee" },
      { name: "Bus Station", icon: "🚌", desc: "Transport" },
      { name: "Market Canteen", icon: "🍱", desc: "Meals & Pocket" }
    ];

    if (this.container) {
      this.render();
    }
  }

  setStage(index) {
    this.currentIndex = index;
    this.render();
  }

  render() {
    if (!this.container) return;

    let html = `<div class="town-roadmap-wrapper">
      <div class="town-roadmap-header">
        <span class="town-title">3D TOWN ROADMAP</span>
        <span class="stage-counter">ROUND ${Math.min(this.currentIndex + 1, 6)} OF 6</span>
      </div>
      <div class="town-road-container">
        <svg class="town-road-svg" viewBox="0 0 340 120" preserveAspectRatio="none">
          <path d="M 20,60 Q 80,10 140,60 T 260,60 Q 300,110 320,60" fill="none" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round"/>
          <path d="M 20,60 Q 80,10 140,60 T 260,60 Q 300,110 320,60" fill="none" stroke="#10B981" stroke-width="12" stroke-dasharray="320" stroke-dashoffset="${320 - (this.currentIndex / 5) * 320}" stroke-linecap="round" class="town-progress-path"/>
        </svg>
        <div class="buildings-grid">`;

    // Coordinates along the road
    const coords = [
      { left: "6%", top: "45%" },
      { left: "24%", top: "18%" },
      { left: "42%", top: "60%" },
      { left: "60%", top: "25%" },
      { left: "78%", top: "65%" },
      { left: "92%", top: "40%" }
    ];

    this.buildings.forEach((bld, idx) => {
      const pos = coords[idx] || { left: `${idx * 16}%`, top: "50%" };
      let stateClass = "locked";
      let badgeIcon = bld.icon;

      if (idx < this.currentIndex) {
        stateClass = "completed";
        badgeIcon = "✓";
      } else if (idx === this.currentIndex) {
        stateClass = "active";
      }

      html += `
        <div class="town-building-node ${stateClass}" style="left: ${pos.left}; top: ${pos.top};">
          <div class="building-3d-card">
            <span class="building-emoji">${badgeIcon}</span>
          </div>
          <span class="building-name">${bld.name}</span>
          ${idx === this.currentIndex ? '<div class="avatar-pin-indicator">👧</div>' : ''}
        </div>
      `;
    });

    html += `</div></div></div>`;
    this.container.innerHTML = html;
  }
}

if (typeof window !== "undefined") {
  window.Roadmap3D = Roadmap3D;
}
