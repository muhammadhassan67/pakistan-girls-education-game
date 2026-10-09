/**
 * Presenter Telemetry Wall Logic - 100% Match to Reference Image (media_1791436575952.png)
 * Supports 8 Scenario Table QR Codes (Scenario 1..8) & Live Dual Bar Chart Telemetry
 */

document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  let currentStageIdx = 0;
  const stageTitles = [
    "Round 1: Kit, Textbooks & Stationery",
    "Round 2: School Uniform, Shoes & Bags",
    "Round 3: Annual Examination & School Funds",
    "Round 4: Board Examination Admit Ticket",
    "Round 5: Daily Transport & Rickshaw Fare",
    "Round 6: Pocket Money & Canteen Meals",
    "🏆 Final Venue Verdict & 1,000 Household Survey Synthesis"
  ];

  const stageActSubtitles = [
    "Phase: Act 1: False Calm",
    "Phase: Act 2: Compounding Squeeze",
    "Phase: Act 3: Mid-Term Shock",
    "Phase: Act 4: High Stakes Examination",
    "Phase: Act 5: Daily Transit Squeeze",
    "Phase: Act 6: Term Verdict",
    "Phase: Final Act: Survey Synthesis & Closing"
  ];

  const podiumCues = [
    `"The average family spends PKR 5,899 a month keeping one girl in school. Watch how quickly the opening costs compound before tuition is even discussed."`,
    `"Round 2 Uniform & Kit: Notice how easily families pay out of float at first. The squeeze compounds quietly as costs multiply."`,
    `"Annual charges & school funds: Watch the float bar fracture as exam fees collide with household income."`,
    `"Board Exam Ticket: High stakes stage. When costs exceed float, families are forced into debt or forced to cut her schooling."`,
    `"Daily Transport: Transport fees create an ongoing daily drain that eats away at household reserves."`,
    `"Term Outcome: Every family in this survey still has her enrolled. What you just felt is what it costs them to keep her there. 13.4 million girls in Pakistan don't have that outcome."`,
    `"FINAL CLOSING: Look at the live venue telemetry wall — every family in this room felt the financial squeeze. Remember, 13.4 million Pakistani girls are out of school because their households could not bridge this exact gap."`
  ];

  // DOM Elements
  const headerRoundTitle = document.getElementById("headerRoundTitle");
  const headerPhaseSubtitle = document.getElementById("headerPhaseSubtitle");
  const headerStagePill = document.getElementById("headerStagePill");

  const valDebtPct = document.getElementById("valDebtPct");
  const subDebtText = document.getElementById("subDebtText");
  const valCutPct = document.getElementById("valCutPct");
  const subCutText = document.getElementById("subCutText");
  const valAvgFloat = document.getElementById("valAvgFloat");

  const barBalochistanBorrow = document.getElementById("barBalochistanBorrow");
  const valBalochistanBorrow = document.getElementById("valBalochistanBorrow");
  const barKPBorrow = document.getElementById("barKPBorrow");
  const valKPBorrow = document.getElementById("valKPBorrow");
  const barSindhBorrow = document.getElementById("barSindhBorrow");
  const valSindhBorrow = document.getElementById("valSindhBorrow");
  const barPunjabBorrow = document.getElementById("barPunjabBorrow");
  const valPunjabBorrow = document.getElementById("valPunjabBorrow");
  const barICTBorrow = document.getElementById("barICTBorrow");
  const valICTBorrow = document.getElementById("valICTBorrow");

  const podiumCueText = document.getElementById("podiumCueText");
  const podiumStageSyncText = document.getElementById("podiumStageSyncText");
  const podiumPlayerSyncText = document.getElementById("podiumPlayerSyncText");

  const btnPrevStage = document.getElementById("btnPrevStage");
  const btnNextStep = document.getElementById("btnNextStep");

  const btnToggleQrView = document.getElementById("btnToggleQrView");
  const qrEightGrid = document.getElementById("qrEightGrid");
  const singleQrBox = document.getElementById("singleQrBox");

  // Register with Socket Server as Presenter
  socket.emit("REGISTER_PRESENTER");

  // Generate 8 Table Scenario QR Codes (Seats 1..8) with Local Wi-Fi IP
  function generateQrCodes(targetHostUrl) {
    try {
      if (typeof QRious !== "undefined") {
        for (let i = 1; i <= 8; i++) {
          const canvasElem = document.getElementById(`qrCanvas${i}`);
          if (canvasElem) {
            new QRious({
              element: canvasElem,
              value: `${targetHostUrl}/?scenario=${i}`,
              size: 60
            });
          }
        }

        const singleCanvas = document.getElementById("singleQrCanvas");
        if (singleCanvas) {
          new QRious({
            element: singleCanvas,
            value: targetHostUrl,
            size: 120
          });
        }

        const venueUrlText = document.getElementById("venueUrlText");
        if (venueUrlText) {
          venueUrlText.innerText = `Host: ${targetHostUrl}`;
        }
      }
    } catch (e) {
      console.log("QR code generation error:", e);
    }
  }

  // Initial fallback generation using location.origin or IP
  const defaultUrl = window.location.origin.includes("localhost")
    ? `http://${window.location.hostname}:3000`
    : window.location.origin;
  generateQrCodes(defaultUrl);

  // Dynamic QR Code generation with Laptop Wi-Fi IP from Socket Server
  socket.on("SERVER_CONFIG", (config) => {
    if (config && config.hostUrl) {
      console.log("Setting QR Codes to Wi-Fi Host URL:", config.hostUrl);
      generateQrCodes(config.hostUrl);
    }
  });

  // Toggle QR view between 8 Table Seats vs Single Main QR
  if (btnToggleQrView) {
    let isSingleView = false;
    btnToggleQrView.addEventListener("click", () => {
      isSingleView = !isSingleView;
      if (isSingleView) {
        qrEightGrid.style.display = "none";
        singleQrBox.style.display = "flex";
        btnToggleQrView.innerText = "8 Seats Grid";
      } else {
        qrEightGrid.style.display = "grid";
        singleQrBox.style.display = "none";
        btnToggleQrView.innerText = "Switch View";
      }
    });
  }

  // Final Summary DOM Elements
  const finalSummaryDashboard = document.getElementById("finalSummaryDashboard");
  const kpiFourCardsGrid = document.querySelector(".kpi-four-cards-grid");
  const mainSplitGrid = document.querySelector(".main-split-grid");

  const finalTotalPlayers = document.getElementById("finalTotalPlayers");
  const finalOverallBorrow = document.getElementById("finalOverallBorrow");
  const finalKpiBorrow = document.getElementById("finalKpiBorrow");
  const finalKpiBorrowSub = document.getElementById("finalKpiBorrowSub");
  const finalKpiCut = document.getElementById("finalKpiCut");
  const finalKpiCutSub = document.getElementById("finalKpiCutSub");
  const finalKpiPaid = document.getElementById("finalKpiPaid");
  const finalKpiPaidSub = document.getElementById("finalKpiPaidSub");
  const btnResetSession = document.getElementById("btnResetSession");

  // Telemetry Updates from Socket Server
  socket.on("TELEMETRY_UPDATE", (data) => {
    const total = data.activePlayers || 0;

    const pctBorrowed = data.percentBorrowed || 0;
    const pctCut = data.percentCut || 0;
    const pctPaid = data.percentPaid !== undefined ? data.percentPaid : (total > 0 ? Math.max(0, 100 - pctBorrowed - pctCut) : 0);

    if (valDebtPct) valDebtPct.innerText = `${pctBorrowed}%`;
    if (subDebtText) {
      if (total === 0) {
        subDebtText.innerText = "0 connected households (Waiting for QR scans)";
      } else {
        subDebtText.innerText = `${data.borrowedCount || 0} of ${total} connected households`;
      }
    }

    if (valCutPct) valCutPct.innerText = `${pctCut}%`;
    if (subCutText) {
      if (total === 0) {
        subCutText.innerText = "0 connected households";
      } else {
        subCutText.innerText = `${data.cutCount || 0} of ${total} connected households`;
      }
    }

    if (podiumPlayerSyncText) {
      if (total === 0) {
        podiumPlayerSyncText.innerText = "0 Devices Connected (Scan QR to Join)";
      } else {
        podiumPlayerSyncText.innerText = `${total} Devices Connected`;
      }
    }

    // Regional Borrowing Updates for main chart
    const rb = data.regionalBorrowing || {};

    updateBar(valBalochistanBorrow, barBalochistanBorrow, rb.balochistan !== undefined ? rb.balochistan : 0);
    updateBar(valKPBorrow, barKPBorrow, rb.kp !== undefined ? rb.kp : 0);
    updateBar(valSindhBorrow, barSindhBorrow, rb.sindh !== undefined ? rb.sindh : 0);
    updateBar(valPunjabBorrow, barPunjabBorrow, rb.punjab !== undefined ? rb.punjab : 0);
    updateBar(valICTBorrow, barICTBorrow, rb.ict !== undefined ? rb.ict : 0);

    // Final Summary Telemetry Updates
    if (finalTotalPlayers) finalTotalPlayers.innerText = total;
    if (finalOverallBorrow) finalOverallBorrow.innerText = `${pctBorrowed}%`;

    if (finalKpiBorrow) finalKpiBorrow.innerText = `${pctBorrowed}%`;
    if (finalKpiBorrowSub) finalKpiBorrowSub.innerText = `${data.borrowedCount || 0} of ${total} households forced into debt`;

    if (finalKpiCut) finalKpiCut.innerText = `${pctCut}%`;
    if (finalKpiCutSub) finalKpiCutSub.innerText = `${data.cutCount || 0} forced to cut education needs`;

    if (finalKpiPaid) finalKpiPaid.innerText = `${pctPaid}%`;
    if (finalKpiPaidSub) finalKpiPaidSub.innerText = `${data.paidCount || 0} paid smoothly from reserves`;

    // Regional Detailed Breakdown Rows
    const rd = data.regionalDetails || {};
    updateRegionRow("Balochistan", rd.balochistan, 64, 12, 24);
    updateRegionRow("KP", rd.kp, 30, 15, 55);
    updateRegionRow("Sindh", rd.sindh, 16, 20, 64);
    updateRegionRow("Punjab", rd.punjab, 8, 8, 84);
    updateRegionRow("ICT", rd.ict, 11, 10, 79);
  });

  function updateRegionRow(rKey, rData, fallbackB, fallbackC, fallbackP) {
    let b = fallbackB;
    let c = fallbackC;
    let p = fallbackP;

    if (rData && rData.total > 0) {
      b = rData.borrowPct;
      c = rData.cutPct;
      p = rData.paidPct;
    }

    const bBar = document.getElementById(`rs${rKey}Borrow`);
    const cBar = document.getElementById(`rs${rKey}Cut`);
    const pBar = document.getElementById(`rs${rKey}Paid`);

    const bVal = document.getElementById(`valRs${rKey}Borrow`);
    const cVal = document.getElementById(`valRs${rKey}Cut`);
    const pVal = document.getElementById(`valRs${rKey}Paid`);

    if (bBar) bBar.style.width = `${b}%`;
    if (cBar) cBar.style.width = `${c}%`;
    if (pBar) pBar.style.width = `${p}%`;

    if (bVal) bVal.innerText = `${b}%`;
    if (cVal) cVal.innerText = `${c}%`;
    if (pVal) pVal.innerText = `${p}%`;
  }

  function updateBar(valElem, barElem, pct) {
    if (valElem) valElem.innerText = `${pct}%`;
    if (barElem) barElem.style.height = `${Math.max(4, pct)}%`;
  }

  const btnBigNextStep = document.getElementById("btnBigNextStep");
  const btnStickyNext = document.getElementById("btnStickyNext");
  const btnStickyPrev = document.getElementById("btnStickyPrev");
  const stickyStageText = document.getElementById("stickyStageText");

  // Stage Navigation Handlers
  function updateStageDisplay(idx) {
    currentStageIdx = idx;
    if (headerRoundTitle) headerRoundTitle.innerText = stageTitles[idx];
    if (headerPhaseSubtitle) headerPhaseSubtitle.innerText = stageActSubtitles[idx];
    if (headerStagePill) {
      headerStagePill.innerText = idx < 6 ? `Round ${idx + 1} of 6` : "FINAL SUMMARY";
    }

    if (podiumCueText) podiumCueText.innerText = podiumCues[idx];
    if (podiumStageSyncText) {
      podiumStageSyncText.innerText = idx < 6 ? `Audience Stage: Round ${idx + 1}` : "Audience Stage: Final Thank You Screen";
    }
    if (stickyStageText) {
      stickyStageText.innerText = idx < 6 ? `ROUND ${idx + 1} OF 6` : "FINAL SUMMARY";
    }

    // Toggle Screen Views between Gameplay Telemetry Wall vs Final Summary Dashboard
    if (idx === 6) {
      if (kpiFourCardsGrid) kpiFourCardsGrid.style.display = "none";
      if (mainSplitGrid) mainSplitGrid.style.display = "none";
      if (finalSummaryDashboard) finalSummaryDashboard.style.display = "flex";
    } else {
      if (kpiFourCardsGrid) kpiFourCardsGrid.style.display = "grid";
      if (mainSplitGrid) mainSplitGrid.style.display = "grid";
      if (finalSummaryDashboard) finalSummaryDashboard.style.display = "none";
    }

    socket.emit("PRESENTER_SET_PHASE", idx < 6 ? `ROUND_${idx + 1}` : "PHASE_VERDICT");
    socket.emit("PRESENTER_SET_STAGE", idx);
  }

  function advanceNext() {
    if (currentStageIdx < 6) {
      updateStageDisplay(currentStageIdx + 1);
    } else {
      updateStageDisplay(0);
    }
  }

  function advancePrev() {
    if (currentStageIdx > 0) {
      updateStageDisplay(currentStageIdx - 1);
    }
  }

  if (btnNextStep) btnNextStep.addEventListener("click", advanceNext);
  if (btnBigNextStep) btnBigNextStep.addEventListener("click", advanceNext);
  if (btnStickyNext) btnStickyNext.addEventListener("click", advanceNext);

  if (btnPrevStage) btnPrevStage.addEventListener("click", advancePrev);
  if (btnStickyPrev) btnStickyPrev.addEventListener("click", advancePrev);

  if (btnResetSession) {
    btnResetSession.addEventListener("click", () => {
      if (confirm("Reset simulation for a new audience session?")) {
        socket.emit("PRESENTER_RESET");
        updateStageDisplay(0);
      }
    });
  }
});
