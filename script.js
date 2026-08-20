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
        name: "Opponent Offensive Rebounds",
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
let liveActionHistory = [];
let viewingSavedGame = false;
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

function showScreen(screenName) {
    Object.values(screens).forEach((screen) => {
        screen.classList.remove("activeScreen");
    });

    screens[screenName].classList.add("activeScreen");

    if (screenName === "home") {
        backButton.classList.add("hidden");
    } else {
        backButton.classList.remove("hidden");
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
function createEmptyStatObject(statKeys) {
    const statObject = {};

    statKeys.forEach((statKey) => {
        statObject[statKey] = 0;
    });

    return statObject;
}

function startLiveGame() {
    const team = getSelectedTeam();

    if (!team || !currentGameSetup) {
        return;
    }

    selectedLivePlayerId =
        team.roster.length > 0
            ? team.roster[0].id
            : null;

    liveActionHistory = [];

    const playerStatsById = {};

    team.roster.forEach((player) => {
        playerStatsById[player.id] =
            createEmptyStatObject(
                team.selectedPlayerStats
            );

        playerStatsById[player.id].points = 0;
    });

    liveGameState = {
        ...currentGameSetup,

        teamStats:
            createEmptyStatObject(
                team.selectedTeamStats
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
    team.selectedTeamStats
);

liveGameState.playerStatsByPeriod[
    liveGameState.period
] = {};

team.roster.forEach((player) => {
    liveGameState.playerStatsByPeriod[
        liveGameState.period
    ][player.id] = createEmptyStatObject(
        team.selectedPlayerStats
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
    renderLastAction();
}

function renderPlayerBench() {
    connectPlayerCardButtons();
    const team = getSelectedTeam();

    const playerBench =
        document.getElementById("playerBench");

    const uniquePlayerStats = [
        ...new Set(team.selectedPlayerStats || [])
    ];
const sortedRoster = [
    ...team.roster
].sort((a, b) => {
    if (a.keepAtTop === b.keepAtTop) {
        return 0;
    }

    return a.keepAtTop ? -1 : 1;
});
    playerBench.innerHTML = sortedRoster
        .map((player) => {
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
            `;
        })
        .join("");
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
}
function getPlayerStatTotal(playerId, statKey) {
    const playerStats =
        liveGameState.playerStatsById[playerId];

    if (!playerStats) {
        return 0;
    }

    return playerStats[statKey] || 0;
}

function getTeamStatTotal(statKey) {
    return liveGameState.teamStats[statKey] || 0;
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
        ...new Set(team.selectedTeamStats || [])
    ];

    const regularStats =
        uniqueTeamStats.filter(
            (statKey) => statKey !== "transitionPoints"
        );

    const hasTransition =
        uniqueTeamStats.includes("transitionPoints");

    const cardColors = [
        "teamStatGreen",
        "teamStatBlue",
        "teamStatPurple",
        "teamStatOrange",
        "teamStatGray",
        "teamStatRed",
        "teamStatTeal",
        "teamStatPink"
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

    container.innerHTML = `
        <div class="teamStatCardGrid">
            ${regularCards}
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

    liveActionHistory.push({
        type: "playerPoints",
        playerId: player.id,
        amount: points,
        period: liveGameState.period,
        description:
            `#${player.number || "—"} ${player.name} — +${points} Point${
                points === 1 ? "" : "s"
            }`
    });

    renderPlayerBench();
renderPlayerStatButtons();
renderLastAction();
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
        amount: 1,
        period: liveGameState.period,
        description:
            `Team — ${stat.name}`
    });

    renderTeamStatButtons();
    renderLastAction();
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

    const teamRows =
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

                        ${periodColumns
    .map((period) => {
        const periodValue =
            liveGameState.teamStatsByPeriod?.[
                period
            ]?.[statKey] || 0;

        return `
            <td>
                ${periodValue}
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

    document.getElementById(
        "liveSummaryPlayerStats"
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

                    ${periodColumns
    .map((period) => {
        const periodValue =
            game.teamStatsByPeriod?.[
                period
            ]?.[statKey] || 0;

        return `
            <td>
                ${periodValue}
            </td>
        `;
    })
    .join("")}

<td>
    ${game.teamStats?.[statKey] || 0}
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

    document.getElementById("summaryPlayerStats").innerHTML =
    team.roster
        .map((player) => {
            const playerStatsLine =
                uniquePlayerStats
                    .map((statKey) => {
                        const stat = playerStats.find(
                            (item) =>
                                item.key === statKey
                        );

                        if (!stat) {
                            return "";
                        }

                        const total =
    game.playerStatsById?.[
        player.id
    ]?.[statKey] || 0;

                        return `
                            <div class="compactPlayerStat">
                                <span>${stat.name}</span>
                                <strong>${total}</strong>
                            </div>
                        `;
                    })
                    .join("");

            return `
                <div class="compactPlayerSummary">

                    <div class="compactPlayerHeader">
                        <strong>
                            #${player.number || "—"}
                            ${player.name || "Unnamed"}
                        </strong>
                    </div>

                    <div class="compactPlayerStats">
                        ${playerStatsLine}
                    </div>

                </div>
            `;
        })
        .join("");
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
        opponent: liveGameState.opponent,
        gameDate: liveGameState.gameDate,
        gameType: liveGameState.gameType,
        location: liveGameState.location,
        gameFormat: liveGameState.gameFormat,
        teamScore,
        opponentScore,
        teamStats: liveGameState.teamStats,
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

        liveActionHistory.splice(index, 1);

        renderPlayerBench();
        connectPlayerCardButtons();
        renderLastAction();

        return;
    }
}
function undoLastAction() {
    const lastAction =
        liveActionHistory.pop();

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

    document.getElementById(
        "confirmationStats"
    ).innerHTML = combinedStats
        .map((stat) => {
            return `
                <div class="focusItem">
                    <span class="focusCheck">✓</span>
                    <span>${stat.name}</span>
                </div>
            `;
        })
        .join("");

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

    teamsList.innerHTML = teams
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
    const gamesTeamFilter =
        document.getElementById("gamesTeamFilter");

    if (!gamesTeamFilter) {
        return;
    }

    gamesTeamFilter.innerHTML = `
        <option value="all">All Teams</option>
        ${teams
            .map((team) => {
                const teamLabel = [
                    team.schoolName,
                    team.teamName
                ]
                    .filter(Boolean)
                    .join(" — ");

                return `
                    <option value="${team.id}">
                        ${teamLabel}
                    </option>
                `;
            })
            .join("")}
    `;
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
        showScreen("games");
    });

    document
    .getElementById("startNewGameButton")
    .addEventListener("click", () => {
        showScreen("newGame");
    });

document
    .getElementById("reportsBtn")
    .addEventListener("click", () => {
        showScreen("reports");
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
    .addEventListener("click", startLiveGame);
    document
    .getElementById("playersTabButton")
    .addEventListener("click", () => {
        document
            .getElementById("playersTabButton")
            .classList.add("activeTrackerTab");

        document
            .getElementById("teamTabButton")
            .classList.remove("activeTrackerTab");

            document
    .getElementById("summaryTabButton")
    .classList.remove("activeTrackerTab");

        document
            .getElementById("playerTrackerPanel")
            .classList.add("activeTrackerPanel");

            document
    .getElementById("summaryTrackerPanel")
    .classList.remove("activeTrackerPanel");

        document
            .getElementById("teamTrackerPanel")
            .classList.remove("activeTrackerPanel");
    });

document
    .getElementById("teamTabButton")
    .addEventListener("click", () => {
        document
            .getElementById("teamTabButton")
            .classList.add("activeTrackerTab");

        document
            .getElementById("playersTabButton")
            .classList.remove("activeTrackerTab");

            document
    .getElementById("summaryTabButton")
    .classList.remove("activeTrackerTab");

        document
            .getElementById("teamTrackerPanel")
            .classList.add("activeTrackerPanel");

            document
    .getElementById("summaryTrackerPanel")
    .classList.remove("activeTrackerPanel");

        document
            .getElementById("playerTrackerPanel")
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
            .getElementById("teamTabButton")
            .classList.remove("activeTrackerTab");

        document
            .getElementById("summaryTrackerPanel")
            .classList.add("activeTrackerPanel");

        document
            .getElementById("playerTrackerPanel")
            .classList.remove("activeTrackerPanel");

        document
            .getElementById("teamTrackerPanel")
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
    .getElementById("finishGameButton")
    .addEventListener("click", openGameSummary);
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
backButton.addEventListener("click", () => {
    const activeScreen =
        document.querySelector(".activeScreen");

    if (viewingSavedGame) {
        const team = getSelectedTeam();

        if (team) {
            viewingSavedGame = false;
            openTeamDetails(team.id);
            return;
        }
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
showScreen("home");