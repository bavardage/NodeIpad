function init() {
  //disable normal scroll
  document.body.addEventListener('touchmove', function(event) {
				   event.preventDefault();
				 }, false);

  $('#mousepad').bind('touchmove', function(event) {
    //jquery hack: mobile safari doesn't allow copying touches
    var e = event.originalEvent;
    var touch = e.touches[0];
    var offset = $('#mousepad').offset();
    touch.pageX -= offset.left;
    touch.pageY -= offset.top;

    //$('#info').html("" + offset.left + "," + offset.top + "(" + touch.pageX*2 + "," + touch.pageY*2 + ")");

    rm.touchMove(touch.pageX, touch.pageY);
  });

  $('#mousepad').bind('touchstart', function(event) {
			var e = event.originalEvent;
			var touch = e.touches[0];
			var offset = $('#mousepad').offset();
			touch.pageX -= offset.left;
			touch.pageY -= offset.top;

			rm.touchStart(touch.pageX, touch.pageY);
  });

  $('#leftclick').bind('touchstart', mouseDown);
  $('#leftclick').bind('touchend', mouseUp);
}


function moveMouse(x, y) {
  $.get('/mouse?x=' + x + '&y=' + y);
}

function mouseClick() {
  $.get('/click');
}

function mouseDown() {
  $.get('/xdt?c=mousedown 1');
}

function mouseUp() {
  $.get('/xdt?c=mouseup 1');
}

function RelativeMouse() {
  this.sensitivity = 2.0;
  this.cursorX = 0;
  this.cursorY = 0;
  this.x = 0; this.y = 0;
}

RelativeMouse.prototype = {
  touchStart : function(x,y) {
    $('#info').html('wooooooooooooooooooooo');
    var that = this;
    $.getJSON('/mouse', function(data) {
      that.cursorX = data.x;
      that.cursorY = data.y;
    });
    this.x = x; this.y = y;
  },
  touchMove : function(x, y) {
    var dx = this.sensitivity * (x - this.x);
    var dy = this.sensitivity*(y - this.y);
    moveMouse(this.cursorX + dx, this.cursorY + dy);
  }
};

var rm = new RelativeMouse();

function relativeMouseMove(x, y) {

}
