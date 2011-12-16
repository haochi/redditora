$.fn.serializeJSON=function() {
  var json = {};
  $.map($(this).serializeArray(), function(n, i){
    json[n['name']] = n['value'];
  });
  return json;
};
