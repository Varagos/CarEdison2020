function battery(charge) {
  var index = 0;
  $(".battery .bar").each(function() {
    var power = Math.round(charge / 10);
    if (index != power) {
      $(this).addClass("active");
      index++;
    } else {
      $(this).removeClass("active");
    }
  });
}

$(".battery .bar").click(function() {
  battery(parseInt($(this).data("power")));
});

battery(67.15); // (67%) Any number 100 or lower will work, Including decimals.
