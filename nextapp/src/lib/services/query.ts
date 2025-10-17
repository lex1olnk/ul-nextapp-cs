export const graphqlMatch = `query __GetMatch($matchId: Int!, $gameId: smallint!) {
  match: matches_by_pk(id: $matchId) {
    id
    type
    state
    status
    shuffle
    premium
    media
    wingman
    password
    bestOf: best_of
    chatId: chat_id
    gameId: game_id
    devBuild: dev_build
    isPaused: is_paused
    creatorId: creator_id
    gameModeId: game_mode_id
    hasWinner: has_winner
    gameStatus: game_status
    lastUpdate: last_update
    createdAt: created_at
    startedAt: started_at
    finishedAt: finished_at
    scheduledAt: scheduled_at
    eventsDelay: events_delay
    captainMode: captain_mode
    waitroomEnabled: waitroom_enabled
    readinessPassed: readiness_passed
    serverRegionId: server_region_id
    serverInstanceId: server_instance_id
    teamSpeakServerId: teamspeak_server_id
    fakeServerRegionId: fake_server_region_id
    tvAddressHidden: tv_address_hidden
    funModeEnabled: fun_mode_enabled
    anticheatEnabled: anticheat_enabled
    cancellationReason: cancellation_reason
    maxRoundsCount: max_rounds_count
    mapBanpickConfigId: map_banpick_config_id
    refereeCheckRequested: referee_check_requested
    resultConfirmed: result_confirmed
    friendlyFireEnabled: friendly_fire_enabled
    tvDelay: tv_delay
    replayExpirationDate: replay_expiration_date
    tournamentGroupId: tournament_group_id
    currentVoterId: current_voter_id
    votingStartedAt: voting_started_at
    disqualificationReason: disqualification_reason
    sideSelectionEnabled: side_selection_enabled
    mapBanpickConfig {
      id
      targetSize: target_size
      steps(order_by: {number: asc}) {
        id
        step
        __typename
      }
      __typename
    }
    mapBans {
      date
      mapId: map_id
      userId: user_id
      __typename
    }
    mapPicks {
      date
      mapId: map_id
      userId: user_id
      __typename
    }
    mapsPool {
      mapId: map_id
      __typename
    }
    maps(order_by: {number: asc}) {
      ...MatchMapPrimaryParts
      ...MatchMapSecondaryParts
      replays {
        ...MatchMapReplayPrimaryParts
        __typename
      }
      highlights {
        ...MatchMapHighlightPrimaryParts
        userId: user_id
        __typename
      }
      __typename
    }
    teams(order_by: {id: asc}) {
      ...MatchTeamPrimaryParts
      mapStats {
        ...MatchTeamMapStatPrimaryParts
        __typename
      }
      team {
        id
        name
        logo
        tag
        __typename
      }
      private {
        cid: teamspeak_cid
        password: voice_room_password
        __typename
      }
      __typename
    }
    serverInstance {
      id
      ip
      port
      tvPort: tv_port
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
    tournament {
      id
      name
      appealTimeout: appeal_timeout
      referees {
        userId: user_id
        __typename
      }
      organizer {
        name
        logo
        __typename
      }
      __typename
    }
    tournamentStage {
      id
      name
      groups {
        id
        name
        __typename
      }
      outgoings {
        id
        number
        matchLink {
          matchId: match_id
          __typename
        }
        __typename
      }
      __typename
    }
    tournamentRound {
      id
      name
      __typename
    }
    leagueDivision {
      name
      league {
        id
        name: name_en
        __typename
      }
      __typename
    }
    private {
      cid: teamspeak_cid
      password: voice_room_password
      matchPassword: password
      __typename
    }
    myBan {
      userId: user_id
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

fragment MatchMapSecondaryParts on match_maps {
  startingSidePicked: starting_side_picked
  startingSidesSwapped: starting_sides_swapped
  __typename
}

fragment MatchMapReplayPrimaryParts on match_replays {
  id
  url
  createdAt: created_at
  __typename
}

fragment MatchMapHighlightPrimaryParts on match_highlights {
  id
  score
  title
  status
  progress
  gameId: game_id
  createdAt: created_at
  uploadedAt: uploaded_at
  likesCount: likes_count
  viewsCount: views_count
  killsCount: kills_count
  clutchSize: clutch_size
  multikillSize: multikill_size
  clutchSuccess: clutch_success
  commentsCount: comments_count
  primaryWeapon {
    ...WeaponPrimaryParts
    __typename
  }
  secondaryWeapon {
    ...WeaponPrimaryParts
    __typename
  }
  myViews {
    userId: user_id
    __typename
  }
  __typename
}

fragment WeaponPrimaryParts on weapons {
  id
  name
  internalName: internal_name
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
  card {
    ...ProfileCardPrimaryParts
    __typename
  }
  __typename
}

fragment ProfileIconPrimaryParts on profile_icons {
  id
  url
  __typename
}

fragment ProfileCardPrimaryParts on profile_cards {
  id
  url
  urlAlt: url_alt
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
}`;
