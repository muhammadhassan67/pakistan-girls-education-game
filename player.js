/**
 * Player Web App Logic - Option A Character Expression Switcher & Outdoor Stage
 */

document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  let persona = null;
  let startingFloat = 0;
  let currentFloat = 0;
  let currentStageIndex = 0;
  let totalSpent = 0;
  let borrowCount = 0;
  let cutCount = 0;
  let userDecisions = [];
  let roadmap = null;

  // 45-Second Round Timer variables
  let timerInterval = null;
  let timeRemaining = 45;

  // Web Audio Context for Chimes
  let audioCtx = null;

  function playClickChime(freq = 440) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  }

  // Parse scenario query parameter from URL (e.g. /?scenario=3)
  const urlParams = new URLSearchParams(window.location.search);
  const explicitScenarioId = urlParams.get("scenario") || urlParams.get("s");

  // Translation state
  let isEnglishTranslationShown = false;

  // DOM Elements
  const headerRegionText = document.getElementById("headerRegionText");
  const headerCoinText = document.getElementById("headerCoinText");
  const headerRoundPill = document.getElementById("headerRoundPill");

  const timerText = document.getElementById("timerText");
  const timerCountdownPill = document.getElementById("timerCountdownPill");

  const speechCharName = document.getElementById("speechCharName");
  const characterUrduQuote = document.getElementById("characterUrduQuote");
  const characterEnglishQuote = document.getElementById("characterEnglishQuote");
  const btnTranslate = document.getElementById("btnTranslate");

  const charNameText = document.getElementById("charNameText");
  const charSubtitleText = document.getElementById("charSubtitleText");
  const characterStandingImg = document.getElementById("characterStandingImg");

  const incomeText = document.getElementById("incomeText");
  const floatAmountText = document.getElementById("floatAmountText");
  const floatProgressBar = document.getElementById("floatProgressBar");

  const stageTitleText = document.getElementById("stageTitleText");
  const stageDetailLabel = document.getElementById("stageDetailLabel");
  const stageCostText = document.getElementById("stageCostText");

  const btnPay = document.getElementById("btnPay");
  const paySubtext = document.getElementById("paySubtext");
  const btnBorrow = document.getElementById("btnBorrow");
  const btnCut = document.getElementById("btnCut");

  const decisionCard = document.getElementById("decisionCard");
  const verdictCard = document.getElementById("verdictCard");
  const receiptItemsContainer = document.getElementById("receiptItemsContainer");
  const receiptTotalText = document.getElementById("receiptTotalText");
  const verdictHouseholdSubtitle = document.getElementById("verdictHouseholdSubtitle");

  // Translation button listener
  if (btnTranslate) {
    btnTranslate.addEventListener("click", () => {
      isEnglishTranslationShown = !isEnglishTranslationShown;
      if (isEnglishTranslationShown) {
        characterUrduQuote.style.display = "none";
        characterEnglishQuote.style.display = "block";
        btnTranslate.innerText = "اردو Urdu";
      } else {
        characterUrduQuote.style.display = "block";
        characterEnglishQuote.style.display = "none";
        btnTranslate.innerText = "A/文 English";
      }
    });
  }

  // Register with Socket Server
  socket.emit("REGISTER_PLAYER", { scenarioId: explicitScenarioId });

  socket.on("PERSONA_ASSIGNED", (data) => {
    persona = data.scenario;
    startingFloat = data.startingFloat;
    currentFloat = startingFloat;

    // Header updates (Matching Reference Image)
    if (headerRegionText) headerRegionText.innerText = persona.regionName || persona.city;
    if (welcomeRegionTag) welcomeRegionTag.innerText = `📍 ${persona.regionName || persona.city} Household`;
    if (headerCoinText) headerCoinText.innerText = `PKR ${startingFloat.toLocaleString()}`;
    if (headerRoundPill) headerRoundPill.innerText = `Round 1 of 6`;

    if (speechCharName) speechCharName.innerText = `Fatima (${persona.city})`;
    if (charNameText) charNameText.innerText = `${persona.city} Household`;
    if (charSubtitleText) charSubtitleText.innerText = `${persona.class} • ${persona.fatherJob}`;

    if (incomeText) incomeText.innerText = `Income: PKR ${persona.monthlyIncome.toLocaleString()}/mo`;

    // Initialize 3D Town Roadmap
    roadmap = new Roadmap3D("roadmapContainer", STAGES, 0);

    // Initialize Pure 3D Code Character Engine (Three.js WebGL)
    if (window.Character3D) {
      window.character3dInstance = new Character3D("character3dCanvasContainer");
    }

    updateFloatHUD();
    loadStage(0);
  });

  /**
   * Transparent 3D Avatar Expression Reaction & Animation Switcher
   * Swaps expression classes: happy, worried, sad, relieved with 3D motion transforms
   */
  function updateCharacterExpression(stateName) {
    if (characterStandingImg) {
      characterStandingImg.className = `standing-character-img ${stateName}`;
    }
  }

  function startStageTimer() {
    clearInterval(timerInterval);
    timeRemaining = 45;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        autoSubmitTimeExpired();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (timeRemaining <= 15) {
      timerCountdownPill.classList.add("urgent");
    } else {
      timerCountdownPill.classList.remove("urgent");
    }
  }

  function autoSubmitTimeExpired() {
    const cost = getStageCost(currentStageIndex);
    if (currentFloat >= cost) {
      btnPay.click();
    } else {
      btnBorrow.click();
    }
  }

  function updateFloatHUD() {
    if (floatAmountText) floatAmountText.innerText = `PKR ${currentFloat.toLocaleString()}`;
    if (headerCoinText) headerCoinText.innerText = `PKR ${currentFloat.toLocaleString()}`;

    const pct = Math.max(0, Math.min(100, (currentFloat / startingFloat) * 100));
    if (floatProgressBar) floatProgressBar.style.width = `${pct}%`;

    if (pct > 50) {
      if (floatProgressBar) floatProgressBar.style.background = "linear-gradient(90deg, #10B981 0%, #34D399 100%)";
      updateCharacterExpression("happy");
    } else if (pct > 20) {
      if (floatProgressBar) floatProgressBar.style.background = "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)";
      updateCharacterExpression("worried");
    } else {
      if (floatProgressBar) floatProgressBar.style.background = "linear-gradient(90deg, #EF4444 0%, #F87171 100%)";
      updateCharacterExpression("sad");
    }
  }

  function getStageCost(stageIdx) {
    if (!persona) return 0;
    const c = persona.costs;
    switch (stageIdx) {
      case 0: return c.admission.fee || 0;
      case 1: return (c.kit.textbooks || 0) + (c.kit.guides || 0) + (c.kit.uniform || 0) + (c.kit.stationery || 0);
      case 2: return (c.charges.funds || 0) + (c.charges.fines || 0) + (c.charges.fee || 0);
      case 3: return c.board.fee || 0;
      case 4: return c.transport.fee || 0;
      case 5: return (c.pocket.pocketMoney || 0) + (c.pocket.meals || 0);
      default: return 0;
    }
  }

  function loadStage(stageIdx) {
    if (stageIdx >= 6) {
      clearInterval(timerInterval);
      showVerdict();
      return;
    }

    currentStageIndex = stageIdx;
    if (roadmap) roadmap.setStage(stageIdx);
    if (headerRoundPill) headerRoundPill.innerText = `Round ${stageIdx + 1} of 6`;

    startStageTimer();

    // Dynamic 3D Environment Backdrop Updates per Round
    const sceneryFrame = document.getElementById("sceneryFrame");

    if (sceneryFrame) {
      sceneryFrame.className = `scenery-background-frame theme-stage-${stageIdx}`;
    }

    const stageDef = STAGES[stageIdx];
    const cost = getStageCost(stageIdx);

    // Auto-skip if cost === 0 and not mandatory
    if (cost === 0 && !stageDef.mandatory) {
      userDecisions.push({ stageId: stageDef.id, title: stageDef.title, choice: "skipped", cost: 0 });
      socket.emit("SUBMIT_STAGE_DECISION", { stageId: stageDef.id, choice: "skipped", cost: 0 });
      loadStage(stageIdx + 1);
      return;
    }

    if (stageTitleText) stageTitleText.innerText = `ROUND ${stageIdx + 1}: ${stageDef.title.toUpperCase()}`;
    if (stageDetailLabel) stageDetailLabel.innerText = `Priced Term Expense (${persona.distance || 'Local'})`;
    if (stageCostText) stageCostText.innerText = `PKR ${cost.toLocaleString()}`;
    if (paySubtext) paySubtext.innerText = `-PKR ${cost.toLocaleString()}`;

    // Dynamic Urdu quote for this round
    const urduQuote = (persona.urduQuotes && persona.urduQuotes[stageDef.key])
      ? persona.urduQuotes[stageDef.key]
      : persona.quote;

    if (characterUrduQuote) characterUrduQuote.innerText = urduQuote;
    if (characterEnglishQuote) characterEnglishQuote.innerText = `"${persona.quote || 'I want to study and complete my term.'}"`;

    // Round-Specific Expression State Switcher
    if (stageIdx === 0) {
      updateCharacterExpression("happy");
    } else if (stageIdx === 1 || stageIdx === 2) {
      updateCharacterExpression(currentFloat < startingFloat * 0.5 ? "worried" : "happy");
    } else if (stageIdx === 3 || stageIdx === 4) {
      updateCharacterExpression(currentFloat < startingFloat * 0.3 ? "sad" : "worried");
    } else {
      updateCharacterExpression(borrowCount > 0 ? "relieved" : cutCount > 0 ? "sad" : "happy");
    }

    // SQUEEZE MECHANIC: If cost > currentFloat, Lock Pay Button!
    if (cost > currentFloat) {
      btnPay.classList.add("btn-disabled");
      btnPay.disabled = true;
      if (paySubtext) paySubtext.innerText = "Float Exhausted";
      updateCharacterExpression("worried");
    } else {
      btnPay.classList.remove("btn-disabled");
      btnPay.disabled = false;
    }

    btnBorrow.classList.remove("btn-disabled");
    btnBorrow.disabled = false;
  }

  // 3D Parallax Gyroscope & Mouse Movement Tracking
  const sceneryFrame = document.querySelector(".scenery-background-frame");

  if (sceneryFrame) {
    window.addEventListener("mousemove", (e) => {
      const { innerWidth, innerHeight } = window;
      const rotateX = ((e.clientY / innerHeight) - 0.5) * -10;
      const rotateY = ((e.clientX / innerWidth) - 0.5) * 10;
      sceneryFrame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        if (e.beta && e.gamma) {
          const rotateX = Math.max(-8, Math.min(8, (e.beta - 45) * 0.3));
          const rotateY = Math.max(-8, Math.min(8, e.gamma * 0.3));
          sceneryFrame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      });
    }
  }

  // DOM elements for welcome screen & sync
  const welcomeScreenWrapper = document.getElementById("welcomeScreenWrapper");
  const gameplayStageWrapper = document.getElementById("gameplayStageWrapper");
  const btnStartGame = document.getElementById("btnStartGame");
  const welcomeRegionTag = document.getElementById("welcomeRegionTag");
  const waitingCard = document.getElementById("waitingCard");
  const waitingStageNameText = document.getElementById("waitingStageNameText");

  // Welcome screen Start Game button
  if (btnStartGame) {
    btnStartGame.addEventListener("click", () => {
      playClickChime(600);
      if (welcomeScreenWrapper) welcomeScreenWrapper.classList.add("hidden-screen");
      if (gameplayStageWrapper) gameplayStageWrapper.classList.remove("hidden-screen");
      loadStage(currentStageIndex);
    });
  }

  // Socket Presenter Remote Stage Sync
  socket.on("ADVANCE_TO_STAGE", (data) => {
    const nextIdx = data.stageIdx !== undefined ? data.stageIdx : currentStageIndex + 1;
    if (welcomeScreenWrapper) welcomeScreenWrapper.classList.add("hidden-screen");
    if (gameplayStageWrapper) gameplayStageWrapper.classList.remove("hidden-screen");
    if (waitingCard) waitingCard.style.display = "none";
    if (decisionCard) decisionCard.style.display = "block";
    loadStage(nextIdx);
  });

  // Button Action Handlers
  btnPay.addEventListener("click", () => {
    playClickChime(523.25);
    updateCharacterExpression("happy");
    const cost = getStageCost(currentStageIndex);
    if (currentFloat >= cost) {
      currentFloat -= cost;
      totalSpent += cost;
      updateFloatHUD();

      const stageDef = STAGES[currentStageIndex];
      userDecisions.push({ stageId: stageDef.id, title: stageDef.title, choice: "pay", cost });
      socket.emit("SUBMIT_STAGE_DECISION", { stageId: stageDef.id, choice: "pay", cost });

      showWaitingCard();
    }
  });

  btnBorrow.addEventListener("click", () => {
    playClickChime(659.25);
    updateCharacterExpression("relieved");
    const cost = getStageCost(currentStageIndex);
    borrowCount++;
    totalSpent += cost;

    const stageDef = STAGES[currentStageIndex];
    userDecisions.push({ stageId: stageDef.id, title: stageDef.title, choice: "borrow", cost });
    socket.emit("SUBMIT_STAGE_DECISION", { stageId: stageDef.id, choice: "borrow", cost });

    showWaitingCard();
  });

  btnCut.addEventListener("click", () => {
    playClickChime(349.23);
    updateCharacterExpression("sad");
    const cost = getStageCost(currentStageIndex);
    cutCount++;

    const stageDef = STAGES[currentStageIndex];
    userDecisions.push({ stageId: stageDef.id, title: stageDef.title, choice: "cut", cost: 0 });
    socket.emit("SUBMIT_STAGE_DECISION", { stageId: stageDef.id, choice: "cut", cost: 0 });

    showWaitingCard();
  });

  function showWaitingCard() {
    if (decisionCard) decisionCard.style.display = "none";
    if (waitingCard) waitingCard.style.display = "block";
    if (waitingStageNameText) waitingStageNameText.innerText = `Round ${currentStageIndex + 1} Submitted - Waiting for Presenter...`;
  }

  function showVerdict() {
    decisionCard.style.display = "none";
    verdictCard.style.display = "block";

    verdictHouseholdSubtitle.innerText = `${persona.city} (${persona.regionName}) • ${persona.class}`;

    let html = "";
    userDecisions.forEach(item => {
      let statusBadge = item.choice === "pay" ? "<span style='color: #10B981;'>Paid out of Float</span>"
        : item.choice === "borrow" ? "<span style='color: #F59E0B;'>Borrowed (+Debt)</span>"
        : item.choice === "cut" ? "<span style='color: #E11D48;'>Sacrificed (Cut)</span>"
        : "<span style='color: #94A3B8;'>Skipped (No cost)</span>";

      html += `
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #E5E7EB;">
          <div>
            <div><strong>${item.title}</strong></div>
            <div style="font-size: 11px;">${statusBadge}</div>
          </div>
          <div>PKR ${item.cost.toLocaleString()}</div>
        </div>
      `;
    });

    receiptItemsContainer.innerHTML = html;
    receiptTotalText.innerText = `PKR ${totalSpent.toLocaleString()}`;

    const verdict = evaluateVerdictTier(totalSpent, startingFloat, borrowCount, cutCount);

    const pivotBox = document.getElementById("pivotStatementBox");
    pivotBox.innerHTML = `
      <h3 style="margin-bottom: 4px; font-size: 15px; color: #1E3A8A;">OUTCOME: ${verdict.headline}</h3>
      <p style="margin-bottom: 10px;">${verdict.description}</p>
      <hr style="margin: 8px 0; border: none; border-top: 1px solid #BFDBFE;">
      <strong>The Survey Reality:</strong> Every household in this survey still has her enrolled. What you just felt is what it costs them to keep her there.
      Now picture a family with less room than ${persona.regionName} had tonight — no stipend, no relative to borrow from, one more shock than this game gave you.
      <br><br>
      <strong style="color: #991B1B;">That is 13.4 million girls in Pakistan who are out of school entirely.</strong>
    `;
  }
});
