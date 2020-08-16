exports.default = function(match) {
    this.title = match.title;
    this.embed = match.embed;
    this.thumbnail = match.thumbnail;
    this.team1 = match.side1.name;
    this.team2 = match.side2.name;
    return this;
}