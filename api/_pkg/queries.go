package pkg

var matchDamageQuery = `
	query GetMatchDamages($matchId: Int!) {
		damages: match_damages(where: {match_id: {_eq: $matchId}}) {
			roundId: round_id
			inflictorId: inflictor_id
			victimId: victim_id
			weaponId: weapon_id
			hitboxGroup: hitbox_group
			damageReal: damage_real
			damageNormalized: damage_normalized
			hits
			__typename
		}
	}
`

var matchKillsQuery = `
	query GetMatchKills($matchId: Int!) {
		kills: match_kills(
			where: {match_id: {_eq: $matchId}}
			order_by: {created_at: asc}
		) {
			roundId: round_id
			createdAt: created_at
			killerId: killer_id
			victimId: victim_id
			assistantId: assistant_id
			weaponId: weapon_id
			isHeadshot: is_headshot
			isWallbang: is_wallbang
			isOneshot: is_oneshot
			isAirshot: is_airshot
			isNoscope: is_noscope
			killerPositionX: killer_position_x
			killerPositionY: killer_position_y
			victimPositionX: victim_position_x
			victimPositionY: victim_position_y
			killerBlindedBy: killer_blinded_by
			killerBlindDuration: killer_blind_duration
			victimBlindedBy: victim_blinded_by
			victimBlindDuration: victim_blind_duration
			isTeamkill: is_teamkill
			__typename
		}
	}
`

var matchCluches = `query GetMatchClutches($matchId: Int!) {
  clutches: match_clutches(where: {match_id: {_eq: $matchId}}) {
    roundId: round_id
    userId: user_id
    createdAt: created_at
    success
    amount
    __typename
  }
}
  `

var fullMatchQuery = `query GetMatchStats($matchId: Int!, $gameId: smallint!) {
	match: matches_by_pk(id: $matchId) {
	  id
	  type
	  status
	  bestOf: best_of
	  gameId: game_id
	  hasWinner: has_winner
	  startedAt: started_at
	  finishedAt: finished_at
	  maxRoundsCount: max_rounds_count
	  serverInstanceId: server_instance_id
	  cancellationReason: cancellation_reason
	  replayExpirationDate: replay_expiration_date
	  rounds(order_by: {id: asc}) {
		id
		winReason: win_reason
		startedAt: started_at
		finishedAt: finished_at
		matchMapId: match_map_id
		spawnedPlayers: spawned_players
		winMatchTeamId: win_match_team_id
		__typename
	  }
	  maps(order_by: {number: asc}) {
		...MatchMapPrimaryParts
		replays {
		  ...MatchMapReplayPrimaryParts
		  __typename
		}
		map {
		  ...MapPrimaryParts
		  ...MapSecondaryParts
		  __typename
		}
		__typename
	  }
	  gameMode {
		id
		teamSize: team_size
		firstTeamSize: first_team_size
		secondTeamSize: second_team_size
		__typename
	  }
	  teams(order_by: {id: asc}) {
		...MatchTeamPrimaryParts
		mapStats {
		  ...MatchTeamMapStatPrimaryParts
		  __typename
		}
		__typename
	  }
	  members(order_by: {private: {party_id: desc_nulls_last}}) {
		...MatchMemberPrimaryParts
		private {
		  ...MatchMemberPrivateParts
		  __typename
		}
		__typename
	  }
	  __typename
	}
  }
  
  fragment MatchMapPrimaryParts on match_maps {
	id
	number
	mapId: map_id
	startedAt: started_at
	finishedAt: finished_at
	gameStatus: game_status
	__typename
  }
  
  fragment MatchMapReplayPrimaryParts on match_replays {
	id
	url
	createdAt: created_at
	__typename
  }
  
  fragment MapPrimaryParts on maps {
	id
	name
	__typename
  }
  
  fragment MapSecondaryParts on maps {
	offset
	scale
	preview
	topview
	overview
	flipV: flip_v
	flipH: flip_h
	__typename
  }
  
  fragment MatchTeamPrimaryParts on match_teams {
	id
	name
	size
	score
	chatId: chat_id
	isWinner: is_winner
	captainId: captain_id
	isDisqualified: is_disqualified
	__typename
  }
  
  fragment MatchTeamMapStatPrimaryParts on match_team_map_stats {
	score
	isWinner: is_winner
	matchMapId: match_map_id
	matchTeamId: match_team_id
	initialSide: initial_side
	__typename
  }
  
  fragment MatchMemberPrimaryParts on match_members {
	hash
	role
	ready
	impact
	connected
	isLeaver: is_leaver
	ratingDiff: rating_diff
	matchTeamId: match_team_id
	__typename
  }
  
  fragment MatchMemberPrivateParts on match_members_private {
	rating
	partyId: party_id
	user {
	  ...UserPrimaryParts
	  ...UserMediaParts
	  ...BasicUserSubscriptionParts
	  ...UserGameStats
	  __typename
	}
	__typename
  }
  
  fragment UserPrimaryParts on users {
	id
	link
	avatar
	online
	verified
	isMobile: is_mobile
	nickName: nick_name
	animatedAvatar: animated_avatar
	__typename
  }
  
  fragment UserMediaParts on users {
	isMedia: is_media
	displayMediaStatus: display_media_status
	__typename
  }
  
  fragment BasicUserSubscriptionParts on users {
	privacyOnlineStatusVisibility: privacy_online_status_visibility
	subscription {
	  planId: plan_id
	  __typename
	}
	icon {
	  ...ProfileIconPrimaryParts
	  __typename
	}
	__typename
  }
  
  fragment ProfileIconPrimaryParts on profile_icons {
	id
	url
	__typename
  }
  
  fragment UserGameStats on users {
	stats(
	  where: {game_id: {_eq: $gameId}, map_id: {_is_null: true}, game_mode_id: {_is_null: false}}
	) {
	  ...UserStatsParts
	  __typename
	}
	__typename
  }
  
  fragment UserStatsParts on user_stats {
	kills
	deaths
	place
	rating
	winRate: win_rate
	gameModeId: game_mode_id
	__typename
  }`
