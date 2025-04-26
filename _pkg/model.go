package pkg

import (
	"time"
)

const (
	kastWeight   = 0.0045
	kdprWeight   = 0.2
	impactWeight = 0.77
	damageWeight = 0.00328
)

type Model struct {
	Name string
}

func NewModel() *Model {
	return &Model{Name: "Kitty"}
}

func NewStats() *Stats {
	return &Stats{
		Players: make(map[int]*PlayerStats),
	}
}

type Clutch struct {
	RoundId   int       `json:"roundId"`
	UserId    int       `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
	Success   bool      `json:"success`
	Amount    int       `json:"amount"`
	Typename  string    `json:"__typename"`
}

type GraphQLClutchResponse struct {
	Data struct {
		Clutches []Clutch `json:"clutches"`
	} `json:"data"`
}

type Kill struct {
	RoundId             int       `json:"roundId"`
	CreatedAt           time.Time `json:"createdAt"`
	KillerId            int       `json:"killerId"`
	VictimId            int       `json:"victimId"`
	AssistantId         *int      `json:"assistantId"` // Используем указатель, если может быть null
	WeaponId            int       `json:"weaponId"`
	IsHeadshot          bool      `json:"isHeadshot"`
	IsWallbang          bool      `json:"isWallbang"`
	IsOneshot           bool      `json:"isOneshot"`
	IsAirshot           bool      `json:"isAirshot"`
	IsNoscope           bool      `json:"isNoscope"`
	KillerPositionX     int       `json:"killerPositionX"`
	KillerPositionY     int       `json:"killerPositionY"`
	VictimPositionX     int       `json:"victimPositionX"`
	VictimPositionY     int       `json:"victimPositionY"`
	KillerBlindedBy     *int      `json:"killerBlindedBy"`     // Используем указатель, если может быть null
	KillerBlindDuration *int      `json:"killerBlindDuration"` // Используем указатель, если может быть null
	VictimBlindedBy     int       `json:"victimBlindedBy"`
	VictimBlindDuration int       `json:"victimBlindDuration"`
	IsTeamkill          bool      `json:"isTeamkill"`
	TypeName            string    `json:"__typename"`
}

type GraphQLRequest struct {
	Query     string         `json:"query"`
	Variables map[string]int `json:"variables"`
}

type PlayerStats struct {
	ID          int
	Nickname    string
	ULRating    float64
	IMG         string
	Matches     int
	Kills       int
	Deaths      int
	Assists     int
	Headshots   int
	KASTScore   float64
	Damage      float64
	Exchanged   int
	FirstDeath  int
	FirstKill   int
	MultiKills  [5]int
	Clutches    [5]int
	Rounds      int
	TeamID      int
	KPR         float64
	DPR         float64
	Impact      float64
	ClutchScore int
	Rating      float64
	MatchID     int
	Map         string
	IsWinner    bool
}

func (p *PlayerStats) CalculateDerivedStats() {
	if p.Rounds == 0 {
		return
	}

	p.KPR = float64(p.Kills) / float64(p.Rounds)
	p.DPR = float64(p.Deaths) / float64(p.Rounds)
	p.Impact = p.CalculateImpact()
	p.ClutchScore = p.CalculateClutchScore()
	p.Rating = p.CalculateRating()
}

func (p *PlayerStats) CalculateImpact() float64 {
	return (1*float64(p.FirstKill) +
		-0.6*float64(p.FirstDeath) +
		0.8*float64(p.MultiKills[1]-p.Clutches[1]) +
		1.08*float64(p.MultiKills[2]-p.Clutches[2]) +
		1.24*float64(p.MultiKills[3]-p.Clutches[3]) +
		1.4*float64(p.MultiKills[4]-p.Clutches[4]) +
		float64(p.Clutches[0]) +
		2*float64(p.Clutches[1]) +
		3*float64(p.Clutches[2]) +
		4*float64(p.Clutches[3]) +
		5*float64(p.Clutches[4])) / float64(p.Rounds)
}

func (p *PlayerStats) CalculateClutchScore() int {
	total := 0
	for _, c := range p.Clutches {
		total += c
	}
	return total
}

func (p *PlayerStats) CalculateRating() float64 {
	return kastWeight*p.KASTScore*100/float64(p.Rounds) +
		kdprWeight*(float64(p.Kills)/float64(p.Deaths)) +
		impactWeight*p.Impact +
		damageWeight*p.Damage/float64(p.Rounds)
}

type Stats struct {
	Players map[int]*PlayerStats
}

type GraphQLKillsResponse struct {
	Data struct {
		Kills []Kill `json:"kills"`
	} `json:"data"`
}

type GraphQLDamagesResponse struct {
	Data struct {
		Damages []Damage `json:"damages"`
	} `json:"data"`
}

type Damage struct {
	RoundId          int    `json:"roundId"`
	InflictorId      int    `json:"inflictorId"`
	VictimId         int    `json:"victimId"`
	WeaponId         int    `json:"weaponId"`
	HitboxGroup      int    `json:"hitboxGroup"`
	DamageReal       int    `json:"damageReal"`
	DamageNormalized int    `json:"damageNormalized"`
	Hits             int    `json:"hits"`
	TypeName         string `json:"__typename"`
}

type GetMatchStatsResponse struct {
	Data struct {
		Match Match `json:"match"`
	} `json:"data"`
}

type Match struct {
	ID                   int         `json:"id"`
	Type                 string      `json:"type"`
	Status               string      `json:"status"`
	BestOf               int         `json:"bestOf"`
	GameID               int         `json:"gameId"`
	HasWinner            bool        `json:"hasWinner"`
	StartedAt            time.Time   `json:"startedAt"`
	FinishedAt           *time.Time  `json:"finishedAt"`
	MaxRoundsCount       int         `json:"maxRoundsCount"`
	ServerInstanceID     *int        `json:"serverInstanceDd"`
	CancellationReason   *string     `json:"cancellation_reason"`
	ReplayExpirationDate *string     `json:"replayExpirationDate"`
	Rounds               []Round     `json:"rounds"`
	Maps                 []MatchMap  `json:"maps"`
	GameMode             GameMode    `json:"gameMode"`
	Teams                []MatchTeam `json:"teams"`
	Members              []Member    `json:"members"`
	Typename             string      `json:"__typename"`
}

type GameMode struct {
	ID             int    `json:"id"`
	TeamSize       int    `json:"teamSize"`
	FirstTeamSize  int    `json:"firstTeamSize"`
	SecondTeamSize int    `json:"secondTeamSize"`
	TypeName       string `json:"__typename"`
}

type Round struct {
	ID             int    `json:"id"`
	WinReason      string `json:"win_reason"`
	StartedAt      string `json:"startedAt"`
	FinishedAt     string `json:"finishedAt"`
	MatchMapID     int    `json:"matchMapId"`
	SpawnedPlayers []int  `json:"spawned_players"` // Исправлено на slice
	WinMatchTeamID *int   `json:"win_match_team_id"`
	Typename       string `json:"__typename"`
}

type MatchMap struct {
	ID         int              `json:"id"`
	Number     int              `json:"number"`
	MapID      int              `json:"map_id"`
	StartedAt  string           `json:"startedAt"`
	FinishedAt *string          `json:"finishedAt"`
	GameStatus string           `json:"game_status"`
	Replays    []MatchMapReplay `json:"replays"`
	Map        Map              `json:"map"`
	Typename   string           `json:"__typename"`
}

type MatchMapReplay struct {
	ID        int    `json:"id"`
	URL       string `json:"url"`
	CreatedAt string `json:"createdAt"`
	TypeName  string `json:"__typename"`
}

type Map struct {
	ID       int      `json:"id"`
	Name     string   `json:"name"`
	Offset   *float64 `json:"offset"` // Исправлено на указатель
	Scale    *float64 `json:"scale"`  // Исправлено на указатель
	Preview  string   `json:"preview"`
	Topview  string   `json:"topview"`
	Overview string   `json:"overview"`
	FlipV    bool     `json:"flip_v"`
	FlipH    bool     `json:"flip_h"`
	Typename string   `json:"__typename"`
}

type MatchTeam struct {
	ID             int                `json:"id"`
	Name           string             `json:"name"`
	Size           int                `json:"size"`
	Score          int                `json:"score"`
	ChatID         *int               `json:"chatId"` // Исправлено на *int
	IsWinner       bool               `json:"isWinner"`
	CaptainID      *int               `json:"captainId"` // Исправлено на *int
	IsDisqualified bool               `json:"isDisqualified"`
	MapStats       []MatchTeamMapStat `json:"map_stats"`
	Typename       string             `json:"__typename"`
}

type Member struct {
	Hash        string             `json:"hash"`
	Role        string             `json:"role"`
	Ready       bool               `json:"ready"`
	Impact      *float64           `json:"impact"` // Исправлено на указатель
	Connected   bool               `json:"connected"`
	IsLeaver    bool               `json:"is_leaver"`
	RatingDiff  *float64           `json:"rating_diff"` // Исправлено на указатель
	MatchTeamID int                `json:"matchTeamId"`
	Private     MatchMemberPrivate `json:"private"`
	Typename    string             `json:"__typename"`
}

type MatchMemberPrivate struct {
	Rating   int    `json:"rating"`
	PartyID  int    `json:"partyId"`
	User     User   `json:"user"`
	TypeName string `json:"__typename"`
}

type User struct {
	ID                            int           `json:"id"`
	Link                          *string       `json:"link"` // Исправлено на указатель
	Avatar                        string        `json:"avatar"`
	Online                        bool          `json:"online"`
	Verified                      bool          `json:"verified"`
	IsMobile                      bool          `json:"isMobile"`
	NickName                      string        `json:"nickName"`
	AnimatedAvatar                *string       `json:"animated_avatar"` // Исправлено на указатель
	IsMedia                       bool          `json:"isMedia"`
	DisplayMediaStatus            bool          `json:"display_media_status"`
	PrivacyOnlineStatusVisibility string        `json:"privacy_online_status_visibility"`
	Subscription                  *Subscription `json:"subscription"`
	Icon                          *ProfileIcon  `json:"icon"`
	Stats                         []UserStat    `json:"stats"`
	Typename                      string        `json:"__typename"`
}

type UserStat struct {
	Kills      int     `json:"kills"`
	Deaths     int     `json:"deaths"`
	Place      *int    `json:"place"` // Исправлено на указатель
	Rating     float64 `json:"rating"`
	WinRate    float64 `json:"win_rate"`
	GameModeID int     `json:"gameModeId"`
	Typename   string  `json:"__typename"`
}

type MatchTeamMapStat struct {
	Score       int     `json:"score"`
	IsWinner    bool    `json:"isWinner"`
	MatchMapID  int     `json:"matchMapId"`
	MatchTeamID int     `json:"matchTeamId"`
	InitialSide *string `json:"initialSide"`
	TypeName    string  `json:"__typename"`
}

type Subscription struct {
	PlanID int `json:"planId"`
}

type ProfileIcon struct {
	ID  int    `json:"id"`
	URL string `json:"url"`
}

type PlayerComparison struct {
	PlayerID          int     `json:"player_id"`
	Nickname          string  `json:"nickname"`
	ULRating          float64 `json:"ul_rating"`
	IMG               string  `json:"img"`
	Kills             int     `json:"kills"`
	Deaths            int     `json:"deaths"`
	Assists           int     `json:"assists"`
	FirstKills        int     `json:"fk"`
	FirstDeaths       int     `json:"fd"`
	KAST              float64 `json:"kast"`
	WinratePercentile float64 `json:"winrate_percentile"`
	KDPercentile      float64 `json:"kd_percentile"`
	HSPercentile      float64 `json:"hs_percentile"`
	AvgPercentile     float64 `json:"avg_percentile"`
	TargetWinrate     float64 `json:"target_winrate"`
	TargetKD          float64 `json:"target_kd"`
	TargetHSRatio     float64 `json:"target_hs_ratio"`
	TargetAvg         float64 `json:"target_avg"`
}

type APIStats struct {
	MatchID    int       `json:"matchId"`
	Map        string    `json:"map"`
	Kills      int       `json:"kills"`
	Deaths     int       `json:"deaths"`
	Assists    int       `json:"assists"`
	Rounds     int       `json:"rounds"`
	Rating     float64   `json:"rating"`
	FinishedAt time.Time `json:"finishedAt"`
	// Другие приватные поля
}

type MapsStatistic struct {
	Map       string
	Matches   int
	Wins      int
	AvgRating float64
	Winrate   float64
}
