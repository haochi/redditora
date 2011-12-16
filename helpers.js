$.fn.serializeJSON=function() {
  var json = {};
  $.map($(this).serializeArray(), function(n, i){
    json[n['name']] = n['value'];
  });
  return json;
};

function array_unique(arr){
  var i = 0, l=arr.length, out=[], obj={};
  while(i<l) obj[arr[i++]] =null;
  for(i in obj) out.push(i);
  return out;
}
