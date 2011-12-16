function Queue(){
  var index = 0
    , queue = []
    , self = this
    , hooks = {}
    , length = 0;
  this.push = function(item){
    queue.push(item);
    run_hook("push");
    length++;
  }
  this.remove = function(index){
    queue[index] = null;
    length--;
    run_hook("remove");
  }
  this.clear = function(){
    queue.length = length = index = 0;
    run_hook("clear");
  }
  this.jump = function(i){
    index = i;
    run_hook("jump");
    return queue[index];
  }
  this.seek = function(num){
    index = (index + num) % queue.length;
    run_hook("prev");
    return queue[index];
  }
  this.next = function(){
    return this.seek(+1);
  }
  this.prev = function(){
    return this.seek(-1);
  }
  this.current = function(){
    run_hook("current");
    return queue[index];
  }
  this.last = function(){
    return queue[queue.length-1];
  }
  this.length = function(){
    return length;
  }
  this.on = function(method, func){
    if(!(method in hooks)){
      hooks[method] = [];
    }
    hooks[method].push(func);
  }
  this.inspect = function(){
    return queue;
  }
  function run_hook(method){
    var method_hooks = hooks[method];
    if(method_hooks){
      for(var i=0, l=method_hooks.length; i<l; i++){
        method_hooks[i].apply(self);
      }
    }
  }
}
