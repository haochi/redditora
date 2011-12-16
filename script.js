var playlist = new Queue
  , player = false
  , subreddits = []
  , Bandcamp = {base: "http://api.bandcamp.com/api/", key: "snaefellsjokull"}
  , SoundCloud = {base: "http://api.soundcloud.com/", key: "e350357eef0347515be167f33dd3240d"};

playlist.on("push", function(){
  var track = this.last()
    , id = this.length()
    , parent = $("<div>").addClass("row")
    , left = $("<div>").addClass("track span5").attr("rel", id)
    , right = $("<div>").addClass("span8");
  track.id = id;
  left.append($("<span>").addClass("play label success").text("play"));
  left.append($("<span>").addClass("remove label warning").text("remove"));
  left.append($("<a>").addClass("label notice reddit").text("reddit:"+track.score).attr({
    href: track.reddit, target: "_blank"
  }));
  left.append($("<span>").addClass("label").text(track.origin));
  right.append($("<span>").addClass("title").html(track.title));

  parent.append(left).append(right);

  $("#playlist").append(parent);
  if(!player){ // initial setup
    $("#playlist .track:first .success").text("playing");
    player = jwplayer('flash_player');
    player.setup({
      flashplayer: '/player.swf',
      file: playlist.current().file,
      height: 0,
      width: 0,
      events: {
        onComplete: function(){
          $("#next").click();
        }
      }
    });
    player.play();
  }
});

$(function(){
  $("#next, #prev").click(function(){
    var action = $(this).attr("id")
      , length = playlist.length();
    while(length && playlist[action]() == null){}
    $("#playlist .success").each(function(){
      if(parseInt($(this).parent(".track").attr("rel"), 10) == playlist.current().id){
        $(this).text("playing");
      }else{
        $(this).text("play");
      }
    });
    player.load(playlist.current().file);
    player.play();
  });

  $("#playlist").on("click", ".remove", function(){
    var track = $(this).parent(".track")
      , id = track.attr("rel");
    $("#next").click();
    track.remove();
    playlist.remove(id);
  });

  $("#playlist").on("click", ".play", function(){
    var id = $(this).parent(".track").attr("rel");
    playlist.jump(parseInt(id, 10)-1);
    $("#next").click();
  });

  $("#clear").click(function(){
    playlist.clear();
    $("#playlist").empty();
  });

  $("#play, #pause").click(function(){
    player[$(this).attr("id")]();
  });

  $("#subreddit_picker").submit(function(){
    var data = $(this).serializeJSON();
    if(data.subreddit == "") return false;

    subreddits.push(data.subreddit);
    subreddits = array_unique(subreddits);
    location.hash = subreddits.join("|");
    $.getJSON("http://www.reddit.com/r/" + data.subreddit + ".json?jsonp=?", function(r){
      $.each(r.data.children, function(i, child){
        var post = child.data
          , media = post.media;
        if(media){
          var data = { reddit: "http://reddit.com"+post.permalink, score: post.score, origin: media.type };
          switch(media.type){

            case "bandcamp.com":
              $.getJSON(Bandcamp.base + "url/1/info?callback=?", {key: Bandcamp.key, url: post.url}, function(r){
                if(r.album_id){
                  $.getJSON(Bandcamp.base + "album/2/info?callback=?", {key: Bandcamp.key, album_id: r.album_id}, function(r){
                    $.each(r.tracks, function(i, track){
                      playlist.push($.extend({title: track.title, file: track.streaming_url}, data));
                    });
                  });
                }else if(r.track_id){
                  $.getJSON(Bandcamp.base + "track/1/info?callback=?", {key: Bandcamp.key, track_id: r.track_id}, function(track){
                    playlist.push($.extend({title: track.title, file: track.streaming_url}, data));
                  });
                }
              });
            break;

            case "youtube.com":
              var track = media.oembed;
              playlist.push($.extend({title: track.title, file: track.url}, data));
            break;

            case "soundcloud.com":
              var track_id = unescape(media.oembed.html).match(/\/tracks\/(\d+)/);
              if(track_id){
                $.getJSON(SoundCloud.base + "tracks/" + track_id[1] + ".json", {client_id: SoundCloud.key}, function(track){
                  if(track.streamable){
                    playlist.push($.extend({title: track.title, file: track.stream_url}, data));
                  }
                });
              }
            break;
          }
        }
      });
    });
    return false;
  });

  $.each(unescape(location.hash.replace(/#/, "")).split("|"), function(i, subreddit){
    $("#subreddit").val(subreddit);
    $("#subreddit_picker").submit();
  });
  $("#subreddit").val("");
});
