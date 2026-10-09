/**
 * The Real Cost of Educating a Girl in Pakistan
 * Node.js + Express + Socket.io Server
 * Bidirectional sync between 100+ Mobile Player devices & Main Venue Projector
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const os = require("os");
const { SCENARIOS, REGIONS, computeTotalSixRoundCost, getPersonaStartingFloat } = require("./public/js/report-data");

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "public")));

// Serve player page on root /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve presenter page on /presenter
app.get("/presenter", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "presenter.html"));
});

// State Management
let players = {}; // socketId -> playerData
let presenterSocketId = null;
let currentPhase = "PHASE_JOIN"; // PHASE_JOIN, PHASE_PLAYING, PHASE_VERDICT
let globalScenarioCounter = 0;

// Aggregate Counters
function calculateTelemetry() {
  const playerList = Object.values(players);
  const total = playerList.length;

  const validRegions = ["balochistan", "kp", "sindh", "punjab", "ict", "gb", "ajk"];

  if (total === 0) {
    let emptyRegBorrowing = {};
    let emptyRegDetails = {};
    validRegions.forEach(r => {
      emptyRegBorrowing[r] = 0;
      emptyRegDetails[r] = { total: 0, borrowPct: 0, cutPct: 0, paidPct: 0 };
    });
    return {
      activePlayers: 0,
      borrowedCount: 0,
      cutCount: 0,
      paidCount: 0,
      percentBorrowed: 0,
      percentCut: 0,
      percentPaid: 0,
      percentFracturedFloat: 0,
      regionalBorrowing: emptyRegBorrowing,
      regionalDetails: emptyRegDetails
    };
  }

  let borrowedCount = 0;
  let cutCount = 0;
  let paidCount = 0;
  let floatFracturedCount = 0;

  let regTotals = {};
  let regBorrowed = {};
  let regCut = {};
  let regPaid = {};

  validRegions.forEach(r => {
    regTotals[r] = 0;
    regBorrowed[r] = 0;
    regCut[r] = 0;
    regPaid[r] = 0;
  });

  playerList.forEach(p => {
    const rKey = p.regionKey || "balochistan";
    if (regTotals[rKey] !== undefined) {
      regTotals[rKey]++;
    }

    if (p.borrowCount > 0) {
      borrowedCount++;
      if (regBorrowed[rKey] !== undefined) regBorrowed[rKey]++;
    }

    if (p.cutCount > 0) {
      cutCount++;
      if (regCut[rKey] !== undefined) regCut[rKey]++;
    }

    if (p.borrowCount === 0 && p.cutCount === 0) {
      paidCount++;
      if (regPaid[rKey] !== undefined) regPaid[rKey]++;
    }

    if (p.startingFloat > 0 && (p.currentFloat < p.startingFloat * 0.3 || p.borrowCount > 0)) {
      floatFracturedCount++;
    }
  });

  let regionalBorrowingProps = {};
  let regionalDetailsProps = {};

  validRegions.forEach(r => {
    const regTot = regTotals[r];
    const bPct = regTot > 0 ? Math.round((regBorrowed[r] / regTot) * 100) : 0;
    const cPct = regTot > 0 ? Math.round((regCut[r] / regTot) * 100) : 0;
    const pPct = regTot > 0 ? Math.round((regPaid[r] / regTot) * 100) : 0;

    regionalBorrowingProps[r] = bPct;
    regionalDetailsProps[r] = {
      total: regTot,
      borrowPct: bPct,
      cutPct: cPct,
      paidPct: pPct
    };
  });

  return {
    activePlayers: total,
    borrowedCount: borrowedCount,
    cutCount: cutCount,
    paidCount: paidCount,
    percentBorrowed: total > 0 ? Math.round((borrowedCount / total) * 100) : 0,
    percentCut: total > 0 ? Math.round((cutCount / total) * 100) : 0,
    percentPaid: total > 0 ? Math.round((paidCount / total) * 100) : 0,
    percentFracturedFloat: total > 0 ? Math.round((floatFracturedCount / total) * 100) : 0,
    regionalBorrowing: regionalBorrowingProps,
    regionalDetails: regionalDetailsProps
  };
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Presenter Registration
  socket.on("REGISTER_PRESENTER", () => {
    presenterSocketId = socket.id;
    const localIp = getLocalIpAddress();
    const port = process.env.PORT || 3000;
    const hostUrl = `http://${localIp}:${port}`;
    console.log("Presenter Registered:", socket.id, "| Wi-Fi LAN Host URL:", hostUrl);

    socket.emit("SERVER_CONFIG", {
      localIp: localIp,
      port: port,
      hostUrl: hostUrl
    });
    socket.emit("TELEMETRY_UPDATE", calculateTelemetry());
    socket.emit("PHASE_CHANGED", currentPhase);
  });

  // Player Registration with Server-Side Round-Robin 8 Scenario Dispatcher
  socket.on("REGISTER_PLAYER", (reqData) => {
    let reqScenarioIndex = reqData && reqData.scenarioId ? parseInt(reqData.scenarioId) - 1 : null;

    let scenario;
    if (reqScenarioIndex !== null && !isNaN(reqScenarioIndex) && reqScenarioIndex >= 0 && reqScenarioIndex < SCENARIOS.length) {
      scenario = SCENARIOS[reqScenarioIndex];
    } else {
      // Strict Round-Robin Dispatcher: Player 1 -> S1, Player 2 -> S2 ... Player 8 -> S8
      scenario = SCENARIOS[globalScenarioCounter % SCENARIOS.length];
      globalScenarioCounter++;
    }

    const startingFloat = getPersonaStartingFloat(scenario);

    players[socket.id] = {
      socketId: socket.id,
      scenario: scenario,
      regionKey: scenario.regionKey,
      startingFloat: startingFloat,
      currentFloat: startingFloat,
      totalSpent: 0,
      borrowCount: 0,
      cutCount: 0,
      decisions: {}
    };

    socket.emit("PERSONA_ASSIGNED", {
      scenario: scenario,
      startingFloat: startingFloat,
      phase: currentPhase
    });

    // Notify presenter of updated count
    io.emit("TELEMETRY_UPDATE", calculateTelemetry());
  });

  // Handle stage decisions
  socket.on("SUBMIT_STAGE_DECISION", (data) => {
    const player = players[socket.id];
    if (!player) return;

    const { stageId, choice, cost } = data; // choice: 'pay', 'borrow', 'cut', 'stipend'

    player.decisions[stageId] = choice;

    if (choice === "pay") {
      player.currentFloat -= cost;
      player.totalSpent += cost;
    } else if (choice === "borrow") {
      player.borrowCount++;
      player.totalSpent += cost;
    } else if (choice === "cut") {
      player.cutCount++;
    } else if (choice === "stipend") {
      player.totalSpent += Math.max(0, cost - (player.scenario.stipendAmount || 0));
    }

    // Broadcast updated telemetry to presenter
    io.emit("TELEMETRY_UPDATE", calculateTelemetry());
  });

  // Presenter phase & stage switcher
  socket.on("PRESENTER_SET_PHASE", (newPhase) => {
    currentPhase = newPhase;
    io.emit("PHASE_CHANGED", currentPhase);
  });

  socket.on("PRESENTER_SET_STAGE", (stageIdx) => {
    io.emit("ADVANCE_TO_STAGE", { stageIdx: stageIdx });
  });

  socket.on("PRESENTER_RESET", () => {
    players = {};
    globalScenarioCounter = 0;
    currentPhase = "PHASE_JOIN";
    io.emit("PHASE_CHANGED", currentPhase);
    io.emit("TELEMETRY_UPDATE", calculateTelemetry());
    io.emit("ADVANCE_TO_STAGE", { stageIdx: 0 });
  });

  socket.on("disconnect", () => {
    if (players[socket.id]) {
      delete players[socket.id];
      io.emit("TELEMETRY_UPDATE", calculateTelemetry());
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
