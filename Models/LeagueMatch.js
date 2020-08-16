exports.default = function(match) {
    this.matchName = match.strEvent;
    this.leagueName = match.strLeague;
    this.homeTeam = match.strHomeTeam;
    this.homeTeamId = match.idHomeTeam;
    this.awayTeamId = match.idAwayTeam;
    this.homeTeamScore = match.intHomeScore || 0;
    this.awayTeam = match.strAwayTeam;
    this.awayTeamScore = match.intAwayScore || 0;
    this.eventImg = match.strThumb || 'not found';
    this.matchGoalsVideo = match.strVideo || 'not found';
    return this;
}