const STORAGE_KEY = "court94Teams";
const GAMES_STORAGE_KEY = "court94Games";
const teamStats = [
    {
        key: "offensiveRebounds",
        name: "Offensive Rebounds",
        description: "Track team offensive rebounds."
    },
    {
        key: "defensiveRebounds",
        name: "Defensive Rebounds",
        description: "Track team defensive rebounds."
    },
    {
    key: "turnovers",
    name: "Team Turnovers",
    description: "Track your team's turnovers."
},
{   
        key: "forcedTurnovers",
        name: "Forced Turnovers",
        description: "Turnovers created by your defense."
    },
    {
        key: "teamFouls",
        name: "Team Fouls",
        description: "Track total team fouls."
    },
    {
        key: "fieldGoals",
        name: "FGM, FGA and FG%",
        description: "Record makes and misses; Court94 calculates FG%."
    },
    {
    key: "threePointers",
    name: "3PM, 3PA and 3P%",
    description: "Record makes and misses; Court94 calculates 3P%."
},
    {
    key: "freeThrows",
    name: "FTM, FTA and FT%",
    description: "Record makes and misses; Court94 calculates FT%."
},
    {
        key: "paintTouches",
        name: "Paint Touches",
        description: "Track offensive possessions that reach the paint."
    },
    {
        key: "transitionPoints",
        name: "Transition Points",
        description: "Track points scored in transition."
    },
    {
        key: "opponentOffensiveRebounds",
        name: "Opp. Off Rebs",
        description: "Track second-chance opportunities allowed."
    }
];

const playerStats = [
    {
        key: "points",
        name: "Points",
        description: "Track player scoring."
    },
    {
        key: "assists",
        name: "Assists",
        description: "Track passes that directly create baskets."
    },
    {
        key: "steals",
        name: "Steals",
        description: "Track player steals."
    },
    {
        key: "blocks",
        name: "Blocks",
        description: "Track blocked shots."
    },
    {
        key: "fouls",
        name: "Fouls",
        description: "Track individual player fouls."
    },
    {
        key: "offensiveRebounds",
        name: "Offensive Rebounds",
        description: "Track individual offensive rebounds."
    },
    {
        key: "defensiveRebounds",
        name: "Defensive Rebounds",
        description: "Track individual defensive rebounds."
    },
    {
        key: "turnovers",
        name: "Turnovers",
        description: "Track individual player turnovers."
    }
];

let teams = loadTeams();
let savedGames = loadGames();
let editingTeamId = null;
let selectedTeamId = null;
let currentGameSetup = null;
let liveGameState = null;
let selectedLivePlayerId = null;
let pendingSubOutPlayerIds = [];
let pendingSubInPlayerIds = [];
let liveActionHistory = [];
let viewingSavedGame = false;
let editingLiveGameSetup = false;
const screens = {
    home: document.getElementById("homeScreen"),
    teams: document.getElementById("teamsScreen"),
    teamSetup: document.getElementById("teamSetupScreen"),
    teamDetails: document.getElementById("teamDetailsScreen"),
    newGame: document.getElementById("newGameScreen"),
gameConfirmation: document.getElementById("gameConfirmationScreen"),
liveGame: document.getElementById("liveGameScreen"),    
gameSummary: document.getElementById("gameSummaryScreen"),
games: document.getElementById("gamesScreen"),
    reports: document.getElementById("reportsScreen"),
    settings: document.getElementById("settingsScreen")
};

const backButton = document.getElementById("backButton");
const homeButton = document.getElementById("homeButton");
const teamsList = document.getElementById("teamsList");
const rosterEditor = document.getElementById("rosterEditor");
function loadGames() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(GAMES_STORAGE_KEY)
        );

        return Array.isArray(saved)
            ? saved
            : [];
    } catch (error) {
        console.error(
            "Court94 could not load games:",
            error
        );

        return [];
    }
}
function loadTeams() {
    try {
        const savedTeams = JSON.parse(localStorage.getItem(STORAGE_KEY));

        return Array.isArray(savedTeams)
            ? savedTeams
            : [];
    } catch (error) {
        console.error("Court94 could not load teams:", error);
        return [];
    }
}

function saveTeams() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(teams)
    );
}

function saveLiveGameState() {
    if (!liveGameState) {
        localStorage.removeItem("court94LiveGameRecovery");
        return;
    }

    const recoveryData = {
        liveGameState,
        liveActionHistory,
        selectedLivePlayerId,
        selectedTeamId,
        currentGameSetup
    };

    localStorage.setItem(
        "court94LiveGameRecovery",
        JSON.stringify(recoveryData)
    );
}

window.addEventListener("pagehide", () => {
    saveLiveGameState();
});

function showScreen(screenName) {
    console.log("SHOW SCREEN:", screenName);

    localStorage.setItem("court94CurrentScreen", screenName);
    Object.values(screens).forEach((screen) => {
        screen.classList.remove("activeScreen");
    });

    screens[screenName].classList.add("activeScreen");

    if (screenName === "home") {
    backButton.classList.add("hidden");
    homeButton.classList.add("hidden");
} else {
    backButton.classList.remove("hidden");
    homeButton.classList.remove("hidden");
}

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function createBlankPlayer() {
    return {
        id: crypto.randomUUID(),
        number: "",
        name: ""
    };
}

function createDefaultTeam() {
    return {
        id: crypto.randomUUID(),
        schoolName: "",
        teamName: "",
        season: "",
        roster: [
            createBlankPlayer(),
            createBlankPlayer(),
            createBlankPlayer(),
            createBlankPlayer(),
            createBlankPlayer()
        ],
        selectedTeamStats: [
            "offensiveRebounds",
            "defensiveRebounds",
            "forcedTurnovers",
            "transitionPoints",
            "opponentOffensiveRebounds"
        ],
        selectedPlayerStats: [
            "points",
            "assists",
            "steals",
            "blocks",
            "fouls"
        ]
    };
}

function renderStatChoices() {
    const teamStatChoices =
        document.getElementById("teamStatChoices");

    const playerStatChoices =
        document.getElementById("playerStatChoices");

    teamStatChoices.innerHTML = teamStats
        .map((stat) => {
            return `
                <label class="statChoice">
                    <input
                        type="checkbox"
                        data-team-stat="${stat.key}"
                    >

                    <span>
                        <strong>${stat.name}</strong>
                        <small>${stat.description}</small>
                    </span>
                </label>
            `;
        })
        .join("");

    playerStatChoices.innerHTML = playerStats
        .map((stat) => {
            return `
                <label class="statChoice">
                    <input
                        type="checkbox"
                        data-player-stat="${stat.key}"
                    >

                    <span>
                        <strong>${stat.name}</strong>
                        <small>${stat.description}</small>
                    </span>
                </label>
            `;
        })
        .join("");
}

function renderRosterEditor(roster) {
    rosterEditor.innerHTML = roster
        .map((player, index) => {
            return `
                <div class="rosterRow" data-player-row="${player.id}">
                    <input
                        type="text"
                        inputmode="numeric"
                        placeholder="#"
                        aria-label="Jersey number"
                        data-player-number
                        value="${player.number}"
                    >

                    <input
                        type="text"
                        placeholder="Player name"
                        aria-label="Player name"
                        data-player-name
                        value="${player.name}"
                    >
<label class="keepAtTopOption">
    <input
        type="checkbox"
        data-player-keep-at-top
        ${player.keepAtTop ? "checked" : ""}
    >
    <span>Starter</span>
</label>
                    <button
                        class="removePlayerButton"
                        type="button"
                        data-remove-player="${index}"
                    >
                        Delete Player
                    </button>
                </div>
            `;
        })
        .join("");

    document
        .querySelectorAll("[data-remove-player]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const row = button.closest(".rosterRow");

                if (rosterEditor.children.length === 1) {
                    alert("A team must have at least one roster row.");
                    return;
                }

                row.remove();
            });
        });
}

function openNewTeamForm() {
    editingTeamId = null;

    const newTeam = createDefaultTeam();

    document.getElementById("teamSetupTitle").textContent =
        "Create Team";

    document.getElementById("schoolNameInput").value = "";
    document.getElementById("teamNameInput").value = "";
    document.getElementById("seasonInput").value = "";

    renderRosterEditor(newTeam.roster);
    setSelectedStats(newTeam);

    showScreen("teamSetup");
}

function openEditTeamForm(teamId) {
    const team = teams.find(
        (savedTeam) => savedTeam.id === teamId
    );

    if (!team) {
        return;
    }

    editingTeamId = teamId;

    document.getElementById("teamSetupTitle").textContent =
        "Edit Team";

    document.getElementById("schoolNameInput").value =
        team.schoolName || "";

    document.getElementById("teamNameInput").value =
        team.teamName || "";

    document.getElementById("seasonInput").value =
        team.season || "";

    renderRosterEditor(team.roster);
    setSelectedStats(team);

    showScreen("teamSetup");
}

function setSelectedStats(team) {team.selectedTeamStats = [
    ...new Set(team.selectedTeamStats || [])
];

team.selectedPlayerStats = [
    ...new Set(team.selectedPlayerStats || [])
];
    document
        .querySelectorAll("[data-team-stat]")
        .forEach((checkbox) => {
            checkbox.checked =
                team.selectedTeamStats.includes(
                    checkbox.dataset.teamStat
                );
        });

    document
        .querySelectorAll("[data-player-stat]")
        .forEach((checkbox) => {
            checkbox.checked =
                team.selectedPlayerStats.includes(
                    checkbox.dataset.playerStat
                );
        });
}

function renderGameStatChoices(
    team,
    teamStatSelections = null,
    playerStatSelections = null
) {
    const gameTeamStatChoices =
        document.getElementById("gameTeamStatChoices");

    const gamePlayerStatChoices =
        document.getElementById("gamePlayerStatChoices");

    if (!gameTeamStatChoices || !gamePlayerStatChoices || !team) {
        return;
    }

    const selectedTeamStats = [
    ...new Set(
        teamStatSelections ??
        team.selectedTeamStats ??
        []
    )
];

const selectedPlayerStats = [
    ...new Set(
        playerStatSelections ??
        team.selectedPlayerStats ??
        []
    )
];
    gameTeamStatChoices.innerHTML = teamStats
        .map((stat) => {
            const isChecked =
                selectedTeamStats.includes(stat.key);

            return `
                <label class="gameStatChoice">
                    <input
                        type="checkbox"
                        data-game-team-stat="${stat.key}"
                        ${isChecked ? "checked" : ""}
                    >
                    <span>${stat.name}</span>
                </label>
            `;
        })
        .join("");

    gamePlayerStatChoices.innerHTML = playerStats
        .map((stat) => {
            const isChecked =
                selectedPlayerStats.includes(stat.key);

            return `
                <label class="gameStatChoice">
                    <input
                        type="checkbox"
                        data-game-player-stat="${stat.key}"
                        ${isChecked ? "checked" : ""}
                    >
                    <span>${stat.name}</span>
                </label>
            `;
        })
        .join("");
}

function collectRoster() {
    return [...document.querySelectorAll(".rosterRow")]
        .map((row) => {
            return {
    id: row.dataset.playerRow,
    number:
        row.querySelector("[data-player-number]").value.trim(),
    name:
        row.querySelector("[data-player-name]").value.trim(),
    keepAtTop:
    row.querySelector(
        "[data-player-keep-at-top]"
    )?.checked || false
};
        })
        .filter((player) => {
            return player.number || player.name;
        });
}

function collectSelectedStats(selector, dataName) {
    const selectedStats = [...document.querySelectorAll(selector)]
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.dataset[dataName]);

    return [...new Set(selectedStats)];
}

function saveTeamFromForm(event) {
    event.preventDefault();

    const teamName =
        document
            .getElementById("teamNameInput")
            .value
            .trim();

    if (!teamName) {
        alert("Please enter a team name.");
        return;
    }

    const roster = collectRoster();

    if (roster.length === 0) {
        alert("Please add at least one player.");
        return;
    }

    const selectedTeamStats = collectSelectedStats(
        "[data-team-stat]",
        "teamStat"
    );

    const selectedPlayerStats = collectSelectedStats(
        "[data-player-stat]",
        "playerStat"
    );

    if (
        selectedTeamStats.length === 0 &&
        selectedPlayerStats.length === 0
    ) {
        alert("Please select at least one statistic.");
        return;
    }

    const teamData = {
        id:
            editingTeamId ||
            crypto.randomUUID(),

        schoolName:
            document
                .getElementById("schoolNameInput")
                .value
                .trim(),

        teamName,

        season:
            document
                .getElementById("seasonInput")
                .value
                .trim(),

        roster,
        selectedTeamStats,
        selectedPlayerStats
    };

    if (editingTeamId) {
        teams = teams.map((team) => {
            return team.id === editingTeamId
                ? teamData
                : team;
        });
    } else {
        teams.push(teamData);
    }

    saveTeams();
    renderTeams();
    showScreen("teams");
}function getSelectedTeam() {
    return teams.find(
        (team) => team.id === selectedTeamId
    );
}

function updateAppTeamBadge() {
    const badge =
        document.getElementById("appTeamBadge");

    if (!badge) {
        return;
    }

    const team = getSelectedTeam();

    if (!team) {
        badge.textContent = "YOUR TEAM";
        return;
    }

    const teamLabel = [
        team.schoolName,
        team.teamName
    ]
        .filter(Boolean)
        .join(" — ");

    badge.textContent =
        teamLabel || "YOUR TEAM";
}

function createEmptyStatObject(statKeys) {
    const statObject = {};

    statKeys.forEach((statKey) => {
        if (
    statKey === "fieldGoals" ||
    statKey === "threePointers" ||
    statKey === "freeThrows"
) {
            statObject[statKey] = {
                made: 0,
                attempted: 0
            };
        } else {
            statObject[statKey] = 0;
        }
    });

    return statObject;
}

function saveLiveGameSetupChanges() {
    if (!liveGameState) {
        return;
    }

    const team = getSelectedTeam();

    if (!team) {
        return;
    }

    const gameStarters = Array.from(
        document.querySelectorAll(
            ".gameStarterCheckbox:checked"
        )
    ).map((checkbox) => checkbox.dataset.playerId);

    if (gameStarters.length !== 5) {
        alert("Please select exactly 5 starters.");
        return;
    }

    const selectedGameTeamStats = Array.from(
        document.querySelectorAll(
            "[data-game-team-stat]:checked"
        )
    ).map(
        (checkbox) => checkbox.dataset.gameTeamStat
    );

    const selectedGamePlayerStats = Array.from(
        document.querySelectorAll(
            "[data-game-player-stat]:checked"
        )
    ).map(
        (checkbox) => checkbox.dataset.gamePlayerStat
    );

    liveGameState.gameStarters = gameStarters;
    liveGameState.selectedTeamStats =
        selectedGameTeamStats;
    liveGameState.selectedPlayerStats =
        selectedGamePlayerStats;

    selectedGameTeamStats.forEach((statKey) => {
        if (
            liveGameState.teamStats[statKey] ===
            undefined
        ) {
            liveGameState.teamStats[statKey] =
                createEmptyStatObject([statKey])[statKey];
        }
    });

    Object.values(
        liveGameState.teamStatsByPeriod || {}
    ).forEach((periodStats) => {
        selectedGameTeamStats.forEach((statKey) => {
            if (periodStats[statKey] === undefined) {
                periodStats[statKey] =
                    createEmptyStatObject(
                        [statKey]
                    )[statKey];
            }
        });
    });

    team.roster.forEach((player) => {
        if (!liveGameState.playerStatsById[player.id]) {
            liveGameState.playerStatsById[player.id] = {
                points: 0
            };
        }

        selectedGamePlayerStats.forEach((statKey) => {
            if (
                liveGameState.playerStatsById[player.id][
                    statKey
                ] === undefined
            ) {
                liveGameState.playerStatsById[player.id][
                    statKey
                ] = 0;
            }
        });
    });

    Object.values(
        liveGameState.playerStatsByPeriod || {}
    ).forEach((periodPlayers) => {
        team.roster.forEach((player) => {
            if (!periodPlayers[player.id]) {
                periodPlayers[player.id] = {
                    points: 0
                };
            }

            selectedGamePlayerStats.forEach(
                (statKey) => {
                    if (
                        periodPlayers[player.id][
                            statKey
                        ] === undefined
                    ) {
                        periodPlayers[player.id][
                            statKey
                        ] = 0;
                    }
                }
            );
        });
    });

    editingLiveGameSetup = false;

    renderLiveGame();
    saveLiveGameState();
    showScreen("liveGame");
}

function startLiveGame() {
    const team = getSelectedTeam();

    if (!team || !currentGameSetup) {
        return;
    }

    const gameStarters = Array.from(
    document.querySelectorAll(
        ".gameStarterCheckbox:checked"
    )
).map((checkbox) => checkbox.dataset.playerId);

if (gameStarters.length !== 5) {
    alert("Please select exactly 5 starters.");
    return;
}

    selectedLivePlayerId =
        team.roster.length > 0
            ? team.roster[0].id
            : null;

    liveActionHistory = [];

    const selectedGameTeamStats = Array.from(
    document.querySelectorAll(
        "[data-game-team-stat]:checked"
    )
).map(
    (checkbox) => checkbox.dataset.gameTeamStat
);

const selectedGamePlayerStats = Array.from(
    document.querySelectorAll(
        "[data-game-player-stat]:checked"
    )
).map(
    (checkbox) => checkbox.dataset.gamePlayerStat
);

    const playerStatsById = {};

    team.roster.forEach((player) => {
        playerStatsById[player.id] =
            createEmptyStatObject(
                selectedGamePlayerStats
            );

        playerStatsById[player.id].points = 0;
    });

    liveGameState = {
        ...currentGameSetup,

        gameStarters,
currentFive: [...gameStarters],
playerDisplayOrder: [
    ...gameStarters,
    ...team.roster
        .filter((player) => !gameStarters.includes(player.id))
        .map((player) => player.id)
],

        selectedTeamStats: selectedGameTeamStats,
selectedPlayerStats: selectedGamePlayerStats,

        teamStats:
            createEmptyStatObject(
                selectedGameTeamStats
            ),

        playerStatsById,
        
        teamStatsByPeriod: {},
playerStatsByPeriod: {},

       period:
    currentGameSetup.gameFormat === "Halves"
        ? "1st Half"
        : "Q1"
    };

    liveGameState.teamStatsByPeriod[
    liveGameState.period
] = createEmptyStatObject(
    selectedGameTeamStats
);

liveGameState.playerStatsByPeriod[
    liveGameState.period
] = {};

team.roster.forEach((player) => {
    liveGameState.playerStatsByPeriod[
        liveGameState.period
    ][player.id] = createEmptyStatObject(
        selectedGamePlayerStats
    );

    liveGameState.playerStatsByPeriod[
        liveGameState.period
    ][player.id].points = 0;
});

    renderLiveGame();
    showScreen("liveGame");
}

function renderLiveGame() {
    const team = getSelectedTeam();

    if (!team || !liveGameState) {
        return;
    }

    document.getElementById(
        "liveGameMatchup"
    ).textContent =
        `${team.teamName} vs ${liveGameState.opponent}`;

    document.getElementById(
        "liveGameDetails"
    ).textContent =
        `${liveGameState.gameType} · ${liveGameState.location}`;

    const periodSelect =
    document.getElementById("livePeriodSelect");

if (liveGameState.gameFormat === "Halves") {
    periodSelect.innerHTML = `
        <option value="1st Half">1st Half</option>
        <option value="2nd Half">2nd Half</option>
        <option value="OT">OT</option>
    `;
} else {
    periodSelect.innerHTML = `
        <option value="Q1">Q1</option>
        <option value="Q2">Q2</option>
        <option value="Q3">Q3</option>
        <option value="Q4">Q4</option>
        <option value="OT">OT</option>
    `;
}

periodSelect.value = liveGameState.period;

    renderPlayerBench();
    connectPlayerCardButtons();
    renderPlayerStatButtons();
    renderTeamStatButtons();
    updateLiveTeamPointTotal();
    renderLastAction();
}

function renderPlayerBench() {
    connectPlayerCardButtons();
    const team = getSelectedTeam();

    const playerBench =
        document.getElementById("playerBench");

    const uniquePlayerStats = [
    ...new Set(
        liveGameState?.selectedPlayerStats ||
        team.selectedPlayerStats ||
        []
    )
];
const currentFive =
    liveGameState?.currentFive || [];

if (!liveGameState.playerDisplayOrder) {
    liveGameState.playerDisplayOrder = [
        ...currentFive,
        ...team.roster
            .filter(
                (player) =>
                    !currentFive.includes(player.id)
            )
            .map((player) => player.id)
    ];
}

const sortedRoster =
    liveGameState.playerDisplayOrder
        .map((playerId) =>
            team.roster.find(
                (player) => player.id === playerId
            )
        )
        .filter(Boolean);
    playerBench.innerHTML = sortedRoster
        .map((player, index) => {
            const points =
                getPlayerStatTotal(
                    player.id,
                    "points"
                );

            const statButtons =
                uniquePlayerStats
                    .filter(
                        (statKey) =>
                            statKey !== "points"
                    )
                    .map((statKey) => {
                        const stat =
                            playerStats.find(
                                (item) =>
                                    item.key === statKey
                            );

                        if (!stat) {
                            return "";
                        }

                        return `
                            <button
    class="playerCardStatButton"
    type="button"
    data-card-player-stat="${statKey}"
    data-card-player-id="${player.id}"
>
    <span>${stat.name}</span>

    <strong>
        ${getPlayerStatTotal(
            player.id,
            statKey
        )}
    </strong>
</button>
                        `;
                    })
                    .join("");

            return `
                <article
                    class="playerCard"
                    data-player-card="${player.id}"
                >

                    <div class="playerCardHeader">

                        <div>
                            <span class="playerCardNumber">
                                #${player.number || "—"}
                            </span>

                            <strong class="playerCardName">
                                ${player.name || "Unnamed"}
                            </strong>
                        </div>

                        <button
    class="playerSubButton"
    type="button"
    data-sub-player-id="${player.id}"
    data-sub-action="${
        currentFive.includes(player.id) ? "out" : "in"
    }"
>
    ${
        currentFive.includes(player.id)
            ? "SUB OUT"
            : "SUB IN"
    }
</button>
                        <div class="playerCardPoints">
                            <strong>${points}</strong>
                            <span>PTS</span>
                        </div>

                    </div>

                    ${
                        uniquePlayerStats.includes("points")
                            ? `
                                <div class="playerCardScoring">

                                    <button
                                        class="playerCardPointButton"
                                        type="button"
                                        data-card-player-points="1"
                                        data-card-player-id="${player.id}"
                                    >
                                        +1
                                    </button>

                                    <button
                                        class="playerCardPointButton"
                                        type="button"
                                        data-card-player-points="2"
                                        data-card-player-id="${player.id}"
                                    >
                                        +2
                                    </button>

                                    <button
                                        class="playerCardPointButton"
                                        type="button"
                                        data-card-player-points="3"
                                        data-card-player-id="${player.id}"
                                    >
                                        +3
                                    </button>

                                </div>
                            `
                            : ""
                    }

                    <div class="playerCardStats">
                        ${statButtons}
                    </div>

                    <button
                        class="playerCardUndoButton"
                        type="button"
                        data-card-player-undo="${player.id}"
                    >
                        ↶ Undo
                    </button>

             </article>

${index === 4 ? `<div class="benchDivider">BENCH</div>` : ""}
`;
        })
        .join("");
}

function updateLiveTeamPointTotal() {
    const totalElement =
        document.getElementById("liveTeamPointTotal");

    if (!totalElement || !liveGameState) {
        return;
    }

    const totalPoints =
        Object.values(
            liveGameState.playerStatsById || {}
        ).reduce(
            (sum, playerStats) =>
                sum + (playerStats.points || 0),
            0
        );

    totalElement.textContent = totalPoints;
}
function connectPlayerCardButtons() {
    document
        .querySelectorAll("[data-card-player-points]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                selectedLivePlayerId =
                    button.dataset.cardPlayerId;

                recordPlayerPoints(
                    Number(
                        button.dataset.cardPlayerPoints
                    )
                );

                renderPlayerBench();
                connectPlayerCardButtons();
            });
        });

    document
        .querySelectorAll("[data-card-player-stat]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                selectedLivePlayerId =
                    button.dataset.cardPlayerId;

                recordPlayerStat(
                    button.dataset.cardPlayerStat
                );

                renderPlayerBench();
                connectPlayerCardButtons();
            });
        });
        document
    .querySelectorAll("[data-card-player-undo]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            undoLastPlayerAction(
                button.dataset.cardPlayerUndo
            );
        });
    });
    document
    .querySelectorAll(".playerSubButton")
    .forEach((button) => {
        const playerId = String(button.dataset.subPlayerId);
        const action = button.dataset.subAction;

        if (
            (action === "out" &&
                pendingSubOutPlayerIds.includes(playerId)) ||
            (action === "in" &&
                pendingSubInPlayerIds.includes(playerId))
        ) {
            button.classList.add("pendingSubButton");
        }

        button.addEventListener("click", () => {
            if (action === "out") {
                if (pendingSubOutPlayerIds.includes(playerId)) {
                    pendingSubOutPlayerIds =
                        pendingSubOutPlayerIds.filter(
                            (id) => id !== playerId
                        );
                } else {
                    pendingSubOutPlayerIds.push(playerId);
                }
            }

            if (action === "in") {
                if (pendingSubInPlayerIds.includes(playerId)) {
                    pendingSubInPlayerIds =
                        pendingSubInPlayerIds.filter(
                            (id) => id !== playerId
                        );
                } else {
                    pendingSubInPlayerIds.push(playerId);
                }
            }

            while (
                pendingSubOutPlayerIds.length > 0 &&
                pendingSubInPlayerIds.length > 0
            ) {
                const outPlayerId =
                    pendingSubOutPlayerIds.shift();

                const inPlayerId =
                    pendingSubInPlayerIds.shift();

                const currentFiveIndex =
                    liveGameState.currentFive.findIndex(
                        (id) =>
                            String(id) === String(outPlayerId)
                    );

                if (currentFiveIndex !== -1) {
                    const incomingDisplayId =
                        liveGameState.playerDisplayOrder.find(
                            (id) =>
                                String(id) === String(inPlayerId)
                        );

                    if (incomingDisplayId !== undefined) {
                        liveGameState.currentFive[
                            currentFiveIndex
                        ] = incomingDisplayId;
                    }
                }

                const outDisplayIndex =
                    liveGameState.playerDisplayOrder.findIndex(
                        (id) =>
                            String(id) === String(outPlayerId)
                    );

                const inDisplayIndex =
                    liveGameState.playerDisplayOrder.findIndex(
                        (id) =>
                            String(id) === String(inPlayerId)
                    );

                if (
                    outDisplayIndex !== -1 &&
                    inDisplayIndex !== -1
                ) {
                    [
                        liveGameState.playerDisplayOrder[
                            outDisplayIndex
                        ],
                        liveGameState.playerDisplayOrder[
                            inDisplayIndex
                        ]
                    ] = [
                        liveGameState.playerDisplayOrder[
                            inDisplayIndex
                        ],
                        liveGameState.playerDisplayOrder[
                            outDisplayIndex
                        ]
                    ];
                }
            }

            renderPlayerBench();
            connectPlayerCardButtons();
            saveLiveGameState();
        });
    });
}
function getPlayerStatTotal(playerId, statKey) {
    const playerStats =
        liveGameState.playerStatsById[playerId];

    if (!playerStats) {
        return 0;
    }

    return playerStats[statKey] || 0;
}

function formatShootingStat(statValue) {
    if (
        !statValue ||
        typeof statValue !== "object"
    ) {
        return "0 / 0 · 0%";
    }

    const made =
        Number(statValue.made) || 0;

    const attempted =
        Number(statValue.attempted) || 0;

    const percentage =
        attempted > 0
            ? Math.round(
                (made / attempted) * 100
            )
            : 0;

    return `
    <div class="shootingStatValue">
        <div>${made} / ${attempted}</div>
        <div>${percentage}%</div>
    </div>
`;
}

function getTeamStatTotal(statKey) {
    const statValue =
        liveGameState.teamStats[statKey];

    if (
    statKey === "fieldGoals" ||
    statKey === "threePointers" ||
    statKey === "freeThrows"
) {
        return formatShootingStat(statValue);
    }

    return statValue || 0;
}

function renderPlayerStatButtons() {
    const team = getSelectedTeam();

    const selectedPlayer =
        team.roster.find(
            (player) =>
                player.id === selectedLivePlayerId
        );

    const selectedPlayerName =
        document.getElementById(
            "selectedPlayerName"
        );

    const container =
        document.getElementById(
            "playerStatButtons"
        );

    if (!selectedPlayer) {
        selectedPlayerName.textContent =
            "Select a player";

        container.innerHTML = "";
        return;
    }

    selectedPlayerName.textContent =
        `#${selectedPlayer.number || "—"} ${selectedPlayer.name}`;

    const uniquePlayerStats =
        [...new Set(team.selectedPlayerStats)];

    let buttonHtml = "";

    if (
        uniquePlayerStats.includes("points")
    ) {
        const totalPoints =
            getPlayerStatTotal(
                selectedPlayer.id,
                "points"
            );

        buttonHtml += `
            <div class="playerPointsCard">

                <div class="playerPointsHeading">
                    <span>POINTS</span>
                    <strong>${totalPoints}</strong>
                </div>

                <div class="playerPointsButtons">

                    <button
                        class="pointsAddButton"
                        type="button"
                        data-player-points="1"
                    >
                        +1
                    </button>

                    <button
                        class="pointsAddButton"
                        type="button"
                        data-player-points="2"
                    >
                        +2
                    </button>

                    <button
                        class="pointsAddButton"
                        type="button"
                        data-player-points="3"
                    >
                        +3
                    </button>

                </div>

            </div>
        `;
    }

    uniquePlayerStats
        .filter((statKey) => statKey !== "points")
        .forEach((statKey) => {
            const stat = playerStats.find(
                (item) => item.key === statKey
            );

            if (!stat) {
                return;
            }

            buttonHtml += `
                <button
                    class="liveStatButton"
                    type="button"
                    data-player-stat="${statKey}"
                >
                    <span class="liveStatButtonName">
                        ${stat.name}
                    </span>

                    <span class="liveStatButtonTotal">
                        ${getPlayerStatTotal(
                            selectedPlayer.id,
                            statKey
                        )}
                    </span>
                </button>
            `;
        });

    container.innerHTML = buttonHtml;

    document
        .querySelectorAll("[data-player-points]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                recordPlayerPoints(
                    Number(button.dataset.playerPoints)
                );
            });
        });

    document
        .querySelectorAll("[data-player-stat]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                recordPlayerStat(
                    button.dataset.playerStat
                );
            });
        });
}
function renderTeamStatButtons() {
    const team = getSelectedTeam();

    const container =
        document.getElementById("teamStatButtons");

    const uniqueTeamStats = [
    ...new Set(
        liveGameState.selectedTeamStats ||
        team.selectedTeamStats ||
        []
    )
];

    const regularStats =
    uniqueTeamStats.filter(
        (statKey) =>
            statKey !== "transitionPoints" &&
            statKey !== "fieldGoals" &&
            statKey !== "threePointers" &&
            statKey !== "freeThrows"
    );

const hasFieldGoals =
    uniqueTeamStats.includes("fieldGoals");

    const hasThreePointers =
    uniqueTeamStats.includes("threePointers");

const hasFreeThrows =
    uniqueTeamStats.includes("freeThrows");

    const hasTransition =
        uniqueTeamStats.includes("transitionPoints");

    const cardColors = [
    "teamStatBlue"
];

    const regularCards = regularStats
        .map((statKey, index) => {
            const stat = teamStats.find(
                (item) => item.key === statKey
            );

            if (!stat) {
                return "";
            }

            const colorClass =
                cardColors[index % cardColors.length];

            return `
                <div
                    class="teamStatCard ${colorClass}"
                    data-team-stat-card="${statKey}"
                >
                    <div class="teamStatCardName">
                        ${stat.name}
                    </div>

                    <div class="teamStatCardTotal">
                        ${getTeamStatTotal(statKey)}
                    </div>

                    <div class="teamStatCardControls">

                        <button
                            type="button"
                            class="teamStatMinusButton"
                            data-team-stat-minus="${statKey}"
                        >
                            −1
                        </button>

                        <button
                            type="button"
                            class="teamStatPlusButton"
                            data-team-stat-plus="${statKey}"
                        >
                            +1
                        </button>

                    </div>
                </div>
            `;
        })
        .join("");

    const transitionCard = hasTransition
        ? `
            <div class="transitionPointsCard">

                <div class="transitionPointsHeader">
                    <span>Transition Points</span>

                    <strong>
                        ${getTeamStatTotal(
                            "transitionPoints"
                        )}
                    </strong>
                </div>

                <div class="transitionPointsButtons">

                    <button
                        type="button"
                        class="transitionUndoButton"
                        data-transition-undo
                    >
                        Undo
                    </button>

                    <button
                        type="button"
                        class="transitionAddButton"
                        data-transition-points="1"
                    >
                        +1
                    </button>

                    <button
                        type="button"
                        class="transitionAddButton"
                        data-transition-points="2"
                    >
                        +2
                    </button>

                    <button
                        type="button"
                        class="transitionAddButton"
                        data-transition-points="3"
                    >
                        +3
                    </button>

                </div>
            </div>
        `
        : "";

        const fieldGoalCard = hasFieldGoals
    ? (() => {
        const fieldGoals =
            liveGameState.teamStats.fieldGoals || {
                made: 0,
                attempted: 0
            };

        const made = fieldGoals.made || 0;
        const attempted = fieldGoals.attempted || 0;

        const percentage =
            attempted > 0
                ? Math.round((made / attempted) * 100)
                : 0;

        return `
            <div class="teamStatCard fieldGoalCard">
                <div class="teamStatCardName">
                    FGM, FGA AND FG%
                </div>

                <div class="teamStatCardTotal">
                    ${made} / ${attempted}
<br>
${percentage}%
                </div>

                <div class="teamStatCardControls">
                    <button
                        type="button"
                        class="teamStatMinusButton"
                        data-field-goal-result="miss"
                    >
                        MISS
                    </button>

                    <button
    type="button"
    class="teamStatUndoButton"
    data-shooting-undo="fieldGoals"
>
    UNDO
</button>

                    <button
                        type="button"
                        class="teamStatPlusButton"
                        data-field-goal-result="make"
                    >
                        MAKE
                    </button>
                </div>
            </div>
        `;
    })()
    : "";

const threePointerCard = hasThreePointers
    ? (() => {
        const threePointers =
            liveGameState.teamStats.threePointers || {
                made: 0,
                attempted: 0
            };

        const made = threePointers.made || 0;
        const attempted = threePointers.attempted || 0;

        const percentage =
            attempted > 0
                ? Math.round((made / attempted) * 100)
                : 0;

        return `
            <div class="teamStatCard teamStatBlue threePointerCard">
                <div class="teamStatCardName">
                    3PM, 3PA AND 3P%
                </div>

                <div class="teamStatCardTotal">
                    ${made} / ${attempted}
                    <br>
                    ${percentage}%
                </div>

                <div class="teamStatCardControls">
                    <button
                        type="button"
                        class="teamStatMinusButton"
                        data-three-pointer-result="miss"
                    >
                        MISS
                    </button>

                    <button
                        type="button"
                        class="teamStatUndoButton"
                        data-shooting-undo="threePointers"
                    >
                        UNDO
                    </button>

                    <button
                        type="button"
                        class="teamStatPlusButton"
                        data-three-pointer-result="make"
                    >
                        MAKE
                    </button>
                </div>
            </div>
        `;
    })()
    : "";

    const freeThrowCard = hasFreeThrows
    ? (() => {
        const freeThrows =
            liveGameState.teamStats.freeThrows || {
                made: 0,
                attempted: 0
            };

        const made = freeThrows.made || 0;
        const attempted = freeThrows.attempted || 0;

        const percentage =
            attempted > 0
                ? Math.round((made / attempted) * 100)
                : 0;

        return `
            <div class="teamStatCard freeThrowCard">
                <div class="teamStatCardName">
                    FTM, FTA AND FT%
                </div>

                <div class="teamStatCardTotal">
                    ${made} / ${attempted}
<br>
${percentage}%
                </div>

                <div class="teamStatCardControls">
                    <button
                        type="button"
                        class="teamStatMinusButton"
                        data-free-throw-result="miss"
                    >
                        MISS
                    </button>

                    <button
    type="button"
    class="teamStatUndoButton"
    data-shooting-undo="freeThrows"
>
    UNDO
</button>

                    <button
                        type="button"
                        class="teamStatPlusButton"
                        data-free-throw-result="make"
                    >
                        MAKE
                    </button>
                </div>
            </div>
        `;
    })()
    : "";

    container.innerHTML = `
        <div class="teamStatCardGrid">
    ${regularCards}
${fieldGoalCard}
${threePointerCard}
${freeThrowCard}
</div>

        ${transitionCard}
    `;

    document
        .querySelectorAll("[data-team-stat-plus]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                recordTeamStat(
                    button.dataset.teamStatPlus
                );
            });
        });

        document
    .querySelectorAll("[data-team-stat-minus]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            recordTeamStat(
                button.dataset.teamStatMinus,
                -1
            );
        });
    });

    document
    .querySelectorAll("[data-field-goal-result]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            recordShootingResult(
                "fieldGoals",
                button.dataset.fieldGoalResult
            );
        });
    });

    document
    .querySelectorAll("[data-three-pointer-result]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            recordShootingResult(
                "threePointers",
                button.dataset.threePointerResult
            );
        });
    });

    document
    .querySelectorAll("[data-free-throw-result]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            recordShootingResult(
                "freeThrows",
                button.dataset.freeThrowResult
            );
        });
    });

    document
    .querySelectorAll("[data-shooting-undo]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            undoShootingResult(
                button.dataset.shootingUndo
            );
        });
    });

    document
        .querySelectorAll("[data-transition-points]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                recordTransitionPoints(
                    Number(
                        button.dataset.transitionPoints
                    )
                );
            });
        });

        document
    .querySelector("[data-transition-undo]")
    ?.addEventListener("click", () => {
        for (let i = liveActionHistory.length - 1; i >= 0; i--) {
            const action = liveActionHistory[i];

            if (action.type === "transitionPoints") {
                liveGameState.teamStats.transitionPoints =
                    Math.max(
                        0,
                        (liveGameState.teamStats.transitionPoints || 0) -
                            action.amount
                    );

                    const actionPeriod =
    action.period || liveGameState.period;

if (
    liveGameState.teamStatsByPeriod[
        actionPeriod
    ]
) {
    liveGameState.teamStatsByPeriod[
        actionPeriod
    ].transitionPoints =
        Math.max(
            0,
            (
                liveGameState.teamStatsByPeriod[
                    actionPeriod
                ].transitionPoints || 0
            ) - action.amount
        );
}

                liveActionHistory.splice(i, 1);
                renderTeamStatButtons();
                return;
            }
        }
    });
}
function recordPlayerPoints(points) {
    const team = getSelectedTeam();

    const player = team.roster.find(
        (item) =>
            item.id === selectedLivePlayerId
    );

    if (!player) {
        return;
    }

    const playerState =
        liveGameState.playerStatsById[
            selectedLivePlayerId
        ];

    playerState.points =
        (playerState.points || 0) + points;

        const currentPeriod =
    liveGameState.period;

const periodPlayerState =
    liveGameState.playerStatsByPeriod[
        currentPeriod
    ][selectedLivePlayerId];

periodPlayerState.points =
    (periodPlayerState.points || 0) + points;

    // Link Player +1 Point to Team Free Throw Make
if (points === 1) {
    if (
        !liveGameState.teamStats.freeThrows ||
        typeof liveGameState.teamStats.freeThrows !== "object"
    ) {
        liveGameState.teamStats.freeThrows = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStats.freeThrows.attempted += 1;
    liveGameState.teamStats.freeThrows.made += 1;

    if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
        liveGameState.teamStatsByPeriod[currentPeriod] = {};
    }

    if (
        !liveGameState.teamStatsByPeriod[currentPeriod].freeThrows ||
        typeof liveGameState.teamStatsByPeriod[currentPeriod].freeThrows !== "object"
    ) {
        liveGameState.teamStatsByPeriod[currentPeriod].freeThrows = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStatsByPeriod[currentPeriod].freeThrows.attempted += 1;
    liveGameState.teamStatsByPeriod[currentPeriod].freeThrows.made += 1;
}   

// Link Player +2 Points to Team Field Goal Make
if (points === 2) {
    if (
        !liveGameState.teamStats.fieldGoals ||
        typeof liveGameState.teamStats.fieldGoals !== "object"
    ) {
        liveGameState.teamStats.fieldGoals = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStats.fieldGoals.attempted += 1;
    liveGameState.teamStats.fieldGoals.made += 1;

    if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
        liveGameState.teamStatsByPeriod[currentPeriod] = {};
    }

    if (
        !liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals ||
        typeof liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals !== "object"
    ) {
        liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals.attempted += 1;
    liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals.made += 1;
}

// Link Player +3 Points to Team 3-Point Make
if (points === 3) {

    // A made 3-pointer also counts as a made field goal
if (
    !liveGameState.teamStats.fieldGoals ||
    typeof liveGameState.teamStats.fieldGoals !== "object"
) {
    liveGameState.teamStats.fieldGoals = {
        made: 0,
        attempted: 0
    };
}

liveGameState.teamStats.fieldGoals.attempted += 1;
liveGameState.teamStats.fieldGoals.made += 1;

if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
    liveGameState.teamStatsByPeriod[currentPeriod] = {};
}

if (
    !liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals ||
    typeof liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals !== "object"
) {
    liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals = {
        made: 0,
        attempted: 0
    };
}

liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals.attempted += 1;
liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals.made += 1;
    if (
        !liveGameState.teamStats.threePointers ||
        typeof liveGameState.teamStats.threePointers !== "object"
    ) {
        liveGameState.teamStats.threePointers = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStats.threePointers.attempted += 1;
    liveGameState.teamStats.threePointers.made += 1;

    if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
        liveGameState.teamStatsByPeriod[currentPeriod] = {};
    }

    if (
        !liveGameState.teamStatsByPeriod[currentPeriod].threePointers ||
        typeof liveGameState.teamStatsByPeriod[currentPeriod].threePointers !== "object"
    ) {
        liveGameState.teamStatsByPeriod[currentPeriod].threePointers = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStatsByPeriod[currentPeriod].threePointers.attempted += 1;
    liveGameState.teamStatsByPeriod[currentPeriod].threePointers.made += 1;
}

    liveActionHistory.push({
        type: "playerPoints",
        playerId: player.id,
        amount: points,
        linkedTeamStat:
    points === 2
        ? "fieldGoals"
        : points === 3
        ? "threePointers"
        : null,
        period: liveGameState.period,
        description:
            `#${player.number || "—"} ${player.name} — +${points} Point${
                points === 1 ? "" : "s"
            }`
    });

    renderPlayerBench();
renderPlayerStatButtons();
renderTeamStatButtons();
updateLiveTeamPointTotal();
renderLastAction();

saveLiveGameState();
}

function recordPlayerStat(statKey) {
    const team = getSelectedTeam();

    const player = team.roster.find(
        (item) =>
            item.id === selectedLivePlayerId
    );

    const stat = playerStats.find(
        (item) => item.key === statKey
    );

    if (!player || !stat) {
        return;
    }

    const playerState =
        liveGameState.playerStatsById[
            selectedLivePlayerId
        ];

    playerState[statKey] =
        (playerState[statKey] || 0) + 1;

        const currentPeriod =
    liveGameState.period;

const periodPlayerState =
    liveGameState.playerStatsByPeriod[
        currentPeriod
    ][selectedLivePlayerId];

periodPlayerState[statKey] =
    (periodPlayerState[statKey] || 0) + 1;

    // Link Player Defensive Rebound to Team Defensive Rebound
if (statKey === "defensiveRebounds") {

    liveGameState.teamStats.defensiveRebounds =
        (liveGameState.teamStats.defensiveRebounds || 0) + 1;

    if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
        liveGameState.teamStatsByPeriod[currentPeriod] = {};
    }

    liveGameState.teamStatsByPeriod[currentPeriod].defensiveRebounds =
        (
            liveGameState.teamStatsByPeriod[currentPeriod]
                .defensiveRebounds || 0
        ) + 1;
}

// Link Player Offensive Rebound to Team Offensive Rebound
if (statKey === "offensiveRebounds") {
    liveGameState.teamStats.offensiveRebounds =
        (liveGameState.teamStats.offensiveRebounds || 0) + 1;

    if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
        liveGameState.teamStatsByPeriod[currentPeriod] = {};
    }

    liveGameState.teamStatsByPeriod[currentPeriod].offensiveRebounds =
        (
            liveGameState.teamStatsByPeriod[currentPeriod]
                .offensiveRebounds || 0
        ) + 1;
}

// Link Player Turnover to Team Turnover
if (statKey === "turnovers") {
    liveGameState.teamStats.turnovers =
        (liveGameState.teamStats.turnovers || 0) + 1;

    if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
        liveGameState.teamStatsByPeriod[currentPeriod] = {};
    }

    liveGameState.teamStatsByPeriod[currentPeriod].turnovers =
        (
            liveGameState.teamStatsByPeriod[currentPeriod]
                .turnovers || 0
        ) + 1;
}

    liveActionHistory.push({
        type: "playerStat",
        playerId: player.id,
        statKey,
        amount: 1,
        period: liveGameState.period,
        description:
            `#${player.number || "—"} ${player.name} — ${stat.name}`
    });

    renderPlayerStatButtons();
renderLastAction();
renderTeamStatButtons();

saveLiveGameState();
}

function recordShootingResult(statKey, result) {
    if (!liveGameState) {
        return;
    }

    if (
        !liveGameState.teamStats[statKey] ||
        typeof liveGameState.teamStats[statKey] !== "object"
    ) {
        liveGameState.teamStats[statKey] = {
            made: 0,
            attempted: 0
        };
    }

    const shootingStat =
        liveGameState.teamStats[statKey];

    shootingStat.attempted += 1;

    if (result === "make") {
        shootingStat.made += 1;
    }

    const currentPeriod =
        liveGameState.period;

    if (!liveGameState.teamStatsByPeriod[currentPeriod]) {
        liveGameState.teamStatsByPeriod[currentPeriod] = {};
    }

    if (
        !liveGameState.teamStatsByPeriod[currentPeriod][statKey] ||
        typeof liveGameState.teamStatsByPeriod[currentPeriod][statKey] !== "object"
    ) {
        liveGameState.teamStatsByPeriod[currentPeriod][statKey] = {
            made: 0,
            attempted: 0
        };
    }

    const periodShootingStat =
        liveGameState.teamStatsByPeriod[
            currentPeriod
        ][statKey];

    periodShootingStat.attempted += 1;

    if (result === "make") {
        periodShootingStat.made += 1;
    }

    // Every 3-point attempt is also a field-goal attempt
if (statKey === "threePointers") {
    if (
        !liveGameState.teamStats.fieldGoals ||
        typeof liveGameState.teamStats.fieldGoals !== "object"
    ) {
        liveGameState.teamStats.fieldGoals = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStats.fieldGoals.attempted += 1;

    if (result === "make") {
        liveGameState.teamStats.fieldGoals.made += 1;
    }

    if (
        !liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals ||
        typeof liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals !== "object"
    ) {
        liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals = {
            made: 0,
            attempted: 0
        };
    }

    liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals.attempted += 1;

    if (result === "make") {
        liveGameState.teamStatsByPeriod[currentPeriod].fieldGoals.made += 1;
    }
}
    liveActionHistory.push({
        type: "shootingStat",
        statKey,
        result,
        period: currentPeriod,
        description:
    result === "make"
        ? `${
              statKey === "fieldGoals"
                  ? "Field Goal"
                  : statKey === "threePointers"
                  ? "3-Pointer"
                  : "Free Throw"
          } — Make`
        : `${
              statKey === "fieldGoals"
                  ? "Field Goal"
                  : statKey === "threePointers"
                  ? "3-Pointer"
                  : "Free Throw"
          } — Miss`
    });

    renderTeamStatButtons();
    renderLastAction();

    saveLiveGameState();
}

function undoShootingResult(statKey) {
    if (!liveGameState) {
        return;
    }

    let actionIndex = -1;

    for (let i = liveActionHistory.length - 1; i >= 0; i -= 1) {
        const action = liveActionHistory[i];

        if (
            action.type === "shootingStat" &&
            action.statKey === statKey
        ) {
            actionIndex = i;
            break;
        }
    }

    if (actionIndex === -1) {
        return;
    }

    const action = liveActionHistory[actionIndex];

    const shootingStat =
        liveGameState.teamStats[statKey];

    if (
        shootingStat &&
        typeof shootingStat === "object"
    ) {
        shootingStat.attempted = Math.max(
            0,
            shootingStat.attempted - 1
        );

        if (action.result === "make") {
            shootingStat.made = Math.max(
                0,
                shootingStat.made - 1
            );
        }
    }

    const periodShootingStat =
        liveGameState.teamStatsByPeriod?.[
            action.period
        ]?.[statKey];

    if (
        periodShootingStat &&
        typeof periodShootingStat === "object"
    ) {
        periodShootingStat.attempted = Math.max(
            0,
            periodShootingStat.attempted - 1
        );

        if (action.result === "make") {
            periodShootingStat.made = Math.max(
                0,
                periodShootingStat.made - 1
            );
        }
    }

    if (statKey === "threePointers") {
    const fieldGoals =
        liveGameState.teamStats.fieldGoals;

    if (fieldGoals && typeof fieldGoals === "object") {
        fieldGoals.attempted =
            Math.max(0, (fieldGoals.attempted || 0) - 1);

        if (action.result === "make") {
            fieldGoals.made =
                Math.max(0, (fieldGoals.made || 0) - 1);
        }
    }

    const periodFieldGoals =
        liveGameState.teamStatsByPeriod?.[
            action.period
        ]?.fieldGoals;

    if (
        periodFieldGoals &&
        typeof periodFieldGoals === "object"
    ) {
        periodFieldGoals.attempted =
            Math.max(
                0,
                (periodFieldGoals.attempted || 0) - 1
            );

        if (action.result === "make") {
            periodFieldGoals.made =
                Math.max(
                    0,
                    (periodFieldGoals.made || 0) - 1
                );
        }
    }
}
    liveActionHistory.splice(actionIndex, 1);

    renderTeamStatButtons();
    renderLastAction();
}

function recordTeamStat(statKey, amount = 1) {
    
    const stat = teamStats.find(
        (item) => item.key === statKey
    );

    if (!stat) {
        return;
    }

    liveGameState.teamStats[statKey] =
    Math.max(
        0,
        (liveGameState.teamStats[statKey] || 0) + amount
    );

    const currentPeriod =
    liveGameState.period;

if (
    !liveGameState.teamStatsByPeriod[
        currentPeriod
    ]
) {
    liveGameState.teamStatsByPeriod[
        currentPeriod
    ] = {};
}

liveGameState.teamStatsByPeriod[
    currentPeriod
][statKey] =
    Math.max(
        0,
        (
            liveGameState.teamStatsByPeriod[
                currentPeriod
            ][statKey] || 0
        ) + amount
    );

    liveActionHistory.push({
        type: "teamStat",
        statKey,
        amount,
        period: liveGameState.period,
        description:
            `Team — ${stat.name}`
    });

    renderTeamStatButtons();
renderLastAction();

saveLiveGameState();
}

function recordTransitionPoints(points) {
    liveGameState.teamStats.transitionPoints =
        (
            liveGameState.teamStats.transitionPoints ||
            0
        ) + points;

        const currentPeriod =
    liveGameState.period;

if (
    !liveGameState.teamStatsByPeriod[
        currentPeriod
    ]
) {
    liveGameState.teamStatsByPeriod[
        currentPeriod
    ] = {};
}

liveGameState.teamStatsByPeriod[
    currentPeriod
].transitionPoints =
    (
        liveGameState.teamStatsByPeriod[
            currentPeriod
        ].transitionPoints || 0
    ) + points;

    liveActionHistory.push({
        type: "transitionPoints",
        statKey: "transitionPoints",
        amount: points,
        period: liveGameState.period,
        description:
            `Team — +${points} Transition Point${
                points === 1 ? "" : "s"
            }`
    });

    renderTeamStatButtons();
renderLastAction();

saveLiveGameState();
}

function renderLiveSummary() {
    const team = getSelectedTeam();

    if (!team || !liveGameState) {
        return;
    }

    const uniqueTeamStats = [
        ...new Set(team.selectedTeamStats || [])
    ];

    const uniquePlayerStats = [
        ...new Set(team.selectedPlayerStats || [])
    ];

    const periodColumns =
    currentGameSetup.gameFormat === "Halves"
        ? ["1st Half", "2nd Half", "OT"]
        : ["Q1", "Q2", "Q3", "Q4", "OT"];

        const orderedTeamStats = [
    ...uniqueTeamStats.filter(
        (statKey) =>
            statKey !== "fieldGoals" &&
            statKey !== "threePointers" &&
            statKey !== "freeThrows"
    ),
    ...uniqueTeamStats.filter(
        (statKey) =>
            statKey === "fieldGoals" ||
            statKey === "threePointers" ||
            statKey === "freeThrows"
    )
];
    const teamRows =
        orderedTeamStats
    .map((statKey) => {
                const stat = teamStats.find(
                    (item) => item.key === statKey
                );

                if (!stat) {
                    return "";
                }

                return `
                    <tr>
                        <td class="teamStatNameCell">
                            ${stat.name}
                        </td>

                        ${periodColumns
    .map((period) => {
        const periodValue =
            liveGameState.teamStatsByPeriod?.[
                period
            ]?.[statKey] || 0;
            const displayPeriodValue =
    statKey === "fieldGoals" ||
    statKey === "threePointers" ||
    statKey === "freeThrows"
        ? formatShootingStat(periodValue)
        : periodValue;

        return `
            <td>
                ${displayPeriodValue}
            </td>
        `;
    })
    .join("")}

<td>
    ${getTeamStatTotal(statKey)}
</td>
                    </tr>
                `;
            })
            .join("");

    document.getElementById(
        "liveSummaryTeamStats"
    ).innerHTML = `
        <div class="boxScoreWrap">
            <table class="boxScoreTable teamSummaryTable">
                <thead>
    <tr>
        <th>Stat</th>

        ${periodColumns
            .map((period) => {
                return `
                    <th>
                        ${period}
                    </th>
                `;
            })
            .join("")}

        <th>Total</th>
    </tr>
</thead>

                <tbody>
                    ${teamRows}
                </tbody>
            </table>
        </div>
    `;

    const playerStatColumns = [
        "points",
        ...uniquePlayerStats.filter(
            (statKey) => statKey !== "points"
        )
    ];

    const playerHeaderCells =
        playerStatColumns
            .map((statKey) => {
                const stat = playerStats.find(
                    (item) => item.key === statKey
                );

                return `
                    <th>
                        ${
                            statKey === "points"
                                ? "PTS"
                                : stat?.name || statKey
                        }
                    </th>
                `;
            })
            .join("");

    const playerRows =
        team.roster
            .map((player) => {
                const statCells =
                    playerStatColumns
                        .map((statKey) => {
                            return `
                                <td>
                                    ${getPlayerStatTotal(
    player.id,
    statKey
)}
                                </td>
                            `;
                        })
                        .join("");

                return `
                    <tr>
                        <td>
                            ${player.number || "—"}
                        </td>

                        <td class="playerNameCell">
                            ${player.name || "Unnamed"}
                        </td>

                        ${statCells}
                    </tr>
                `;
            })
            .join("");

            const playerScoringTotals = periodColumns.map((period) => {
    return team.roster.reduce((total, player) => {
        const playerPeriodStats =
            liveGameState.playerStatsByPeriod?.[
                period
            ]?.[player.id];

        return total + (playerPeriodStats?.points || 0);
    }, 0);
});

const playerGameTotal =
    team.roster.reduce((total, player) => {
        return total + getPlayerStatTotal(
            player.id,
            "points"
        );
    }, 0);

          const playerScoringRows =
    team.roster
        .map((player) => {
            const periodCells =
                periodColumns
                    .map((period) => {
                        const playerPeriodStats =
                            liveGameState.playerStatsByPeriod?.[
                                period
                            ]?.[player.id];

                        const points =
                            playerPeriodStats?.points || 0;

                        return `
                            <td>
                                ${points}
                            </td>
                        `;
                    })
                    .join("");

            return `
                <tr>
                    <td class="playerNameCell">
                        ${player.name || "Unnamed"}
                    </td>

                    ${periodCells}

                    <td>
                        ${getPlayerStatTotal(
                            player.id,
                            "points"
                        )}
                    </td>
                </tr>
            `;
        })
        .join("");

        const playerStatTotals = playerStatColumns.map((statKey) => {
    return team.roster.reduce((total, player) => {
        return total + getPlayerStatTotal(
            player.id,
            statKey
        );
    }, 0);
});

          
    document.getElementById(
    "liveSummaryPlayerStats"
).innerHTML = `
    <div class="boxScoreWrap">
        <h3>Player Scoring</h3>

        <table class="boxScoreTable">
            <thead>
                <tr>
                    <th>Player</th>

                    ${periodColumns
                        .map((period) => {
                            return `
                                <th>${period}</th>
                            `;
                        })
                        .join("")}

                    <th>Total</th>
                </tr>
            </thead>

       <tbody>
    ${playerScoringRows}

    <tr class="summaryTotalsRow">
        <td>Totals</td>

        ${playerScoringTotals
            .map((total) => {
                return `
                    <td>${total}</td>
                `;
            })
            .join("")}

        <td>${playerGameTotal}</td>
    </tr>
</tbody>
        </table>
    </div>

    <div class="boxScoreWrap">
        <h3>Player Stats</h3>

        <table class="boxScoreTable">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    ${playerHeaderCells}
                </tr>
            </thead>

            <tbody>
    ${playerRows}

    <tr class="summaryTotalsRow">
        <td></td>
        <td>Totals</td>

        ${playerStatTotals
            .map((total) => {
                return `
                    <td>${total}</td>
                `;
            })
            .join("")}
    </tr>
</tbody>
        </table>
    </div>
`;
}

function openGameSummary() {
    const team = getSelectedTeam();

    if (!team || !liveGameState) {
        return;
    }
    const calculatedTeamScore =
    Object.values(
        liveGameState.playerStatsById || {}
    ).reduce((total, playerStats) => {
        return total + (playerStats.points || 0);
    }, 0);
    viewingSavedGame = false;

    document.getElementById("summaryMatchup").textContent =
        `${team.teamName} vs ${liveGameState.opponent}`;

    const uniqueTeamStats = [
        ...new Set(team.selectedTeamStats || [])
    ];

  const teamStatRows =
    uniqueTeamStats
        .map((statKey) => {
            const stat = teamStats.find(
                (item) => item.key === statKey
            );

            if (!stat) {
                return "";
            }

            return `
                <tr>
                    <td class="teamStatNameCell">
                        ${stat.name}
                    </td>
                    <td>
                        ${getTeamStatTotal(statKey)}
                    </td>
                </tr>
            `;
        })
        .join("");

document.getElementById("summaryTeamStats").innerHTML = `
    <div class="boxScoreWrap">
        <table class="boxScoreTable teamSummaryTable">
            <thead>
                <tr>
                    <th>Stat</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${teamStatRows}
            </tbody>
        </table>
    </div>
`;
const uniquePlayerStats = [
    ...new Set(team.selectedPlayerStats || [])
];
    const playerStatColumns = [
    "points",
    ...uniquePlayerStats.filter(
        (statKey) => statKey !== "points"
    )
];

const playerHeaderCells =
    playerStatColumns
        .map((statKey) => {
            const stat = playerStats.find(
                (item) => item.key === statKey
            );

            return `
                <th>
                    ${
                        statKey === "points"
                            ? "PTS"
                            : stat?.name || statKey
                    }
                </th>
            `;
        })
        .join("");

const playerRows =
    team.roster
        .map((player) => {
            const statCells =
                playerStatColumns
                    .map((statKey) => {
                        return `
                           <td>
    ${getPlayerStatTotal(
        player.id,
        statKey
    )}
</td>
                        `;
                    })
                    .join("");

            return `
                <tr>
                    <td>
                        ${player.number || "—"}
                    </td>

                    <td class="playerNameCell">
                        ${player.name || "Unnamed"}
                    </td>

                    ${statCells}
                </tr>
            `;
        })
        .join("");

             const playerStatTotals = playerStatColumns.map((statKey) => {
    return team.roster.reduce((total, player) => {
        return total + getPlayerStatTotal(
            player.id,
            statKey
        );
    }, 0);
});

document.getElementById(
    "summaryPlayerStats"
).innerHTML = `
    <div class="boxScoreWrap">
        <table class="boxScoreTable">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    ${playerHeaderCells}
                </tr>
            </thead>

            <tbody>
    ${playerRows}

    <tr class="summaryTotalsRow">
        <td></td>
        <td>Totals</td>

        ${playerStatTotals
            .map((total) => {
                return `
                    <td>${total}</td>
                `;
            })
            .join("")}
    </tr>
</tbody>
        </table>
    </div>
`;
document.getElementById(
    "returnToLiveGameButton"
).textContent = "Back to Game";

document.getElementById(
    "saveCompletedGameButton"
).style.display = "";
document.getElementById(
    "summaryTeamScore"
).value = calculatedTeamScore;

document.getElementById(
    "summaryOpponentScore"
).value = 0;

    showScreen("gameSummary");
}

function openSavedGameSummary(gameId) {
    const game = savedGames.find(
        (savedGame) =>
    String(savedGame.id) === String(gameId)
    );

    const team = teams.find(
        (savedTeam) => savedTeam.id === game?.teamId
    );

    if (!game || !team) {
        return;
    }
    viewingSavedGame = true;

    document.getElementById("summaryMatchup").textContent =
        `${team.teamName} vs ${game.opponent}`;

    document.getElementById("summaryTeamScore").value =
        game.teamScore;

    document.getElementById("summaryOpponentScore").value =
        game.opponentScore;

    const uniqueTeamStats = [
        ...new Set(team.selectedTeamStats || [])
    ];

    const periodColumns =
    game.gameFormat === "Halves"
        ? ["1st Half", "2nd Half", "OT"]
        : ["Q1", "Q2", "Q3", "Q4", "OT"];
    const orderedTeamStats = [
    ...uniqueTeamStats.filter(
        (statKey) =>
            statKey !== "fieldGoals" &&
            statKey !== "threePointers" &&
            statKey !== "freeThrows"
    ),
    ...uniqueTeamStats.filter(
        (statKey) =>
            statKey === "fieldGoals" ||
            statKey === "threePointers" ||
            statKey === "freeThrows"
    )
];

const teamStatRows =
    orderedTeamStats
        .map((statKey) => {
            const stat = teamStats.find(
                (item) => item.key === statKey
            );

            if (!stat) {
                return "";
            }

            return `
                <tr>
                    <td class="teamStatNameCell">
                        ${stat.name}
                    </td>

                    ${periodColumns
    .map((period) => {
        const periodValue =
    game.teamStatsByPeriod?.[
        period
    ]?.[statKey] || 0;

const displayPeriodValue =
    statKey === "fieldGoals" ||
statKey === "threePointers" ||
statKey === "freeThrows"
        ? `${periodValue?.made || 0} / ${periodValue?.attempted || 0} - ${
            (periodValue?.attempted || 0) > 0
                ? Math.round(
                    ((periodValue?.made || 0) /
                        periodValue.attempted) *
                        100
                )
                : 0
          }%`
        : periodValue;

return `
    <td>
        ${displayPeriodValue}
    </td>
`;
    })
    .join("")}

<td>
    ${
        statKey === "fieldGoals" ||
statKey === "threePointers" ||
statKey === "freeThrows"    
            ? `${game.teamStats?.[statKey]?.made || 0} / ${
                game.teamStats?.[statKey]?.attempted || 0
              } - ${
                (game.teamStats?.[statKey]?.attempted || 0) > 0
                    ? Math.round(
                        ((game.teamStats?.[statKey]?.made || 0) /
                            game.teamStats[statKey].attempted) *
                            100
                      )
                    : 0
              }%`
            : game.teamStats?.[statKey] || 0
    }
</td>
                </tr>
            `;
        })
        .join("");

document.getElementById(
    "summaryTeamStats"
).innerHTML = `
    <div class="boxScoreWrap">
        <table class="boxScoreTable teamSummaryTable">
            <thead>
    <tr>
        <th>Stat</th>

        ${periodColumns
            .map((period) => {
                return `
                    <th>
                        ${period}
                    </th>
                `;
            })
            .join("")}

        <th>Total</th>
    </tr>
</thead>

            <tbody>
                ${teamStatRows}
            </tbody>
        </table>
    </div>
`;

    const uniquePlayerStats = [
        ...new Set(team.selectedPlayerStats || [])
    ];

   const savedPlayerStatColumns = [
    "points",
    ...uniquePlayerStats.filter(
        (statKey) => statKey !== "points"
    )
];

const savedPlayerHeaderCells =
    savedPlayerStatColumns
        .map((statKey) => {
            const stat = playerStats.find(
                (item) => item.key === statKey
            );

            return `
                <th>
                    ${
                        statKey === "points"
                            ? "PTS"
                            : stat?.name || statKey
                    }
                </th>
            `;
        })
        .join("");

const savedPlayerScoringRows =
    team.roster
        .map((player) => {
            const periodCells =
                periodColumns
                    .map((period) => {
                        const points =
                            game.playerStatsByPeriod?.[
                                period
                            ]?.[player.id]?.points || 0;

                        return `
                            <td>${points}</td>
                        `;
                    })
                    .join("");

            return `
                <tr>
                    <td class="playerNameCell">
                        ${player.name || "Unnamed"}
                    </td>

                    ${periodCells}

                    <td>
                        ${
                            game.playerStatsById?.[
                                player.id
                            ]?.points || 0
                        }
                    </td>
                </tr>
            `;
        })
        .join("");

const savedScoringTotals =
    periodColumns.map((period) => {
        return team.roster.reduce(
            (total, player) => {
                return total + (
                    game.playerStatsByPeriod?.[
                        period
                    ]?.[player.id]?.points || 0
                );
            },
            0
        );
    });

const savedGamePointsTotal =
    team.roster.reduce((total, player) => {
        return total + (
            game.playerStatsById?.[
                player.id
            ]?.points || 0
        );
    }, 0);

const savedPlayerRows =
    team.roster
        .map((player) => {
            const statCells =
                savedPlayerStatColumns
                    .map((statKey) => {
                        const total =
                            game.playerStatsById?.[
                                player.id
                            ]?.[statKey] || 0;

                        return `
                            <td>${total}</td>
                        `;
                    })
                    .join("");

            return `
                <tr>
                    <td>
                        ${player.number || "—"}
                    </td>

                    <td class="playerNameCell">
                        ${player.name || "Unnamed"}
                    </td>

                    ${statCells}
                </tr>
            `;
        })
        .join("");

const savedPlayerStatTotals =
    savedPlayerStatColumns.map((statKey) => {
        return team.roster.reduce(
            (total, player) => {
                return total + (
                    game.playerStatsById?.[
                        player.id
                    ]?.[statKey] || 0
                );
            },
            0
        );
    });

document.getElementById(
    "summaryPlayerStats"
).innerHTML = `
    <div class="boxScoreWrap">
        <h3>Player Scoring</h3>

        <table class="boxScoreTable">
            <thead>
                <tr>
                    <th>Player</th>

                    ${periodColumns
                        .map((period) => {
                            return `
                                <th>${period}</th>
                            `;
                        })
                        .join("")}

                    <th>Total</th>
                </tr>
            </thead>

            <tbody>
                ${savedPlayerScoringRows}

                <tr class="summaryTotalsRow">
                    <td>Totals</td>

                    ${savedScoringTotals
                        .map((total) => {
                            return `
                                <td>${total}</td>
                            `;
                        })
                        .join("")}

                    <td>${savedGamePointsTotal}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="boxScoreWrap">
        <h3>Player Stats</h3>

        <table class="boxScoreTable">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    ${savedPlayerHeaderCells}
                </tr>
            </thead>

            <tbody>
                ${savedPlayerRows}

                <tr class="summaryTotalsRow">
                    <td></td>
                    <td>Totals</td>

                    ${savedPlayerStatTotals
                        .map((total) => {
                            return `
                                <td>${total}</td>
                            `;
                        })
                        .join("")}
                </tr>
            </tbody>
        </table>
    </div>
`;
document.getElementById(
    "returnToLiveGameButton"
).textContent = "Back to Team";

document.getElementById(
    "saveCompletedGameButton"
).style.display = "none";
    showScreen("gameSummary");
}
function saveCompletedGame() {
    const team = getSelectedTeam();

    if (!team || !liveGameState) {
        return;
    }

    const teamScore =
        Number(
            document.getElementById(
                "summaryTeamScore"
            ).value
        ) || 0;

    const opponentScore =
        Number(
            document.getElementById(
                "summaryOpponentScore"
            ).value
        ) || 0;

    const completedGame = {
    id: crypto.randomUUID(),
    teamId: team.id,
    season: team.season,
    opponent: liveGameState.opponent,
        gameDate: liveGameState.gameDate,
        gameType: liveGameState.gameType,
        location: liveGameState.location,
        gameFormat: liveGameState.gameFormat,
        gameStarters: liveGameState.gameStarters,
        teamScore,
        opponentScore,
        teamStats: liveGameState.teamStats,

selectedTeamStats:
    liveGameState.selectedTeamStats,

selectedPlayerStats:
    liveGameState.selectedPlayerStats,

playerStatsById:
    liveGameState.playerStatsById,

teamStatsByPeriod:
    liveGameState.teamStatsByPeriod,

playerStatsByPeriod:
    liveGameState.playerStatsByPeriod,
        completedAt: new Date().toISOString()
    };

    savedGames.push(completedGame);

    localStorage.setItem(
        GAMES_STORAGE_KEY,
        JSON.stringify(savedGames)
    );

    liveGameState = null;
    currentGameSetup = null;
    liveActionHistory = [];
    selectedLivePlayerId = null;

    openTeamDetails(team.id);
}
function renderLastAction() {
    const lastActionText =
        document.getElementById(
            "lastActionText"
        );

    const undoButton =
        document.getElementById(
            "undoLastActionButton"
        );

    if (liveActionHistory.length === 0) {
        lastActionText.textContent =
            "No stats recorded yet.";

        undoButton.disabled = true;
        return;
    }

    const lastAction =
        liveActionHistory[
            liveActionHistory.length - 1
        ];

    lastActionText.textContent =
        lastAction.description;

    undoButton.disabled = false;
}
function undoLastPlayerAction(playerId) {
    for (
        let index = liveActionHistory.length - 1;
        index >= 0;
        index--
    ) {
        const action = liveActionHistory[index];

        const isPlayerAction =
            action.playerId === playerId &&
            (
                action.type === "playerPoints" ||
                action.type === "playerStat"
            );

        if (!isPlayerAction) {
            continue;
        }

        if (action.type === "playerPoints") {
            const playerState =
                liveGameState.playerStatsById[playerId];

            playerState.points = Math.max(
                0,
                (playerState.points || 0) - action.amount
            );

            const actionPeriod =
    action.period || liveGameState.period;

const periodPlayerState =
    liveGameState.playerStatsByPeriod?.[
        actionPeriod
    ]?.[playerId];

if (periodPlayerState) {
    periodPlayerState.points =
        Math.max(
            0,
            (periodPlayerState.points || 0) -
                action.amount
        );
}
        }

        if (action.amount === 1) {
    const freeThrows =
        liveGameState.teamStats.freeThrows;

    if (freeThrows && typeof freeThrows === "object") {
        freeThrows.attempted =
            Math.max(0, (freeThrows.attempted || 0) - 1);

        freeThrows.made =
            Math.max(0, (freeThrows.made || 0) - 1);
    }

    const periodFreeThrows =
        liveGameState.teamStatsByPeriod?.[
            action.period || liveGameState.period
        ]?.freeThrows;

    if (
        periodFreeThrows &&
        typeof periodFreeThrows === "object"
    ) {
        periodFreeThrows.attempted =
            Math.max(
                0,
                (periodFreeThrows.attempted || 0) - 1
            );

        periodFreeThrows.made =
            Math.max(
                0,
                (periodFreeThrows.made || 0) - 1
            );
    }
}

// Undo linked Team 3-Point Field Goal for Player +3

// Also undo the regular Field Goal for the made 3-pointer
if (
    action.type === "playerPoints" &&
    action.linkedTeamStat === "threePointers"
) {
    const fieldGoals =
        liveGameState.teamStats.fieldGoals;

    if (
        fieldGoals &&
        typeof fieldGoals === "object"
    ) {
        fieldGoals.attempted = Math.max(
            0,
            (fieldGoals.attempted || 0) - 1
        );

        fieldGoals.made = Math.max(
            0,
            (fieldGoals.made || 0) - 1
        );
    }

    const periodFieldGoals =
        liveGameState.teamStatsByPeriod?.[
            action.period || liveGameState.period
        ]?.fieldGoals;

    if (
        periodFieldGoals &&
        typeof periodFieldGoals === "object"
    ) {
        periodFieldGoals.attempted = Math.max(
            0,
            (periodFieldGoals.attempted || 0) - 1
        );

        periodFieldGoals.made = Math.max(
            0,
            (periodFieldGoals.made || 0) - 1
        );
    }
}
if (
    action.type === "playerPoints" &&
    action.linkedTeamStat === "threePointers"
) {
    const threePointers =
        liveGameState.teamStats.threePointers;

    if (
        threePointers &&
        typeof threePointers === "object"
    ) {
        threePointers.attempted = Math.max(
            0,
            (threePointers.attempted || 0) - 1
        );

        threePointers.made = Math.max(
            0,
            (threePointers.made || 0) - 1
        );
    }

    const periodThreePointers =
        liveGameState.teamStatsByPeriod?.[
            action.period || liveGameState.period
        ]?.threePointers;

    if (
        periodThreePointers &&
        typeof periodThreePointers === "object"
    ) {
        periodThreePointers.attempted = Math.max(
            0,
            (periodThreePointers.attempted || 0) - 1
        );

        periodThreePointers.made = Math.max(
            0,
            (periodThreePointers.made || 0) - 1
        );
    }
}

// Undo linked Team Field Goal for Player +2
if (
    action.type === "playerPoints" &&
    action.linkedTeamStat === "fieldGoals"
) {
    const fieldGoals =
        liveGameState.teamStats.fieldGoals;

    if (
        fieldGoals &&
        typeof fieldGoals === "object"
    ) {
        fieldGoals.attempted = Math.max(
            0,
            (fieldGoals.attempted || 0) - 1
        );

        fieldGoals.made = Math.max(
            0,
            (fieldGoals.made || 0) - 1
        );
    }

    const periodFieldGoals =
        liveGameState.teamStatsByPeriod?.[
            action.period || liveGameState.period
        ]?.fieldGoals;

    if (
        periodFieldGoals &&
        typeof periodFieldGoals === "object"
    ) {
        periodFieldGoals.attempted = Math.max(
            0,
            (periodFieldGoals.attempted || 0) - 1
        );

        periodFieldGoals.made = Math.max(
            0,
            (periodFieldGoals.made || 0) - 1
        );
    }
}

        if (action.type === "playerStat") {
            const playerState =
                liveGameState.playerStatsById[playerId];

            playerState[action.statKey] = Math.max(
                0,
                (playerState[action.statKey] || 0) - 1
            );

            const actionPeriod =
    action.period || liveGameState.period;

const periodPlayerState =
    liveGameState.playerStatsByPeriod?.[
        actionPeriod
    ]?.[playerId];

if (periodPlayerState) {
    periodPlayerState[action.statKey] =
        Math.max(
            0,
            (
                periodPlayerState[
                    action.statKey
                ] || 0
            ) - 1
        );
}
        }
        if (action.statKey === "defensiveRebounds") {
    liveGameState.teamStats.defensiveRebounds =
        Math.max(
            0,
            (liveGameState.teamStats.defensiveRebounds || 0) - 1
        );

    const linkedPeriod =
    action.period || liveGameState.period;

const periodTeamStats =
    liveGameState.teamStatsByPeriod?.[linkedPeriod];

    if (periodTeamStats) {
        periodTeamStats.defensiveRebounds =
            Math.max(
                0,
                (periodTeamStats.defensiveRebounds || 0) - 1
            );
    }
}

if (action.statKey === "offensiveRebounds") {
    liveGameState.teamStats.offensiveRebounds =
        Math.max(
            0,
            (liveGameState.teamStats.offensiveRebounds || 0) - 1
        );

    const linkedPeriod =
        action.period || liveGameState.period;

    const periodTeamStats =
        liveGameState.teamStatsByPeriod?.[linkedPeriod];

    if (periodTeamStats) {
        periodTeamStats.offensiveRebounds =
            Math.max(
                0,
                (periodTeamStats.offensiveRebounds || 0) - 1
            );
    }
}

if (action.statKey === "turnovers") {
    liveGameState.teamStats.turnovers =
        Math.max(
            0,
            (liveGameState.teamStats.turnovers || 0) - 1
        );

    const linkedPeriod =
        action.period || liveGameState.period;

    const periodTeamStats =
        liveGameState.teamStatsByPeriod?.[linkedPeriod];

    if (periodTeamStats) {
        periodTeamStats.turnovers =
            Math.max(
                0,
                (periodTeamStats.turnovers || 0) - 1
            );
    }
}
        liveActionHistory.splice(index, 1);

        renderPlayerBench();
        connectPlayerCardButtons();
        renderLastAction();
renderTeamStatButtons();
updateLiveTeamPointTotal();

        saveLiveGameState();

        return;
    }
}
function undoLastAction() {
    const lastAction =
        liveActionHistory.pop();
        console.log("UNDO ACTION:", lastAction);

    if (!lastAction) {
        return;
    }

    if (lastAction.type === "playerPoints") {
        const playerState =
            liveGameState.playerStatsById[
                lastAction.playerId
            ];

            const actionPeriod =
    lastAction.period || liveGameState.period;

const periodPlayerState =
    liveGameState.playerStatsByPeriod?.[
        actionPeriod
    ]?.[lastAction.playerId];

if (periodPlayerState) {
    periodPlayerState.points =
        Math.max(
            0,
            (periodPlayerState.points || 0) -
                lastAction.amount
        );
}

        playerState.points = Math.max(
            0,
            (playerState.points || 0) -
                lastAction.amount
        );
      // Undo linked Team Field Goal for Player +2
if (lastAction.linkedTeamStat === "fieldGoals") {
    const teamFG = liveGameState.teamStats.fieldGoals;

    if (teamFG && typeof teamFG === "object") {
        teamFG.made = Math.max(0, (teamFG.made || 0) - 1);
        teamFG.attempted = Math.max(0, (teamFG.attempted || 0) - 1);
    }

    const periodFG =
        liveGameState.teamStatsByPeriod?.[actionPeriod]?.fieldGoals;

    if (periodFG && typeof periodFG === "object") {
        periodFG.made = Math.max(0, (periodFG.made || 0) - 1);
        periodFG.attempted = Math.max(
            0,
            (periodFG.attempted || 0) - 1
        );
    }
}
    }

    if (lastAction.type === "playerStat") {
        const playerState =
            liveGameState.playerStatsById[
                lastAction.playerId
            ];

        playerState[lastAction.statKey] =
            Math.max(
                0,
                (playerState[
                    lastAction.statKey
                ] || 0) - 1
            );

            const actionPeriod =
    lastAction.period || liveGameState.period;

const periodPlayerState =
    liveGameState.playerStatsByPeriod?.[
        actionPeriod
    ]?.[lastAction.playerId];

if (periodPlayerState) {
    periodPlayerState[lastAction.statKey] =
        Math.max(
            0,
            (
                periodPlayerState[
                    lastAction.statKey
                ] || 0
            ) - 1
        );
}
    }
    if (lastAction.statKey === "defensiveRebounds") {
    liveGameState.teamStats.defensiveRebounds =
        Math.max(
            0,
            (liveGameState.teamStats.defensiveRebounds || 0) - 1
        );

    const periodTeamStats =
        liveGameState.teamStatsByPeriod?.[actionPeriod];

    if (periodTeamStats) {
        periodTeamStats.defensiveRebounds =
            Math.max(
                0,
                (periodTeamStats.defensiveRebounds || 0) - 1
            );
    }
}
if (lastAction.type === "transitionPoints") {
    liveGameState.teamStats.transitionPoints =
        Math.max(
            0,
            (
                liveGameState.teamStats
                    .transitionPoints || 0
            ) - lastAction.amount
        );
}
    if (lastAction.type === "teamStat") {
        liveGameState.teamStats[
            lastAction.statKey
        ] =
            Math.max(
                0,
                (
                    liveGameState.teamStats[
                        lastAction.statKey
                    ] || 0
                ) - 1
            );

            const actionPeriod =
    lastAction.period || liveGameState.period;

if (
    liveGameState.teamStatsByPeriod?.[
        actionPeriod
    ]
) {
    liveGameState.teamStatsByPeriod[
        actionPeriod
    ][lastAction.statKey] =
        Math.max(
            0,
            (
                liveGameState.teamStatsByPeriod[
                    actionPeriod
                ][lastAction.statKey] || 0
            ) - Math.abs(lastAction.amount || 1)
        );
}
    }

    renderPlayerStatButtons();
    renderTeamStatButtons();
    renderLastAction();
}
function openNewGameScreen() {
    const team = getSelectedTeam();

    if (!team) {
        alert("Please select a team first.");
        return;
    }

    document.getElementById("newGameForm").reset();

    document.querySelector(
        'input[name="gameType"][value="Regular Season"]'
    ).checked = true;

    document.querySelector(
        'input[name="gameLocation"][value="Home"]'
    ).checked = true;

    const today = new Date();

    const localDate = new Date(
        today.getTime() -
        today.getTimezoneOffset() * 60000
    )
        .toISOString()
        .split("T")[0];

    document.getElementById("gameDateInput").value =
        localDate;

    showScreen("newGame");
}

function createGameConfirmation(event) {
    event.preventDefault();

    const team = getSelectedTeam();

    if (!team) {
        return;
    }

    const opponent =
        document
            .getElementById("opponentInput")
            .value
            .trim();

    if (!opponent) {
        alert("Please enter an opponent.");
        return;
    }

    const gameType =
        document.querySelector(
            'input[name="gameType"]:checked'
        ).value;

    const location =
        document.querySelector(
            'input[name="gameLocation"]:checked'
        ).value;


        const gameFormat =
    document.querySelector(
        'input[name="gameFormat"]:checked'
    ).value;
    const gameDate =
        document.getElementById("gameDateInput").value;

    currentGameSetup = {
        teamId: team.id,
        opponent,
        gameType,
        location,
        gameFormat,
        gameDate
    };

    const fullTeamName = [
        team.schoolName,
        team.teamName
    ]
        .filter(Boolean)
        .join(" — ");

    document.getElementById(
        "confirmationTeamName"
    ).textContent = fullTeamName || team.teamName;

    document.getElementById(
        "confirmationOpponent"
    ).textContent = opponent;

    document.getElementById(
        "confirmationGameDetails"
    ).textContent =
        `${gameDate} · ${gameType} · ${location} · ${gameFormat}`;

   const uniqueTeamStats = [
    ...new Set(team.selectedTeamStats || [])
];

const uniquePlayerStats = [
    ...new Set(team.selectedPlayerStats || [])
];

const combinedStats = [
    ...uniqueTeamStats.map((statKey) => {
        return teamStats.find(
            (stat) => stat.key === statKey
        );
    }),

    ...uniquePlayerStats.map((statKey) => {
        return playerStats.find(
            (stat) => stat.key === statKey
        );
    })
]
    .filter(Boolean);

        const gameStartersList =
    document.getElementById("gameStartersList");

gameStartersList.innerHTML = team.roster
    .map((player) => {
        return `
            <label class="gameStarterOption">
                <input
                    type="checkbox"
                    class="gameStarterCheckbox"
                    data-player-id="${player.id}"
                    ${
    editingLiveGameSetup
        ? (liveGameState.gameStarters || []).includes(player.id)
            ? "checked"
            : ""
        : player.keepAtTop
            ? "checked"
            : ""
}
                >
                <span>
                    #${player.number} ${player.name}
                </span>
            </label>
        `;
    })
    .join("");

    const starterCheckboxes =
    document.querySelectorAll(".gameStarterCheckbox");

function updateStarterCheckboxes() {
    const checkedCount =
        document.querySelectorAll(
            ".gameStarterCheckbox:checked"
        ).length;

    starterCheckboxes.forEach((checkbox) => {
        checkbox.disabled =
            checkedCount >= 5 && !checkbox.checked;
    });
}

starterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        updateStarterCheckboxes();
    });
});

updateStarterCheckboxes();

editingLiveGameSetup = false;

document.getElementById(
    "backToGameSetupButton"
).style.display = "";

document.getElementById(
    "confirmStartGameButton"
).textContent = "START GAME";

    renderGameStatChoices(team);

    showScreen("gameConfirmation");
}
function openTeamDetails(teamId) {
    const team = teams.find(
        (savedTeam) => savedTeam.id === teamId
    );

    if (!team) {
        return;
    }

    selectedTeamId = teamId;
    updateAppTeamBadge();

    const fullName = [
        team.schoolName,
        team.teamName
    ]
        .filter(Boolean)
        .join(" — ");

    document.getElementById("detailsTeamName").textContent =
        fullName || team.teamName;

    document.getElementById("detailsTeamInformation").textContent =
        `${team.season || "Season not entered"} · ${team.roster.length} players`;

    const detailsRoster =
        document.getElementById("detailsRoster");

    detailsRoster.innerHTML = team.roster
        .map((player) => {
            return `
                <div class="detailsPlayer">
                    <span class="detailsPlayerNumber">
                        ${player.number || "—"}
                    </span>

                    <span class="detailsPlayerName">
                        ${player.name || "Unnamed Player"}
                    </span>
                </div>
            `;
        })
        .join("");

    const detailsTeamStats =
        document.getElementById("detailsTeamStats");

    detailsTeamStats.innerHTML = team.selectedTeamStats
        .map((statKey) => {
            const stat = teamStats.find(
                (item) => item.key === statKey
            );

            if (!stat) {
                return "";
            }

            return `
                <div class="detailsStat">
                    <strong>${stat.name}</strong>
                    <small>${stat.description}</small>
                </div>
            `;
        })
        .join("");

    const detailsPlayerStats =
        document.getElementById("detailsPlayerStats");

    detailsPlayerStats.innerHTML = team.selectedPlayerStats
        .map((statKey) => {
            const stat = playerStats.find(
                (item) => item.key === statKey
            );

            if (!stat) {
                return "";
            }

            return `
                <div class="detailsStat">
                    <strong>${stat.name}</strong>
                    <small>${stat.description}</small>
                </div>
            `;
        })
        .join("");
const teamGames = savedGames
    .filter((game) => game.teamId === team.id)
    .sort((a, b) => {
        return new Date(b.completedAt) - new Date(a.completedAt);
    });

const pastGamesList =
    document.getElementById("pastGamesList");

if (teamGames.length === 0) {
    pastGamesList.innerHTML = `
        <div class="emptyState">
            <h3>No saved games yet</h3>
            <p>
                Completed games will appear here after you save them.
            </p>
        </div>
    `;
} else {
    pastGamesList.innerHTML = teamGames
        .map((game) => {
            let resultLetter = "T";
            let resultClass = "gameResultTie";

            if (game.teamScore > game.opponentScore) {
                resultLetter = "W";
                resultClass = "gameResultWin";
            }

            if (game.teamScore < game.opponentScore) {
                resultLetter = "L";
                resultClass = "gameResultLoss";
            }

            return `
                <div class="pastGameCard">

                    <div class="pastGameInfo">

                        <h4>
                            <span
                                class="gameResultBadge ${resultClass}"
                            >
                                ${resultLetter}
                            </span>

                            vs ${game.opponent}
                        </h4>

                        <p>
                            ${game.gameDate || "Date not entered"}
                            · ${game.teamScore}-${game.opponentScore}
                        </p>

                    </div>

                    <button
                        class="viewGameButton"
                        type="button"
                        data-view-game="${game.id}"
                    >
                        View Game
                    </button>

                </div>
            `;
        })
        .join("");
        document
    .querySelectorAll("[data-view-game]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            openSavedGameSummary(
                button.dataset.viewGame
            );
        });
    });
}
    showScreen("teamDetails");
}
function renderTeams() {
    if (teams.length === 0) {
        teamsList.innerHTML = `
            <div class="emptyState">
                <h3>No teams yet</h3>

                <p>
                    Add your first team to begin building
                    a roster and choosing statistics.
                </p>
            </div>
        `;

        return;
    }

    teamsList.innerHTML = [...teams]
    .reverse()
    .map((team) => {
            const fullName = [
                team.schoolName,
                team.teamName
            ]
                .filter(Boolean)
                .join(" — ");

            return `
                <article
    class="teamCard"
    data-open-team="${team.id}"
>

                    <div>
                        <h3>${fullName || team.teamName}</h3>

                        <p>
                            ${team.season || "Season not entered"}
                            · ${team.roster.length} players
                        </p>
                    </div>

                    <div class="teamCardActions">

                        <button
                            class="smallButton"
                            type="button"
                            data-edit-team="${team.id}"
                        >
                            Edit
                        </button>

                        <button
                            class="smallButton deleteButton"
                            type="button"
                            data-delete-team="${team.id}"
                        >
                            Delete
                        </button>

                    </div>

                </article>
            `;
        })
        .join("");
document
    .querySelectorAll("[data-open-team]")
    .forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest("button")) {
                return;
            }

            openTeamDetails(card.dataset.openTeam);
        });
    });
    document
        .querySelectorAll("[data-edit-team]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                openEditTeamForm(button.dataset.editTeam);
            });
        });

    document
        .querySelectorAll("[data-delete-team]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                deleteTeam(button.dataset.deleteTeam);
            });
        });
}

function deleteTeam(teamId) {
    const team = teams.find(
        (savedTeam) => savedTeam.id === teamId
    );

    if (!team) {
        return;
    }

    const confirmed = confirm(
        `Delete ${team.teamName}? This cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    teams = teams.filter(
        (savedTeam) => savedTeam.id !== teamId
    );

    saveTeams();
    renderTeams();
}

function renderGamesTeamFilter() {
    const gamesTeamCards =
        document.getElementById("gamesTeamCards");

    if (!gamesTeamCards) {
        return;
    }

    if (teams.length === 0) {
        gamesTeamCards.innerHTML = `
            <div class="emptyState">
                <h3>No teams yet</h3>
                <p>Create a team to start tracking games.</p>
            </div>
        `;

        gamesTeamCards.dataset.selectedTeamId = "";
        return;
    }

    let selectedGamesTeamId =
        gamesTeamCards.dataset.selectedTeamId;

    const selectedTeamStillExists =
        teams.some(
            (team) =>
                team.id === selectedGamesTeamId
        );

    if (!selectedTeamStillExists) {
        selectedGamesTeamId =
            teams.some(
                (team) =>
                    team.id === selectedTeamId
            )
                ? selectedTeamId
                : teams[0].id;

        gamesTeamCards.dataset.selectedTeamId =
            selectedGamesTeamId;
    }

    gamesTeamCards.innerHTML = [...teams]
    .reverse()
    .map((team) => {
            const teamLabel = [
                team.schoolName,
                team.teamName
            ]
                .filter(Boolean)
                .join(" — ");

            const isSelected =
                team.id === selectedGamesTeamId;

            return `
                <button
                    type="button"
                    class="gamesTeamCard ${
                        isSelected
                            ? "activeGamesTeamCard"
                            : ""
                    }"
                    data-games-team-id="${team.id}"
                >
                    <span class="gamesTeamCardName">
                        ${teamLabel || "Team"}
                    </span>

                    ${
                        team.season
                            ? `
                                <span class="gamesTeamCardSeason">
                                    ${team.season}
                                </span>
                            `
                            : ""
                    }
                </button>
            `;
        })
        .join("");

    gamesTeamCards
        .querySelectorAll(
            "[data-games-team-id]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    gamesTeamCards.dataset.selectedTeamId =
                        button.dataset.gamesTeamId;

                    selectedTeamId =
                        button.dataset.gamesTeamId;
                        updateAppTeamBadge();

                    renderGamesTeamFilter();
                    renderGamesList();
                }
            );
        });
}


function renderGamesList() {
    const gamesList =
    document.getElementById("gamesList");

const gamesTeamCards =
    document.getElementById("gamesTeamCards");

if (!gamesList || !gamesTeamCards) {
    return;
}

const selectedFilterTeamId =
    gamesTeamCards.dataset.selectedTeamId;

if (!selectedFilterTeamId) {
    gamesList.innerHTML = `
        <div class="emptyState">
            <h3>Select a team</h3>
            <p>Choose a team above to view its past games.</p>
        </div>
    `;

    return;
}

    const filteredGames =
        savedGames
            .filter((game) => {
                return (
                    selectedFilterTeamId === "all" ||
                    game.teamId === selectedFilterTeamId
                );
            })
            .sort((a, b) => {
                return (
                    new Date(b.completedAt) -
                    new Date(a.completedAt)
                );
            });

    if (filteredGames.length === 0) {
        gamesList.innerHTML = `
            <div class="emptyState">
                <h3>No games yet</h3>
                <p>
                    Your completed games will appear here.
                </p>
            </div>
        `;

        return;
    }

    gamesList.innerHTML =
        filteredGames
            .map((game) => {
                const team =
                    teams.find(
                        (item) =>
                            item.id === game.teamId
                    );

                const teamLabel = [
                    team?.schoolName,
                    team?.teamName
                ]
                    .filter(Boolean)
                    .join(" — ");

                let resultLetter = "T";
                let resultClass = "gameResultTie";

                if (
                    game.teamScore >
                    game.opponentScore
                ) {
                    resultLetter = "W";
                    resultClass = "gameResultWin";
                }

                if (
                    game.teamScore <
                    game.opponentScore
                ) {
                    resultLetter = "L";
                    resultClass = "gameResultLoss";
                }

                return `
                    <div class="pastGameCard">
                        <div class="pastGameInfo">
                            <h4>
                                <span
                                    class="gameResultBadge ${resultClass}"
                                >
                                    ${resultLetter}
                                </span>

                                ${teamLabel || "Team"}
                                vs ${game.opponent}
                            </h4>

                            <p>
                                ${
                                    game.gameDate ||
                                    "Date not entered"
                                }
                                ·
                                ${game.teamScore}-${game.opponentScore}
                            </p>
                        </div>

                        <button
                            class="viewGameButton"
                            type="button"
                            data-games-view-game="${game.id}"
                        >
                            View Game
                        </button>
                    </div>
                `;
            })
            .join("");

    document
        .querySelectorAll(
            "[data-games-view-game]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const game =
                        savedGames.find(
                            (item) =>
                                item.id ===
                                button.dataset.gamesViewGame
                        );

                    if (game) {
                        selectedTeamId =
                            game.teamId;
                    }

                    openSavedGameSummary(
                        button.dataset.gamesViewGame
                    );
                }
            );
        });
}

document
    .getElementById("teamsBtn")
    .addEventListener("click", () => {
        renderTeams();
        showScreen("teams");
    });

document
    .getElementById("gamesBtn")
    .addEventListener("click", () => {
        renderGamesTeamFilter();
        renderGamesList();
        showScreen("games");
    });

    document
    .getElementById("startNewGameButton")
    .addEventListener("click", () => {
        const gamesTeamCards =
            document.getElementById("gamesTeamCards");

        const selectedGamesTeamId =
            gamesTeamCards?.dataset.selectedTeamId;

        if (!selectedGamesTeamId) {
            alert("Please select a team before starting a game.");
            return;
        }

        selectedTeamId = selectedGamesTeamId;
        updateAppTeamBadge();

        showScreen("newGame");
    });

    function renderReportsTeamFilter() {
    const reportsTeamCards =
        document.getElementById("reportsTeamCards");

    if (!reportsTeamCards) {
        return;
    }

    if (teams.length === 0) {
        reportsTeamCards.innerHTML = `
            <div class="emptyState">
                <h3>No teams yet</h3>
                <p>Create a team to view reports.</p>
            </div>
        `;
        return;
    }

    reportsTeamCards.innerHTML = [...teams]
    .reverse()
    .map((team) => {
            const teamLabel = [
                team.schoolName,
                team.teamName
            ]
                .filter(Boolean)
                .join(" — ");

            return `
                <button
                    type="button"
                    class="reportsTeamCard"
                    data-reports-team-id="${team.id}"
                >
                    ${teamLabel}
                </button>
            `;
        })
        .join("");
}

function renderReportsSeasonFilter() {
    const reportsTeamCards =
    document.getElementById("reportsTeamCards");

    const reportsSeasonFilter =
        document.getElementById("reportsSeasonFilter");

    if (!reportsTeamCards || !reportsSeasonFilter) {
        return;
    }

    const teamId =
    reportsTeamCards.dataset.selectedTeamId || "";

    reportsSeasonFilter.innerHTML = `
        <option value="">Select Season</option>
    `;

    if (!teamId) {
        return;
    }

    const team =
        teams.find(
            (item) => item.id === teamId
        );

    if (!team) {
        return;
    }

    const seasons = new Set();

    if (team.season) {
        seasons.add(team.season);
    }

    savedGames
        .filter(
            (game) => game.teamId === teamId
        )
        .forEach((game) => {
            const gameSeason =
                game.season || team.season;

            if (gameSeason) {
                seasons.add(gameSeason);
            }
        });

    const seasonList =
        [...seasons].sort().reverse();

    reportsSeasonFilter.innerHTML = `
        <option value="">Select Season</option>

        ${seasonList
            .map((season) => {
                return `
                    <option value="${season}">
                        ${season}
                    </option>
                `;
            })
            .join("")}
    `;

    if (team.season) {
        reportsSeasonFilter.value =
            team.season;
    }
}

function renderTeamReport() {
    const reportsTeamCards =
    document.getElementById("reportsTeamCards");

    const reportsContent =
        document.getElementById("reportsContent");

    if (!reportsTeamCards || !reportsContent) {
        return;
    }

    const teamId =
    reportsTeamCards.dataset.selectedTeamId || "";

const reportsSeasonFilter =
    document.getElementById("reportsSeasonFilter");

const selectedSeason =
    reportsSeasonFilter?.value || "";

if (!teamId || !selectedSeason) {
        reportsContent.innerHTML = `
            <div class="emptyState">
                <h3>Select a team</h3>
                <p>
                    Choose a team to view season reports.
                </p>
            </div>
        `;

        return;
    }

    const team =
        teams.find(
            (item) => item.id === teamId
        );

    const teamGames =
    savedGames.filter((game) => {
        if (game.teamId !== teamId) {
            return false;
        }

        const gameSeason =
            game.season || team.season;

        return gameSeason === selectedSeason;
    }); 

    if (!team) {
        return;
    }

    if (teamGames.length === 0) {
        reportsContent.innerHTML = `
            <div class="emptyState">
                <h3>No completed games yet</h3>
                <p>
                    Complete a game for this team to begin building reports.
                </p>
            </div>
        `;

        return;
    }

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let totalPointsFor = 0;
    let totalPointsAgainst = 0;

    teamGames.forEach((game) => {
        totalPointsFor +=
            Number(game.teamScore) || 0;

        totalPointsAgainst +=
            Number(game.opponentScore) || 0;

        if (game.teamScore > game.opponentScore) {
            wins += 1;
        } else if (
            game.teamScore < game.opponentScore
        ) {
            losses += 1;
        } else {
            ties += 1;
        }
    });

    const gamesPlayed =
        teamGames.length;

    const averagePointsFor =
        (
            totalPointsFor /
            gamesPlayed
        ).toFixed(1);

    const averagePointsAgainst =
        (
            totalPointsAgainst /
            gamesPlayed
        ).toFixed(1);

    const teamLabel = [
        team.schoolName,
        team.teamName
    ]
        .filter(Boolean)
        .join(" — ");

        const selectedTeamStats = [
    ...new Set(
        teamGames.flatMap((game) => {
            if (
                Array.isArray(game.selectedTeamStats) &&
                game.selectedTeamStats.length > 0
            ) {
                return game.selectedTeamStats;
            }

            return Object.keys(game.teamStats || {});
        })
    )
];
const teamStatAverages =
    selectedTeamStats.map((statKey) => {
        if (
            statKey === "fieldGoals" ||
statKey === "threePointers" ||
statKey === "freeThrows"
        ) {
            let totalMade = 0;
            let totalAttempted = 0;

            teamGames.forEach((game) => {
                const shootingStat =
                    game.teamStats?.[statKey];

                if (
                    shootingStat &&
                    typeof shootingStat === "object"
                ) {
                    totalMade +=
                        Number(shootingStat.made) || 0;

                    totalAttempted +=
                        Number(shootingStat.attempted) || 0;
                }
            });

            const averageMade =
                gamesPlayed > 0
                    ? totalMade / gamesPlayed
                    : 0;

            const averageAttempted =
                gamesPlayed > 0
                    ? totalAttempted / gamesPlayed
                    : 0;

            const percentage =
                totalAttempted > 0
                    ? Math.round(
                        (totalMade / totalAttempted) * 100
                    )
                    : 0;

            return {
                statKey,
                average:
                    `${averageMade.toFixed(1)} / ` +
                    `${averageAttempted.toFixed(1)} · ` +
                    `${percentage}%`
            };
        }

        let statTotal = 0;

        teamGames.forEach((game) => {
            statTotal +=
                Number(
                    game.teamStats?.[statKey]
                ) || 0;
        });

        return {
            statKey,
            average:
                (
                    statTotal /
                    gamesPlayed
                ).toFixed(1)
        };
    });

    const selectedPlayerStats = [
    ...new Set([
        ...(team.selectedPlayerStats || []),
        "offensiveRebounds",
        "defensiveRebounds"
    ])
].filter((statKey) => statKey !== "points");

const playerSeasonStats =
    team.roster.map((player) => {
        let totalPoints = 0;
        let gamesPlayedByPlayer = 0;

        const statTotals = {};

        selectedPlayerStats.forEach((statKey) => {
            statTotals[statKey] = 0;
        });

        teamGames.forEach((game) => {
            const gamePlayerStats =
                game.playerStatsById?.[player.id];

            if (!gamePlayerStats) {
                return;
            }

            gamesPlayedByPlayer += 1;

            totalPoints +=
                Number(gamePlayerStats.points) || 0;

            selectedPlayerStats.forEach(
                (statKey) => {
                    statTotals[statKey] +=
                        Number(
                            gamePlayerStats[statKey]
                        ) || 0;
                }
            );
        });

        const offensiveRebounds =
    Number(
        statTotals.offensiveRebounds
    ) || 0;

const defensiveRebounds =
    Number(
        statTotals.defensiveRebounds
    ) || 0;

const totalRebounds =
    offensiveRebounds +
    defensiveRebounds;

return {
    id: player.id,
    number: player.number,
    name: player.name,
    gamesPlayed: gamesPlayedByPlayer,
    totalPoints,
    pointsPerGame:
        gamesPlayedByPlayer > 0
            ? (
                totalPoints /
                gamesPlayedByPlayer
            ).toFixed(1)
            : "0.0",
    averageRebounds:
        gamesPlayedByPlayer > 0
            ? (
                totalRebounds /
                gamesPlayedByPlayer
            ).toFixed(1)
            : "0.0",
    statTotals
};
});

    reportsContent.innerHTML = `
        <div class="reportSection">
            <h3>${teamLabel}</h3>

            <div class="reportOverviewGrid">
                <div class="reportStatCard">
                    <span class="reportStatLabel">
                        Games
                    </span>

                    <strong class="reportStatValue">
                        ${gamesPlayed}
                    </strong>
                </div>

                <div class="reportStatCard">
                    <span class="reportStatLabel">
                        Record
                    </span>

                    <strong class="reportStatValue">
                        ${wins}-${losses}${
                            ties > 0
                                ? `-${ties}`
                                : ""
                        }
                    </strong>
                </div>

                <div class="reportStatCard">
                    <span class="reportStatLabel">
                        PPG
                    </span>

                    <strong class="reportStatValue">
                        ${averagePointsFor}
                    </strong>
                </div>

                <div class="reportStatCard">
                    <span class="reportStatLabel">
                        Opponent PPG
                    </span>

                    <strong class="reportStatValue">
                        ${averagePointsAgainst}
                    </strong>
                                </div>
            </div>

            <div class="reportTeamAverages">
                <h4>Team Averages</h4>

                <div class="reportAveragesGrid">
                    ${teamStatAverages
                        .map((stat) => {
                            const statLabel =
                                stat.statKey
                                    .replace(
                                        /([A-Z])/g,
                                        " $1"
                                    )
                                    .replace(
                                        /^./,
                                        (letter) =>
                                            letter.toUpperCase()
                                    );

                            return `
                                <div class="reportAverageCard">
                                    <span class="reportAverageLabel">
                                        ${statLabel}
                                    </span>

                                    <strong class="reportAverageValue">
                                        ${stat.average}
                                    </strong>
                                </div>
                            `;
                        })
                        .join("")}
                </div>
            </div>
        </div>
                        </div>
            </div>

            <div class="reportPlayerStats">
                <h4>Player Season Stats</h4>

                <div class="reportPlayerTableWrap">
                    <table class="reportPlayerTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>GP</th>
<th>PTS</th>
<th>PPG</th>
<th>AVG REB</th>

${selectedPlayerStats
    .map((statKey) => {
        const playerStatLabels = {
            offensiveRebounds: "ORebs",
            defensiveRebounds: "DRebs",
            turnovers: "TO's"
        };

        const statLabel =
            playerStatLabels[statKey] ||
            statKey
                .replace(
                    /([A-Z])/g,
                    " $1"
                )
                .replace(
                    /^./,
                    (letter) =>
                        letter.toUpperCase()
                );

        return `
            <th>
                ${statLabel}
            </th>
        `;
    })
    .join("")}
                            </tr>
                        </thead>

                        <tbody>
                            ${playerSeasonStats
                                .map((player) => {
                                    return `
                                        <tr>
                                            <td>
                                                ${player.number || ""}
                                            </td>

                                            <td>
                                                ${player.name}
                                            </td>

                                            <td>
                                                ${player.gamesPlayed}
                                            </td>

                                            <td>
    ${player.totalPoints}
</td>

<td>
    ${player.pointsPerGame}
</td>

<td>
    ${player.averageRebounds}
</td>

${selectedPlayerStats
                                                .map((statKey) => {
                                                    return `
                                                        <td>
                                                            ${
                                                                player
                                                                    .statTotals[
                                                                        statKey
                                                                    ] || 0
                                                            }
                                                        </td>
                                                    `;
                                                })
                                                .join("")}
                                        </tr>
                                    `;
                                })
                                .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
                        </div>
        </div>

        <div class="reportPlayerGameDetail">
    <div class="reportPlayerGameHeader">
        <h4>Player Game-by-Game</h4>

        <label class="reportPlayerFilter">
            Player

            <select id="reportPlayerFilter">
                <option value="">
                    Select Player
                </option>

                ${playerSeasonStats
                    .map((player) => {
                        return `
                            <option value="${player.id}">
                                ${
                                    player.number
                                        ? `#${player.number} `
                                        : ""
                                }${player.name}
                            </option>
                        `;
                    })
                    .join("")}
            </select>
        </label>
    </div>

    <div id="reportPlayerGameContent">
        <div class="reportPlayerPrompt">
            Select a player to view game-by-game stats.
        </div>
    </div>
</div>

        <div class="reportGameTrends">
            <h4>Game-by-Game Team Trends</h4>

            <div class="reportPlayerTableWrap">
                <table class="reportPlayerTable">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Opp</th>
                            <th>Result</th>
                            <th>Score</th>

                            ${selectedTeamStats
                                .map((statKey) => {
                                    const teamStatLabels = {
    offensiveRebounds: "ORebs",
    defensiveRebounds: "DRebs",
    opponentOffensiveRebounds: "Opp ORebs",
    transitionPoints: "Trans Pts",
    paintTouches: "Paint Tchs",
    turnovers: "TO's",
    forcedTurnovers: "Forced TO's",
    fouls: "Fouls"
};

                                    const statLabel =
                                        teamStatLabels[statKey] ||
                                        statKey
                                            .replace(
                                                /([A-Z])/g,
                                                " $1"
                                            )
                                            .replace(
                                                /^./,
                                                (letter) =>
                                                    letter.toUpperCase()
                                            );

                                    return `
                                        <th>${statLabel}</th>
                                    `;
                                })
                                .join("")}
                        </tr>
                    </thead>

                    <tbody>
                        ${teamGames
                            .map((game) => {
                                let result = "T";

                                if (
                                    game.teamScore >
                                    game.opponentScore
                                ) {
                                    result = "W";
                                }

                                if (
                                    game.teamScore <
                                    game.opponentScore
                                ) {
                                    result = "L";
                                }

                                return `
                                    <tr>
                                        <td>
                                            ${game.gameDate || "—"}
                                        </td>

                                        <td>
                                            ${game.opponent || "—"}
                                        </td>

                                        <td>
                                            ${result}
                                        </td>

                                        <td>
                                            ${game.teamScore}-${game.opponentScore}
                                        </td>

                                        ${selectedTeamStats
    .map((statKey) => {
        const statValue =
            game.teamStats?.[statKey];

        if (
    statKey === "fieldGoals" ||
    statKey === "threePointers" ||
    statKey === "freeThrows"
) {
            return `
                <td>
                    ${formatShootingStat(statValue)}
                </td>
            `;
        }

        return `
            <td>
                ${Number(statValue) || 0}
            </td>
        `;
    })
    .join("")}
                                    </tr>
                                `;
                            })
                            .join("")}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;
}

function renderPlayerGameReport() {
    const playerFilter =
        document.getElementById("reportPlayerFilter");

    const playerContent =
        document.getElementById("reportPlayerGameContent");

    const reportsSeasonFilter =
        document.getElementById("reportsSeasonFilter");

    if (
    !playerFilter ||
    !playerContent ||
    !reportsSeasonFilter
) {
    return;
}

    const playerId = playerFilter.value;
    const reportsTeamCards =
    document.getElementById("reportsTeamCards");

const teamId =
    reportsTeamCards?.dataset.selectedTeamId || "";
    const selectedSeason = reportsSeasonFilter.value;

    if (!playerId) {
        playerContent.innerHTML = `
            <div class="reportPlayerPrompt">
                Select a player to view game-by-game stats.
            </div>
        `;
        return;
    }

    const team =
        teams.find(
            (item) => item.id === teamId
        );

    if (!team) {
        return;
    }

    const player =
        team.roster.find(
            (item) => item.id === playerId
        );

    if (!player) {
        return;
    }

    const playerStats =
        (team.selectedPlayerStats || [])
            .filter((statKey) => {
                return statKey !== "points";
            });

    const playerGames =
        savedGames.filter((game) => {
            if (game.teamId !== teamId) {
                return false;
            }

            const gameSeason =
                game.season || team.season;

            return (
                gameSeason === selectedSeason &&
                game.playerStatsById?.[playerId]
            );
        });

    playerContent.innerHTML = `
        <div class="reportPlayerTableWrap">
            <table class="reportPlayerTable">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Opp</th>
                        <th>PTS</th>
                        <th>REB</th>

                        ${playerStats
                            .map((statKey) => {
                                const statLabels = {
                                    offensiveRebounds: "ORebs",
                                    defensiveRebounds: "DRebs",
                                    turnovers: "TO's",
                                    assists: "AST",
                                    steals: "STL",
                                    blocks: "BLK"
                                };

                                return `
                                    <th>
                                        ${
                                            statLabels[statKey] ||
                                            statKey
                                        }
                                    </th>
                                `;
                            })
                            .join("")}
                    </tr>
                </thead>

                <tbody>
                    ${playerGames
                        .map((game) => {
                            const stats =
    game.playerStatsById[playerId];

const totalRebounds =
    (Number(stats.offensiveRebounds) || 0) +
    (Number(stats.defensiveRebounds) || 0);

return `
                                <tr>
                                    <td>
                                        ${game.gameDate || "—"}
                                    </td>

                                    <td>
                                        ${game.opponent || "—"}
                                    </td>

                                    <td>
    ${Number(stats.points) || 0}
</td>

<td>
    ${totalRebounds}
</td>

${playerStats
                                        .map((statKey) => {
                                            return `
                                                <td>
                                                    ${
                                                        Number(
                                                            stats[
                                                                statKey
                                                            ]
                                                        ) || 0
                                                    }
                                                </td>
                                            `;
                                        })
                                        .join("")}
                                </tr>
                            `;
                        })
                        .join("")}
                </tbody>
            </table>
        </div>
    `;
}

document
    .getElementById("reportsBtn")
    .addEventListener("click", () => {
        renderReportsTeamFilter();
        renderReportsSeasonFilter();
        showScreen("reports");
    });

    document
    .getElementById("reportsTeamCards")
    .addEventListener("click", (event) => {
        const card = event.target.closest(
            "[data-reports-team-id]"
        );

        if (!card) {
            return;
        }

        const reportsTeamCards =
            document.getElementById("reportsTeamCards");

        reportsTeamCards.dataset.selectedTeamId =
            card.dataset.reportsTeamId;
            selectedTeamId =
    card.dataset.reportsTeamId;

updateAppTeamBadge();

        document
            .querySelectorAll(".reportsTeamCard")
            .forEach((teamCard) => {
                teamCard.classList.toggle(
                    "activeReportsTeamCard",
                    teamCard === card
                );
            });

        renderReportsSeasonFilter();
        renderTeamReport();
    });

    document
    .getElementById("reportsSeasonFilter")
    .addEventListener("change", () => {
        renderTeamReport();
    });

    document
    .getElementById("reportsContent")
    .addEventListener("change", (event) => {
        if (
            event.target.id ===
            "reportPlayerFilter"
        ) {
            renderPlayerGameReport();
        }
    });

document
    .getElementById("settingsBtn")
    .addEventListener("click", () => {
        showScreen("settings");
    });

document
    .getElementById("addTeamButton")
    .addEventListener("click", openNewTeamForm);

document
    .getElementById("cancelTeamButton")
    .addEventListener("click", () => {
        showScreen("teams");
    });

document
    .getElementById("teamForm")
    .addEventListener("submit", saveTeamFromForm);

document
    .getElementById("addPlayerButton")
    .addEventListener("click", () => {
        rosterEditor.insertAdjacentHTML(
            "beforeend",
            `
                <div
                    class="rosterRow"
                    data-player-row="${crypto.randomUUID()}"
                >
                    <input
                        type="text"
                        inputmode="numeric"
                        placeholder="#"
                        aria-label="Jersey number"
                        data-player-number
                    >

                    <input
    type="text"
    placeholder="Player name"
    aria-label="Player name"
    data-player-name
>

<label class="keepAtTopOption">
    <input
        type="checkbox"
        data-player-keep-at-top
    >
    <span>Starter</span>
</label>

<button
    class="removePlayerButton"
    type="button"
>
    Delete Player
</button>
                </div>
            `
        );

        const newestRow = rosterEditor.lastElementChild;

        newestRow
            .querySelector(".removePlayerButton")
            .addEventListener("click", () => {
                if (rosterEditor.children.length === 1) {
                    alert(
                        "A team must have at least one roster row."
                    );
                    return;
                }

                newestRow.remove();
            });
    });
document
    .getElementById("editDetailsTeamButton")
    .addEventListener("click", () => {
        if (selectedTeamId) {
            openEditTeamForm(selectedTeamId);
        }
    });

document
    .getElementById("startTeamGameButton")
    .addEventListener("click", openNewGameScreen);
    document
    .getElementById("newGameForm")
    .addEventListener("submit", createGameConfirmation);

document
    .getElementById("cancelNewGameButton")
    .addEventListener("click", () => {
        if (selectedTeamId) {
            openTeamDetails(selectedTeamId);
        }
    });

document
    .getElementById("backToGameSetupButton")
    .addEventListener("click", () => {
        showScreen("newGame");
    });

document
    .getElementById("confirmStartGameButton")
    .addEventListener("click", () => {
        if (editingLiveGameSetup) {
            saveLiveGameSetupChanges();
        } else {
            startLiveGame();
        }
    });
    document
    .getElementById("editGameSetupButton")
    .addEventListener("click", () => {
        if (!liveGameState) {
            return;
        }

        const team = getSelectedTeam();

        if (!team) {
            return;
        }

        editingLiveGameSetup = true;

        document.getElementById(
    "backToGameSetupButton"
).style.display = "none";

document.getElementById(
    "confirmStartGameButton"
).textContent = "CONTINUE GAME";

        currentGameSetup = {
            ...liveGameState
        };

        renderGameStatChoices(
            team,
            liveGameState.selectedTeamStats,
            liveGameState.selectedPlayerStats
        );

        showScreen("gameConfirmation");
    });

    document
    .getElementById("playersTabButton")
    .addEventListener("click", () => {
        document
            .getElementById("playersTabButton")
            .classList.add("activeTrackerTab");

            document
    .getElementById("summaryTabButton")
    .classList.remove("activeTrackerTab");

        document
            .getElementById("playerTrackerPanel")
            .classList.add("activeTrackerPanel");

            document
    .getElementById("summaryTrackerPanel")
    .classList.remove("activeTrackerPanel");

    });

    document
    .getElementById("summaryTabButton")
    .addEventListener("click", () => {
        document
            .getElementById("summaryTabButton")
            .classList.add("activeTrackerTab");

        document
            .getElementById("playersTabButton")
            .classList.remove("activeTrackerTab");

        document
            .getElementById("summaryTrackerPanel")
            .classList.add("activeTrackerPanel");

        document
            .getElementById("playerTrackerPanel")
            .classList.remove("activeTrackerPanel");

        renderLiveSummary();
    });

document
    .getElementById("undoLastActionButton")
    .addEventListener("click", undoLastAction);

document
    document
    .getElementById("livePeriodSelect")
    .addEventListener("change", (event) => {
        if (!liveGameState) {
            return;
        }

        liveGameState.period =
            event.target.value;

        const currentPeriod =
            liveGameState.period;

        if (
            !liveGameState.teamStatsByPeriod[
                currentPeriod
            ]
        ) {
            liveGameState.teamStatsByPeriod[
                currentPeriod
            ] = createEmptyStatObject(
                getSelectedTeam()
                    .selectedTeamStats
            );
        }

        if (
            !liveGameState.playerStatsByPeriod[
                currentPeriod
            ]
        ) {
            liveGameState.playerStatsByPeriod[
                currentPeriod
            ] = {};

            const team = getSelectedTeam();

            team.roster.forEach((player) => {
                liveGameState.playerStatsByPeriod[
                    currentPeriod
                ][player.id] =
                    createEmptyStatObject(
                        team.selectedPlayerStats
                    );

                liveGameState.playerStatsByPeriod[
                    currentPeriod
                ][player.id].points = 0;
            });
        }
    });
document
    document
    .getElementById("finishGameButton")
    .addEventListener("click", () => {
        const confirmed = window.confirm(
            "Are you sure you want to finish this game?"
        );

        if (!confirmed) {
            return;
        }

        openGameSummary();
    });

    document
    .getElementById("saveCompletedGameButton")
    .addEventListener("click", saveCompletedGame);

    document
    .getElementById("returnToLiveGameButton")
    .addEventListener("click", () => {
        if (viewingSavedGame) {
            const team = getSelectedTeam();

            if (team) {
                openTeamDetails(team.id);
            }

            return;
        }

        showScreen("liveGame");
    });

    homeButton.addEventListener("click", () => {
    const activeScreen =
        document.querySelector(".activeScreen");

    if (activeScreen?.id === "liveGameScreen") {
        const confirmed = window.confirm(
            "Leave this game?\n\nIf you continue, all unsaved game stats will be lost and you will return to Home."
        );

        if (!confirmed) {
            return;
        }
    }

    showScreen("home");
});

backButton.addEventListener("click", () => {
    const activeScreen =
        document.querySelector(".activeScreen");

        if (
    activeScreen.id === "liveGameScreen" &&
    document
        .getElementById("summaryTabButton")
        .classList.contains("activeTrackerTab")
) {
    document.getElementById("playersTabButton").click();
    return;
}   

        console.log(
    "ACTIVE SCREENS:",
    [...document.querySelectorAll(".activeScreen")].map(
        (screen) => screen.id
    )
);

    if (viewingSavedGame) {
        const team = getSelectedTeam();

        if (team) {
            viewingSavedGame = false;
            openTeamDetails(team.id);
            return;
        }
    }

    if (activeScreen.id === "gameSummaryScreen") {
    showScreen("liveGame");
    return;
    }

    if (activeScreen.id === "liveGameScreen") {
    const team = getSelectedTeam();

    if (!team || !liveGameState) {
        return;
    }

    editingLiveGameSetup = true;

    document.getElementById("backToGameSetupButton").style.display = "none";

document.getElementById("confirmStartGameButton").textContent =
    "CONTINUE GAME";

    currentGameSetup = {
        ...liveGameState
    };

    renderGameStatChoices(
        team,
        liveGameState.selectedTeamStats,
        liveGameState.selectedPlayerStats
    );

    showScreen("gameConfirmation");
    return;
}

if (
    activeScreen.id === "gameConfirmationScreen" &&
    editingLiveGameSetup
) {
    editingLiveGameSetup = false;
    showScreen("liveGame");
    return;
}

if (
    activeScreen.id === "gameConfirmationScreen" &&
    !editingLiveGameSetup
) {
    showScreen("newGame");
    return;
}

if (activeScreen.id === "newGameScreen") {
    showScreen("games");
    return;
}

    if (
        activeScreen.id === "teamSetupScreen" ||
        activeScreen.id === "teamDetailsScreen"
    ) {
        showScreen("teams");
    } else {
        showScreen("home");
    }
});

renderStatChoices();
renderTeams();

const savedLiveGameRecovery =
    localStorage.getItem("court94LiveGameRecovery");

if (savedLiveGameRecovery) {
    try {
        const recoveryData =
            JSON.parse(savedLiveGameRecovery);

        if (recoveryData.liveGameState) {
            liveGameState =
                recoveryData.liveGameState;

            liveActionHistory =
                recoveryData.liveActionHistory || [];

            selectedLivePlayerId =
                recoveryData.selectedLivePlayerId || null;

            selectedTeamId =
                recoveryData.selectedTeamId || null;

            currentGameSetup =
                recoveryData.currentGameSetup || null;
        }
    } catch (error) {
        console.error(
            "Court94 could not restore the live game.",
            error
        );
    }
}

const savedScreen =
    localStorage.getItem("court94CurrentScreen");

    if (
    savedScreen === "liveGame" &&
    liveGameState &&
    selectedTeamId
) {
    renderLiveGame();
}

if (savedScreen === "games") {
    renderGamesTeamFilter();
    renderGamesList();
}

if (savedScreen === "reports") {
    renderReportsTeamFilter();
    renderReportsSeasonFilter();
}

if (savedScreen && screens[savedScreen]) {
    showScreen(savedScreen);
} else {
    showScreen("home");
}